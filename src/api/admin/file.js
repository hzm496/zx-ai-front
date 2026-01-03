/**
 * Admin 后台管理 - 文件管理 API
 * 
 * 说明：
 * - 该文件专门用于管理员后台的文件管理相关 API 调用
 * - 使用 adminRequest 发送请求，自动添加 /api/admin 前缀
 * - 请求会被代理到 http://localhost:8082（Admin 后端服务）
 * - 后端接收：AdminFileController @RequestMapping("/admin/file")
 * 
 * @author AI Assistant
 * @date 2025-10-13
 */

import { adminRequest } from '@/utils/request'

/**
 * 上传图片（管理员）
 */
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return adminRequest({
    url: '/file/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传视频（管理员）
 */
export const uploadVideo = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return adminRequest({
    url: '/file/upload/video',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传通用文件（管理员）
 */
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return adminRequest({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

