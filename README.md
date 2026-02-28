# Kairos — 记录生命中的每个瞬间

> καιρός — 希腊语「恰当的时刻」

一个现代化的个人生活动态记录应用，追踪你的书、音乐、影视和游戏。

详细更新记录请见 [CHANGELOG.md](CHANGELOG.md)。

![Kairos](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## 特性

- 📊 **GitHub 风格活动热力图** — 一眼看到你的记录频率
- 📆 **最近一年热力图** — 展示「过去 365 天到今天」，避免未来日期空白格
- 📚 **书籍活动按阅读日期计入** — 书籍优先按 `startDate` / `finishDate` 计入热力图；仅在缺失时回退 `createdAt`
- ⌘ **Cmd+K 快速录入** — 命令面板搜索并录入（自动从 Hardcover/Google Books/TMDB/RAWG/MusicBrainz 填充元数据）
- 📚 **四大媒体类型** — 书 / 音乐 / 影视 / 游戏
- ✏️ **卡片点击即编辑** — Books / Music / Watch / Games 支持直接点击已有卡片编辑
- 🔎 **搜索高可用兜底** — 本地库优先 + 多上游聚合，第三方 API 不可用时仍可搜索本地数据
- 🧭 **可观测性增强** — 搜索链路分级日志 + `x-trace-id` 端到端追踪
- 🌙 **深色主题优先** — Linear/Raycast 风格极简 UI
- 🔒 **三种访问模式** — 支持 `public` / `private` / `password`，可在「管理设置」页实时切换（`/dashboard/settings`）
- 📥 **Goodreads 一键导入** — 在「管理设置」页上传 CSV，自动追加导入并跳过重复
- 🐳 **Docker 一键部署** — PostgreSQL + App 容器化
- 🗄️ **镜像内可执行迁移** — `latest` 镜像内置 `dist/migrate.js`，支持无源码环境初始化数据库

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
bun -e "import { hash } from 'bcryptjs'; console.log(await hash('your-password', 10))"
# 将输出填入 .env 的 ADMIN_PASSWORD_HASH（注意把 `$` 写成 `\$`）

# 4. 启动
docker compose up -d

# 5. 运行数据库迁移
docker compose exec app bun run db:push

# 6. （可选）填充示例数据
docker compose exec app bun run db:seed

# 访问 http://localhost:3000
```

### 仅镜像部署时初始化数据库

```bash
# 远端只有镜像、没有源码时可直接执行
docker run --rm \
  --network <your_network> \
  -e DATABASE_URL='postgresql://user:pass@db:5432/kairos' \
  ghcr.io/<owner>/<repo>:latest \
  bun dist/migrate.js
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
| `VIEWER_PASSWORD_HASH` | 访客密码 hash（`password` 模式可选，默认回退 ADMIN） | 可选 |
| `JWT_SECRET` | JWT 签名密钥（≥32字符） | ✅ |
| `SITE_VISIBILITY` | 默认访问模式（数据库未初始化时兜底） | 可选 |
| `LOG_LEVEL` | 服务端日志级别（debug/info/warn/error） | 可选 |
| `TMDB_API_KEY` | TMDB API Key（影视搜索） | 搜索时需要 |
| `GOOGLE_BOOKS_API_KEY` | Google Books API Key | 搜索时需要 |
| `HARDCOVER_API_TOKEN` | Hardcover API Token（中文书搜索增强） | 推荐 |
| `RAWG_API_KEY` | RAWG API Key（游戏搜索） | 搜索时需要 |
| `LASTFM_API_KEY` | Last.fm API Key（音乐封面） | 搜索时需要 |

> 搜索 API 会在响应头返回 `x-trace-id`，可用该值串联后端日志排查问题。
> 访问模式优先读取数据库中的管理设置；若无设置则回退到 `SITE_VISIBILITY`。
> bcrypt hash 写入 `.env` 时需要转义 `$`（示例：`\$2b\$10\$...`），否则会被环境变量展开导致登录失败。

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
bun run build:migrate # 构建运行时迁移脚本
bun run start       # 启动生产服务器
bun run lint        # ESLint 检查
bun run db:generate # 生成迁移文件
bun run db:push     # 推送 schema 到数据库
bun run db:migrate  # 运行迁移
bun run db:migrate:runtime # 执行镜像内运行时迁移脚本
bun run db:studio   # 打开 Drizzle Studio
bun run db:seed     # 填充示例数据
bun run db:import:goodreads -- /path/to/goodreads_library_export.csv          # 导入 Goodreads 书单
bun run db:import:goodreads -- /path/to/goodreads_library_export.csv --clear  # 导入前清空 books 表
```

后台导入入口：`/dashboard/settings` → Goodreads 导入。

## 许可

MIT
