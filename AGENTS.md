# AGENTS.md - 知识库小破站 (zsk-ui)

本文件供 Agentic Coding 代理使用，确保代码符合项目规范。

---

## 一、命令

### 1.1 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 (tsc -b && vite build) |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run preview` | 预览生产构建 |

### 1.2 检查命令（提交前必须执行）

```bash
# 运行类型检查
npx tsc --noEmit

# 运行 ESLint
npm run lint

# 运行构建
npm run build
```

---

## 二、技术栈

- **UI 框架**: React ^19.2.0
- **构建工具**: Vite ^7.x
- **类型系统**: TypeScript ~5.9.3
- **组件库**: HeroUI ^2.8.8 (默认)
- **CSS**: Tailwind CSS ^4.x
- **路由**: React Router DOM ^7.x
- **状态管理**: Zustand

---

## 三、代码规范（强制）

### 3.1 语言规范

- ✅ **必须使用中文注释**
- ✅ **必须使用中文报错日志**
- ✅ **必须使用 ES6+ 语法**
- ❌ **禁止在代码中使用 emoji**

```typescript
// ✅ 正确
// 处理用户登录请求
function handleUserLogin() {
  try {
    console.info('用户登录成功')
  } catch (error) {
    console.error('登录失败：', error)
  }
}

// ❌ 错误
function handleUserLogin() {
  console.log('User logged in')  // 英文注释
}
```

### 3.2 路径规范

- ✅ **必须使用路径别名**（如 `@/`）
- ❌ 禁止使用相对路径 `../../`

```typescript
// ✅ 正确
import { handleApiCall } from '@/utils'
import { UserService } from '@/services/user'

// ❌ 错误
import { handleApiCall } from '../../utils'
```

### 3.3 文件区域顺序

按以下顺序组织代码：

```typescript
// ===== 1. 依赖导入区域 =====
// React/第三方组件 → 工具函数 → 类型定义

// ===== 2. TODO待处理导入区域 =====

// ===== 3. 状态控制逻辑区域 =====

// ===== 4. 通用工具函数区域 =====

// ===== 5. 注释代码函数区 =====

// ===== 6. 错误处理函数区域 =====

// ===== 7. 数据处理函数区域 =====

// ===== 8. UI渲染逻辑区域 =====

// ===== 9. 页面初始化与事件绑定 =====

// ===== 10. TODO任务管理区域 =====

// ===== 11. 导出区域 =====
export default function ComponentName() { }
```

### 3.4 导入顺序

```typescript
// 1. React 核心
import { useState, useEffect, useCallback } from 'react'

// 2. HeroUI 组件
import { Button, Input, Modal } from '@heroui/react'

// 3. 图标 (Lucide > React Icons)
import { Home, Settings } from 'lucide-react'
import { FiUser } from 'react-icons/fi'

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

## 四、命名规范

### 4.1 变量命名 (camelCase)

| 类型 | 规则 | 示例 |
|------|------|------|
| 普通变量 | camelCase | `userName`, `totalCount` |
| 布尔值 | is/has/can 前缀 | `isActive`, `hasPermission` |
| 数组 | 复数形式 | `users`, `items`, `dataList` |
| 常量 | 全大写+下划线 | `MAX_RETRY`, `API_BASE_URL` |

### 4.2 函数命名 (动词前缀 + 名词)

| 前缀 | 用途 | 示例 |
|------|------|------|
| get | 获取数据 | `getUserInfo` |
| handle | 处理事件 | `handleSubmit` |
| show/hide | 显示/隐藏 | `showModal` |
| validate | 校验 | `validateEmail` |
| on | 事件处理 | `onChange` |

### 4.3 组件/文件命名 (PascalCase)

```typescript
// 组件文件: UserProfile.tsx, ArticleCard.tsx
// 工具文件: format.ts, validate.ts (camelCase)
// 类型文件: user.types.ts, api.types.ts
// 钩子文件: useAuth.ts, useDebounce.ts
```

---

## 五、类型安全

- ✅ **必须定义明确类型**，禁止使用 `any`
- ✅ **使用泛型**处理通用逻辑
- ✅ **利用类型推断**简化代码

```typescript
// ✅ 正确
interface UserInfo {
  id: string
  name: string
  role: 'admin' | 'user' | 'guest'
}

// ❌ 错误
function getUser(id: any): Promise<any> { }
```

---

## 六、组件规范

### 6.1 HeroUI 使用

```typescript
// ✅ 正确：使用 HeroUI 组件
import { Button, Input, Card, Modal } from '@heroui/react'

function LoginForm() {
  return (
    <Card>
      <Input label="用户名" placeholder="请输入用户名" />
      <Button color="primary">登录</Button>
    </Card>
  )
}
```

### 6.2 Props 定义

```typescript
interface ButtonProps {
  /** 按钮文字 */
  children: React.ReactNode
  /** 点击事件 */
  onClick: () => void
  /** 是否禁用 */
  disabled?: boolean
  /** 按钮变体 */
  variant?: 'solid' | 'bordered' | 'light'
}
```

### 6.3 条件渲染

```typescript
// ✅ 正确：清晰的条件渲染
{isLoading && <Spinner />}
{error && <Alert color="danger">{error}</Alert>}

// ✅ 正确：简单三元
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// ❌ 错误：嵌套三元
{isLoading ? <Spinner /> : error ? <Alert /> : data ? <Display /> : null}
```

---

## 七、状态管理 (Zustand)

```typescript
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

### 7.1 全局加载状态 (GlobalLoading)

> **使用 `useUIStore` 控制全局加载遮罩**

```typescript
import { useUIStore } from '@/stores/ui'

const { showLoading, hideLoading } = useUIStore()

// 显示加载
showLoading('正在保存...')

// 隐藏加载
hideLoading()
```

### 7.2 不可变性

```typescript
// ✅ 正确：使用展开运算符
const updatedUser = { ...user, name: '新名字' }
const updatedList = [...items, newItem]

// ❌ 错误：直接修改
user.name = '新名字'
items.push(newItem)
```

---

## 八、API 规范

```typescript
import { request } from '@/utils/request'

async function fetchUser(id: string): Promise<User> {
  const response = await request.get<ApiResponse<User>>(`/api/users/${id}`)
  if (!response.success) {
    throw new Error(response.error || '请求失败')
  }
  return response.data!
}
```

### 错误处理

```typescript
import { toast } from '@/utils/toast'

async function handleSubmit(data: FormData) {
  setLoading(true)
  try {
    await createUser(data)
    toast.success('提交成功')
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

## 九、特殊组件规范

### 9.1 图标 (Lucide > React Icons)

```typescript
// ✅ 推荐
import { Home, User, Settings } from 'lucide-react'

// ✅ 可选
import { FiHome, FiUser } from 'react-icons/fi'
```

### 9.2 视频播放器 (Vidstack)

```typescript
import { Player, Video, defaultLayoutIcons } from '@vidstack/react'
import '@vidstack/react/player/styles/default/theme.css'
```

### 9.3 富文本编辑器 (Tiptap/Quill)

- 简历编辑：必须使用 Tiptap
- 文档编辑：可选 Quill

---

## 十、移动端适配

- ✅ 使用 Tailwind CSS 响应式类
- ✅ 移动端优先原则
- ✅ 触摸区域最小 44px

```typescript
// 断点: sm:640px, md:768px, lg:1024px, xl:1280px

// ✅ 正确
<div className="w-full md:w-1/2 lg:w-1/3">
  <Card className="p-2 md:p-4">
    <h2 className="text-sm md:text-base lg:text-lg">标题</h2>
  </Card>
</div>
```

---

## 十一、动画规范

| 库 | 用途 |
|------|------|
| Framer Motion | 页面转场、复杂动画 |
| HeroUI 内置动画 | 组件内置动画 |
| Tailwind CSS | 简单过渡效果 |

---

## 十二、检查清单（提交前必做）

1. ✅ 无 TypeScript 类型错误 (`npx tsc --noEmit`)
2. ✅ 无 ESLint 错误和警告 (`npm run lint`)
3. ✅ 无未使用的变量或函数
4. ✅ 无重复的注释函数
5. ✅ 无未封装的注释代码

---

## 十三、ESLint 规则

项目已配置以下规则：

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

---

## 十四、注释规范

> **解释为什么，而不是做什么**

```typescript
// ✅ 正确：说明原因
// 使用指数退避避免 API 过载
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// ❌ 错误：说明做什么
// 延迟 1 秒
const delay = 1000
```

---

## 十五、代码复用

- ✅ **必须合并重复逻辑**
- ✅ **优先使用封装好的工具函数**

```typescript
// ✅ 正确：使用工具函数
import { formatDate, formatTime } from '@/utils/format'
import { toast } from '@/utils/toast'

// ❌ 错误：自己实现
function formatDate(date) {
  return new Date(date).toLocaleDateString()
}
```
