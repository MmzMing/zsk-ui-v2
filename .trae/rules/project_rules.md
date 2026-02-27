# 项目开发规范

> 本文件为 Trae IDE 项目规则钩子，每次生成代码时必须遵守以下规范。

---

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
| HeroUI React | ^2.8.8 | **默认组件库** |
| Tailwind CSS | ^4.1.18 | CSS 框架 |
| tailwind-merge | ^3.4.0 | Class 合并 |
| clsx | ^2.1.1 | Class 构造 |

### 1.3 图标库

> **图标使用优先级**：Lucide React > React Icons

```typescript
// 推荐：使用 Lucide React
import { Home, User, Settings } from 'lucide-react'

// 可选：React Icons
import { FiHome, FiUser } from 'react-icons/fi'
```

### 1.4 视频播放器

> **必须使用 Vidstack**

```typescript
// 正确：使用 Vidstack
import { Player, Video, defaultLayoutIcons } from '@vidstack/react'

// 禁止：禁止使用其他视频播放器
```

### 1.5 富文本编辑器

> **必须使用 Tiptap**（简历编辑）、**可选 Quill**（文档编辑）

---

## 二、核心规则（必须遵守）

### 2.1 语言规范

1. **必须使用中文注释**
2. **必须使用中文报错日志**
3. **必须使用 ES6+ 语法**
4. **禁止在代码中使用 emoji**

```typescript
// 正确
// 处理用户登录请求
function handleUserLogin() {
  try {
    console.info('用户登录成功')
  } catch (error) {
    console.error('登录失败：', error)
  }
}

// 错误
function handleUserLogin() {
  try {
    console.log('User logged in')  // 英文注释
  } catch (e) {
    console.error(e)  // 无中文说明
  }
}
```

### 2.2 路径规范

> **必须使用路径别名 `@/`**

```typescript
// 正确：使用路径别名
import { handleApiCall } from '@/utils'
import { UserService } from '@/services/user'
import { ApiConfig } from '@/config'

// 错误：使用相对路径
import { handleApiCall } from '../../utils'
```

### 2.3 代码复用

> **必须合并重复逻辑**，优先使用封装好的工具函数

```typescript
// 正确：使用工具函数
import { formatDate, formatTime, formatNumber } from '@/utils/format'
import { validateEmail, validatePhone } from '@/utils/validate'
import { toast } from '@/utils/toast'

// 错误：自己重复实现
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

// 类型定义
import type { UserInfo } from '@/types/user'

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====
const [loading, setLoading] = useState(false)

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
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

### 4.3 组件命名

> **使用帕斯卡命名法（PascalCase）**

```typescript
// 正确
export function UserProfile() { }
export function ArticleCard() { }
export function VideoPlayer() { }

// 错误
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

---

## 五、类型安全规范

### 5.1 类型定义

> **必须定义明确的类型，禁止使用 `any`**

```typescript
// 正确
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

// 错误
function getUser(id: any): Promise<any> {
  // 实现
}
```

### 5.2 组件 Props 规范

```typescript
// 正确：完整的 Props 类型定义
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'solid' | 'bordered' | 'light'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
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
  // 实现
}
```

---

## 六、组件规范

### 6.1 HeroUI 使用规范

> **所有 UI 组件优先使用 HeroUI**

```typescript
// 正确：使用 HeroUI 组件
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

### 6.2 条件渲染规范

```typescript
// 正确：清晰的条件渲染
{isLoading && <Spinner />}

{error && (
  <Alert color="danger" title="加载失败">
    {error.message}
  </Alert>
)}

{data && <DataDisplay data={data} />}

// 正确：使用三元运算符（简单情况）
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// 错误：嵌套三元运算符
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
// 正确：定义 Store
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

### 7.2 全局加载状态 (GlobalLoading)

> **使用 `useUIStore` 控制全局加载遮罩**

```typescript
import { useUIStore } from '@/stores/ui'

const { showLoading, hideLoading } = useUIStore()

// 显示加载
showLoading('正在保存...')

// 隐藏加载
hideLoading()
```

### 7.3 不可变性规范

> **永远不要直接修改状态**

```typescript
// 正确：使用展开运算符
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

// 错误：直接修改
user.name = '新名字'
items.push(newItem)
items.splice(index, 1)
```

---

## 八、API 规范

### 8.1 请求规范

```typescript
// 正确：使用封装好的请求方法
import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'

async function fetchUser(id: string): Promise<User> {
  const response = await request.get<ApiResponse<User>>(`/api/users/${id}`)
  if (!response.success) {
    throw new Error(response.error || '请求失败')
  }
  return response.data!
}
```

### 8.2 错误处理规范

```typescript
// 正确：完善的错误处理
import { toast } from '@/utils/toast'

async function handleSubmit(data: FormData) {
  setLoading(true)
  try {
    await createUser(data)
    toast.success('提交成功')
    router.push('/success')
  } catch (error) {
    const message = error instanceof Error ? error.message : '提交失败，请稍后重试'
    toast.error(message)
    console.error('提交失败：', error)
  } finally {
    setLoading(false)
  }
}
```

---

## 九、移动端适配规范

### 9.1 响应式断点

> **使用 Tailwind CSS 响应式类**

| 断点 | 最小宽度 | 类前缀 |
|------|----------|--------|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### 9.2 移动优先原则

```typescript
// 正确：移动优先
<div className="w-full md:w-1/2 lg:w-1/3">
  <Card className="p-2 md:p-4">
    <h2 className="text-sm md:text-base lg:text-lg">标题</h2>
  </Card>
</div>

// 正确：显示/隐藏
<div className="hidden md:block">
  {/* 仅桌面端显示 */}
</div>

<div className="block md:hidden">
  {/* 仅移动端显示 */}
</div>
```

---

## 十、动画规范

### 10.1 使用场景

| 库 | 用途 |
|------|------|
| Framer Motion | 页面转场、复杂动画 |
| HeroUI 内置动画 | 组件内置动画 |
| Tailwind CSS | 简单过渡效果 |

```typescript
// 正确：简单过渡使用 Tailwind
<Button className="transition-all duration-300 hover:scale-105">
  按钮
</Button>

// 正确：复杂动画使用 Framer Motion
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

## 十一、校验检查

### 11.1 构建检查

> **提交代码前必须执行**

```bash
# 运行类型检查
npm run type-check

# 运行 ESLint
npm run lint

# 运行构建
npm run build
```

### 11.2 检查项

1. 无 TypeScript 类型错误
2. 无 ESLint 错误和警告
3. 无未使用的变量或函数
4. 无重复的注释函数
5. 无未封装的注释代码

---

## 十二、注释规范

### 12.1 注释原则

> **解释为什么，而不是做什么**

```typescript
// 正确：说明原因
// 使用指数退避避免 API 过载
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// 错误：说明做什么
// 延迟 1 秒
const delay = 1000
```

### 12.2 JSDoc 文档注释

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

## 十三、导入顺序

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
import { toast } from '@/utils/toast'
import { request } from '@/utils/request'

// 7. 状态管理
import { useUserStore } from '@/stores/user'
import { useUIStore } from '@/stores/ui'

// 8. 类型定义
import type { UserInfo } from '@/types/user'

// 9. 组件
import UserCard from '@/components/UserCard'
```

---

## 十四、组件设计模式

### 14.1 组合优于继承

```typescript
// 正确：组件组合
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>
}

// 使用
<Card>
  <CardHeader>标题</CardHeader>
  <CardBody>内容</CardBody>
</Card>
```

### 14.2 自定义 Hooks 模式

```typescript
// 状态管理 Hook
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle]
}

// 防抖 Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

### 14.3 性能优化

```typescript
// useMemo 用于昂贵计算
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

// useCallback 用于传递给子组件的函数
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

// React.memo 用于纯组件
export const MarketCard = React.memo<MarketCardProps>(({ market }) => {
  return (
    <div className="market-card">
      <h3>{market.name}</h3>
    </div>
  )
})
```

---

## 十五、错误边界模式

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('错误边界捕获：', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>出现错误</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 十六、无障碍规范

### 16.1 键盘导航

```typescript
export function Dropdown({ options, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        onSelect(options[activeIndex])
        setIsOpen(false)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onKeyDown={handleKeyDown}
    >
      {/* 实现细节 */}
    </div>
  )
}
```

---

## 参考文档

- 详细规范文档：[frontend-code-standard.md](./docs/rule/frontend-code-standard.md)
- 前端设计模式：[frontend-patterns skill](./docs/skill/前端skill/frontend-patterns/SKILL.md)
