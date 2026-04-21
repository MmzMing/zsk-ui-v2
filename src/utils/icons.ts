import React from 'react'
import {
  Home,
  Bot,
  Users,
  Video,
  FileText,
  Settings,
  Monitor,
  MessageSquare,
  MessageCircle,
  List,
  ShieldCheck,
  FolderOpen,
  Upload,
  CheckCircle,
  Edit,
  Edit3,
  Cog,
  Tag,
  Activity,
  Database,
  ListChecks,
  RefreshCw,
  Search,
  Plus,
  Trash2,
  Pencil,
  Globe,
  Mail,
  Bell,
  Star,
  Bookmark,
  Clock,
  Key,
  Lock,
  Eye,
  Download,
  Calendar,
  User,
  LayoutDashboard,
  BarChart3,
  LogOut
} from 'lucide-react'

import type { LucideIcon } from 'lucide-react'

export type LucideIconComponent = LucideIcon

export const AVAILABLE_ICONS = [
  'home', 'bot', 'users', 'video', 'file-text', 'settings', 'monitor',
  'message-square', 'message-circle', 'list', 'shield-check', 'folder-open',
  'upload', 'check-circle', 'edit', 'edit-3', 'cog', 'tag', 'activity', 'database',
  'list-checks', 'refresh-cw', 'search', 'plus', 'trash-2', 'pencil',
  'globe', 'mail', 'bell', 'star', 'bookmark', 'clock', 'key', 'lock',
  'eye', 'download', 'calendar', 'user', 'layout-dashboard', 'bar-chart-3',
  'log-out'
]

const iconMap: Record<string, LucideIconComponent> = {
  'home': Home,
  'bot': Bot,
  'users': Users,
  'video': Video,
  'file-text': FileText,
  'settings': Settings,
  'monitor': Monitor,
  'message-square': MessageSquare,
  'message-circle': MessageCircle,
  'list': List,
  'shield-check': ShieldCheck,
  'folder-open': FolderOpen,
  'upload': Upload,
  'check-circle': CheckCircle,
  'edit': Edit,
  'edit-3': Edit3,
  'cog': Cog,
  'tag': Tag,
  'activity': Activity,
  'database': Database,
  'list-checks': ListChecks,
  'refresh-cw': RefreshCw,
  'search': Search,
  'plus': Plus,
  'trash-2': Trash2,
  'pencil': Pencil,
  'globe': Globe,
  'mail': Mail,
  'bell': Bell,
  'star': Star,
  'bookmark': Bookmark,
  'clock': Clock,
  'key': Key,
  'lock': Lock,
  'eye': Eye,
  'download': Download,
  'calendar': Calendar,
  'user': User,
  'layout-dashboard': LayoutDashboard,
  'bar-chart-3': BarChart3,
  'log-out': LogOut
}

export function getLucideIcon(iconName: string): LucideIconComponent | null {
  return iconMap[iconName] ?? null
}

const INVALID_ICON_VALUES = ['#', '', 'null', 'undefined']

export function renderIcon(iconName?: string, size = 16, className?: string) {
  if (!iconName || INVALID_ICON_VALUES.includes(iconName)) return null
  const IconComponent = getLucideIcon(iconName)
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in iconMap`)
    return null
  }
  try {
    return React.createElement(IconComponent, { size, className })
  } catch (error) {
    console.error(`Failed to render icon "${iconName}":`, error)
    return null
  }
}