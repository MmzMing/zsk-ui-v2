/**
 * 全站搜索 API
 * 对应后端：GET /api/document/search/all
 */

import { get } from '../request'
import type { SearchPageResult, SearchParams } from '@/types/search.types'

/**
 * 全站搜索（视频 + 笔记）
 * @param params 搜索参数
 */
export async function searchAll(params: SearchParams): Promise<SearchPageResult> {
  return get<SearchPageResult>('/document/search/all', {
    keyword: params.keyword || undefined,
    type: params.type || 'all',
    sort: params.sort || undefined,
    category: params.category || undefined,
    duration: params.duration || undefined,
    pageNum: params.pageNum ?? 1,
    pageSize: params.pageSize ?? 20,
  })
}
