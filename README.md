# Kairos — 记录生命中的每个瞬间

> καιρός — 希腊语「恰当的时刻」

一个现代化的个人生活动态记录应用，追踪你的书、音乐、影视和游戏。

![Kairos](https://img.shields.io/badge/Next.js-15-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## 特性

- 📊 **GitHub 风格活动热力图** — 一眼看到你的记录频率
- ⌘ **Cmd+K 快速录入** — 命令面板搜索并录入（自动从 TMDB/Google Books/RAWG/MusicBrainz 填充元数据）
- 📚 **四大媒体类型** — 书 / 音乐 / 影视 / 游戏
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
| `TMDB_API_KEY` | TMDB API Key（影视搜索） | 搜索时需要 |
| `GOOGLE_BOOKS_API_KEY` | Google Books API Key | 搜索时需要 |
| `RAWG_API_KEY` | RAWG API Key（游戏搜索） | 搜索时需要 |
| `LASTFM_API_KEY` | Last.fm API Key（音乐封面） | 搜索时需要 |

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

## Changelog

### v0.1.0 — 2026-02-26 (Initial Release)

**项目初始化**
- 使用 Next.js 16 (App Router) + Tailwind CSS v4 + shadcn/ui 搭建项目骨架
- 配置 Bun 作为包管理器，Turbopack 开发构建

**数据库**
- PostgreSQL 16 + Drizzle ORM，定义 4 张核心表 (`books`, `music`, `watches`, `games`)
- 5 个 PostgreSQL enum 类型（book_status, music_type, watch_type, watch_status, game_status）
- drizzle-kit 脚本集成：generate / push / migrate / studio / seed
- 示例种子数据（12 条记录覆盖全部类型）

**认证系统**
- 简单密码保护（bcrypt 哈希 + JWT 会话）
- middleware 守护 `/dashboard` 路由，公开首页和登录页
- HttpOnly cookie 存储 JWT，30 天过期

**第三方 API 集成**
- TMDB API — 电影 / 电视剧搜索与详情
- Google Books API — 书籍搜索与元数据
- RAWG API — 游戏搜索与详情
- MusicBrainz + Last.fm — 音乐搜索与封面（Cover Art Archive 回退 Last.fm）
- 统一代理路由 `/api/search/[type]`，避免前端暴露 API Key

**核心 UI**
- 深色主题优先（zinc-950 背景 + amber/orange 强调色渐变）
- Geist / Geist Mono 字体，中文回退
- 响应式布局：桌面侧边栏 + 移动端底部 Tab 栏
- Dashboard Overview：活动热力图 + 统计卡片 + 最近活动 Timeline + 收藏网格
- 四大分类页面（Books / Music / Watch / Games）：卡片网格 + 状态筛选 + 排序 + 搜索
- 空状态设计，Skeleton 加载占位

**快速录入系统**
- ⌘K 全局命令面板（基于 cmdk），支持类型前缀 `/book`, `/music`, `/movie`, `/tv`, `/game`
- 300ms debounce 搜索第三方 API，结果带封面缩略图
- 录入 Dialog：自动填充元数据、⭐ 星星评分（键盘 1-5 快速评分）、日历选择日期、状态下拉、笔记、收藏
- Server Actions 提交表单，自动 revalidate 相关路径

**热力图**
- 基于 react-activity-calendar v3，amber 色阶渐变
- 全年数据填充，hover tooltip 显示各类型明细
- 自定义 legend 色阶展示

**动画**
- Framer Motion：Nav 指示器 layoutId 动画、卡片 stagger 入场、Dialog 过渡
- 登录页 Logo + 表单入场动画

**部署**
- 多阶段 Dockerfile（oven/bun 镜像，standalone 输出）
- docker-compose.yml：PostgreSQL 16 + App，健康检查，持久化 volume
- `.env.example` 列出所有必需环境变量

## 许可

MIT
