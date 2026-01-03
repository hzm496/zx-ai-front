/**
 * Admin 后台管理 - 用户管理 API
 * 
 * 说明：
 * - 该文件专门用于管理员后台的用户管理相关 API 调用
 * - 使用 adminRequest 发送请求，自动添加 /api/admin 前缀
 * - 请求会被代理到 http://localhost:8082（Admin 后端服务）
 * - 后端接收：AdminUserController @RequestMapping("/admin/user")
 * 
 * @author AI Assistant
 * @date 2025-10-13
 */

import { adminRequest } from '@/utils/request'

/**
 * ==================== 用户基本操作 ====================
 */

/**
 * 获取用户信息（管理员）
 */
export const getUserInfo = () => {
  return adminRequest({
    url: '/user/getUserInfo',
    method: 'get'
  })
}

/**
 * 根据ID获取用户信息（管理员）
 */
export const getUserById = (id) => {
  return adminRequest({
    url: `/user/getUserById/${id}`,
    method: 'get'
  })
}

/**
 * 更新用户信息（管理员）
 */
export const updateUserInfo = (data) => {
  return adminRequest({
    url: '/user/updateUserInfo',
    method: 'put',
    data
  })
}

/**
 * 登出（管理员）
 */
export const logout = () => {
  return adminRequest({
    url: '/user/logout',
    method: 'get'
  })
}

/**
 * ==================== 用户列表管理 ====================
 */

/**
 * 获取用户列表（分页）
 * @param {Object} data - 查询参数 { pageNum, pageSize, username, isVip, gender, status }
 */
export const getUserList = (data) => {
  return adminRequest({
    url: '/user/finduserList',
    method: 'post',
    data
  })
}

/**
 * 删除用户（管理员）
 * @param {Number} id - 用户ID
 */
export const deleteUser = (id) => {
  return adminRequest({
    url: `/user/deleteUser/${id}`,
    method: 'delete'
  })
}

/**
 * 管理员编辑用户信息
 * @param {Number} userId - 用户ID
 * @param {Object} data - 用户信息 { nickname, avatar, phone, email, gender }
 */
export const updateUserInfoByAdmin = (userId, data) => {
  return adminRequest({
    url: `/user/updateUserInfoByAdmin/${userId}`,
    method: 'put',
    data
  })
}

/**
 * 修改密码（管理员）
 * @param {Object} data - { oldPassword, newPassword }
 */
export const updatePassword = (data) => {
  return adminRequest({
    url: '/user/updatePassword',
    method: 'post',
    data
  })
}

