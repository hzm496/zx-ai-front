/**
 * Web 用户端 - 用户 API
 * 
 * 说明：
 * - 该文件专门用于普通用户端的用户相关 API 调用
 * - 使用 webRequest 发送请求，自动添加 /api/web 前缀
 * - 请求会被代理到 http://localhost:8081（Web 后端服务）
 * - 后端接收：UserWebController @RequestMapping("/web/user")
 * 
 * @author AI Assistant
 * @date 2025-10-13
 */

import { webRequest } from '@/utils/request'

/**
 * ==================== 用户认证 ====================
 */

/**
 * 用户登录
 */
export const login = (data) => {
  return webRequest({
    url: '/user/login',
    method: 'post',
    data
  })
}

/**
 * 用户注册
 */
export const register = (data) => {
  return webRequest({
    url: '/user/register',
    method: 'post',
    data
  })
}

/**
 * 用户登出
 */
export const logout = () => {
  return webRequest({
    url: '/user/logout',
    method: 'get'
  })
}

/**
 * ==================== 用户信息 ====================
 */

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return webRequest({
    url: '/user/getUserInfo',
    method: 'get'
  })
}

/**
 * 修改用户信息（注意：Web 模块使用 POST 方法）
 */
export const updateUserInfo = (data) => {
  return webRequest({
    url: '/user/updateUserInfo',
    method: 'post',
    data
  })
}

/**
 * 根据ID获取用户信息
 */
export const getUserById = (id) => {
  return webRequest({
    url: `/user/getUserInfoById/${id}`,
    method: 'get'
  })
}

/**
 * ==================== 密码管理 ====================
 */

/**
 * 修改密码
 */
export const updatePassword = (data) => {
  return webRequest({
    url: '/user/updatePassword',
    method: 'post',
    data
  })
}

/**
 * ==================== 头像管理 ====================
 */

/**
 * 更新头像（实际是更新用户信息，只传avatar字段）
 */
export const updateAvatar = (avatar) => {
  return webRequest({
    url: '/user/updateUserInfo',
    method: 'post',
    data: { avatar }
  })
}

