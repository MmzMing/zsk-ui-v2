# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

知识库小破站前端 (zsk-ui-v2)：基于 React 19 + Vite 7 + TypeScript 的企业级前端应用，包含前台门户与后台管理 (Admin) 双布局，使用 HeroUI 作为默认组件库。

## 常用命令

```bash
npm run dev          # 启动开发服务器 (Vite)
npm run build        # 生产构建：先 tsc -b 校验，再 vite build
npm run lint         # ESLint 检查（flat config，eslint.config.mjs）
npm run preview      # 预览生产构建产物
npx tsc --noEmit     # 仅做类型检查（无产出，提交前推荐）
```

> 项目尚未集成测试框架，无 `npm test`。新增测试需先评估并接入框架。

## 架构总览

### 入口与 Provider 链
- `src/main.tsx` → `src/App.tsx`
- `App.tsx` 在 `useUserInit()` 完成前显示加载态，完成后渲染：
  ```
  <HeroUIProvider>
    <ToastProvider />
    <RouterProvider router={router} />
  </HeroUIProvider>
  ```
- `src/provider.tsx` 中导出的 `Provider` 是带 `navigate` 注入的 HeroUIProvider 备用版本，目前未在主链上挂载（保留供独立场景）。
- `useLenis()` 在 App 顶层启用平滑滚动（Lenis）。

### 路由与布局
- 路由集中在 `src/router/index.tsx`，使用 `createBrowserRouter` + `lazy()` + `Suspense` 全量懒加载页面。
- 顶层 `RootLayout` 调用 `useTheme()`（必须在路由内才能读 `useLocation`），并挂载全局 `<GlobalModal />` 与 `<Watermark />`。
- 三大布局分支：
  - `/` → `FrontLayout` (前台)
  - `/admin/*` → `AdminLayout` (后台，受 `ProtectedRoute` 保护)
  - `/login` `/auth/callback` → `AuthLayout` (受 `PublicRoute` 保护)
- 添加新页面：在 `src/pages/...` 建文件 → 在 `router/index.tsx` 内 `lazy(import)` 并挂到对应布局子节点。

### 主题系统（关键）
- `src/hooks/useTheme.ts` 是主题应用的唯一权威入口，把 `useAppStore` 中的设置写入 `<html>` 的 `class="dark"` / `data-theme` / 一系列 CSS 变量（`--heroui-primary*`, `--color-primary*`, `--theme-*`, `--menu-width` 等）。
- 路由感知：`/admin/*` 使用 `state.adminSettings`，其它使用 `state` 主设置——后台与前台主题相互独立。
- 任何与颜色相关的样式（含第三方库覆盖）应使用 `hsl(var(--heroui-...))` 或 `bg-content1` / `border-default-200` 等 HeroUI 语义 token，避免写死颜色，否则切换主题会失效。富文本编辑器 (`Editor.tsx` + `global.css` 中的 `.zsk-wang-editor`) 是该约定的样板。

### 状态管理 (Zustand)
- `src/stores/`：`app`（主题/设置）、`user`（用户/登录态）、`menu`（动态菜单）、`modal`（GlobalModal 控制）、`ui`（含 `showLoading/hideLoading` 全局遮罩）。
- 全局加载请用 `useUIStore().showLoading('文案')` / `hideLoading()`，不要自行实现。

### API 层
- `src/utils/request.ts`（axios 封装）+ `src/api/<模块>/index.ts`：按模块分目录（auth / profile / admin/{user,role,menu,config,dict,cache,syslog} 等）。
- 调用约定：`request.get<ApiResponse<T>>(...)` → 检查 `success` → 抛 `Error` → 上层 `try/catch` 后用 `toast` 反馈。

### 路径别名
- Vite + tsconfig 都以 `@` 指向 `src/`。**禁止 `../../` 相对路径**，统一 `@/utils`、`@/components`、`@/stores` 等。

### 国际化
- `src/locales/` 通过 `import './locales'` 在 `main.tsx` 自动初始化（i18next + http-backend）。`useLocale()` 提供切换。
- Vite 已集成 `vite-plugin-auto-i18n`（如启用），新增页面文案应避免硬编码英文/中文混排。

### 富文本编辑器（当前实现）
- 使用`Markdown`格式，使用封装好的`MarkdownEditor`组件。渲染使用`MarkdownPreview`组件。
- 参考 test 页面。

## 技术栈

- **UI 框架**: React ^19.2.0
- **构建工具**: Vite ^7.x
- **类型系统**: TypeScript ~5.9.3
- **组件库**: HeroUI ^2.8.8 (默认)
- **CSS**: Tailwind CSS ^4.x
- **路由**: React Router DOM ^7.x
- **状态管理**: Zustand

## 代码规范（强制）

### 语言规范
- ✅ **必须使用中文注释**
- ✅ **必须使用中文报错日志**
- ✅ **必须使用 ES6+ 语法**
- ❌ **禁止在代码中使用 emoji**

### 路径规范
- ✅ **必须使用路径别名**（如 `@/`）
- ❌ 禁止使用相对路径 `../../`

### 文件区域顺序

按以下顺序组织代码：
1. 依赖导入区域
2. TODO待处理导入区域
3. 状态控制逻辑区域
4. 通用工具函数区域
5. 注释代码函数区
6. 错误处理函数区域
7. 数据处理函数区域
8. UI渲染逻辑区域
9. 页面初始化与事件绑定
10. TODO任务管理区域
11. 导出区域

### 导入顺序

```typescript
// 1. React 核心
import { useState, useEffect, useCallback } from 'react'

// 2. HeroUI 组件
import { Button, Input, Modal } from '@heroui/react'

// 3. 图标 (Lucide > React Icons)
import { Home, Settings } from 'lucide-react'

// 4. 视频/富文本
import { Player, Video } from '@vidstack/react'

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

## 命名规范

### 变量命名 (camelCase)
- 普通变量：`userName`, `totalCount`
- 布尔值：`isActive`, `hasPermission`（is/has/can 前缀）
- 数组：`users`, `items`, `dataList`（复数形式）
- 常量：`MAX_RETRY`, `API_BASE_URL`（全大写+下划线）

### 函数命名 (动词前缀 + 名词)
- get：获取数据，如 `getUserInfo`
- handle：处理事件，如 `handleSubmit`
- show/hide：显示/隐藏，如 `showModal`
- validate：校验，如 `validateEmail`
- on：事件处理，如 `onChange`

### 组件/文件命名 (PascalCase)
- 组件文件：`UserProfile.tsx`, `ArticleCard.tsx`
- 工具文件：`format.ts`, `validate.ts`（camelCase）
- 类型文件：`user.types.ts`, `api.types.ts`
- 钩子文件：`useAuth.ts`, `useDebounce.ts`

## 类型安全

- ✅ **必须定义明确类型**，禁止使用 `any`
- ✅ **使用泛型**处理通用逻辑
- ✅ **利用类型推断**简化代码

## 组件规范

### HeroUI 使用
优先使用 HeroUI 组件构建界面。

### Props 定义
必须有显式 interface 与 JSDoc 注释。

### 条件渲染
使用清晰的条件渲染，避免嵌套三元运算符。

## 状态管理 (Zustand)

### 全局加载状态
使用 `useUIStore` 控制全局加载遮罩。

### 不可变性
状态更新使用展开运算符或 `map/filter`，禁止就地修改状态数组。

## API 规范

### 请求规范
使用封装好的 `request` 工具函数，检查 `success` 字段，失败时抛出 `Error`。

### 错误处理
使用 `try/catch` 捕获错误，通过 `toast` 反馈用户，并记录日志。

## 特殊组件规范

### 图标
优先使用 `lucide-react`，其次 `react-icons`。

### 视频播放器
必须使用 `@vidstack/react`。

### 富文本编辑器
- 简历编辑：必须使用 Tiptap
- 文档编辑：可选 Quill

## 移动端适配

- 使用 Tailwind CSS 响应式类
- 移动端优先原则
- 触摸区域最小 44px

## 动画规范

| 库 | 用途 |
|------|------|
| Framer Motion | 页面转场、复杂动画 |
| HeroUI 内置动画 | 组件内置动画 |
| Tailwind CSS | 简单过渡效果 |

## ESLint 规则

```javascript
{
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

## 注释规范

**解释为什么，而不是做什么**：

```typescript
// ✅ 正确：说明原因
// 使用指数退避避免 API 过载
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// ❌ 错误：说明做什么
const delay = 1000
```

## 代码复用

- ✅ **必须合并重复逻辑**
- ✅ **优先使用封装好的工具函数**

## 项目级强制规范

- **语言**：注释、`console` 日志一律中文；不在源码中使用 emoji。
- **导入顺序**：React → HeroUI → 图标(Lucide 优先, 其次 react-icons) → 媒体/编辑器 → 动画 → `@/utils` → `@/stores` → `@/types` → 业务组件。
- **图标**：优先 `lucide-react`，其次 `react-icons`。
- **视频**：必须使用 `@vidstack/react`（项目已封装 `src/components/ui/video/VideoPlayer`）。
- **类型**：禁止 `any`（ESLint 设为 warn，但视为强制）；Props 必须有显式 interface 与 JSDoc。
- **不可变更新**：状态用展开运算符或 `map/filter`，不允许就地 `push/splice` 状态数组。
- **HeroUI 优先**：所有交互组件先在 `@heroui/react` 中找，必要时再自行封装到 `src/components/ui/`。

## 提交前自检

1. `npx tsc --noEmit` 无错误
2. `npm run lint` 无错误/警告
3. 没有 `any`、未使用变量、`../../` 相对路径
4. 颜色用 HeroUI/CSS 变量，不写死，能切 dark 主题
5. 国际化字段已加，不要硬编码

## 详细规范文档

- `.trae/rules/project_rules.md` ——Trae IDE 规则钩子
- `docs/rule/frontend-code-standard.md` ——前端代码规范
- `docs/前端框架构建/` ——主题系统、国际化、页头页脚、全局设置等专题说明
- `docs/前端需求文档/` ——前台/后台/简历编辑等业务需求
