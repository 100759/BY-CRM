import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { D1Database } from '@cloudflare/workers-types'

interface Env {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Env }>()

// CORS 配置
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// 简单的 JWT 实现
function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  return atob(str)
}

async function generateToken(userId: string, secret: string): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64UrlEncode(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  }))
  
  const message = `${header}.${payload}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  const sig = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))
  
  return `${message}.${sig}`
}

async function verifyToken(token: string, secret: string): Promise<any> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token')
  
  const message = `${parts[0]}.${parts[1]}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  
  const signatureBytes = new Uint8Array(
    atob(parts[2].replace(/-/g, '+').replace(/_/g, '/'))
      .split('')
      .map(c => c.charCodeAt(0))
  )
  
  const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(message))
  if (!isValid) throw new Error('Invalid signature')
  
  const payload = JSON.parse(base64UrlDecode(parts[1]))
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
  
  return payload
}

// 密码哈希
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// 验证密码
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password)
  return newHash === hash
}

// 生成 UUID
function generateId(): string {
  return crypto.randomUUID()
}

// ============ 认证相关 ============

// 注册
app.post('/api/auth/register', async (c) => {
  const { email, password, name } = await c.req.json()
  
  if (!email || !password || !name) {
    return c.json({ error: '缺少必要字段' }, 400)
  }

  try {
    const passwordHash = await hashPassword(password)
    const userId = generateId()
    
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)'
    ).bind(userId, email, passwordHash, name).run()

    const token = await generateToken(userId, c.env.JWT_SECRET)
    
    return c.json({
      success: true,
      token,
      user: { id: userId, email, name }
    })
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: '邮箱已被注册' }, 400)
    }
    return c.json({ error: '注册失败' }, 500)
  }
})

// 登录
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: '邮箱和密码不能为空' }, 400)
  }

  try {
    const result = await c.env.DB.prepare(
      'SELECT id, email, name, password_hash FROM users WHERE email = ?'
    ).bind(email).first()

    if (!result) {
      return c.json({ error: '用户不存在' }, 401)
    }

    const passwordValid = await verifyPassword(password, result.password_hash as string)
    if (!passwordValid) {
      return c.json({ error: '密码错误' }, 401)
    }

    const token = await generateToken(result.id as string, c.env.JWT_SECRET)
    
    return c.json({
      success: true,
      token,
      user: { id: result.id, email: result.email, name: result.name }
    })
  } catch (error) {
    return c.json({ error: '登录失败' }, 500)
  }
})

// ============ 客户管理 ============

// 获取当前用户的所有客户
app.get('/api/customers', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '未授权' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const userId = payload.sub as string

    const customers = await c.env.DB.prepare(
      'SELECT * FROM customers WHERE user_id = ? ORDER BY updated_at DESC'
    ).bind(userId).all()

    return c.json({ success: true, data: customers.results })
  } catch (error) {
    return c.json({ error: '获取客户列表失败' }, 500)
  }
})

// 创建客户
app.post('/api/customers', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '未授权' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const userId = payload.sub as string

    const data = await c.req.json()
    const customerId = generateId()

    await c.env.DB.prepare(
      `INSERT INTO customers 
       (id, user_id, name, phone, email, undergraduate_school, major, gpa, 
        target_school, target_major, budget, stage, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      customerId, userId, data.name, data.phone || null, data.email || null,
      data.undergraduate_school || null, data.major || null, data.gpa || null,
      data.target_school || null, data.target_major || null, data.budget || null,
      data.stage || '初次接触', data.status || '进行中', data.notes || ''
    ).run()

    return c.json({ success: true, id: customerId })
  } catch (error) {
    return c.json({ error: '创建客户失败' }, 500)
  }
})

// 更新客户
app.put('/api/customers/:id', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '未授权' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const userId = payload.sub as string
    const customerId = c.req.param('id')

    const data = await c.req.json()

    await c.env.DB.prepare(
      `UPDATE customers SET 
       name = ?, phone = ?, email = ?, undergraduate_school = ?, major = ?, gpa = ?,
       target_school = ?, target_major = ?, budget = ?, stage = ?, status = ?, notes = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`
    ).bind(
      data.name, data.phone || null, data.email || null, data.undergraduate_school || null, 
      data.major || null, data.gpa || null,
      data.target_school || null, data.target_major || null, data.budget || null, 
      data.stage, data.status, data.notes || '',
      customerId, userId
    ).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: '更新客户失败' }, 500)
  }
})

// 删除客户
app.delete('/api/customers/:id', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '未授权' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const userId = payload.sub as string
    const customerId = c.req.param('id')

    await c.env.DB.prepare(
      'DELETE FROM customers WHERE id = ? AND user_id = ?'
    ).bind(customerId, userId).run()

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: '删除客户失败' }, 500)
  }
})

// ============ 跟进记录 ============

// 获取客户的跟进记录
app.get('/api/customers/:id/follow-ups', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '未授权' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const userId = payload.sub as string
    const customerId = c.req.param('id')

    const followUps = await c.env.DB.prepare(
      `SELECT * FROM follow_ups 
       WHERE customer_id = ? AND user_id = ? 
       ORDER BY follow_up_date DESC`
    ).bind(customerId, userId).all()

    return c.json({ success: true, data: followUps.results })
  } catch (error) {
    return c.json({ error: '获取跟进记录失败' }, 500)
  }
})

// 添加跟进记录
app.post('/api/customers/:id/follow-ups', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '未授权' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const userId = payload.sub as string
    const customerId = c.req.param('id')

    const { content, follow_up_date } = await c.req.json()
    const followUpId = generateId()

    await c.env.DB.prepare(
      `INSERT INTO follow_ups (id, customer_id, user_id, content, follow_up_date)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(followUpId, customerId, userId, content, follow_up_date).run()

    return c.json({ success: true, id: followUpId })
  } catch (error) {
    return c.json({ error: '添加跟进记录失败' }, 500)
  }
})

// ============ 统计 ============

// 获取统计数据
app.get('/api/stats', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader) {
    return c.json({ error: '未授权' }, 401)
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const payload = await verifyToken(token, c.env.JWT_SECRET)
    const userId = payload.sub as string

    const stats = await c.env.DB.prepare(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN stage = '初次接触' THEN 1 ELSE 0 END) as stage_initial,
        SUM(CASE WHEN stage = '需求沟通' THEN 1 ELSE 0 END) as stage_communication,
        SUM(CASE WHEN stage = '方案制定' THEN 1 ELSE 0 END) as stage_proposal,
        SUM(CASE WHEN stage = '签约' THEN 1 ELSE 0 END) as stage_signed,
        SUM(CASE WHEN status = '进行中' THEN 1 ELSE 0 END) as status_ongoing,
        SUM(CASE WHEN status = '已完成' THEN 1 ELSE 0 END) as status_completed
       FROM customers WHERE user_id = ?`
    ).bind(userId).first()

    return c.json({ success: true, data: stats })
  } catch (error) {
    return c.json({ error: '获取统计数据失败' }, 500)
  }
})

export default app
