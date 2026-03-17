const API_BASE = '/api'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new ApiError(response.status, data.error || '请求失败')
  }

  return data
}

export const api = {
  // 认证
  register: (email: string, password: string, name: string) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // 客户
  getCustomers: () => request('/customers'),

  createCustomer: (data: any) =>
    request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCustomer: (id: string, data: any) =>
    request(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCustomer: (id: string) =>
    request(`/customers/${id}`, {
      method: 'DELETE',
    }),

  // 跟进记录
  getFollowUps: (customerId: string) =>
    request(`/customers/${customerId}/follow-ups`),

  createFollowUp: (customerId: string, content: string, follow_up_date: string) =>
    request(`/customers/${customerId}/follow-ups`, {
      method: 'POST',
      body: JSON.stringify({ content, follow_up_date }),
    }),

  // 统计
  getStats: () => request('/stats'),
}
