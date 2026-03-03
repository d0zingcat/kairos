"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Locale = "zh" | "en";

type Messages = {
  [key: string]: string | Messages;
 };

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Simple Chinese messages (embedded for initial load)
const zhMessages: Messages = {
  common: {
    save: "保存",
    cancel: "取消",
    delete: "删除",
    edit: "编辑",
    add: "添加",
    search: "搜索",
    loading: "加载中...",
    retry: "点击重试",
    noMore: "没有更多了",
  },
  nav: {
    quickEntry: "快速录入",
    readOnly: "只读模式",
    loggedIn: "已登录",
    guestMode: "访客模式",
    logout: "退出",
    login: "登录 / 注册",
  },
  theme: {
    light: "白天",
    dark: "暗夜",
    system: "自动",
    switch: "切换主题",
  },
  search: {
    placeholder: "搜索...",
    all: "全部",
    searchType: "当前模式：{type}",
    enterKeyword: "输入关键词后开始搜索",
    clearMode: "清除模式",
    noResults: "未找到结果",
    shortcuts: "快捷指令",
    book: "书籍",
    music: "音乐",
    movie: "电影",
    tv: "电视剧",
    game: "游戏",
    searchBook: "搜索书籍",
    searchMusic: "搜索音乐",
    searchMovie: "搜索电影",
    searchTv: "搜索电视剧",
    searchGame: "搜索游戏",
    searchWithType: "搜索{type}...",
    searchTip: "输入 /book, /music, /movie, /tv, /game 后搜索...",
  },
  entry: {
    title: "录入记录",
    rating: "评分 (按 1-5 快速评分)",
    startDate: "开始阅读",
    finishDate: "结束阅读",
    selectStartDate: "选择开始日期",
    selectFinishDate: "选择结束日期",
    author: "作者",
    authorPlaceholder: "输入作者后按回车，支持多个",
    category: "类别",
    categoryPlaceholder: "输入类别后按回车，支持多个",
    date: "日期",
    status: "状态",
    myRating: "我的评价",
    note: "笔记",
    notePlaceholder: "写点什么...",
    confirmDelete: "确定要删除这条记录吗？此操作不可撤销。",
  },
  status: {
    reading: "在读",
    completed: "已完成",
    paused: "暂停",
    abandoned: "放弃",
  },
  activity: {
    recentYear: "最近一年活动记录",
    less: "少",
    more: "多",
    books: "书",
    music: "音乐",
    watches: "影视",
    games: "游戏",
    records: "条记录",
  },
  feed: {
    read: "读了",
    listened: "听了",
    watched: "看了",
    played: "玩了",
    loadFailed: "加载失败，请稍后重试",
    noPublicFeed: "还没有公开动态，先去记录你的第一条时间线吧。",
    loadingMore: "加载更多中...",
    resumed: "已恢复加载",
    noMoreFeed: "没有更多动态了",
  },
  dashboard: {
    favorites: "收藏",
    noFavorites: "还没有收藏",
    author: "作者：{authors}",
    readingTime: "阅读时间：{start} → {finish}",
    monthly: "本月",
    yearly: "本年",
    total: "总计",
    recentActivity: "最近活动",
    noRecords: "还没有记录",
    startEntry: "按 ⌘K 开始录入",
  },
  media: {
    noRecords: "还没有{type}记录",
    quickAdd: "按 {key} 快速添加",
  },
  version: {
    checking: "检查版本...",
    foundNew: "发现新版本",
    current: "当前",
    latest: "最新",
    goToGithub: "点击前往 GitHub 查看更新",
    currentVersion: "当前版本",
    upToDate: "已是最新版本",
  },
  settings: {
    public: "公开",
    publicDesc: "任何人都可浏览，只有管理员可编辑。",
    private: "私有",
    privateDesc: "只有管理员可以访问与编辑。",
    passwordProtected: "密码保护",
    passwordProtectedDesc: "输入访问密码后可浏览，管理员密码可编辑。",
    passwordNote: "密码保护模式使用 `VIEWER_PASSWORD_HASH`（未配置时回退管理员密码）。",
    saving: "保存中...",
    saveSettings: "保存设置",
  },
  visibility: {
    title: "公开广场可见性",
    description: "开启后，你的摘要统计与最近动态会出现在广场页面。",
    public: "公开到广场",
    publicDesc: "其他人可在广场看到你的摘要动态",
    private: "仅自己可见",
    privateDesc: "你的摘要不会出现在广场",
    saving: "保存中...",
    savePublicSettings: "保存公开设置",
  },
  goodreads: {
    title: "Goodreads 导入",
    description: "上传 Goodreads 导出的 CSV 文件，系统将追加导入并自动跳过重复书籍。",
    summary: "导入完成：新增 {inserted} 条，跳过 {skipped} 条，源数据 {total} 条。",
    duplicateNote: "重复判定：Book Id 优先，缺失时使用 书名+作者。",
    importing: "导入中...",
    import: "导入 Goodreads",
    noFile: "请先选择 Goodreads 导出 CSV 文件",
    importFailed: "导入失败",
    retryImport: "导入失败，请稍后重试",
  },
  login: {
    title: "输入你的账号密码",
    username: "用户名",
    password: "密码",
    submitting: "登录中...",
    login: "登录",
    noAccount: "没有账号？",
    register: "注册一个",
    createAccount: "创建账号",
    firstUserNote: "首个注册用户将自动成为管理员",
    usernamePlaceholder: "用户名（小写字母/数字/_-.）",
    passwordPlaceholder: "密码（至少 8 位）",
    confirmPassword: "确认密码",
    submittingRegister: "创建中...",
    registerAndEnter: "注册并进入",
    hasAccount: "已有账号？",
    goLogin: "去登录",
  },
  metadata: {
    title: "Kairos — 记录生命中的每个瞬间",
    description: "个人生活动态记录应用：书、音乐、影视、游戏",
  },
};

const enMessages: Messages = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    loading: "Loading...",
    retry: "Click to retry",
    noMore: "No more",
  },
  nav: {
    quickEntry: "Quick Entry",
    readOnly: "Read Only",
    loggedIn: "Logged In",
    guestMode: "Guest Mode",
    logout: "Logout",
    login: "Login / Register",
  },
  theme: {
    light: "Light",
    dark: "Dark",
    system: "Auto",
    switch: "Switch Theme",
  },
  search: {
    placeholder: "Search...",
    all: "All",
    searchType: "Current mode: {type}",
    enterKeyword: "Enter keywords to start searching",
    clearMode: "Clear Mode",
    noResults: "No results found",
    shortcuts: "Shortcuts",
    book: "Books",
    music: "Music",
    movie: "Movies",
    tv: "TV Shows",
    game: "Games",
    searchBook: "Search Books",
    searchMusic: "Search Music",
    searchMovie: "Search Movies",
    searchTv: "Search TV Shows",
    searchGame: "Search Games",
    searchWithType: "Search {type}...",
    searchTip: "Type /book, /music, /movie, /tv, /game to search...",
  },
  entry: {
    title: "Add Entry",
    rating: "Rating (Press 1-5 to rate quickly)",
    startDate: "Start Date",
    finishDate: "Finish Date",
    selectStartDate: "Select start date",
    selectFinishDate: "Select finish date",
    author: "Author",
    authorPlaceholder: "Enter author and press enter, supports multiple",
    category: "Category",
    categoryPlaceholder: "Enter category and press enter, supports multiple",
    date: "Date",
    status: "Status",
    myRating: "My Rating",
    note: "Note",
    notePlaceholder: "Write something...",
    confirmDelete: "Are you sure you want to delete this entry? This cannot be undone.",
  },
  status: {
    reading: "Reading",
    completed: "Completed",
    paused: "Paused",
    abandoned: "Abandoned",
  },
  activity: {
    recentYear: "Activity in the Past Year",
    less: "Less",
    more: "More",
    books: "books",
    music: "music",
    watches: "shows",
    games: "games",
    records: "records",
  },
  feed: {
    read: "read",
    listened: "listened to",
    watched: "watched",
    played: "played",
    loadFailed: "Failed to load, please try again later",
    noPublicFeed: "No public posts yet. Start recording your timeline!",
    loadingMore: "Loading more...",
    resumed: "Loading resumed",
    noMoreFeed: "No more posts",
  },
  dashboard: {
    favorites: "Favorites",
    noFavorites: "No favorites yet",
    author: "Author: {authors}",
    readingTime: "Reading time: {start} → {finish}",
    monthly: "This Month",
    yearly: "This Year",
    total: "Total",
    recentActivity: "Recent Activity",
    noRecords: "No records yet",
    startEntry: "Press ⌘K to start adding",
  },
  media: {
    noRecords: "No {type} records yet",
    quickAdd: "Press {key} to quickly add",
  },
  version: {
    checking: "Checking version...",
    foundNew: "New version found",
    current: "Current",
    latest: "Latest",
    goToGithub: "Click to visit GitHub for updates",
    currentVersion: "Current Version",
    upToDate: "Up to date",
  },
  settings: {
    public: "Public",
    publicDesc: "Anyone can view, only admins can edit.",
    private: "Private",
    privateDesc: "Only admins can access and edit.",
    passwordProtected: "Password Protected",
    passwordProtectedDesc: "Enter password to view, admin password can edit.",
    passwordNote: "Password protection uses `VIEWER_PASSWORD_HASH` (falls back to admin password when not configured).",
    saving: "Saving...",
    saveSettings: "Save Settings",
  },
  visibility: {
    title: "Public Feed Visibility",
    description: "When enabled, your summary stats and recent activity will appear on the feed page.",
    public: "Public Feed",
    publicDesc: "Others can see your summary on the feed",
    private: "Private",
    privateDesc: "Your summary won't appear on the feed",
    saving: "Saving...",
    savePublicSettings: "Save Visibility Settings",
  },
  goodreads: {
    title: "Goodreads Import",
    description: "Upload your exported Goodreads CSV file. The system will import and automatically skip duplicate entries.",
    summary: "Import complete: {inserted} new, {skipped} skipped, {total} total source.",
    duplicateNote: "Duplicate check: Book Id first, fallback to Title + Author.",
    importing: "Importing...",
    import: "Import from Goodreads",
    noFile: "Please select a Goodreads exported CSV file first",
    importFailed: "Import failed",
    retryImport: "Import failed, please try again later",
  },
  login: {
    title: "Enter your credentials",
    username: "Username",
    password: "Password",
    submitting: "Logging in...",
    login: "Login",
    noAccount: "Don't have an account?",
    register: "Register one",
    createAccount: "Create Account",
    firstUserNote: "The first registered user will become admin automatically",
    usernamePlaceholder: "Username (lowercase letters/numbers/_-.)",
    passwordPlaceholder: "Password (at least 8 characters)",
    confirmPassword: "Confirm Password",
    submittingRegister: "Creating...",
    registerAndEnter: "Register and Enter",
    hasAccount: "Already have an account?",
    goLogin: "Go to Login",
  },
  metadata: {
    title: "Kairos — Record Every Moment of Life",
    description: "Personal life tracking: Books, Music, Movies, Games",
  },
};

const allMessages: Record<Locale, Messages> = {
  zh: zhMessages,
  en: enMessages,
};

const LOCALE_STORAGE_KEY = "kairos-locale";

function getNestedValue(obj: Messages, path: string): string | undefined {
  const keys = path.split(".");
  let current: Messages | string = obj;
  for (const key of keys) {
    if (typeof current === "object" && current !== null && key in current) {
      current = current[key] as Messages | string;
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
}

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "zh";

  // Check localStorage first
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === "en" || stored === "zh") {
    return stored;
  }

  // Fall back to browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("en")) return "en";
  if (browserLang.startsWith("zh")) return "zh";
  return "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const messages = allMessages[locale];
      let value = getNestedValue(messages, key);

      if (value === undefined) {
        console.warn(`Missing translation for key: ${key}`);
        return key;
      }

      // Replace parameters like {type} with actual values
      if (params) {
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          value = value?.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
        });
      }

      return value;
    },
    [locale]
  );

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    messages: allMessages[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Hook for components to get translation
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}