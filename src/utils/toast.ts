import { addToast, type ToastProps } from "@heroui/toast";

// 默认配置
const DEFAULT_DURATION = 3000;

interface ToastOptions extends Omit<ToastProps, 'title'> {
  duration?: number;
}

/**
 * 全局消息提示封装
 * 基于 @heroui/toast
 */
export const toast = {
  /**
   * 成功提示
   * @param message 提示内容
   * @param options 其他配置
   */
  success: (message: string, options?: ToastOptions) => {
    addToast({
      title: message,
      color: "success",
      timeout: options?.duration || DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * 错误提示
   * @param message 提示内容
   * @param options 其他配置
   */
  error: (message: string, options?: ToastOptions) => {
    addToast({
      title: message,
      color: "danger",
      timeout: options?.duration || DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * 警告提示
   * @param message 提示内容
   * @param options 其他配置
   */
  warning: (message: string, options?: ToastOptions) => {
    addToast({
      title: message,
      color: "warning",
      timeout: options?.duration || DEFAULT_DURATION,
      ...options,
    });
  },

  /**
   * 信息提示
   * @param message 提示内容
   * @param options 其他配置
   */
  info: (message: string, options?: ToastOptions) => {
    addToast({
      title: message,
      color: "primary",
      timeout: options?.duration || DEFAULT_DURATION,
      ...options,
    });
  },
  
  /**
   * 自定义提示
   * @param props Toast配置
   */
  show: (props: ToastProps) => {
    addToast(props);
  }
};
