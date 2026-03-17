# 快速开始指南

## 项目已创建！🎉

你的保研销售 CRM 系统已经完全搭建好了。以下是快速开始的步骤。

## 项目结构

```
CRM/
├── src/
│   ├── index.ts              # Hono 后端 API
│   ├── main.tsx              # React 入口
│   ├── App.tsx               # 主应用组件
│   ├── api.ts                # API 客户端
│   ├── store.ts              # Zustand 状态管理
│   ├── index.css             # 全局样式
│   ├── pages/
│   │   ├── LoginPage.tsx      # 登录/注册
│   │   └── MainPage.tsx       # 主仪表板
│   └── components/
│       ├── Dashboard.tsx      # 统计仪表板
│       ├── CustomerList.tsx   # 客户列表
│       ├── CustomerDetail.tsx # 客户详情
│       └── CustomerForm.tsx   # 添加客户表单
├── schema.sql                # 数据库架构
├── wrangler.toml             # Cloudflare 配置
├── vite.config.ts            # Vite 配置
├── tailwind.config.js        # Tailwind 配置
├── package.json              # 项目依赖
├── README.md                 # 项目文档
└── DEPLOYMENT.md             # 部署指南
```

## 第一步：安装依赖

```bash
cd "f:\付恒\项目\CRM"
npm install
```

## 第二步：本地开发

```bash
npm run dev
```

然后打开浏览器访问 `http://localhost:8787`

### 测试账户

- 邮箱：test@example.com
- 密码：password123

（首次访问时可以注册新账户）

## 第三步：部署到 Cloudflare

详见 `DEPLOYMENT.md` 文件，包含完整的部署步骤。

快速部署命令：

```bash
# 1. 登录 Cloudflare
npx wrangler login

# 2. 创建数据库
npx wrangler d1 create crm_db

# 3. 初始化数据库
npx wrangler d1 execute crm_db --file schema.sql

# 4. 更新 wrangler.toml 中的数据库 ID

# 5. 部署
npm run deploy
```

## 功能概览

### 1. 用户认证
- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT Token 认证
- ✅ 多用户支持

### 2. 客户管理
- ✅ 添加客户
- ✅ 编辑客户信息
- ✅ 删除客户
- ✅ 搜索和筛选客户

### 3. 客户信息字段
- 基本信息：姓名、邮箱、电话
- 学术信息：本科院校、专业、GPA
- 目标信息：目标院校、目标专业
- 商业信息：预算、销售阶段、状态

### 4. 销售阶段
- 初次接触
- 需求沟通
- 方案制定
- 签约

### 5. 跟进记录
- ✅ 添加跟进记录
- ✅ 记录跟进日期和内容
- ✅ 查看历史跟进记录

### 6. 数据统计
- ✅ 总客户数
- ✅ 销售阶段分布
- ✅ 销售漏斗可视化
- ✅ 进行中/已完成统计

## 技术栈详情

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18 | 用户界面 |
| 前端样式 | Tailwind CSS | 响应式设计 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 后端框架 | Hono | 轻量级 Web 框架 |
| 运行环境 | Cloudflare Workers | 边缘计算 |
| 数据库 | Cloudflare D1 | SQLite 数据库 |
| 认证 | JWT | Token 认证 |
| 构建工具 | Vite | 快速构建 |

## API 端点

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 客户
- `GET /api/customers` - 获取所有客户
- `POST /api/customers` - 创建客户
- `PUT /api/customers/:id` - 更新客户
- `DELETE /api/customers/:id` - 删除客户

### 跟进记录
- `GET /api/customers/:id/follow-ups` - 获取跟进记录
- `POST /api/customers/:id/follow-ups` - 添加跟进记录

### 统计
- `GET /api/stats` - 获取统计数据

## 常见问题

### Q: 如何修改 JWT 密钥？
编辑 `wrangler.toml`：
```toml
[vars]
JWT_SECRET = "your-new-secret"
```

### Q: 如何添加新的客户字段？
1. 修改 `schema.sql` 中的 `customers` 表
2. 更新 `src/store.ts` 中的 `Customer` 接口
3. 更新 `src/components/CustomerForm.tsx` 和 `CustomerDetail.tsx`
4. 更新后端 API 处理逻辑

### Q: 如何自定义样式？
编辑 `tailwind.config.js` 和 `src/index.css`

### Q: 如何添加新的销售阶段？
1. 修改 `src/components/CustomerForm.tsx` 中的 select 选项
2. 修改 `src/components/CustomerDetail.tsx` 中的 select 选项
3. 修改 `src/components/Dashboard.tsx` 中的阶段统计逻辑

## 下一步

1. **本地测试**：运行 `npm run dev` 测试所有功能
2. **自定义配置**：根据需要修改样式和配置
3. **部署**：按照 `DEPLOYMENT.md` 部署到 Cloudflare
4. **监控**：使用 `npx wrangler tail` 监控日志

## 获取帮助

- 查看 `README.md` 了解详细文档
- 查看 `DEPLOYMENT.md` 了解部署步骤
- 查看代码注释了解实现细节

## 许可证

MIT

---

祝你使用愉快！如有问题，欢迎反馈。
