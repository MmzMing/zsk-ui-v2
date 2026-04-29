/**
 * Markdown AST 解析 Web Worker
 * 将 remark-parse + remark-gfm + remark-rehype 的 AST 构建移至 Worker 线程
 * 避免长文档解析阻塞主线程
 */

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)

self.onmessage = (e: MessageEvent<{ id: string; markdown: string }>) => {
  const { id, markdown } = e.data
  try {
    const mdast = processor.parse(markdown)
    const hast = processor.runSync(mdast, markdown)
    self.postMessage({ id, hast })
  } catch (error) {
    self.postMessage({ id, error: String(error) })
  }
}
