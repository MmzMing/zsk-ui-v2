/**
 * 文件管理 API
 * 对接后端 DocFilesController 接口
 * 支持文件上传、下载、CRUD
 */

import { get, post, put, del, request } from '../../request'
import type { ApiResponse } from '@/types/api.types'

/** 文件信息 */
export interface DocFile {
  id: string
  fileName: string
  fileType: string
  fileSize: string
  filePath: string
  fileUrl: string
  deleted: number
  createTime: string
  updateTime: string
}

/** 文件查询参数 */
export interface DocFileQueryParams {
  fileName?: string
  fileType?: string
  deleted?: number
  pageNum?: number
  pageSize?: number
}

/** 文件分页数据 */
export interface DocFilePageData {
  list: DocFile[]
  total: number
  pageNum: number
  pageSize: number
}

/** 新增文件输入 */
export interface DocFileCreateInput {
  fileName: string
  fileType: string
  fileSize: string
  filePath: string
  fileUrl: string
}

/** 修改文件输入 */
export interface DocFileUpdateInput {
  id: string
  fileName?: string
  fileType?: string
  fileSize?: string
  filePath?: string
  fileUrl?: string
}

/**
 * 查询文件列表（不分页）
 *
 * @param params - 查询参数
 * @returns 文件列表
 */
export async function getDocFileList(params?: DocFileQueryParams): Promise<DocFile[]> {
  return get('/document/docFiles/list', params as unknown as Record<string, unknown>)
}

/**
 * 分页查询文件列表
 *
 * @param params - 查询参数（含分页参数）
 * @returns 分页文件数据
 */
export async function getDocFilePage(params?: DocFileQueryParams): Promise<DocFilePageData> {
  return get('/document/docFiles/page', params as unknown as Record<string, unknown>)
}

/**
 * 根据ID获取文件详情
 *
 * @param id - 文件ID
 * @returns 文件详情
 */
export async function getDocFileById(id: string): Promise<DocFile> {
  return get(`/document/docFiles/${id}`)
}

/**
 * 新增文件记录
 *
 * @param data - 文件数据
 */
export async function createDocFile(data: DocFileCreateInput): Promise<boolean> {
  return post('/document/docFiles', data as unknown as Record<string, unknown>)
}

/**
 * 修改文件信息
 *
 * @param data - 文件数据（必须包含id）
 */
export async function updateDocFile(data: DocFileUpdateInput): Promise<boolean> {
  return put('/document/docFiles', data as unknown as Record<string, unknown>)
}

/**
 * 删除文件（支持批量）
 * 多个ID用逗号分隔
 *
 * @param ids - 文件ID列表，多个用逗号分隔
 */
export async function deleteDocFile(ids: string): Promise<boolean> {
  return del(`/document/docFiles/${ids}`)
}

/**
 * 上传文件
 * 使用 multipart/form-data 格式上传文件
 *
 * @param file - 文件对象
 * @returns 上传后的文件信息
 */
export async function uploadDocFile(file: File): Promise<DocFile> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await request.post<ApiResponse<DocFile & { url?: string }>>('/document/docFiles/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  
  const data = response.data.data!
  
  console.log('上传响应:', response)
  console.log('响应数据:', response.data)
  console.log('文件数据:', data)
  
  // 后端返回的字段是 url，我们需要映射到 fileUrl
  if (data && data.url && !data.fileUrl) {
    data.fileUrl = data.url
  }
  
  return data as DocFile
}

/**
 * 下载文件
 * 返回文件流，通过创建临时链接触发下载
 *
 * @param id - 文件ID
 * @param fileName - 下载后的文件名
 */
export async function downloadDocFile(id: string, fileName: string): Promise<void> {
  const response = await request.get(`/document/docFiles/download/${id}`, {
    responseType: 'blob'
  })

  // 创建临时下载链接
  const blob = new Blob([response.data])
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
