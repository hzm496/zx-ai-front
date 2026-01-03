<template>
  <div class="ai-assistant-page">
    <!-- 导航栏 -->
    <AppHeader active-nav="ai-assistant" />

    <!-- 主内容区 -->
    <div class="page-container">
      <el-row :gutter="20" class="chat-layout">
        <!-- 左侧会话列表 -->
        <el-col :span="6">
          <el-card shadow="hover" class="conversation-card">
            <template #header>
              <div class="card-header">
                <span>💬 我的对话</span>
                <el-button type="success" size="small" :icon="Plus" @click="handleNewConversation">
                  新建
                </el-button>
              </div>
            </template>

            <div class="conversation-list">
              <div
                v-for="conv in conversations"
                :key="conv.id"
                class="conversation-item"
                :class="{ active: currentConversationId === conv.id }"
                @click="selectConversation(conv.id)"
              >
                <div class="conv-header">
                  <span class="conv-title">{{ conv.title }}</span>
                  <el-icon class="delete-icon" @click.stop="handleDeleteConversation(conv.id)">
                    <Delete />
                  </el-icon>
                </div>
                <div class="conv-meta">
                  <span class="conv-time">{{ formatTime(conv.updateTime) }}</span>
                </div>
              </div>

              <el-empty v-if="conversations.length === 0" description="暂无对话" :image-size="100" />
            </div>
          </el-card>
        </el-col>

        <!-- 右侧聊天区域 -->
        <el-col :span="18">
          <el-card shadow="hover" class="chat-card">
            <template #header>
              <div class="chat-header-bar">
                <div class="header-info">
                  <el-icon :size="24" color="#67C23A"><ChatDotRound /></el-icon>
                  <span class="header-title">🤖 智学小助手</span>
                  <el-tag type="success" size="small">AI助手</el-tag>
                </div>
                <div class="header-tips">
                  有学习问题随时问我，我也可以为你推荐课程哦~
                </div>
              </div>
            </template>

            <!-- 聊天消息区 -->
            <div class="messages-area" ref="messagesRef">
              <div v-if="messages.length === 0" class="empty-chat">
                <el-icon :size="80" color="#67C23A"><ChatDotRound /></el-icon>
                <h3>你好！我是智学小助手 🤖</h3>
                <p>有什么学习问题可以问我~</p>
              </div>

              <div
                v-for="(msg, index) in messages"
                :key="index"
                class="message-row"
                :class="{ 'message-self': msg.role === 'user' }"
              >
                <el-avatar :size="40" :src="msg.role === 'user' ? userAvatar : aiAvatar">
                  <el-icon v-if="msg.role === 'assistant'"><ChatDotRound /></el-icon>
                </el-avatar>
                <div class="message-box">
                  <div class="message-meta">
                    <span class="sender">{{ msg.role === 'user' ? '我' : '智学小助手' }}</span>
                    <span class="time">{{ formatTime(msg.createTime) }}</span>
                  </div>
                  <div class="message-text">
                    <!-- 如果是AI消息且内容为空，显示打字动画 -->
                    <div v-if="msg.role === 'assistant' && !msg.content" class="typing">
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                      <span class="typing-dot"></span>
                    </div>
                    <!-- 否则显示实际内容，添加 key 强制重新渲染 -->
                    <div v-else :key="msg.renderKey || 0" v-html="formatMessage(msg.content)"></div>
                  </div>
                </div>
              </div>

            </div>

            <!-- 输入区 -->
            <div class="input-area">
              <el-input
                v-model="inputMessage"
                type="textarea"
                :rows="4"
                placeholder="请输入你的问题... (Shift+Enter换行)"
                :maxlength="1000"
                show-word-limit
                @keydown.enter.exact.prevent="handleSend"
                :disabled="aiTyping"
              />
              <el-button
                type="success"
                size="large"
                @click="handleSend"
                :loading="aiTyping"
                :disabled="!inputMessage.trim()"
              >
                发送 (Enter)
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, Plus, Delete } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import {
  createConversation,
  getConversations,
  getMessages,
  chatStream,
  deleteConversation
} from '@/api/web/aiAssistant'
import { searchCourseByTitle } from '@/api/web/course'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 全局处理课程链接点击（供formatMessage生成的HTML调用）
window.handleCourseClick = async (event, courseName) => {
  event.preventDefault()
  console.log('点击课程：', courseName)
  
  try {
    // 根据课程名称搜索课程
    const course = await searchCourseByTitle(courseName)
    
    if (course && course.id) {
      // 跳转到课程详情页
      router.push({
        path: '/web/course/detail',
        query: { id: course.id }
      })
      ElMessage.success(`正在打开《${courseName}》...`)
    } else {
      // 没找到课程，跳转到首页
      router.push({
        path: '/web/home',
        hash: '#courses'
      })
      ElMessage.warning(`未找到《${courseName}》课程，请在首页搜索`)
    }
  } catch (error) {
    console.error('查询课程失败', error)
    // 出错时跳转到首页
    router.push({
        path: '/web/home',
    hash: '#courses'
      })
    ElMessage.error('查询课程失败，请在首页搜索')
  }
}

const conversations = ref([])
const currentConversationId = ref(null)
const messages = ref([])
const inputMessage = ref('')
const aiTyping = ref(false)
const messagesRef = ref(null)
// messagesKey 已不再使用（改为直接刷新页面）

const userAvatar = computed(() => userStore.userInfo?.avatar)
const aiAvatar = 'https://img.icons8.com/fluency/96/chatbot.png'

// 加载会话列表
const loadConversations = async () => {
  try {
    conversations.value = await getConversations()
  } catch (error) {
    console.error('加载会话列表失败：', error)
  }
}

// 选择会话
const selectConversation = async (conversationId) => {
  currentConversationId.value = conversationId
  await loadMessages(conversationId)
}

// 加载消息
const loadMessages = async (conversationId) => {
  try {
    const loadedMessages = await getMessages(conversationId)
    // 给每条消息添加 renderKey（用于强制重新渲染）
    messages.value = loadedMessages.map((msg, index) => ({
      ...msg,
      renderKey: Date.now() + index
    }))
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败：', error)
  }
}

// 创建新会话
const handleNewConversation = async () => {
  try {
    const conversationId = await createConversation()
    currentConversationId.value = conversationId
    messages.value = []
    await loadConversations()
    ElMessage.success('已创建新对话')
  } catch (error) {
    console.error('创建会话失败：', error)
    ElMessage.error('创建会话失败')
  }
}

// 删除会话
const handleDeleteConversation = async (conversationId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个对话吗？', '删除对话', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteConversation(conversationId)

    // 如果删除的是当前会话，清空消息和会话ID
    if (conversationId === currentConversationId.value) {
      currentConversationId.value = null
      messages.value = []
    }

    // 重新加载会话列表
    await loadConversations()
    
    // 如果还有其他会话，选择第一个；否则保持空白状态
    if (conversations.value.length > 0) {
      selectConversation(conversations.value[0].id)
    }
    
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除会话失败：', error)
      ElMessage.error('删除失败')
    }
  }
}

// 发送消息（流式）
const handleSend = async () => {
  if (!inputMessage.value.trim()) {
    return
  }

  // 如果当前没有选择对话，自动创建一个新会话
  if (!currentConversationId.value) {
    try {
      const conversationId = await createConversation()
      currentConversationId.value = conversationId
      messages.value = []
      await loadConversations()
    } catch (error) {
      console.error('自动创建会话失败：', error)
      ElMessage.error('创建会话失败，请重试')
      return
    }
  }

  const userMsg = inputMessage.value.trim()
  inputMessage.value = ''

  // 立即显示用户消息
  messages.value.push({
    role: 'user',
    content: userMsg,
    createTime: new Date().toISOString(),
    renderKey: 0
  })
  scrollToBottom()

  // 创建AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    createTime: new Date().toISOString(),
    renderKey: 0
  })

  aiTyping.value = true

  // 设置超时保护
  const timeoutId = setTimeout(() => {
    console.warn('⏰ 超时！强制关闭typing状态')
    aiTyping.value = false
  }, 60000)

  try {
    await chatStream(
      {
        conversationId: currentConversationId.value,
        message: userMsg
      },
      // onMessage
      (chunk) => {
        // 追加内容到消息
        messages.value[aiMessageIndex].content += chunk
        scrollToBottom()
      },
      // onComplete
      () => {
        clearTimeout(timeoutId)
        console.log('🎯 onComplete被调用，设置aiTyping = false')
        aiTyping.value = false
        
        // AI输出完成后无感刷新页面
        setTimeout(() => {
          console.log('🔄 AI输出完成，准备无感刷新页面')
          
          // 保存当前会话ID
          if (currentConversationId.value) {
            sessionStorage.setItem('ai_current_conversation', currentConversationId.value)
            sessionStorage.setItem('ai_auto_scroll', 'true')
          }
          
          // 延迟刷新，让用户看到完整内容
          setTimeout(() => {
            console.log('✅ 开始刷新页面...')
            location.reload()
          }, 300)
        }, 100)
        
        loadConversations().catch(err => {
          console.error('加载会话列表失败', err)
        })
      },      // onError
      (error) => {
        clearTimeout(timeoutId)
        aiTyping.value = false
        console.error('发送消息失败：', error)
        ElMessage.error('发送失败，请重试')
        messages.value.splice(aiMessageIndex, 1)
      }
    )
  } catch (error) {
    clearTimeout(timeoutId)
    aiTyping.value = false
    console.error('发送消息失败：', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    setTimeout(() => {
      if (aiTyping.value) {
        console.warn('⚠️ finally块强制关闭typing状态')
        aiTyping.value = false
      }
    }, 1000)
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 格式化消息（支持Markdown）
const formatMessage = (content) => {
  if (!content) return ''
  
  let html = content
  
  // 1. 保护代码块，先提取出来
  const codeBlocks = []
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`
    codeBlocks.push(code.trim())
    return placeholder
  })
  
  // 2. 保护行内代码
  const inlineCodes = []
  html = html.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodes.length}__`
    inlineCodes.push(code)
    return placeholder
  })
  
  // 3. 处理课程链接《课程名》→ 可点击链接
  html = html.replace(/《([^》]+)》/g, '<a href="#" class="course-link" data-course-name="$1" onclick="handleCourseClick(event, \'$1\')">《$1》</a>')
  
  // 4. 处理加粗 **文字**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // 5. 分段处理（按双换行分段）
  const paragraphs = html.split(/\n\n+/)
  html = paragraphs.map(para => {
    para = para.trim()
    if (!para) return ''
    
    // 处理标题
    if (para.match(/^### /)) {
      return para.replace(/^### (.*)$/gim, '<h3>$1</h3>')
    }
    if (para.match(/^## /)) {
      return para.replace(/^## (.*)$/gim, '<h2>$1</h2>')
    }
    if (para.match(/^# /)) {
      return para.replace(/^# (.*)$/gim, '<h1>$1</h1>')
    }
    
    // 处理有序列表
    if (para.match(/^\d+\./m)) {
      const items = para.split('\n').map(line => {
        return line.replace(/^\d+\.\s+(.*)$/, '<li class="ordered-item">$1</li>')
      }).join('')
      return `<ol class="markdown-list">${items}</ol>`
    }
    
    // 处理无序列表
    if (para.match(/^[\-\*] /m)) {
      const items = para.split('\n').map(line => {
        return line.replace(/^[\-\*]\s+(.*)$/, '<li class="unordered-item">$1</li>')
      }).join('')
      return `<ul class="markdown-list">${items}</ul>`
    }
    
    // 普通段落，保留段内换行
    return `<p>${para.replace(/\n/g, '<br>')}</p>`
  }).join('')
  
  // 6. 还原行内代码
  inlineCodes.forEach((code, index) => {
    html = html.replace(`__INLINE_CODE_${index}__`, `<code class="inline-code">${code}</code>`)
  })
  
  // 7. 还原代码块
  codeBlocks.forEach((code, index) => {
    html = html.replace(`__CODE_BLOCK_${index}__`, `<pre class="code-block"><code>${code}</code></pre>`)
  })
  
  return html
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(async () => {
  await loadConversations()

  // 检查是否有需要恢复的会话（刷新后恢复）
  const savedConvId = sessionStorage.getItem('ai_current_conversation')
  const autoScroll = sessionStorage.getItem('ai_auto_scroll')
  
  if (savedConvId && conversations.value.some(c => c.id == savedConvId)) {
    // 恢复之前的会话
    await selectConversation(Number(savedConvId))
    
    // 自动滚动到底部
    if (autoScroll === 'true') {
      nextTick(() => {
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      })
    }
    
    // 清除缓存
    sessionStorage.removeItem('ai_current_conversation')
    sessionStorage.removeItem('ai_auto_scroll')
  } else {
    // 正常流程：如果有会话，自动选择第一个；如果没有会话，保持空白状态等待用户发送消息
    if (conversations.value.length > 0) {
      selectConversation(conversations.value[0].id)
    }
    // 移除了自动创建会话的逻辑，现在用户可以在没有会话时直接发送消息，系统会自动创建
  }
})
</script>

<style scoped>
.ai-assistant-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 20px 20px;
}

.chat-layout {
  height: calc(100vh - 140px);
  min-height: 600px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

/* 会话列表 */
.conversation-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.conversation-card :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.conversation-item {
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.conversation-item:hover {
  background: #e1f3d8;
  border-color: #67C23A;
}

.conversation-item.active {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(133, 206, 97, 0.1) 100%);
  border-color: #67C23A;
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.conv-title {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.delete-icon {
  font-size: 16px;
  color: #909399;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .delete-icon {
  opacity: 1;
}

.delete-icon:hover {
  color: #f56c6c;
}

.conv-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.conv-time {
  font-size: 11px;
}

/* 聊天区域 */
.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-card :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.chat-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.header-tips {
  font-size: 13px;
  color: #67C23A;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f7fa;
  min-height: 400px;
  max-height: calc(100vh - 380px);
}

.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  gap: 16px;
}

.empty-chat h3 {
  margin: 0;
  color: #303133;
}

.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message-row.message-self {
  flex-direction: row-reverse;
}

.message-box {
  max-width: 70%;
}

.message-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
  color: #909399;
}

.message-self .message-meta {
  flex-direction: row-reverse;
}

.sender {
  font-weight: 500;
}

.message-text {
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  word-wrap: break-word;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.message-self .message-text {
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  color: white;
}

.message-text :deep(strong) {
  font-weight: 600;
  color: #67C23A;
}

.message-self .message-text :deep(strong) {
  color: #fff;
}

.message-text :deep(pre.code-block) {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
  border-left: 4px solid #67C23A;
}

.message-text :deep(pre.code-block code) {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #abb2bf;
}

.message-text :deep(.inline-code) {
  background: #f5f7fa;
  color: #e74c3c;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  font-weight: 500;
}

.message-self .message-text :deep(.inline-code) {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

/* 课程链接样式 */
.message-text :deep(.course-link) {
  color: #67C23A;
  font-weight: 600;
  text-decoration: none;
  border-bottom: 2px solid #67C23A;
  padding-bottom: 2px;
  transition: all 0.3s;
  cursor: pointer;
}

.message-text :deep(.course-link:hover) {
  color: #85CE61;
  border-bottom-color: #85CE61;
  background: rgba(103, 194, 58, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.message-self .message-text :deep(.course-link) {
  color: #fff;
  border-bottom-color: rgba(255, 255, 255, 0.8);
}

.message-self .message-text :deep(.course-link:hover) {
  background: rgba(255, 255, 255, 0.2);
}

.message-text :deep(h1),
.message-text :deep(h2),
.message-text :deep(h3) {
  margin: 12px 0 8px 0;
  color: #303133;
  font-weight: 600;
}

.message-text :deep(h1) {
  font-size: 20px;
}

.message-text :deep(h2) {
  font-size: 18px;
}

.message-text :deep(h3) {
  font-size: 16px;
}

.message-text :deep(p) {
  margin: 12px 0;
  line-height: 1.8;
}

.message-text :deep(p:first-child) {
  margin-top: 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(.markdown-list) {
  margin: 12px 0;
  padding-left: 20px;
}

.message-text :deep(li) {
  margin: 6px 0;
  line-height: 1.8;
}

.message-text :deep(.ordered-item) {
  list-style-type: decimal;
  display: list-item;
  list-style-position: outside;
}

.message-text :deep(.unordered-item) {
  list-style-type: disc;
  display: list-item;
  list-style-position: outside;
}

.message-self .message-text :deep(h1),
.message-self .message-text :deep(h2),
.message-self .message-text :deep(h3) {
  color: white;
}

/* AI正在输入动画 */
.typing {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 16px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #67C23A;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 输入区 */
.input-area {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background: white;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-area .el-textarea {
  flex: 1;
}

.input-area :deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
}
</style>

