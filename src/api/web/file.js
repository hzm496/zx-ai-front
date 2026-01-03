/**
 * Web 用户端 - 文件 API
 * 
 * 说明：
 * - 该文件专门用于普通用户端的文件上传相关 API 调用
 * - 使用 webRequest 发送请求，自动添加 /api/web 前缀
 * - 请求会被代理到 http://localhost:8081（Web 后端服务）
 * - 后端接收：FileController @RequestMapping("/web/file")
 * 
 * @author AI Assistant
 * @date 2025-10-13
 */

import { webRequest } from '@/utils/request'

/**
 * 上传图片
 */
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return webRequest({
    url: '/file/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传视频
 */
export const uploadVideo = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return webRequest({
    url: '/file/upload/video',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传文件
 */
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return webRequest({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

