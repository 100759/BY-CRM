# Cloudflare 部署指南

本指南将帮助你将 CRM 系统部署到 Cloudflare。

## 前置要求

- Cloudflare 账户
- Node.js 18+
- npm 或 yarn

## 部署步骤

### 1. 安装依赖

```bash
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

这会打开浏览器进行 OAuth 认证。

### 3. 创建 D1 数据库

```bash
npx wrangler d1 create crm_db
```

命令输出会显示数据库 ID，类似于：
```
✓ Successfully created DB 'crm_db'
Database ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4. 更新 wrangler.toml

将输出的数据库 ID 复制到 `wrangler.toml` 中：

```toml
[[d1_databases]]
binding = "DB"
database_name = "crm_db"
database_id = "你的数据库ID"
```

### 5. 初始化数据库架构

```bash
npx wrangler d1 execute crm_db --file schema.sql
```

### 6. 设置 JWT 密钥

在 `wrangler.toml` 中更新 JWT_SECRET（生产环境应该使用强密钥）：

```toml
[vars]
JWT_SECRET = "your-strong-secret-key-change-this"
```

### 7. 构建和部署

```bash
npm run deploy
```

部署完成后，你会看到类似的输出：
```
✓ Uploaded crm-system (1.23 MB)
✓ Published crm-system
  https://crm-system.your-account.workers.dev
```

### 8. 配置前端 API 地址

如果你的前端部署在不同的域名，需要更新 `src/api.ts` 中的 `API_BASE`：

```typescript
const API_BASE = 'https://crm-system.your-account.workers.dev/api'
```

## 本地开发

### 启动开发服务器

```bash
npm run dev
```

这会启动 Wrangler 开发服务器，通常在 `http://localhost:8787`

### 访问应用

打开浏览器访问 `http://localhost:8787`

## 生产环境配置

### 使用环境变量

在 `wrangler.toml` 中为生产环境配置不同的设置：

```toml
[env.production]
name = "crm-system-prod"
vars = { JWT_SECRET = "your-production-secret" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "crm_db_prod"
database_id = "production-database-id"
```

### 部署到生产环境

```bash
npm run deploy -- --env production
```

## 常见问题

### Q: 如何重置数据库？

```bash
npx wrangler d1 execute crm_db --command "DROP TABLE IF EXISTS follow_ups; DROP TABLE IF EXISTS customers; DROP TABLE IF EXISTS users;"
npx wrangler d1 execute crm_db --file schema.sql
```

### Q: 如何查看数据库内容？

```bash
npx wrangler d1 execute crm_db --command "SELECT * FROM users;"
```

### Q: 如何更新数据库架构？

编辑 `schema.sql` 后，执行：

```bash
npx wrangler d1 execute crm_db --file schema.sql
```

### Q: 部署后无法访问？

1. 检查 Wrangler 是否正确登录：`npx wrangler whoami`
2. 检查数据库 ID 是否正确
3. 查看部署日志：`npx wrangler tail`

## 监控和日志

### 查看实时日志

```bash
npx wrangler tail
```

### 查看部署历史

```bash
npx wrangler deployments list
```

## 备份和恢复

### 导出数据

```bash
npx wrangler d1 execute crm_db --command "SELECT * FROM customers;" > backup.json
```

### 导入数据

```bash
npx wrangler d1 execute crm_db --file backup.sql
```

## 性能优化

1. **启用缓存**：在 Cloudflare 仪表板中为 Workers 启用缓存
2. **使用 KV 存储**：对于频繁访问的数据，考虑使用 Cloudflare KV
3. **优化数据库查询**：添加适当的索引（已在 schema.sql 中包含）

## 安全建议

1. **更改 JWT 密钥**：在生产环境中使用强密钥
2. **启用 HTTPS**：Cloudflare Workers 默认使用 HTTPS
3. **限制 CORS**：根据需要限制允许的来源
4. **定期备份**：定期导出数据库备份

## 获取帮助

- Cloudflare 文档：https://developers.cloudflare.com/
- Wrangler 文档：https://developers.cloudflare.com/workers/wrangler/
- D1 文档：https://developers.cloudflare.com/d1/
