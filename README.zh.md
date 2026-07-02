# Kairos — 记录生命中的每个瞬间

> καιρός — 希腊语「恰当的时刻」

[English README](README.md)

一个现代化的个人生活动态记录应用，追踪你的书、音乐、影视和游戏。

详细更新记录请见 [CHANGELOG.md](CHANGELOG.md)。
面向用户的版本摘要数据维护在 `src/data/product-changelog.{zh,en}.json`，用于产品更新日志页面（入口位于 `/dashboard/settings`）。
产品方向与执行优先级请见 [docs/product-roadmap.md](docs/product-roadmap.md)。

可选：使用 OpenAI 自动从 `CHANGELOG.md` 生成用户向版本摘要（支持中英文，自动处理技术术语）。脚本只会读取最新一个 release，并将新版本追加到 `src/data/product-changelog.{zh,en}.json` 顶部，不会改写历史版本描述：

```bash
OPENAI_API_KEY=your_key bun run changelog:generate:product
```

可通过 `OPENAI_CHANGELOG_MODEL` 覆盖默认模型（默认：`gpt-4o-mini`）。

![Kairos](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square)

## 特性

- 📊 **GitHub 风格活动热力图** — 一眼看到你的记录频率
- 📆 **最近一年热力图** — 展示「过去 365 天到今天」，避免未来日期空白格
- 🧩 **热力图日期键修正** — 统一活动日期键并按 `date(created_at)` 过滤，当天新增记录会正确着色显示
- 📚 **书籍活动按阅读日期计入** — 书籍优先按 `startDate` / `finishDate` 计入热力图；仅在缺失时回退 `createdAt`
- ⌘ **Cmd+K 快速录入** — 命令面板搜索并录入（支持 `/isbn 978...` 通过 Hardcover 按 ISBN 精确导入书籍元数据）
- 📚 **四大媒体类型** — 书 / 音乐 / 影视 / 游戏
- ✏️ **卡片点击即编辑** — Books / Music / Watch / Games 支持直接点击已有卡片编辑
- 🔎 **搜索高可用兜底** — 本地库优先 + 多上游聚合，第三方 API 不可用时仍可搜索本地数据
- 🧭 **可观测性增强** — 搜索链路分级日志 + `x-trace-id` 端到端追踪
- 🌓 **白天/暗夜/自动主题** — 支持手动切换和跟随系统主题自动切换
- 🌐 **多语言支持 (i18n)** — 支持中英文切换，适配多语言用户
- 💾 **数据管理 (JSON 备份)** — 支持在管理设置页导出所有媒体记录为 JSON 文件，方便备份与迁移
- 📝 **产品更新日志入口整合** — 「更新日志」入口已收纳到设置页，减少外层导航冗余
- 🔒 **三种访问模式** — 支持 `public` / `private` / `password`，可在「管理设置」页实时切换（`/dashboard/settings`）
- 🏷️ **标签录入与多作者支持** — 采用 `TagInput` 组件，支持回车/逗号录入多个作者与类别，分类标签自动配色，作者标签简洁去色
- 🗑️ **记录删除与动态同步** — 编辑已有记录时支持点击垃圾桶图标删除，删除后实时从个人仪表盘及广场同步移除
- 💿 **音乐类型区分** — 支持专辑 (Album) 和单曲 (Track) 类型，Spotify 搜索自动识别，外部数据源类型锁定，广场动态显示类型图标
- 📝 **预留用户名保护** — 注册时自动保留 admin、official、system 等官方用户名，防止被占用
- 👥 **多用户账号体系** — 支持注册账号，每位用户默认仅查看自己的时间线
- 🌐 **公开广场 (Plaza)** — 用户可切换“是否公开摘要动态”，并在广场（`/plaza`）展示最近活动
- 📥 **Goodreads 一键导入** — 在「管理设置」页上传 CSV，自动追加导入并跳过重复
- 🐳 **Docker 一键部署** — PostgreSQL + App 容器化
- 🗄️ **镜像内可执行迁移** — `latest` 镜像内置 `dist/migrate.js`，支持无源码环境初始化数据库

## 快速开始

### Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/d0zingcat/kairos.git
cd kairos

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入 DATABASE_URL / JWT_SECRET / 各搜索 API Keys

# 4. 启动
docker compose up -d

# 5. （可选）填充示例数据
docker compose exec app bun run db:seed

# 访问 http://localhost:3000
```

### 仅镜像部署时初始化数据库

```bash
# 远端只有镜像、没有源码时可直接执行
docker run --rm \
  --network <your_network> \
  -e DATABASE_URL='postgresql://user:pass@db:5432/kairos' \
  ghcr.io/d0zingcat/kairos:latest \
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

# 启动开发服务器（启动时会自动执行 migration）
bun run dev

# （可选）填充示例数据
bun run db:seed
```

## 环境变量

| 变量 | 说明 | 必须 |
|------|------|:----:|
| `DATABASE_URL` | PostgreSQL 连接字符串 | ✅ |
| `DB_AUTO_MIGRATE` | 启动时自动执行 migration（默认开启） | 可选 |
| `JWT_SECRET` | JWT 签名密钥（≥32字符） | ✅ |
| `SITE_VISIBILITY` | 默认访问模式（数据库未初始化时兜底） | 可选 |
| `LOG_LEVEL` | 服务端日志级别（debug/info/warn/error） | 可选 |
| `TMDB_API_KEY` | TMDB API Key（影视搜索） | 搜索时需要 |
| `GOOGLE_BOOKS_API_KEY` | Google Books API Key | 搜索时需要 |
| `HARDCOVER_API_TOKEN` | Hardcover API Token（中文书搜索增强） | 推荐 |
| `RAWG_API_KEY` | RAWG API Key（游戏搜索） | 搜索时需要 |
| `SPOTIFY_CLIENT_ID` | Spotify Client ID（音乐搜索优先源） | 推荐 |
| `SPOTIFY_CLIENT_SECRET` | Spotify Client Secret | 推荐 |
| `LASTFM_API_KEY` | Last.fm API Key（音乐封面兜底） | 搜索时需要 |
| `NEXT_PUBLIC_SITE_AUTHOR` | 网站底部显示的作者名称，默认 d0zingcat | 可选 |
| `NEXT_PUBLIC_GITHUB_URL` | 网站底部 GitHub 图标跳转链接，默认跳转作者仓库 | 可选 |
| `NEXT_PUBLIC_GITHUB_REPO` | 设置页版本检查使用的 GitHub 仓库，格式 `owner/repo` | 可选 |
| `GITHUB_TOKEN` | 私有仓库版本检查使用的服务端 GitHub Token | 私有仓库推荐 |

> 搜索 API 会在响应头返回 `x-trace-id`，可用该值串联后端日志排查问题。
> 访问模式优先读取数据库中的管理设置；若无设置则回退到 `SITE_VISIBILITY`。
> 首次启动后请访问 `/register` 注册账号；首个账号自动成为管理员。
> 若 `NEXT_PUBLIC_GITHUB_REPO` 指向私有仓库，请同时配置 `GITHUB_TOKEN`，否则版本检查会显示“无法验证最新版本”而不是误报“已是最新”。

## 安全部署

自托管并面向公网时，请务必：

- **设置强随机 `JWT_SECRET`**（≥32 字符）。未配置时开发环境会使用内置 fallback，**生产环境绝不可依赖该默认值**。
- **修改数据库默认凭据**。`docker-compose.yml` 与 README 示例中的 `kairos/kairos` 仅适合本地开发。
- **不要在生产环境执行 `db:seed`**。该脚本会创建演示账号，默认密码为 `admin12345`。
- **妥善保管 API Key**。所有第三方密钥通过 `.env` 注入，勿提交到版本库。
- 根据威胁模型配置 `SITE_VISIBILITY`、注册策略与反向代理（HTTPS、速率限制等）。

更多说明见 [SECURITY.md](SECURITY.md)。

## 数据来源与归属

搜索与元数据来自以下第三方服务，自托管时需自行申请 API Key 并遵守各自使用条款：

| 服务 | 用途 | 文档 |
|------|------|------|
| TMDB | 影视搜索与海报 | https://www.themoviedb.org/documentation/api |
| Spotify | 音乐搜索（优先源） | https://developer.spotify.com/documentation/web-api |
| RAWG | 游戏搜索 | https://rawg.io/apidocs |
| Google Books | 书籍搜索 | https://developers.google.com/books |
| Hardcover | 中文书籍增强 | https://hardcover.app/account/api |
| MusicBrainz | 音乐元数据兜底 | https://musicbrainz.org/doc/MusicBrainz_API |
| Last.fm | 音乐封面兜底 | https://www.last.fm/api |
| OpenAI | 广场内容审核（可选） | https://platform.openai.com/docs |

使用 TMDB 数据时，应用页脚与设置页会展示归属声明：

> *This product uses the TMDB API but is not endorsed or certified by TMDB.*

## 多用户与广场说明

- 默认情况下，用户只能查看和管理自己的记录（书/音乐/影视/游戏）。
- 在 `Dashboard -> Settings` 可切换“公开个人摘要”开关，控制是否出现在广场。
- 广场页面位于 `/plaza`，展示已公开用户的摘要与最近动态。
- 公开用户主页位于 `/u/<username>`，未公开用户不会暴露主页内容。
- 广场动态采用无限滚动加载，网络失败时支持“点击重试”，恢复后会显示短暂提示。

## 技术栈

- **框架**: Next.js 16 (App Router, RSC)
- **UI**: Tailwind CSS v4 + shadcn/ui
- **数据库**: PostgreSQL 16 + Drizzle ORM
- **缓存**: Redis (ioredis) — 用于加速第三方 API 搜索与详情查询
- **认证**: JWT (jose) + bcrypt
- **自动化测试**: Vitest + Playwright
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
bun run db:push     # 推送 schema 到数据库（可选：本地快速同步 schema）
bun run db:migrate  # 运行迁移
bun run db:migrate:runtime # 执行镜像内运行时迁移脚本（远端/生产镜像推荐）
bun run db:studio   # 打开 Drizzle Studio
bun run db:seed     # 填充示例数据
bun run db:import:goodreads -- /path/to/goodreads_library_export.csv <userId>          # 导入 Goodreads 书单
bun run db:import:goodreads -- /path/to/goodreads_library_export.csv <userId> --clear  # 导入前清空该用户 books
```

### Migration 基线重置说明（破坏性）

- 当前仓库已重置为新的 Drizzle 基线迁移：`drizzle/0000_init.sql`。
- 启动时自动迁移仅调用 Drizzle 官方 migrator，不会手动修改 Drizzle metadata。
- Docker 镜像构建不会执行 `db:generate`，生产环境只应用仓库中已提交的 `drizzle/*.sql` 迁移文件。
- 若你的数据库里仍有旧结构且不需要保留数据，请先执行一次：

```sql
drop schema if exists public cascade;
create schema public;
```

- 然后再启动应用（`bun run dev` / `bun run start`）让自动迁移重建表结构。

后台导入入口：`/dashboard/settings` → Goodreads 导入。

## Agent 协作约定

- 仓库根目录新增 `AGENTS.md`，用于统一 Codex / Claude Code 的默认收尾流程。
- 可通过口令 `收尾` 或 `ship` 触发：更新文档、更新 `CHANGELOG`、bump version、commit、push、创建/更新 PR。
- 禁止代理直接向 `main` 提交，所有变更必须通过 PR 合并。

## 开源

本项目以 [MIT License](LICENSE) 发布。欢迎 Fork、自托管与贡献；变更请通过 Pull Request 提交。

将仓库设为 Public 前，请确认：

- `.env` 未提交且 git 历史中无密钥泄露
- 生产实例已更换默认凭据与 `JWT_SECRET`
- GHCR 镜像若需公开分发，请在 GitHub Packages 设置中调整可见性

## 许可

[MIT](LICENSE) — Copyright (c) 2026 d0zingcat
