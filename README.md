# 🎬 MovieSite Admin - 专业电影网站后台管理系统

一个功能完整、企业级的电影网站后台管理系统，提供内容管理、数据分析、用户管理、品牌配置等全方位解决方案。

## ✨ 系统特色

### 🏗️ 企业级架构
- **Monorepo 设计**: 统一的代码管理和部署
- **微服务架构**: 模块化设计，易于扩展
- **TypeScript 全栈**: 类型安全，开发效率高
- **现代技术栈**: Next.js 14 + NestJS + Prisma

### 🔐 安全与权限
- **JWT 认证系统**: 安全的用户身份验证
- **RBAC 权限控制**: 细粒度的角色权限管理
- **双因子认证 (2FA)**: 提升账户安全性
- **审计日志**: 完整的操作记录和追踪

### 📊 数据与分析
- **ClickHouse 分析**: 高性能实时数据分析
- **Redis 缓存**: 多层缓存优化性能
- **Meilisearch 搜索**: 快速全文搜索引擎
- **实时仪表盘**: 关键指标监控

### 🎥 内容管理
- **多媒体支持**: 电影、剧集、纪录片管理
- **元数据管理**: 演员、导演、类型、标签
- **媒体资源**: 海报、预告片、字幕管理
- **首页编排**: 可视化内容布局配置

## 🏛️ 系统架构

```
moviesite-admin/
├── apps/
│   ├── admin/                 # Next.js 14 管理后台前端
│   │   ├── src/
│   │   │   ├── app/          # App Router 页面
│   │   │   ├── components/   # React 组件
│   │   │   ├── hooks/        # 自定义 Hooks
│   │   │   └── lib/          # 工具库
│   │   └── package.json
│   │
│   └── api/                   # NestJS 后端 API
│       ├── src/
│       │   ├── modules/      # 功能模块
│       │   │   ├── auth/     # 认证系统
│       │   │   ├── content/  # 内容管理
│       │   │   ├── analytics/# 数据分析
│       │   │   ├── brand/    # 品牌管理
│       │   │   └── admin/    # 系统管理
│       │   └── main.ts
│       ├── prisma/           # 数据库模型
│       └── package.json
│
├── packages/
│   ├── ui/                   # 共享 UI 组件库
│   └── config/               # 共享配置和类型
│
└── package.json              # Monorepo 根配置
```

## 🗄️ 数据库设计

### 核心数据模型
- **内容模型**: Movie, Series, Season, Episode
- **人员模型**: Person, Credit (演员关系)
- **分类模型**: Genre, Tag, Collection
- **媒体模型**: Artwork, Source, Subtitle
- **用户模型**: User, UserHistory, UserFavorite
- **权限模型**: AdminUser, Role, Permission
- **品牌模型**: Brand, Sponsor, Campaign
- **系统模型**: AuditLog, HomepageSection

### 技术栈
- **主数据库**: PostgreSQL (业务数据)
- **分析数据库**: ClickHouse (行为分析)
- **缓存数据库**: Redis (会话、缓存)
- **搜索引擎**: Meilisearch (全文搜索)
- **对象存储**: S3 兼容 (媒体文件)

## 🚀 快速开始

### 环境要求
- Node.js ≥ 18.0.0
- PostgreSQL ≥ 14
- Redis ≥ 6.0
- ClickHouse ≥ 22.0 (可选)
- Meilisearch ≥ 1.0 (可选)

### 1. 安装依赖
```bash
# 安装所有依赖
npm run install:all

# 或分别安装
npm install
cd apps/api && npm install
cd ../admin && npm install
```

### 2. 环境配置
```bash
# 复制环境配置文件
cp apps/api/.env.example apps/api/.env

# 编辑数据库连接信息
# DATABASE_URL="postgresql://username:password@localhost:5432/moviesite_db"
# REDIS_URL="redis://localhost:6379"
# CLICKHOUSE_URL="http://localhost:8123"
```

### 3. 数据库初始化
```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库 Schema
npm run db:push

# 初始化默认管理员
curl -X POST http://localhost:3001/api/admin/system/init-admin
```

### 4. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境
npm run build
npm run start
```

### 5. 访问系统
- **管理后台**: http://localhost:3000
- **API 文档**: http://localhost:3001/api/docs
- **默认管理员**: admin@moviesite.com / change-me-in-production

## 📋 功能模块

### 🎬 内容管理 (Content Management)
- ✅ 电影/剧集 CRUD 操作
- ✅ 季/集管理 (Series/Season/Episode)
- ✅ 演员/导演/编剧管理
- ✅ 类型/标签/集合管理
- ✅ 媒体资源上传 (海报/字幕/视频源)
- ✅ 首页布局可视化编排
- ✅ 批量导入和数据统计

### 🔐 认证权限 (Auth & RBAC)
- ✅ JWT Token 认证
- ✅ 基于角色的权限控制 (40+ 权限点)
- ✅ Google Authenticator 双因子认证
- ✅ 管理员用户管理
- ✅ 角色权限矩阵配置
- ✅ 完整的审计日志

### 📊 数据分析 (Analytics)
- 🔄 实时访问统计
- 🔄 内容热度分析
- 🔄 播放质量监控
- 🔄 用户行为漏斗
- 🔄 留存率分析
- 🔄 搜索词汇分析

### 🎨 品牌管理 (Brand & Sponsors)
- 🔄 Logo/色彩/字体配置
- 🔄 赞助商管理
- 🔄 广告位投放
- 🔄 A/B 测试
- 🔄 点击率统计

### 👥 用户管理 (User Management)
- 🔄 用户信息管理
- 🔄 观看历史/收藏
- 🔄 举报处理
- 🔄 封禁/警告系统

### 🔍 搜索 SEO (Search & SEO)
- 🔄 Meilisearch 集成
- 🔄 搜索索引管理
- 🔄 SEO 元数据
- 🔄 站点地图生成

## 🛠️ 开发指南

### API 开发
```bash
# 启动 API 开发服务器
cd apps/api
npm run start:dev

# 查看 API 文档
open http://localhost:3001/api/docs

# 数据库操作
npm run db:studio    # 打开数据库管理界面
npm run db:migrate   # 创建迁移
```

### 前端开发
```bash
# 启动前端开发服务器
cd apps/admin
npm run dev

# 构建生产版本
npm run build
```

### 数据库管理
```bash
# Prisma 操作
npm run db:generate  # 生成客户端
npm run db:push      # 推送 Schema
npm run db:migrate   # 创建迁移
npm run db:studio    # 数据库管理界面
```

## 🔧 配置说明

### 核心配置 (.env)
```env
# 数据库配置
DATABASE_URL="postgresql://user:pass@localhost:5432/moviesite_db"
REDIS_URL="redis://localhost:6379"
CLICKHOUSE_URL="http://localhost:8123"

# 认证配置
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# 文件存储
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="moviesite-media"

# 搜索引擎
MEILISEARCH_URL="http://localhost:7700"
MEILISEARCH_API_KEY="your-meilisearch-key"
```

### 权限配置
系统提供 40+ 细粒度权限控制：
- `dashboard.view` - 仪表盘查看
- `content.movies.*` - 电影管理权限
- `analytics.*` - 数据分析权限
- `brand.*` - 品牌管理权限
- `admin.users.*` - 系统管理权限

### 默认角色
- **Super Admin**: 完整系统权限
- **Content Manager**: 内容管理权限
- **Marketing Manager**: 品牌营销权限
- **Analyst**: 数据分析权限
- **Moderator**: 内容审核权限

## 🚀 部署指南

### Docker 部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/moviesite
    depends_on:
      - db
      - redis

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: moviesite
      POSTGRES_PASSWORD: password

  redis:
    image: redis:7-alpine
```

### 生产部署步骤
1. **构建应用**
   ```bash
   npm run build
   ```

2. **数据库迁移**
   ```bash
   npm run db:migrate
   ```

3. **初始化数据**
   ```bash
   curl -X POST https://your-domain.com/api/admin/system/init-admin
   curl -X POST https://your-domain.com/api/admin/system/init-permissions
   curl -X POST https://your-domain.com/api/admin/system/init-roles
   ```

4. **启动服务**
   ```bash
   npm run start
   ```

## 📈 性能优化

### 数据库优化
- 使用数据库索引优化查询
- ClickHouse 预聚合视图
- Redis 多层缓存策略

### 前端优化
- Next.js App Router 和 SSR
- 组件懒加载和代码分割
- 图片压缩和 CDN 分发

### API 优化
- 查询结果缓存
- 批量操作支持
- API 限流和防护

## 🔒 安全特性

### 认证安全
- JWT Token 自动过期
- 双因子认证支持
- 会话管理和撤销

### 数据安全
- SQL 注入防护
- XSS 攻击防护
- CSRF 令牌验证

### 操作安全
- 完整审计日志
- 敏感操作确认
- IP 白名单 (可选)

## 📊 监控告警

### 系统监控
- API 响应时间监控
- 数据库性能监控
- 错误率和异常追踪

### 业务监控
- 内容发布统计
- 用户活跃度监控
- 存储使用量监控

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持与反馈

- 📧 邮箱: support@moviesite.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-org/moviesite-admin/issues)
- 📖 文档: [项目 Wiki](https://github.com/your-org/moviesite-admin/wiki)

---

⭐ 如果这个项目对你有帮助，请给个 Star！
