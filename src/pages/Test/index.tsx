/**
 * 测试开发环境组件页面
 */

import { Button, Card, Divider } from '@heroui/react'
import { VideoPlayer } from '@/components/ui/video/VideoPlayer'
import Editor from '@/components/ui/editor'
import { useState } from 'react'
import { Turnstile } from '@marsidev/react-turnstile'

export default function TestPage() {
  const [content, setContent] = useState('<p>Hello Tiptap!</p>')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileStatus, setTurnstileStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">组件测试页面</h1>
          <p className="text-default-500">用于测试开发环境中的组件效果</p>
        </div>

        <Divider />

        {/* Cloudflare Turnstile 测试区域 */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Cloudflare Turnstile 人机验证</h2>
            <p className="text-default-500 text-sm">
              测试 Cloudflare Turnstile 集成效果。
            </p>
          </div>
          
          <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
            <Card className="p-6 w-full max-w-md mx-auto">
              <h3 className="font-bold mb-4 text-center">验证演示</h3>
              <div className="flex justify-center mb-4">
                <Turnstile 
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => {
                    setTurnstileToken(token)
                    setTurnstileStatus('success')
                  }}
                  onError={() => {
                    setTurnstileToken('')
                    setTurnstileStatus('error')
                  }}
                  onExpire={() => {
                    setTurnstileToken('')
                    setTurnstileStatus('expired')
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-default-600">状态:</span>
                  <span className={`font-bold ${
                    turnstileStatus === 'success' ? 'text-success' : 
                    turnstileStatus === 'error' ? 'text-danger' : 
                    turnstileStatus === 'expired' ? 'text-warning' : 'text-default-400'
                  }`}>
                    {turnstileStatus === 'success' && '验证通过'}
                    {turnstileStatus === 'error' && '验证出错'}
                    {turnstileStatus === 'expired' && '验证过期'}
                    {turnstileStatus === 'pending' && '等待验证'}
                  </span>
                </div>
                
                {turnstileToken && (
                  <div className="mt-2">
                    <p className="text-xs text-default-500 mb-1">Token (前50位):</p>
                    <div className="p-2 bg-content2 rounded text-xs font-mono break-all">
                      {turnstileToken.slice(0, 50)}...
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        <Divider />

        {/* 富文本编辑器测试区域 */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">富文本编辑器 (Tiptap)</h2>
            <p className="text-default-500 text-sm">
              企业级富文本编辑器，支持 Markdown 快捷键、气泡菜单、悬浮菜单、图片上传等。
            </p>
          </div>
          
          <div className="w-full max-w-4xl mx-auto">
            <Editor 
              value={content} 
              onChange={setContent} 
              placeholder="开始输入..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Card className="p-4 border-primary/20 bg-primary/5">
              <h3 className="font-bold mb-2 text-primary">实时内容预览</h3>
              <div className="prose prose-sm max-w-none p-2 bg-content1 rounded-md border border-default-200 min-h-[100px]">
                {content}
              </div>
            </Card>
            <Card className="p-4">
              <h3 className="font-bold mb-2">组件特性</h3>
              <ul className="list-disc list-inside text-sm text-default-600 space-y-1">
                <li>集成 Tailwind Typography</li>
                <li>支持气泡菜单 (选中文本)</li>
                <li>支持悬浮菜单 (空行)</li>
                <li>移动端适配</li>
              </ul>
            </Card>
          </div>
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
