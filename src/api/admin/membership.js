/**
 * Admin 后台管理 - 会员配置管理 API
 * 
 * @author AI Assistant
 * @date 2025-10-31
 */

import { adminRequest } from '@/utils/request'

/**
 * 获取会员配置列表
 */
export const getMembershipList = () => {
  return adminRequest({
    url: '/membership/list',
    method: 'get'
  })
}

/**
 * 添加会员配置
 */
export const addMembership = (data) => {
  return adminRequest({
    url: '/membership/add',
    method: 'post',
    data
  })
}

/**
 * 更新会员配置信息
 */
export const updateMembership = (data) => {
  return adminRequest({
    url: '/membership/update',
    method: 'put',
    data
  })
}

/**
 * 删除会员配置
 */
export const deleteMembership = (id) => {
  return adminRequest({
    url: `/membership/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID获取会员配置详情
 */
export const getMembershipById = (id) => {
  return adminRequest({
    url: `/membership/getById/${id}`,
    method: 'get'
  })
}

