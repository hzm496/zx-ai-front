import request from '@/utils/request'

/**
 * 发送客服消息
 */
export function sendMessage(data) {
  return request({
    url: '/customer-service/send',
    method: 'post',
    data
  })
}

/**
 * 获取聊天记录
 */
export function getMessages(limit = 50) {
  return request({
    url: '/customer-service/messages',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取未读消息数量
 */
export function getUnreadCount() {
  return request({
    url: '/customer-service/unread-count',
    method: 'get'
  })
}

/**
 * 标记消息为已读
 */
export function markAsRead() {
  return request({
    url: '/customer-service/mark-read',
    method: 'post'
  })
}

/**
 * 清除会话历史
 */
export function clearHistory() {
  return request({
    url: '/customer-service/clear',
    method: 'delete'
  })
}

