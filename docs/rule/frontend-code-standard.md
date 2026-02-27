# 前端代码规范

本文档定义了知识库小破站（zsk-ui）项目的前端代码规范，所有开发人员必须遵守。

## 一、技术栈规范

### 1.1 核心技术栈

| 类别 | 技术 | 版本要求 |
|------|------|----------|
| UI 框架 | React | ^19.2.0 |
| 构建工具 | Vite | ^7.2.4 |
| 类型系统 | TypeScript | ~5.9.3 |
| 路由 | React Router DOM | ^7.12.0 |

### 1.2 UI 组件库

> **默认使用 HeroUI**，所有业务组件优先使用 HeroUI 实现。

| 库 | 版本 | 用途 |
|---|------|------|
| HeroUI React | ^3.0.0 | **默认组件库** |
| Tailwind CSS | ^4.1.18 | CSS 框架 |
| tailwind-merge | ^3.4.0 | Class 合并 |
| clsx | ^2.1.1 | Class 构造 |

### 1.3 图标库

> **图标使用优先级**：Lucide React > React Icons

| 库 | 版本 | 用途 |
|---|------|------|
| Lucide React | ^0.562.0 | **默认图标库** |
| React Icons | ^5.5.0 | 备选图标库（包含 Feather 等） |

```typescript
// ✅ 推荐：使用 Lucide React
import { Home, User, Settings } from 'lucide-react'

// ✅ 可选：React Icons
import { FiHome, FiUser } from 'react-icons/fi'
```

### 1.4 视频播放器

> **必须使用 Vidstack**

| 库 | 版本 | 用途 |
|---|------|------|
| Vidstack | ^1.12.13 | 视频播放器核心 |
| @vidstack/react | ^1.12.13 | React 封装 |
| media-icons | ^0.6.0 | 媒体图标 |

```typescript
// ✅ 正确：使用 Vidstack
import { Player, Video, defaultLayoutIcons } from '@vidstack/react'

// ❌ 错误：禁止使用其他视频播放器
import VideoPlayer from 'some-other-player'
```

### 1.5 富文本编辑器

> **必须使用 Tiptap**（简历编辑）、**可选 Quill**（文档编辑）

| 库 | 版本 | 用途 |
|---|------|------|
| Tiptap React | ^3.15.3 | 简历编辑（必须） |
| Tiptap Starter Kit | ^3.15.3 | 基础扩展 |
| Tiptap Extension Image | ^3.15.3 | 图片扩展 |
| Tiptap Extension Link | ^3.15.3 | 链接扩展 |
| Tiptap Extension Table | ^3.15.3 | 表格扩展 |
| Quill | ^2.0.3 | 文档编辑（可选） |

### 1.6 移动端适配

> **必须进行移动端适配**，使用以下方案：

| 方案 | 用途 |
|------|------|
| Tailwind CSS 响应式类 | 移动端布局 |
| amfe-flexible | rem 适配 |

```typescript
// ✅ 正确：使用 Tailwind 响应式类
<div className="w-full md:w-1/2 lg:w-1/3">
  <HeroUIButton className="block md:hidden">移动端显示</HeroUIButton>
</div>

// ✅ 正确：CSS 变量配合 amfe-flexible
// vite.config.ts 配置 postcss-pxtorem
```

---

## 二、核心规则

### 2.1 语言规范

1. **必须使用中文注释**
2. **必须使用中文报错日志**
3. **必须使用 ES6+ 语法**
4. **禁止在代码中使用 emoji**（文档中可以使用）

```typescript
// ✅ 正确
// 处理用户登录请求
function handleUserLogin() {
  try {
    // 用户登录成功
    console.info('用户登录成功')
  } catch (error) {
    // 登录失败，输出错误信息
    console.error('登录失败：', error)
  }
}

// ❌ 错误
function handleUserLogin() {
  try {
    console.log('User logged in')
  } catch (e) {
    console.error(e)
  }
}
```

### 2.2 路径规范

> **必须使用路径别名**

```typescript
// ✅ 正确：使用路径别名
import { handleApiCall } from '@/utils'
import { UserService } from '@/services/user'
import { ApiConfig } from '@/config'

// ❌ 错误：使用相对路径
import { handleApiCall } from '../../utils'
```

### 2.3 代码复用

> **必须合并重复逻辑**，避免冗余

```typescript
// ✅ 正确：提取重复逻辑
function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

function formatTime(time: string | Date): string {
  return dayjs(time).format('HH:mm:ss')
}

// ❌ 错误：重复代码
function formatDate(date: string | Date): string {
  // 重复的实现
}
function formatDateTime(date: string | Date): string {
  // 又一个重复的实现
}
```

### 2.4 工具函数

> **优先使用封装好的工具函数**

```typescript
// ✅ 正确：使用工具函数
import { formatDate, formatTime, formatNumber } from '@/utils/format'
import { validateEmail, validatePhone } from '@/utils/validate'

// ❌ 错误：自己实现
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
```

---

## 三、文件结构规范

### 3.1 组件文件区域顺序

> **必须按照以下区域顺序组织代码**

```typescript
// ===== 1. 依赖导入区域 =====
// React/第三方组件
import { useState, useEffect } from 'react'
import { Button, Input, Card } from '@heroui/react'
import { FiHome } from 'react-icons/fi'

// 工具函数
import { formatDate } from '@/utils/format'
import { validateEmail } from '@/utils/validate'

// 类型定义
import type { UserInfo } from '@/types/user'

// ===== 2. TODO待处理导入区域 =====
// TODO: 后续需要优化的导入

// ===== 3. 状态控制逻辑区域 =====
const [loading, setLoading] = useState(false)
const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

// ===== 4. 通用工具函数区域 =====
// 业务相关的工具函数

// ===== 5. 注释代码函数区 =====
// 暂不执行但需要保留的代码

// ===== 6. 错误处理函数区域 =====
// 错误处理函数

// ===== 7. 数据处理函数区域 =====
// 数据转换、格式化等

// ===== 8. UI渲染逻辑区域 =====
// UI 组件渲染

// ===== 9. 页面初始化与事件绑定 =====
// useEffect 初始化、事件绑定

// ===== 10. TODO任务管理区域 =====
// TODO: 待完成的任务

// ===== 11. 导出区域 =====
// 导出组件
export default function UserProfile() {
  // 组件实现
}
```

---

## 四、命名规范

### 4.1 变量命名

> **使用驼峰命名法（camelCase）**

| 类型 | 规则 | 示例 |
|------|------|------|
| 普通变量 | camelCase | `userName`, `totalCount` |
| 布尔值 | is/has/can 前缀 | `isActive`, `hasPermission`, `canEdit` |
| 数组 | 复数形式 | `users`, `items`, `dataList` |
| 常量 | 全大写+下划线 | `MAX_RETRY`, `API_BASE_URL` |

```typescript
// ✅ 正确
const userName = '张三'
const isLoggedIn = true
const hasAdminRole = true
const canEditContent = false
const userList = []
const MAX_RETRY_COUNT = 3

// ❌ 错误
const user_name = '张三'  // snake_case
const loggedIn = true    // 缺少前缀
const admin_role = true  // 缺少前缀
```

### 4.2 函数命名

> **使用动词前缀 + 名词**

| 前缀 | 用途 | 示例 |
|------|------|------|
| get | 获取数据 | `getUserInfo`, `getDataList` |
| set | 设置数据 | `setUserName`, `setConfig` |
| handle | 处理事件 | `handleSubmit`, `handleClick` |
| show | 显示 | `showModal`, `showToast` |
| hide | 隐藏 | `hideModal`, `hideDropdown` |
| fetch | 异步获取 | `fetchUserData`, `fetchList` |
| validate | 校验 | `validateForm`, `validateEmail` |
| format | 格式化 | `formatDate`, `formatCurrency` |
| on | 事件处理 | `onChange`, `onSubmit` |

```typescript
// ✅ 正确
function getUserInfo(id: string) { }
function handleSubmit(data: FormData) { }
function showNotification(message: string) { }
function validateEmailFormat(email: string): boolean { }
function onButtonClick(event: MouseEvent) { }

// ❌ 错误
function userInfo(id: string) { }        // 缺少动词前缀
function submit(data: FormData) { }      // 不清晰
function notification(message: string) { } // 不清晰
```

### 4.3 组件命名

> **使用帕斯卡命名法（PascalCase）**

```typescript
// ✅ 正确
export function UserProfile() { }
export function ArticleCard() { }
export function VideoPlayer() { }

// ❌ 错误
export function userProfile() { }
export function article_card() { }
```

### 4.4 文件命名

| 类型 | 规则 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserProfile.tsx`, `ArticleCard.tsx` |
| 工具文件 | camelCase | `format.ts`, `validate.ts` |
| 类型文件 | camelCase + .types | `user.types.ts`, `api.types.ts` |
| 钩子文件 | use 前缀 | `useAuth.ts`, `useDebounce.ts` |
| 配置文件 | camelCase | `vite.config.ts`, `eslint.config.js` |

---

## 五、类型安全规范

### 5.1 类型定义

> **必须定义明确的类型，禁止使用 `any`**

```typescript
// ✅ 正确
interface UserInfo {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  createdAt: Date
}

function getUser(id: string): Promise<UserInfo> {
  // 实现
}

// ❌ 错误
function getUser(id: any): Promise<any> {
  // 实现
}
```

### 5.2 泛型使用

```typescript
// ✅ 正确：使用泛型
function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json())
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
```

### 5.3 类型推断

```typescript
// ✅ 正确：利用类型推断
const userList = useState<UserInfo[]>([])
const [users, setUsers] = useState<UserInfo[]>([])

// ❌ 错误：不必要的类型标注
const userList: UserInfo[] = []
```

---

## 六、组件规范

### 6.1 HeroUI 使用规范

> **所有 UI 组件优先使用 HeroUI**

```typescript
// ✅ 正确：使用 HeroUI 组件
import { Button, Input, Card, Modal, Table, Select } from '@heroui/react'

function LoginForm() {
  return (
    <Card>
      <Input label="用户名" placeholder="请输入用户名" />
      <Input label="密码" type="password" placeholder="请输入密码" />
      <Button color="primary">登录</Button>
    </Card>
  )
}
```

### 6.2 组件 Props 规范

```typescript
// ✅ 正确：完整的 Props 类型定义
interface ButtonProps {
  /** 按钮文字 */
  children: React.ReactNode
  /** 点击事件 */
  onClick: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 按钮变体 */
  variant?: 'solid' | 'bordered' | 'light'
  /** 按钮颜色 */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否加载中 */
  isLoading?: boolean
}

export function SubmitButton({
  children,
  onClick,
  disabled = false,
  variant = 'solid',
  color = 'primary',
  size = 'md',
  isLoading = false
}: ButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      variant={variant}
      color={color}
      size={size}
      isLoading={isLoading}
    >
      {children}
    </Button>
  )
}
```

### 6.3 条件渲染规范

```typescript
// ✅ 正确：清晰的条件渲染
{isLoading && <Spinner />}

{error && (
  <Alert color="danger" title="加载失败">
    {error.message}
  </Alert>
)}

{data && <DataDisplay data={data} />}

// ✅ 正确：使用三元运算符（简单情况）
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// ❌ 错误：嵌套三元运算符
{isLoading ? (
  <Spinner />
) : error ? (
  <Alert>{error}</Alert>
) : data ? (
  <DataDisplay data={data} />
) : null}
```

---

## 七、状态管理规范

### 7.1 Zustand 使用规范

```typescript
// ✅ 正确：定义 Store
import { create } from 'zustand'

interface UserStore {
  userInfo: UserInfo | null
  isLoggedIn: boolean
  setUserInfo: (user: UserInfo | null) => void
  logout: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  userInfo: null,
  isLoggedIn: false,
  setUserInfo: (user) => set({ userInfo: user, isLoggedIn: !!user }),
  logout: () => set({ userInfo: null, isLoggedIn: false })
}))

// 使用
const { userInfo, isLoggedIn } = useUserStore()
```

### 7.2 不可变性规范

> **永远不要直接修改状态**

```typescript
// ✅ 正确：使用展开运算符
const updatedUser = {
  ...user,
  name: '新名字'
}

const updatedList = [...items, newItem]

// 数组更新
const filteredList = items.filter(item => item.id !== targetId)
const updatedItems = items.map(item => 
  item.id === targetId ? { ...item, name: '更新' } : item
)

// ❌ 错误：直接修改
user.name = '新名字'
items.push(newItem)
items.splice(index, 1)
```

---

## 八、API 规范

### 8.1 请求规范

```typescript
// ✅ 正确：使用封装好的请求方法
import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

interface User {
  id: string
  name: string
}

async function fetchUser(id: string): Promise<User> {
  const response = await request.get<ApiResponse<User>>(`/api/users/${id}`)
  if (!response.success) {
    throw new Error(response.error || '请求失败')
  }
  return response.data!
}

async function createUser(data: Partial<User>): Promise<User> {
  const response = await request.post<ApiResponse<User>>('/api/users', data)
  if (!response.success) {
    throw new Error(response.error || '创建失败')
  }
  return response.data!
}
```

### 8.2 错误处理规范

```typescript
// ✅ 正确：完善的错误处理
async function handleSubmit(data: FormData) {
  setLoading(true)
  try {
    await createUser(data)
    showToast({ title: '提交成功', type: 'success' })
    router.push('/success')
  } catch (error) {
    const message = error instanceof Error ? error.message : '提交失败，请稍后重试'
    showToast({ title: '提交失败', message, type: 'error' })
    console.error('提交失败：', error)
  } finally {
    setLoading(false)
  }
}
```

---

## 九、Vidstack 视频播放器规范

### 9.1 基础使用

```typescript
// ✅ 正确：使用 Vidstack
import { Player, Video, defaultLayoutIcons } from '@vidstack/react'
import '@vidstack/react/player/styles/default/theme.css'

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
}

export function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  return (
    <Player
      title={title}
      src={src}
      posters={poster ? [poster] : undefined}
      layout="default"
      icons={defaultLayoutIcons}
    >
      <Video />
    </Player>
  )
}
```

### 9.2 移动端适配

```typescript
// ✅ 正确：响应式视频播放器
export function ResponsiveVideoPlayer({ src, poster }: VideoPlayerProps) {
  return (
    <div className="w-full aspect-video">
      <Player
        src={src}
        posters={poster ? [poster] : undefined}
        className="w-full h-full"
      >
        <Video />
      </Player>
    </div>
  )
}
```

---

## 十、Tiptap 富文本编辑器规范

### 10.1 基础配置

```typescript
// ✅ 正确：Tiptap 编辑器配置
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'

interface RichEditorProps {
  content?: string
  onChange?: (html: string) => void
  readonly?: boolean
}

export function RichEditor({ content = '', onChange, readonly = false }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    }
  })

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}
```

### 10.2 工具栏配置

```typescript
// ✅ 正确：编辑器工具栏
import { FiBold, FiItalic, FiUnderline, FiList, FiLink, FiImage } from 'react-icons/fi'

function EditorToolbar({ editor }: { editor: Editor }) {
  if (!editor) return null

  return (
    <div className="flex gap-1 p-2 border-b">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        <FiBold />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        <FiItalic />
      </button>
      {/* 更多工具按钮 */}
    </div>
  )
}
```

---

## 十一、移动端适配规范

### 11.1 响应式断点

> **使用 Tailwind CSS 响应式类**

| 断点 | 最小宽度 | 类前缀 |
|------|----------|--------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### 11.2 移动优先原则

```typescript
// ✅ 正确：移动优先
<div className="w-full md:w-1/2 lg:w-1/3">
  <Card className="p-2 md:p-4">
    <h2 className="text-sm md:text-base lg:text-lg">标题</h2>
  </Card>
</div>

// ✅ 正确：显示/隐藏
<div className="hidden md:block">
  {/* 仅桌面端显示 */}
</div>

<div className="block md:hidden">
  {/* 仅移动端显示 */}
</div>
```

### 11.3 触摸交互

```typescript
// ✅ 正确：移动端友好的交互
<Button
  size="lg"  // 移动端使用大尺寸
  className="min-h-[44px]"  // 最小触摸区域
  onPress={handlePress}
>
  点击
</Button>

// ✅ 正确：使用 HeroUI 的响应式组件
<Card isPressable onPress={handlePress}>
  <CardBody>
    <p>可点击的卡片</p>
  </CardBody>
</Card>
```

---

## 十二、动画规范

### 12.1 使用场景

| 库 | 用途 |
|------|------|
| Framer Motion | 页面转场、复杂动画 |
| HeroUI 内置动画 | 组件内置动画 |
| Tailwind CSS | 简单过渡效果 |

```typescript
// ✅ 正确：简单过渡使用 Tailwind
<Button className="transition-all duration-300 hover:scale-105">
  按钮
</Button>

// ✅ 正确：复杂动画使用 Framer Motion
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  内容
</motion.div>
```

---

## 十三、校验检查

### 13.1 构建检查

> **提交代码前必须执行**

```bash
# 运行类型检查
npm run type-check

# 运行 ESLint
npm run lint

# 运行构建
npm run build
```

### 13.2 检查项

1. ✅ 无 TypeScript 类型错误
2. ✅ 无 ESLint 错误和警告
3. ✅ 无未使用的变量或函数
4. ✅ 无重复的注释函数
5. ✅ 无未封装的注释代码

---

## 十四、注释规范

### 14.1 注释原则

> **解释为什么，而不是做什么**

```typescript
// ✅ 正确：说明原因
// 使用指数退避避免 API 过载
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// ❌ 错误：说明做什么
// 延迟 1 秒
const delay = 1000
```

### 14.2 注释类型

| 类型 | 用途 |
|------|------|
| `// 注释` | 行内注释 |
| `/* 注释 */` | 块级注释 |
| `/** 注释 */` | JSDoc 文档注释 |

```typescript
/**
 * 格式化日期显示
 *
 * @param date - 日期字符串或 Date 对象
 * @param format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 *
 * @example
 * formatDate('2024-01-01') // '2024-01-01'
 * formatDate(new Date(), 'YYYY年MM月DD日') // '2024年01月01日'
 */
function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  return dayjs(date).format(format)
}
```

---

## 附录

### A. 导入顺序

```typescript
// 1. React 核心
import { useState, useEffect, useCallback } from 'react'

// 2. HeroUI 组件
import { Button, Input, Modal } from '@heroui/react'

// 3. 图标
import { FiHome, FiUser } from 'react-icons/fi'
import { Settings } from 'lucide-react'

// 4. 视频/富文本
import { Player, Video } from '@vidstack/react'
import { useEditor, EditorContent } from '@tiptap/react'

// 5. 动画
import { motion } from 'framer-motion'

// 6. 工具函数
import { formatDate, formatTime } from '@/utils/format'
import { validateEmail } from '@/utils/validate'
import { request } from '@/utils/request'

// 7. 状态管理
import { useUserStore } from '@/stores/user'

// 8. 类型定义
import type { UserInfo } from '@/types/user'

// 9. 组件
import UserCard from '@/components/UserCard'
```

### B. ESLint 规则（推荐配置）

```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-refresh/only-export-components": "warn"
  }
}
```
