/**
 * Admin 后台管理 - 反馈 API
 * 
 * @author AI Assistant
 * @date 2025-10-28
 */

import { adminRequest } from '@/utils/request'

/**
 * 获取反馈列表（分页）
 */
export const getFeedbackList = (data) => {
  return adminRequest({
    url: '/feedback/list',
    method: 'post',
    data
  })
}

/**
 * 标记为已读
 */
export const markAsRead = (id) => {
  return adminRequest({
    url: `/feedback/read/${id}`,
    method: 'put'
  })
}

/**
 * 回复反馈
 */
export const replyFeedback = (id, reply) => {
  return adminRequest({
    url: `/feedback/reply/${id}`,
    method: 'put',
    data: { reply }
  })
}

/**
 * 获取未读反馈数量
 */
export const getUnreadCount = () => {
  return adminRequest({
    url: '/feedback/unread-count',
    method: 'get'
  })
}

/**
 * 删除反馈
 */
export const deleteFeedback = (id) => {
  return adminRequest({
    url: `/feedback/${id}`,
    method: 'delete'
  })
}

