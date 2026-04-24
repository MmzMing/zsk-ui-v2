---
name: about-blogger-page-design
version: 1.0.0
description: 前台首页「关于博主」个人介绍页面设计文档
created: 2026-04-24
status: approved
---

# 关于博主页面设计文档

## 概述

为前台首页新增 `/about` 路由页面，采用 4 层纵向布局，每层均有动效加持且不掉帧。整体风格简约现代，深色/浅色主题自适应。

## 用户决策记录

| 决策项 | 选择 | 理由 |
|--------|------|------|
| B站直播对接 | 状态指示器 | 只显示开播/未开播 + 跳转链接，不嵌入直播流 |
| 大头照风格 | 像素化交互 | PixelatedCanvas 组件，鼠标悬停产生像素扭曲效果 |
| 赞助商广告 | 底部横幅 | 头像+介绍区下方一行 logo 横条，类似 GitHub Sponsors |
| 创意层 | 技术成长热力图 | 类似 GitHub 贻动热力图，展示博客发布频率/技术成长轨迹 |
| 技术栈跑马灯 | 单向匀速滚动 | 单行无限水平滚动，所有图标同向匀速移动 |

## 页面结构（4 层）

### 第1层：博主信息区

**布局**：左右结构（移动端上下）

- **左侧 — 像素化大头照**
  - 使用已有的 `PixelatedCanvas` 组件，传入头像图片 URL
  - 配置：`interactive=true`, `distortionMode="swirl"`, `cellSize=4`, `shape="circle"`
  - 鼠标悬停时产生漩涡像素扭曲效果，鼠标离开时平滑恢复（`fadeOnLeave=true`）
  - 大头照下方或右侧有 **直播状态指示器**：
    - 绿色脉冲圆点 + 「正在直播」标签（开播时）
    - 灰色静态圆点 + 「未开播」标签（离线时）
    - 点击跳转 B站直播间页面（外部链接）
  - B站直播状态通过定时轮询 B站 API 获取（如 `api.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=XXX`）

- **右侧 — 个人介绍文字**
  - 博主昵称（大标题，带 `BlurFade` 入场动画）
  - 一句话简介（副标题）
  - 详细自我介绍（多行文本）
  - 社交链接图标行（GitHub / B站 / 微信 / 邮箱等，使用 lucide-react 图标）

- **底部横幅 — 赞助商广告位**
  - 一行水平排列的赞助商 logo 小方块（2-6 个）
  - 每个 logo 方块 hover 时微缩放 + 辉光效果
  - 点击跳转赞助商网站
  - 空状态时显示「成为赞助商」占位提示

### 第2层：技术栈图标墙 + 跑马灯

**布局**：全宽水平滚动

- **标题**：「我的技术栈」或类似，带 `BlurFade` 入场
- **跑马灯区域**：
  - 单行无限水平匀速滚动（CSS animation `translateX` 或 framer-motion）
  - 使用 `react-icons` + `lucide-react` 的技术栈图标（Java, Spring Boot, MySQL, React, TypeScript, Docker, Redis, Kafka, MyBatis, Git, Linux, Nginx, TailwindCSS, Node.js, Vite 等）
  - 每个图标：小尺寸（48px）+ 下方技术名称标签
  - 图标背景使用 HeroUI 语义色（`bg-content1`），圆角卡片式
  - 两份相同内容拼接实现无缝循环（`duplicate` 方案）
  - hover 时暂停滚动 + 图标卡片高亮放大
- **性能**：纯 CSS animation 或 `will-change: transform` 优化，不使用逐帧 JS

### 第3层：技术成长热力图

**布局**：居中大区域

- **标题**：「技术成长轨迹」或类似
- **热力图**：
  - 参考 GitHub 贻动热力图样式
  - 使用自定义 SVG 或 Canvas 绘制方格矩阵
  - 每列代表一周（7 天），每格代表一天
  - 颜色深浅表示活动强度（0-4 级），使用主题色变量
  - 底部显示月份标签
  - hover 某一格时 tooltip 显示具体日期和活动描述
- **数据源**：初期使用 mock 数据（博客发布频率），后续可对接后端 API
- **入场动画**：`BlurFade` 逐列渐入，从左到右

### 第4层：气泡弹窗对话

**布局**：全宽对话区

- **标题**：「和我聊聊」或类似
- **内容**：直接移植 `ChatBubble` 组件
  - 使用已有的 `src/components/ui/ChatBubble/index.tsx`
  - 配置自定义对话内容（关于博主的 FAQ）
  - 包含可交互问题气泡（点击展开回复）
  - 打字机效果 + 气泡弹出动画 + 滚动加速
- **数据**：定义 about 页面专属的 `ChatItem[]` 和 `ChatQuestion[]`

## 技术方案

### 新增文件

| 文件 | 用途 |
|------|------|
| `src/pages/About/index.tsx` | 页面主入口，组合 4 层组件 |
| `src/pages/About/AvatarSection.tsx` | 第1层 — 大头照 + 介绍 + 赞助商 |
| `src/pages/About/TechStackMarquee.tsx` | 第2层 — 技术栈跑马灯 |
| `src/pages/About/GrowthHeatmap.tsx` | 第3层 — 技术成长热力图 |
| `src/pages/About/ChatSection.tsx` | 第4层 — 气泡弹窗对话 |
| `src/pages/About/about-data.ts` | 页面 mock 数据（介绍文本、技术栈列表、热力图数据、对话内容） |
| `src/api/bilibili/index.ts` | B站直播状态 API 封装 |
| `src/hooks/useBilibiliLive.ts` | B站直播状态轮询 Hook |

### 路由修改

在 `src/router/index.tsx` 的 FrontLayout 子路由中新增：

```tsx
{ path: '/about', element: lazy(() => import('@/pages/About')) }
```

### 国际化

在 `src/locales/zh-CN/` 和 `src/locales/en/` 中新增 `about.json`，包含：
- 页面标题、副标题、自我介绍文本
- 技术栈名称
- 直播状态文案
- 赞助商文案
- FAQ 对话内容

### Aceternity/动效组件使用

| 组件 | 来源 | 用途 |
|------|------|------|
| `PixelatedCanvas` | aceternity (已有) | 大头照像素化交互 |
| `BlurFade` | magicui (已有) | 各层入场动画 |
| `ChatBubble` | 自封装 (已有) | 第4层对话 |
| `InteractiveHoverButton` | magicui (已有) | 赞助商「成为赞助商」按钮 |
| `SlideFade` | reactbits (已有) | 热力图入场过渡 |

### 性能优化

- 跑马灯使用纯 CSS `animation` + `will-change: transform`，避免逐帧 JS
- 热力图使用 SVG 渲染（轻量），hover tooltip 用 CSS `opacity` 过渡
- ChatBubble 已有 `memo` + `IntersectionObserver` 懒加载机制
- PixelatedCanvas 已有 `maxFps` 帧率限制 + DPR 适配
- 整体页面使用 `Suspense` + `lazy()` 懒加载

### 主题适配

- 所有颜色使用 HeroUI 语义 token（`bg-content1`, `text-default-700`, `border-default-200`）
- 热力图色阶使用 `--color-primary-*` 变量（浅→深 4 级）
- 直播状态脉冲色使用 `--color-success` / `--color-default-300`
- 赞助商辉光使用 `--color-primary` 主题色

## 交互细节

- 直播状态每 60 秒轮询一次（`useBilibiliLive` Hook），离线时灰色静态圆点
- 跑马灯 hover 暂停，离开后恢复滚动
- 热力图 hover 显示 tooltip（日期 + 活动描述）
- 气泡对话滚动时自动加速打字，停止滚动后恢复正常速度