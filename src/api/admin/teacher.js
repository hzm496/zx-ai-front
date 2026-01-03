/**
 * Admin 后台管理 - 讲师管理 API
 * 
 * 说明：
 * - 该文件专门用于管理员后台的讲师管理相关 API 调用
 * - 使用 adminRequest 发送请求，自动添加 /api/admin 前缀
 * - 请求会被代理到 http://localhost:8082（Admin 后端服务）
 * - 后端接收：TeacherController @RequestMapping("/admin/teacher")
 * 
 * @author AI Assistant
 * @date 2025-10-13
 */

import { adminRequest } from '@/utils/request'

/**
 * ==================== 讲师列表管理 ====================
 */

/**
 * 获取讲师列表（分页）
 * @param {Object} data - 查询参数 { pageNum, pageSize, name, title, status }
 */
export const getTeacherList = (data) => {
  return adminRequest({
    url: '/teacher/list',
    method: 'post',
    data
  })
}

/**
 * 添加讲师
 * @param {Object} data - 讲师信息 { name, avatar, title, intro, description, experience, status, sort }
 */
export const addTeacher = (data) => {
  return adminRequest({
    url: '/teacher/add',
    method: 'post',
    data
  })
}

/**
 * 更新讲师信息
 * @param {Object} data - 讲师信息 { id, name, avatar, title, intro, description, experience, status, sort }
 */
export const updateTeacher = (data) => {
  return adminRequest({
    url: '/teacher/update',
    method: 'put',
    data
  })
}

/**
 * 删除讲师
 * @param {Number} id - 讲师ID
 */
export const deleteTeacher = (id) => {
  return adminRequest({
    url: `/teacher/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID获取讲师详情
 * @param {Number} id - 讲师ID
 */
export const getTeacherById = (id) => {
  return adminRequest({
    url: `/teacher/getById/${id}`,
    method: 'get'
  })
}

