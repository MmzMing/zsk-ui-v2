/**
 * 测试开发环境组件页面
 */

import { Button, Card, Divider, Input } from '@heroui/react'
import { VideoPlayer } from '@/components/ui/video/VideoPlayer'
import { MarkdownEditor, MarkdownPreview } from '@/components/ui/editor'
import { useState } from 'react'
import { toast } from '@/utils/toast'
import { ChatBubble } from '@/components/ui/ChatBubble'
import type { ChatItem, ChatQuestion } from '@/components/ui/ChatBubble'

// 演示用聊天数据（网站问答风格）
const DEMO_CHAT_ITEMS: ChatItem[] = [
  { id: '1', type: 'message', role: 'user', content: '什么是智数科云平台？' },
  { id: '2', type: 'message', role: 'bot', content: '智数科云是一个企业级智能数据服务平台，提供数据采集、分析和可视化解决方案。' },
  { id: '3', type: 'message', role: 'user', content: '如何开始使用？' },
  { id: '4', type: 'message', role: 'bot', content: '您可以注册账号后免费试用基础功能，我们提供详细的入门指南和在线教程帮助您快速上手。' },
  { id: '5', type: 'message', role: 'user', content: '平台是否易于使用？' },
  { id: '6', type: 'message', role: 'bot', content: '是的，我们的界面设计注重用户体验，无论是技术人员还是业务人员都能轻松操作。' },
  { id: '7', type: 'divider', content: '更多常见问题' },
]

// 底部可点击问题列表
const DEMO_QUESTIONS: ChatQuestion[] = [
  {
    id: 'q1',
    label: '平台支持哪些数据源接入？',
    reply: '支持主流数据库（MySQL、PostgreSQL、MongoDB等）、云存储服务（阿里云、腾讯云、AWS）以及API接口的数据接入。',
  },
  {
    id: 'q2',
    label: '如何保障数据安全？',
    reply: '我们采用企业级加密传输和存储方案，支持私有化部署，并通过了等保三级认证，确保您的数据安全无忧。',
  },
  {
    id: 'q3',
    label: '有技术支持服务吗？',
    reply: '提供7x24小时在线技术支持，企业客户可享受专属客户经理和定制化培训服务。',
  },
]

export default function TestPage() {
  const [content, setContent] = useState('# Hello Milkdown!\n\n这是一个基于 **Milkdown Crepe** 的所见即所得 Markdown 编辑器。\n\n- 支持 GFM 表格、任务列表\n- 支持代码块、引用、图片\n- 右侧使用 `react-markdown` 实时渲染\n\n```ts\nconst hello = (name: string) => `Hello, ${name}!`\n```\n\n| 特性 | 状态 |\n| ---- | ---- |\n| 工具栏 | ✅ |\n| 斜杠菜单 | ✅ |\n| 图片粘贴 | ✅ |\n')
  // 用 key 控制 ChatBubble 重新挂载以重播动画
  const [chatKey, setChatKey] = useState(0)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">组件测试页面</h1>
          <p className="text-default-500">用于测试开发环境中的组件效果</p>
        </div>

        <Divider />


        <Divider />

        {/* Markdown 编辑器测试区域 */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Markdown 编辑器 (Milkdown)</h2>
            <p className="text-default-500 text-sm">
              基于 Milkdown Crepe 的所见即所得 Markdown 编辑器，右侧使用 react-markdown + remark-gfm 实时渲染。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-sm text-default-700">编辑器</h3>
              <MarkdownEditor
                value={content}
                onChange={setContent}
                placeholder="开始输入 Markdown..."
                height={500}
              />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-sm text-primary">实时内容预览 (react-markdown)</h3>
              <div
                className="p-4 bg-content1 rounded-md border border-default-200 overflow-auto"
                style={{ height: 500 }}
              >
                <MarkdownPreview value={content} />
              </div>
            </div>
          </div>

          <Card className="p-4">
            <h3 className="font-bold mb-2">组件特性</h3>
            <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
              <li>编辑器：Milkdown Crepe（基于 ProseMirror + remark）所见即所得</li>
              <li>预览：react-markdown + remark-gfm，支持表格、任务列表、删除线</li>
              <li>支持 value / onChange 受控接口、placeholder、readOnly、自定义高度</li>
              <li>样式继承 Tailwind Typography (prose)，自动适配 dark 主题</li>
            </ul>
          </Card>
        </section>

        <Divider />

        {/* 视频播放器测试区域 */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">视频播放器测试</h2>
            <p className="text-default-500 text-sm">
              基于 Vidstack 封装，支持断点续播、音量记忆、移动端适配
            </p>
          </div>
          
          <div className="w-full max-w-4xl mx-auto">
            <VideoPlayer
              src="https://files.vidstack.io/sprite-fight/720p.mp4"
              poster="https://files.vidstack.io/sprite-fight/poster.webp"
              title="Sprite Fight"
              thumbnails="https://files.vidstack.io/sprite-fight/thumbnails.vtt" 
              storageKey="test-player-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Card className="p-4 border-primary/20 bg-primary/5">
              <h3 className="font-bold mb-2 text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                移动端横屏与音响设置指引
              </h3>
              <ul className="list-disc list-inside text-sm text-default-700 space-y-2">
                <li>
                  <span className="font-bold">音响设置</span>：点击播放器右下角齿轮 <span className="text-primary font-mono">设置</span> -&gt; <span className="text-primary font-mono">音响设置</span>。在这里可以调节<span className="font-bold">音量</span>和<span className="font-bold">音响增强</span>（支持 0% 到 200% 的平滑调节，步进 5%）。
                </li>
                <li>
                  <span className="font-bold">横屏播放</span>：进入全屏模式时，播放器会自动尝试锁定为<span className="font-bold">横屏</span>。如果您的设备开启了自动旋转，效果更佳。
                </li>
                <li>
                  <span className="font-bold">进度记忆</span>：播放一段视频后刷新，会自动从上次位置继续。
                </li>
              </ul>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold mb-2">组件特性</h3>
              <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                <li>使用 LocalStorage 存储播放状态 (key: test-player-1)</li>
                <li>支持 VTT 缩略图预览</li>
                <li>自适应宽高比 (默认 16:9)</li>
              </ul>
            </Card>
          </div>
        </section>

        <Divider />

        {/* Toast 消息提示测试区域 */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Toast 消息提示</h2>
            <p className="text-default-500 text-sm">
              基于 HeroUI Toast 封装的全局消息提示工具，支持成功、错误、警告、信息等多种类型。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 flex flex-col gap-3">
              <h3 className="font-bold text-success">成功提示</h3>
              <p className="text-xs text-default-500">用于操作成功时的反馈</p>
              <Button 
                color="success" 
                variant="flat"
                onClick={() => toast.success('这是一条成功提示消息！')}
              >
                显示成功 Toast
              </Button>
            </Card>

            <Card className="p-4 flex flex-col gap-3">
              <h3 className="font-bold text-danger">错误提示</h3>
              <p className="text-xs text-default-500">用于操作失败或发生异常时的反馈</p>
              <Button 
                color="danger" 
                variant="flat"
                onClick={() => toast.error('这是一条错误提示消息，请检查后重试。')}
              >
                显示错误 Toast
              </Button>
            </Card>

            <Card className="p-4 flex flex-col gap-3">
              <h3 className="font-bold text-warning">警告提示</h3>
              <p className="text-xs text-default-500">用于需要用户注意的警告信息</p>
              <Button 
                color="warning" 
                variant="flat"
                onClick={() => toast.warning('这是一条警告提示消息！')}
              >
                显示警告 Toast
              </Button>
            </Card>

            <Card className="p-4 flex flex-col gap-3">
              <h3 className="font-bold text-primary">信息提示</h3>
              <p className="text-xs text-default-500">用于普通的信息通知</p>
              <Button 
                color="primary" 
                variant="flat"
                onClick={() => toast.info('这是一条普通的信息提示消息。')}
              >
                显示信息 Toast
              </Button>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-bold mb-3">进阶用法</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="bordered"
                onClick={() => toast.success('这条消息会持续 10 秒')}
              >
                长时提示 (10s)
              </Button>
              <Button 
                variant="bordered"
                onClick={() => toast.info('这是一条带有描述信息的自定义 Toast')}
              >
                自定义配置
              </Button>
            </div>
          </Card>
        </section>

        <Divider />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-bold">基础按钮</h3>
            <div className="flex flex-wrap gap-2">
              <Button color="primary">Primary</Button>
              <Button color="secondary">Secondary</Button>
              <Button color="success">Success</Button>
              <Button color="warning">Warning</Button>
              <Button color="danger">Danger</Button>
            </div>
          </Card>

          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-bold">按钮变体</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="solid" color="primary">Solid</Button>
              <Button variant="bordered" color="primary">Bordered</Button>
              <Button variant="light" color="primary">Light</Button>
              <Button variant="flat" color="primary">Flat</Button>
              <Button variant="faded" color="primary">Faded</Button>
              <Button variant="shadow" color="primary">Shadow</Button>
            </div>
          </Card>

          <Card className="p-4 flex flex-col gap-3">
            <h3 className="font-bold">按钮大小</h3>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" color="primary">Small</Button>
              <Button size="md" color="primary">Medium</Button>
              <Button size="lg" color="primary">Large</Button>
            </div>
          </Card>
        </div>

        <Divider />

        {/* 输入框测试区域 */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">输入框测试</h2>
            <p className="text-default-500 text-sm">
              HeroUI Input 组件测试，包含边框样式和清除功能
            </p>
          </div>

          <div className="space-y-4">
            <Input 
              variant="bordered" 
              placeholder="请输入内容..." 
              isClearable 
              defaultValue="这是带清除功能的边框输入框"
            />
            <Input 
              placeholder="请输入内容..." 
              defaultValue="这是普通输入框"
            />
          </div>
        </section>

        <Divider />

        {/* 气泡聊天组件测试区域 */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">气泡聊天组件</h2>
              <p className="text-default-500 text-sm">
                微信/QQ 风格左右布局，气泡弹出动效，打字机效果，聊天记录依次弹出，滑动加速
              </p>
            </div>
            <Button
              variant="bordered"
              size="sm"
              onClick={() => setChatKey(k => k + 1)}
            >
              重播动画
            </Button>
          </div>

          {/* 聊天区域：无边框无背景，直接铺在页面上 */}
          <div className="w-full max-w-4xl mx-auto">
            <ChatBubble
              key={chatKey}
              items={DEMO_CHAT_ITEMS}
              questions={DEMO_QUESTIONS}
              typingSpeed={38}
            />
          </div>
        </section>
        <Card className="p-6">
          <h3 className="font-bold mb-4">后续测试项</h3>
          <ul className="list-disc list-inside space-y-2 text-default-600">
            <li>表单组件测试</li>
            <li>模态框与弹出层测试</li>
            <li>数据展示组件（表格、列表）</li>
            <li>动画效果测试</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
