# Kairos — 记录生命中的每个瞬间

> καιρός — 希腊语「恰当的时刻」

一个现代化的个人生活动态记录应用，追踪你的书、音乐、影视和游戏。

详细更新记录请见 [CHANGELOG.md](CHANGELOG.md)。

![Kairos](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## 特性

- 📊 **GitHub 风格活动热力图** — 一眼看到你的记录频率
- ⌘ **Cmd+K 快速录入** — 命令面板搜索并录入（自动从 Hardcover/Google Books/TMDB/RAWG/MusicBrainz 填充元数据）
- 📚 **四大媒体类型** — 书 / 音乐 / 影视 / 游戏
- ✏️ **卡片点击即编辑** — Books / Music / Watch / Games 支持直接点击已有卡片编辑
- 🔎 **搜索高可用兜底** — 本地库优先 + 多上游聚合，第三方 API 不可用时仍可搜索本地数据
- 🧭 **可观测性增强** — 搜索链路分级日志 + `x-trace-id` 端到端追踪
- 🌙 **深色主题优先** — Linear/Raycast 风格极简 UI
- 🔒 **简单密码保护** — 管理入口密码保护，前端公开
- 🐳 **Docker 一键部署** — PostgreSQL + App 容器化

## 快速开始

### Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/your-user/kairos.git
cd kairos

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 API Keys 和管理密码 hash

# 3. 生成密码 hash
bunx bcryptjs hash "your-password"
# 将输出填入 .env 的 ADMIN_PASSWORD_HASH

# 4. 启动
docker compose up -d

# 5. 运行数据库迁移
docker compose exec app bun run db:push

# 6. （可选）填充示例数据
docker compose exec app bun run db:seed

# 访问 http://localhost:3000
```

### 本地开发

```bash
# 安装依赖
bun install

# 启动 PostgreSQL（需要本地安装或 Docker）
docker run -d --name kairos-pg \
  -e POSTGRES_USER=kairos \
  -e POSTGRES_PASSWORD=kairos \
  -e POSTGRES_DB=kairos \
  -p 5432:5432 \
  postgres:16-alpine

# 配置环境变量
cp .env.example .env

# 推送 schema 到数据库
bun run db:push

# 填充示例数据
bun run db:seed

# 启动开发服务器
bun run dev
```

## 环境变量

| 变量 | 说明 | 必须 |
|------|------|:----:|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `ADMIN_PASSWORD_HASH` | bcrypt 密码哈希 | ✅ |
| `JWT_SECRET` | JWT 签名密钥（≥32字符） | ✅ |
| `LOG_LEVEL` | 服务端日志级别（debug/info/warn/error） | 可选 |
| `TMDB_API_KEY` | TMDB API Key（影视搜索） | 搜索时需要 |
| `GOOGLE_BOOKS_API_KEY` | Google Books API Key | 搜索时需要 |
| `HARDCOVER_API_TOKEN` | Hardcover API Token（中文书搜索增强） | 推荐 |
| `RAWG_API_KEY` | RAWG API Key（游戏搜索） | 搜索时需要 |
| `LASTFM_API_KEY` | Last.fm API Key（音乐封面） | 搜索时需要 |

> 搜索 API 会在响应头返回 `x-trace-id`，可用该值串联后端日志排查问题。

## 技术栈

- **框架**: Next.js 15 (App Router, RSC)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **数据库**: PostgreSQL 16 + Drizzle ORM
- **认证**: JWT (jose) + bcrypt
- **动画**: Framer Motion
- **热力图**: react-activity-calendar
- **包管理**: Bun
- **部署**: Docker Compose

## 脚本

```bash
bun run dev         # 开发服务器
bun run build       # 生产构建
bun run start       # 启动生产服务器
bun run lint        # ESLint 检查
bun run db:generate # 生成迁移文件
bun run db:push     # 推送 schema 到数据库
bun run db:migrate  # 运行迁移
bun run db:studio   # 打开 Drizzle Studio
bun run db:seed     # 填充示例数据
```

## 许可

MIT
