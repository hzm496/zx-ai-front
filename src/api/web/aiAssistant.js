import request from '@/utils/request'
import { webRequest } from '@/utils/request'
import { getToken } from '@/utils/auth'

/**
 * 创建新会话
 */
export function createConversation() {
  return webRequest({
    url: '/ai-assistant/conversation/create',
    method: 'post'
  })
}

/**
 * 获取会话列表
 */
export function getConversations() {
  return webRequest({
    url: '/ai-assistant/conversations',
    method: 'get'
  })
}

/**
 * 获取会话消息
 */
export function getMessages(conversationId) {
  return webRequest({
    url: `/ai-assistant/messages/${conversationId}`,
    method: 'get'
  })
}

/**
 * 发送消息（普通方式）
 */
export function sendMessage(data) {
  return webRequest({
    url: '/ai-assistant/chat',
    method: 'post',
    data
  })
}

/**
 * 流式对话
 * @param {Object} data - {conversationId, message}
 * @param {Function} onMessage - 接收到消息片段的回调
 * @param {Function} onComplete - 完成回调
 * @param {Function} onError - 错误回调
 */
export async function chatStream(data, onMessage, onComplete, onError) {
  // 使用webRequest的baseURL配置
  const baseURL = '/api/web'
  const url = `${baseURL}/ai-assistant/chat/stream`
  
  // 获取token（与webRequest保持一致）
  let token = getToken()
  if (token && !token.startsWith('Bearer ')) {
    token = `Bearer ${token}`
  }
  
  console.log('🚀 开始流式对话...', data)
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(data)
    })
    
    console.log('📡 响应状态:', response.status)
    
    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let lastDataTime = Date.now()
    let noDataTimer = null
    
    // 设置无数据超时检测（2秒无新数据则认为完成）
    const checkTimeout = () => {
      if (noDataTimer) clearTimeout(noDataTimer)
      noDataTimer = setTimeout(() => {
        const timeSinceLastData = Date.now() - lastDataTime
        if (timeSinceLastData >= 2000) {
          console.log('⏰ 2秒无新数据，认为流式响应已完成，主动结束')
          try {
            reader.cancel() // 取消读取，会触发done=true
          } catch (e) {
            console.warn('取消reader失败', e)
          }
        } else {
          checkTimeout() // 继续检测
        }
      }, 500) // 每500ms检测一次
    }
    checkTimeout()
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ 流式响应读取完成')
          clearTimeout(noDataTimer)
          break
        }
        
        // 更新最后接收数据时间
        lastDataTime = Date.now()
        
        // 解码数据
        buffer += decoder.decode(value, { stream: true })
        
        // 按行处理（SSE格式）
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后不完整的行
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const content = line.substring(5) // 去掉 "data:" 但保留空格
            if (content) {
              onMessage(content)
            }
          } else if (line === '') {
            // 空行表示一个事件结束
            continue
          }
        }
      }
      
      // 处理剩余的buffer
      if (buffer && buffer.startsWith('data:')) {
        const content = buffer.substring(5)
        if (content) {
          onMessage(content)
        }
      }
      
      clearTimeout(noDataTimer)
      
    } catch (readError) {
      console.error('读取流数据失败：', readError)
      clearTimeout(noDataTimer)
      throw readError
    } finally {
      // 清除定时器
      if (noDataTimer) {
        clearTimeout(noDataTimer)
      }
      // 确保reader被关闭
      try {
        reader.releaseLock()
      } catch (e) {
        console.warn('释放reader失败', e)
      }
    }
    
    // 成功完成
    console.log('✅ 流式对话完成，调用onComplete')
    if (onComplete) {
      onComplete()
    }
  } catch (error) {
    console.error('❌ 流式对话发生错误：', error)
    // 无论如何都要调用onComplete关闭typing状态
    if (onComplete) {
      console.log('⚠️ 错误情况下调用onComplete')
      onComplete()
    }
    if (onError) {
      onError(error)
    }
  }
}

/**
 * 删除会话
 */
export function deleteConversation(conversationId) {
  return webRequest({
    url: `/ai-assistant/conversation/${conversationId}`,
    method: 'delete'
  })
}

/**
 * 重命名会话
 */
export function renameConversation(conversationId, title) {
  return webRequest({
    url: `/ai-assistant/conversation/${conversationId}/rename`,
    method: 'put',
    data: { title }
  })
}




