# 知识库小破站前端 (zsk-ui-v2)

一个基于 **React 19 + Vite 7 + TypeScript** 的企业级前端应用，包含前台门户与后台管理双布局，使用 HeroUI 作为默认组件库。

## ✨ 项目特点

- 🎨 **双布局架构**：前台门户 (`/`) 与后台管理 (`/admin`) 独立主题系统
- 🎯 **现代技术栈**：React 19、Vite 7、TypeScript、Tailwind CSS 4
- 🌙 **完整主题系统**：支持深色/浅色主题切换，独立前后台设置
- 📱 **响应式设计**：移动端优先，完整触摸支持
- 🔐 **权限管理**：Protected Route 与 Public Route 路由守护
- 🌍 **国际化支持**：i18next + HTTP Backend
- 📊 **数据可视化**：ECharts 5 集成
- 🎥 **富媒体支持**：视频播放器、富文本编辑、Markdown 编辑
- ⚡ **性能优化**：Vite 懒加载、路由分割、全局加载管理

## 📦 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| **框架** | React | ^19.2.0 |
| **构建工具** | Vite | ^7.2.4 |
| **类型系统** | TypeScript | ~5.9.3 |
| **组件库** | HeroUI | ^2.8.8 |
| **样式** | Tailwind CSS | ^4.1.18 |
| **路由** | React Router DOM | ^7.12.0 |
| **状态管理** | Zustand | ^5.0.9 |
| **HTTP 客户端** | Axios | ^1.13.2 |
| **动画** | Framer Motion | ^12.34.3 |
| **图标** | Lucide React | ^0.562.0 |
| **数据可视化** | ECharts | ^5.6.0 |
| **国际化** | i18next | ^25.8.13 |
| **富文本编辑** | Milkdown + WangEditor | ^7.20.0, ^5.1.23 |
| **视频播放** | Vidstack React | ^1.12.13 |
| **Markdown** | React Markdown | ^10.1.0 |
| **3D** | Three.js | ^0.182.0 |

## 🚀 快速开始

### 前置要求
- Node.js >= 16.x
- npm >= 8.x 或 yarn >= 3.x

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```
访问 `http://localhost:5173`

### 生产构建
```bash
npm run build
```
执行顺序：
1. `tsc -b` - TypeScript 类型检查
2. `vite build` - 生产构建

### 代码检查
```bash
npm run lint
```
使用 ESLint flat config，配置文件：`eslint.config.mjs`

### 预览生产构建
```bash
npm run preview
```

### 纯类型检查（无产出）
```bash
npx tsc --noEmit
```
提交前推荐运行此命令

## 📁 项目结构

```
src/
├── main.tsx              # 应用入口
├── App.tsx               # 根组件（包含 Provider 链）
├── provider.tsx          # Provider 配置
├── components/           # 业务组件
│   ├── ui/              # UI 基础组件库
│   ├── common/          # 全局通用组件（GlobalModal、Watermark）
│   └── ...
├── pages/               # 页面组件（路由对应）
│   ├── FrontLayout.tsx  # 前台布局
│   ├── AdminLayout.tsx  # 后台布局
│   ├── AuthLayout.tsx   # 认证页面布局
│   └── ...
├── router/              # 路由配置
│   └── index.tsx        # 集中路由定义（使用 lazy + Suspense）
├── hooks/               # 自定义 React 钩子
│   ├── useTheme.ts      # 主题系统（唯一权威入口）
│   ├── useLocale.ts     # 国际化切换
│   └── ...
├── stores/              # Zustand 全局状态管理
│   ├── app.ts           # 主题/设置状态
│   ├── user.ts          # 用户/登录态
│   ├── menu.ts          # 动态菜单
│   ├── modal.ts         # GlobalModal 控制
│   └── ui.ts            # 全局加载/UI 状态
├── api/                 # API 接口层（按模块分目录）
│   ├── auth/            # 认证相关
│   ├── profile/         # 用户资料
│   ├── admin/           # 后台管理
│   │   ├── user/        # 用户管理
│   │   ├── role/        # 角色管理
│   │   ├── menu/        # 菜单管理
│   │   ├── config/      # 系统配置
│   │   ├── dict/        # 字典管理
│   │   ├── cache/       # 缓存管理
│   │   └── syslog/      # 系统日志
│   └── index.ts
├── types/               # TypeScript 类型定义
│   ├── api.types.ts     # API 响应类型
│   ├── user.types.ts    # 用户相关类型
│   └── ...
├── utils/               # 工具函数
│   ├── request.ts       # Axios 封装（请求/错误处理）
│   ├── format.ts        # 格式化函数
│   ├── validate.ts      # 校验函数
│   └── ...
├── locales/             # 国际化配置
│   ├── en/
│   ├── zh/
│   └── index.ts         # i18next 初始化
└── styles/              # 全局样式
    └── global.css       # 包含主题 CSS 变量、三方库覆盖

public/                  # 静态资源
dist/                    # 生产构建输出
```

## 🎯 核心架构

### 1. Provider 链

```
App.tsx
└── useUserInit() → 加载用户数据
    ├── HeroUIProvider
    │   ├── ToastProvider
    │   └── RouterProvider
    │       └── RootLayout
    │           ├── useTheme() → 应用主题
    │           ├── GlobalModal
    │           ├── Watermark
    │           └── Routes
```

### 2. 路由体系

基于 `createBrowserRouter` + `lazy()` + `Suspense` 的懒加载方案：

```
/                    → FrontLayout (前台布局)
  ├── /about         → 关于页面
  ├── /products      → 产品页面
  └── /...

/admin/*             → AdminLayout (后台布局) [ProtectedRoute]
  ├── /admin/users   → 用户管理
  ├── /admin/roles   → 角色管理
  └── /admin/...

/login               → AuthLayout [PublicRoute]
/auth/callback       → 认证回调 [PublicRoute]
```

**新增页面步骤**：
1. 在 `src/pages/` 中创建页面组件
2. 在 `src/router/index.tsx` 中 `lazy(import)` 并添加到对应布局的子节点

### 3. 主题系统（关键）

`useTheme()` 是主题应用的唯一权威入口，负责：
- 读取 `useAppStore` 的主题设置
- 写入 `<html>` 的 `class="dark"` / `data-theme`
- 注入 CSS 变量：`--heroui-primary*`, `--color-primary*`, `--theme-*`, `--menu-width` 等

**路由感知**：
- `/admin/*` 使用 `state.adminSettings`（后台主题）
- 其他路由使用 `state` 主设置（前台主题）

**颜色规范**（强制）：
```css
/* ✅ 推荐：使用 HeroUI 语义 token */
background-color: hsl(var(--heroui-content1));
border-color: hsl(var(--color-primary-500));

/* ✅ 推荐：使用 Tailwind HeroUI 类 */
<div className="bg-content1 border-primary-200">

/* ❌ 禁止：写死颜色，切换主题会失效 */
background-color: #ffffff;
```

### 4. 状态管理（Zustand）

```
useAppStore      → 主题、系统设置
useUserStore     → 用户信息、登录态
useMenuStore     → 动态菜单
useModalStore    → GlobalModal 控制
useUIStore       → 全局加载遮罩 (showLoading/hideLoading)
```

**全局加载规范**：
```typescript
// ✅ 正确：使用全局加载状态
const { showLoading, hideLoading } = useUIStore()
showLoading('正在加载...')
// 异步操作
hideLoading()

// ❌ 禁止：自行实现加载态
const [loading, setLoading] = useState(false)
```

### 5. API 层

**请求流程**：
```
request.get<ApiResponse<T>>('/api/path')
  ↓
检查 success 字段
  ├─ true  → 返回 data
  └─ false → 抛 Error
    ↓
上层 try/catch
  ↓
toast 反馈用户 + 日志记录
```

**目录结构**：
```
src/api/
├── auth/
├── profile/
├── admin/
│   ├── user/
│   ├── role/
│   ├── menu/
│   ├── config/
│   ├── dict/
│   ├── cache/
│   └── syslog/
└── index.ts (统一导出)
```

## 📝 代码规范

### 语言规范
- ✅ **中文注释、日志**
- ❌ **禁止代码中使用 emoji**

### 路径规范
- ✅ **使用路径别名** `@/utils`、`@/components`、`@/stores`
- ❌ **禁止相对路径** `../../`

### 导入顺序（强制）
```typescript
// 1. React 核心
import { useState, useEffect } from 'react'

// 2. HeroUI 组件
import { Button, Input, Modal } from '@heroui/react'

// 3. 图标 (Lucide > React Icons)
import { Home, Settings } from 'lucide-react'

// 4. 视频/富文本
import { Player } from '@vidstack/react'

// 5. 动画
import { motion } from 'framer-motion'

// 6. 工具函数
import { formatDate } from '@/utils/format'
import { request } from '@/utils/request'

// 7. 状态管理
import { useUserStore } from '@/stores/user'

// 8. 类型定义
import type { UserInfo } from '@/types/user'

// 9. 组件
import UserCard from '@/components/UserCard'
```

### 文件命名
| 类型 | 命名方式 | 示例 |
|------|--------|------|
| 组件 | PascalCase | `UserProfile.tsx` |
| 工具 | camelCase | `format.ts` |
| 类型 | `*.types.ts` | `user.types.ts` |
| 钩子 | `use*` | `useAuth.ts` |

### 变量命名
- **普通**：`camelCase` → `userName`
- **布尔**：`is/has/can` 前缀 → `isActive`, `hasPermission`
- **数组**：复数 → `users`, `items`
- **常量**：全大写 + 下划线 → `MAX_RETRY`, `API_BASE_URL`

### 函数命名
| 前缀 | 用途 | 示例 |
|------|------|------|
| `get` | 获取数据 | `getUserInfo` |
| `handle` | 处理事件 | `handleSubmit` |
| `show/hide` | 显示/隐藏 | `showModal` |
| `validate` | 校验 | `validateEmail` |
| `on` | 事件处理 | `onChange` |

### 类型安全
- ✅ **禁止使用 `any`**（ESLint warn，视为强制）
- ✅ **Props 必须有显式 interface + JSDoc**
- ✅ **使用泛型**处理通用逻辑

### 状态更新（不可变性）
```typescript
// ✅ 正确：使用展开运算符
setState(prev => [
  ...prev.items,
  newItem
])

// ✅ 正确：使用 map/filter
setState(prev => prev.items.map(item => 
  item.id === id ? { ...item, name } : item
))

// ❌ 禁止：就地修改状态数组
state.items.push(newItem)    // 错误！
state.items[0].name = 'new'  // 错误！
```

## 🎨 组件库与媒体

### UI 组件
优先使用 **HeroUI** (`@heroui/react`)，必要时在 `src/components/ui/` 自行封装。

### 图标
优先使用 **Lucide React** (`lucide-react`)，其次 React Icons (`react-icons`)。

### 视频播放
必须使用 **Vidstack React** (`@vidstack/react`)。项目已在 `src/components/ui/video/VideoPlayer` 中封装。

### 富文本编辑
- **简历编辑**：Tiptap
- **文档编辑**：Quill（可选）
- **Markdown 编辑**：Milkdown Crepe

### 数据可视化
使用 **ECharts 5** (`echarts`)。

## 🌍 国际化

- 配置文件：`src/locales/`
- 初始化：`src/locales/index.ts` 自动在 `main.tsx` 导入
- 使用：`useLocale()` 提供切换、`useTranslation()` 获取翻译
- 新增文案避免硬编码英文/中文混排

## 📱 移动端适配

- 使用 Tailwind CSS 响应式类
- 移动端优先原则
- 触摸区域最小 44px

## 🎬 动画库

| 库 | 用途 |
|----|----|
| **Framer Motion** | 页面转场、复杂动画 |
| **HeroUI 内置** | 组件内置动画 |
| **Tailwind CSS** | 简单过渡效果 |
| **React Spring** | 物理引擎动画 |
| **GSAP** | 高性能动画 |

## 🔍 特殊功能

### 全局加载遮罩
```typescript
import { useUIStore } from '@/stores/ui'

const { showLoading, hideLoading } = useUIStore()

showLoading('正在加载...')
// 异步操作
hideLoading()
```

### 全局模态框
```typescript
import { useModalStore } from '@/stores/modal'

// 打开模态框
useModalStore.setState({ isOpen: true, title: '标题' })
```

### 平滑滚动
```typescript
// App.tsx 中已启用 useLenis()
// Lenis 自动管理页面滚动
```

### 受保护路由
```typescript
// ProtectedRoute：检查登录态
// PublicRoute：检查未登录，已登录则重定向

// /admin/* 自动使用 ProtectedRoute
// /login 自动使用 PublicRoute
```

## 🧪 开发工具

### ESLint
```bash
npm run lint
```
- 配置：`eslint.config.mjs`（flat config）
- 规则：React 最佳实践、TypeScript 类型检查

### TypeScript
```bash
npx tsc --noEmit
```
检查类型错误，提交前推荐运行。

## ✅ 提交前自检清单

- [ ] `npx tsc --noEmit` 无错误
- [ ] `npm run lint` 无错误/警告
- [ ] 没有 `any`、未使用变量、`../../` 相对路径
- [ ] 颜色用 HeroUI/CSS 变量，能切主题
- [ ] 国际化字段已加，不硬编码

## 📚 文档参考

- **项目规范**：`CLAUDE.md`（开发指南）
- **前端规范**：`docs/rule/frontend-code-standard.md`
- **主题系统**：`docs/前端框架构建/`
- **业务需求**：`docs/前端需求文档/`

## 🤝 贡献指南

1. 新建功能分支：`git checkout -b feature/xxx`
2. 提交前运行 `npx tsc --noEmit && npm run lint`
3. 提交消息参照项目规范（中文、动词开头）
4. 提交 Pull Request

## 📄 许可证

私有项目 - 仅供内部使用

---

**最后更新**：2026-04-28

