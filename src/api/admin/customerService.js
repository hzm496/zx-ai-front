import { adminRequest } from '@/utils/request'

/**
 * 获取所有用户会话列表
 */
export function getSessions() {
  return adminRequest({
    url: '/customer-service/sessions',
    method: 'get'
  })
}

/**
 * 获取指定用户的聊天记录
 */
export function getUserMessages(userId, limit = 100) {
  return adminRequest({
    url: `/customer-service/messages/${userId}`,
    method: 'get',
    params: { limit }
  })
}

/**
 * 客服回复用户消息
 */
export function replyMessage(userId, content) {
  return adminRequest({
    url: `/customer-service/reply/${userId}`,
    method: 'post',
    data: { content }
  })
}

/**
 * 获取未读消息总数
 */
export function getUnreadTotal() {
  return adminRequest({
    url: '/customer-service/unread-total',
    method: 'get'
  })
}

