/**
 * 应用主入口
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'
import './locales'

// 获取根节点
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('找不到根节点 #root')
}

// 创建 React 根节点并渲染
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
