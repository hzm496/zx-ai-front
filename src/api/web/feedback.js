/**
 * Web 端 - 反馈 API
 * 
 * @author AI Assistant
 * @date 2025-10-28
 */

import { webRequest } from '@/utils/request'

/**
 * 提交反馈
 */
export const submitFeedback = (data) => {
  return webRequest({
    url: '/feedback/submit',
    method: 'post',
    data
  })
}

