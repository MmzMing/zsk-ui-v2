/**
 * 工具导航页面
 * 黑白简约线条风格，展示分类好的实用网站工具
 */

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Cloud,
  Code2,
  Sparkles,
  Palette,
  Play,
  Zap,
  BookOpen,
  Terminal,
  ExternalLink,
  Search,
  Tag,
  Layers,
  Menu,
  X
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  cloud: Cloud,
  code: Code2,
  sparkles: Sparkles,
  palette: Palette,
  play: Play,
  zap: Zap,
  book: BookOpen,
  terminal: Terminal
}

interface ToolItem {
  name: string
  url: string
  description: string
  tags: string[]
}

interface ToolCategory {
  name: string
  icon: string
  items: ToolItem[]
}

interface ToolsData {
  title: string
  description: string
  categories: ToolCategory[]
}

export default function CategoriesPage() {
  const [toolsData, setToolsData] = useState<ToolsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/tools.json')
      .then(res => {
        if (!res.ok) throw new Error('加载配置失败')
        return res.json()
      })
      .then((data: ToolsData) => {
        setToolsData(data)
        setLoading(false)
      })
      .catch(() => {
        console.error('工具导航配置加载失败')
        setLoading(false)
      })
  }, [])

  const filteredCategories = useMemo(() => {
    if (!toolsData) return []

    if (!searchKeyword.trim() && !activeCategory) {
      return toolsData.categories
    }

    const keyword = searchKeyword.toLowerCase()
    return toolsData.categories
      .filter(cat => {
        if (activeCategory && cat.name !== activeCategory) return false
        if (!keyword) return true
        const hasItem = cat.items.some(
          item =>
            item.name.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword) ||
            item.tags.some(t => t.toLowerCase().includes(keyword))
        )
        return hasItem
      })
      .map(cat => ({
        ...cat,
        items: keyword
          ? cat.items.filter(
              item =>
                item.name.toLowerCase().includes(keyword) ||
                item.description.toLowerCase().includes(keyword) ||
                item.tags.some(t => t.toLowerCase().includes(keyword))
            )
          : cat.items
      }))
      .filter(cat => cat.items.length > 0)
  }, [toolsData, searchKeyword, activeCategory])

  const handleCardClick = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const allTags = useMemo(() => {
    if (!toolsData) return []
    const tagSet = new Set<string>()
    toolsData.categories.forEach(cat => {
      cat.items.forEach(item => {
        item.tags.forEach(tag => tagSet.add(tag))
      })
    })
    return Array.from(tagSet).slice(0, 20)
  }, [toolsData])

  const totalItems = useMemo(() => {
    if (!toolsData) return 0
    return toolsData.categories.reduce((sum, cat) => sum + cat.items.length, 0)
  }, [toolsData])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-default-900 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!toolsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-default-500">配置加载失败，请检查配置是否正确</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-light tracking-wide mb-3 text-zinc-900 dark:text-zinc-50">
            {toolsData.title}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
            {toolsData.description}
          </p>
          <div className="mt-4 flex items-center gap-6 text-xs text-zinc-400 dark:text-zinc-500">
            <span>{toolsData.categories.length} 个分类</span>
            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>{totalItems} 个工具</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索工具名称、描述或标签..."
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-400 transition-colors"
            />
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveCategory(null)
                setIsMobileMenuOpen(false)
              }}
              className={`px-4 py-2.5 text-xs rounded-lg border transition-all ${
                !activeCategory
                  ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50'
                  : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
            >
              全部
            </button>
            {toolsData.categories.map(cat => {
              const IconComponent = ICON_MAP[cat.icon] || Layers
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-2.5 text-xs rounded-lg border transition-all flex items-center gap-2 ${
                    activeCategory === cat.name
                      ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              )
            })}
          </div>
        </motion.div>

        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden mb-8 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg"
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveCategory(null)
                  setIsMobileMenuOpen(false)
                }}
                className={`px-4 py-2.5 text-xs rounded-lg border transition-all text-left ${
                  !activeCategory
                    ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                }`}
              >
                全部
              </button>
              {toolsData.categories.map(cat => {
                const IconComponent = ICON_MAP[cat.icon] || Layers
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCategory(cat.name)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`px-4 py-2.5 text-xs rounded-lg border transition-all text-left flex items-center gap-2 ${
                      activeCategory === cat.name
                        ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-50'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {allTags.length > 0 && !activeCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10 flex flex-wrap gap-2"
          >
            <span className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 mr-1">
              <Tag className="w-3 h-3" />
              热门标签
            </span>
            {allTags.slice(0, 12).map(tag => (
              <button
                key={tag}
                onClick={() => setSearchKeyword(tag)}
                className="px-3 py-1 text-xs border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all"
              >
                #{tag}
              </button>
            ))}
          </motion.div>
        )}

        <div className="space-y-16">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">未找到匹配的工具</p>
            </div>
          ) : (
            filteredCategories.map((category, catIndex) => {
              const IconComponent = ICON_MAP[category.icon] || Layers
              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <IconComponent className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                    <h2 className="text-lg font-light tracking-wide text-zinc-800 dark:text-zinc-200">
                      {category.name}
                    </h2>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600">
                      {category.items.length}
                    </span>
                    <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {category.items.map((item, itemIndex) => {
                      const cardId = `${category.name}-${item.name}`
                      return (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: catIndex * 0.1 + itemIndex * 0.05 }}
                          onMouseEnter={() => setHoveredCard(cardId)}
                          onMouseLeave={() => setHoveredCard(null)}
                          onClick={() => handleCardClick(item.url)}
                          className="group relative border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 cursor-pointer bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all duration-300"
                        >
                          <motion.div
                            className="absolute inset-0 rounded-xl bg-zinc-50 dark:bg-zinc-900 opacity-0 transition-opacity duration-300"
                            animate={{ opacity: hoveredCard === cardId ? 1 : 0 }}
                          />

                          <div className="relative z-10">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors truncate">
                                {item.name}
                              </h3>
                              <ExternalLink className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors shrink-0" />
                            </div>

                            <motion.p
                              className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-3 line-clamp-2"
                              animate={{
                                opacity: hoveredCard === cardId ? 1 : 0.8
                              }}
                            >
                              {item.description}
                            </motion.p>

                            <div className="flex flex-wrap gap-1.5">
                              {item.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-[10px] border border-zinc-200 dark:border-zinc-800 rounded text-zinc-400 dark:text-zinc-500"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
