// ===== 1. 依赖导入区域 =====
// 暂无

// ===== 2. TODO待处理导入区域 =====
// 暂无

// ===== 3. 状态控制逻辑区域 =====
// 消息类型
export type MessageType = 'success' | 'error' | 'warning' | 'info'

// 消息配置
interface MessageOptions {
  duration?: number
  closable?: boolean
}

// 默认配置
const DEFAULT_OPTIONS: Required<MessageOptions> = {
  duration: 3000,
  closable: true
}

// ===== 4. 通用工具函数区域 =====
/**
 * 创建消息元素
 * @param content 消息内容
 * @param type 消息类型
 * @param options 配置选项
 * @returns 消息元素
 */
function createMessageElement(content: string, type: MessageType, options: MessageOptions = {}): HTMLElement {
  const { duration, closable } = { ...DEFAULT_OPTIONS, ...options }

  // 创建消息容器
  const messageEl = document.createElement('div')
  messageEl.className = `message message-${type} message-enter`

  // 创建图标
  const iconMap: Record<MessageType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }

  messageEl.innerHTML = `
    <span class="message-icon">${iconMap[type]}</span>
    <span class="message-content">${content}</span>
    ${closable ? '<span class="message-close">×</span>' : ''}
  `

  // 关闭按钮事件
  if (closable) {
    const closeBtn = messageEl.querySelector('.message-close')
    closeBtn?.addEventListener('click', () => {
      removeMessage(messageEl)
    })
  }

  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      removeMessage(messageEl)
    }, duration)
  }

  return messageEl
}

/**
 * 移除消息
 * @param element 消息元素
 */
function removeMessage(element: HTMLElement): void {
  element.classList.remove('message-enter')
  element.classList.add('message-leave')
  setTimeout(() => {
    element.remove()
  }, 300)
}

/**
 * 获取消息容器
 * @returns 消息容器元素
 */
function getMessageContainer(): HTMLElement {
  let container = document.getElementById('message-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'message-container'
    container.className = 'message-container'
    document.body.appendChild(container)
  }
  return container
}

/**
 * 显示消息
 * @param content 消息内容
 * @param type 消息类型
 * @param options 配置选项
 */
function show(content: string, type: MessageType, options?: MessageOptions): void {
  const container = getMessageContainer()
  const messageEl = createMessageElement(content, type, options)
  container.appendChild(messageEl)
}

// ===== 5. 注释代码函数区 =====
// 暂无

// ===== 6. 错误处理函数区域 =====
// 暂无

// ===== 7. 数据处理函数区域 =====
// 暂无

// ===== 8. UI渲染逻辑区域 =====
// 暂无

// ===== 9. 页面初始化与事件绑定 =====
// 暂无

// ===== 10. TODO任务管理区域 =====
// TODO: 集成 HeroUI 的消息组件

/**
 * 显示成功消息
 * @param content 消息内容
 * @param options 配置选项
 */
export function showSuccess(content: string, options?: MessageOptions): void {
  show(content, 'success', options)
}

/**
 * 显示错误消息
 * @param content 消息内容
 * @param options 配置选项
 */
export function showError(content: string, options?: MessageOptions): void {
  show(content, 'error', options)
}

/**
 * 显示警告消息
 * @param content 消息内容
 * @param options 配置选项
 */
export function showWarning(content: string, options?: MessageOptions): void {
  show(content, 'warning', options)
}

/**
 * 显示确认对话框
 * @param title 标题
 * @param content 内容
 * @returns 是否确认
 */
export function showConfirm(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    // 简单的确认对话框实现
    const confirmed = window.confirm(`${title}\n\n${content}`)
    resolve(confirmed)
  })
}

// ===== 11. 导出区域 =====
export const message = {
  success: (content: string, options?: MessageOptions) => show(content, 'success', options),
  error: (content: string, options?: MessageOptions) => show(content, 'error', options),
  warning: (content: string, options?: MessageOptions) => show(content, 'warning', options),
  info: (content: string, options?: MessageOptions) => show(content, 'info', options)
}
