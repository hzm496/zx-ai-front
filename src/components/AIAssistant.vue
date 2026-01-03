<template>
  <!-- AI助手悬浮按钮 -->
  <div class="ai-assistant-wrapper">
    <div class="ai-button" @click="toggleChat">
      <el-icon :size="28"><ChatDotRound /></el-icon>
    </div>

    <!-- 聊天窗口 -->
    <transition name="chat-slide">
      <div v-if="showChat" class="chat-window">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="header-info">
            <el-icon :size="20"><ChatDotRound /></el-icon>
            <span class="header-title">🤖 智学小助手</span>
            <el-tag size="small" type="success">AI</el-tag>
          </div>
          <div class="header-actions">
            <el-tooltip content="会话列表" placement="bottom">
              <el-icon class="action-btn" @click="showConversations = !showConversations"><List /></el-icon>
            </el-tooltip>
            <el-tooltip content="新建会话" placement="bottom">
              <el-icon class="action-btn" @click="handleNewConversation"><Plus /></el-icon>
            </el-tooltip>
            <el-icon class="close-btn" @click="closeChat"><Close /></el-icon>
          </div>
        </div>

        <!-- 会话列表侧边栏 -->
        <transition name="sidebar-slide">
          <div v-if="showConversations" class="conversations-sidebar">
            <div class="sidebar-header">
              <span>历史对话</span>
              <el-icon @click="showConversations = false"><Close /></el-icon>
            </div>
            <div class="conversation-list">
              <div
                v-for="conv in conversations"
                :key="conv.id"
                class="conversation-item"
                :class="{ active: currentConversationId === conv.id }"
                @click="selectConversation(conv.id)"
              >
                <div class="conv-title">{{ conv.title }}</div>
                <div class="conv-meta">
                  <span>{{ conv.messageCount }}条消息</span>
                  <el-icon class="delete-icon" @click.stop="handleDeleteConversation(conv.id)"><Delete /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- 聊天内容区域 -->
        <div class="chat-content" ref="chatContentRef">
          <div v-if="messages.length === 0" class="empty-message">
            <el-icon :size="60" color="#67C23A"><ChatDotRound /></el-icon>
            <p>你好！我是智学小助手 🤖</p>
            <p class="tips">有学习问题随时问我，我也可以为你推荐课程哦~</p>
          </div>

          <div v-for="msg in messages" :key="msg.id" class="message-item" :class="{ 'message-self': msg.role === 'user' }">
            <el-avatar :size="36" :src="msg.role === 'user' ? userAvatar : aiAvatar">
              <el-icon v-if="msg.role === 'assistant'"><ChatDotRound /></el-icon>
            </el-avatar>
            <div class="message-content">
              <div class="message-info">
                <span class="sender-name">{{ msg.role === 'user' ? '我' : '智学小助手' }}</span>
                <span class="send-time">{{ formatTime(msg.createTime) }}</span>
              </div>
              <div class="message-bubble" v-html="formatMessage(msg.content)"></div>
            </div>
          </div>

          <!-- AI正在输入 -->
          <div v-if="aiTyping" class="message-item">
            <el-avatar :size="36" :src="aiAvatar">
              <el-icon><ChatDotRound /></el-icon>
            </el-avatar>
            <div class="message-content">
              <div class="message-bubble typing">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
            placeholder="请输入你的问题... (Shift+Enter换行)"
            :maxlength="500"
            show-word-limit
            @keydown.enter.exact.prevent="handleSend"
            :disabled="aiTyping"
          />
          <el-button type="success" @click="handleSend" :loading="aiTyping" :disabled="!inputMessage.trim()">
            发送 (Enter)
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ChatDotRound, Close, List, Plus, Delete } from '@element-plus/icons-vue'
import { 
  createConversation, 
  getConversations, 
  getMessages, 
  chatStream,
  deleteConversation 
} from '@/api/web/aiAssistant'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const showChat = ref(false)
const showConversations = ref(false)
const conversations = ref([])
const currentConversationId = ref(null)
const messages = ref([])
const inputMessage = ref('')
const aiTyping = ref(false)
const chatContentRef = ref(null)

const userAvatar = computed(() => userStore.userInfo?.avatar)
const aiAvatar = 'https://img.icons8.com/fluency/96/chatbot.png' // AI头像

// 打开/关闭聊天窗口
const toggleChat = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    return
  }
  
  showChat.value = !showChat.value
  
  if (showChat.value) {
    await loadConversations()
    
    // 如果没有会话，创建新会话
    if (conversations.value.length === 0) {
      await handleNewConversation()
    } else {
      // 选择最新的会话
      selectConversation(conversations.value[0].id)
    }
  }
}

// 关闭聊天
const closeChat = () => {
  showChat.value = false
  showConversations.value = false
}

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
  showConversations.value = false
  await loadMessages(conversationId)
}

// 加载消息
const loadMessages = async (conversationId) => {
  try {
    messages.value = await getMessages(conversationId)
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
    showConversations.value = false
    ElMessage.success('已创建新对话')
  } catch (error) {
    console.error('创建会话失败：', error)
    ElMessage.error('创建会话失败')
  }
}

// 删除会话
const handleDeleteConversation = async (conversationId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个对话吗？',
      '删除对话',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteConversation(conversationId)
    
    // 如果删除的是当前会话，创建新会话
    if (conversationId === currentConversationId.value) {
      await handleNewConversation()
    }
    
    await loadConversations()
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
  if (!inputMessage.value.trim() || !currentConversationId.value) {
    return
  }
  
  const userMsg = inputMessage.value.trim()
  inputMessage.value = ''
  
  // 立即显示用户消息
  messages.value.push({
    role: 'user',
    content: userMsg,
    createTime: new Date().toISOString()
  })
  scrollToBottom()
  
  // 创建AI消息占位符
  const aiMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    createTime: new Date().toISOString()
  })
  
  aiTyping.value = true
  
  // 设置超时保护，60秒后强制关闭typing状态
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
      // onMessage - 接收到每个字符
      (chunk) => {
        messages.value[aiMessageIndex].content += chunk
        scrollToBottom()
      },
      // onComplete - 流式输出完成
      () => {
        clearTimeout(timeoutId)
        console.log('🎯 onComplete被调用，设置aiTyping = false')
        aiTyping.value = false
        console.log('当前aiTyping状态:', aiTyping.value)
        // 异步加载会话列表，不阻塞typing状态更新
        loadConversations().catch(err => {
          console.error('加载会话列表失败', err)
        })
      },
      // onError - 错误处理
      (error) => {
        clearTimeout(timeoutId)
        console.log('⚠️ onError被调用，设置aiTyping = false')
        aiTyping.value = false
        console.error('发送消息失败：', error)
        ElMessage.error('发送失败，请重试')
        // 移除失败的AI消息
        messages.value.splice(aiMessageIndex, 1)
      }
    )
  } catch (error) {
    clearTimeout(timeoutId)
    console.log('❌ catch被触发，设置aiTyping = false')
    aiTyping.value = false
    console.error('发送消息失败：', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    // 最终保险：无论如何都关闭typing状态
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
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
  }
}

// 格式化消息（支持Markdown）
const formatMessage = (content) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\n/g, '<br>')
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前'`
  if (date.toDateString() === now.toDateString()) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  // 初始化
})

onBeforeUnmount(() => {
  // 清理
})
</script>

<style scoped>
.ai-assistant-wrapper {
  position: fixed;
  left: 30px;
  bottom: 30px;
  z-index: 1000;
}

.ai-button {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
  transition: all 0.3s;
}

.ai-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.6);
}

.chat-window {
  position: fixed;
  left: 30px;
  bottom: 110px;
  width: 450px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.chat-header {
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn,
.close-btn {
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s;
  padding: 4px;
  border-radius: 4px;
}

.action-btn:hover,
.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn:hover {
  transform: rotate(90deg);
}

/* 会话侧边栏 */
.conversations-sidebar {
  position: absolute;
  top: 60px;
  left: 0;
  width: 200px;
  height: calc(100% - 60px);
  background: #f5f7fa;
  border-right: 1px solid #e4e7ed;
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.3s;
}

.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(-100%);
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.sidebar-header .el-icon {
  cursor: pointer;
}

.conversation-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  padding: 10px 12px;
  margin-bottom: 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.conversation-item:hover {
  background: #e1f3d8;
}

.conversation-item.active {
  background: #67C23A;
  color: white;
}

.conv-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conv-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  opacity: 0.8;
}

.delete-icon {
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
}

.conversation-item:hover .delete-icon {
  opacity: 1;
}

.chat-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}

.chat-content::-webkit-scrollbar {
  width: 6px;
}

.chat-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  gap: 10px;
}

.empty-message .tips {
  font-size: 13px;
  color: #67C23A;
}

.message-item {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.message-item.message-self {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 75%;
}

.message-info {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.message-self .message-info {
  flex-direction: row-reverse;
}

.sender-name {
  font-weight: 500;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  background: white;
  word-wrap: break-word;
  line-height: 1.6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-self .message-bubble {
  background: linear-gradient(135deg, #67C23A 0%, #85CE61 100%);
  color: white;
}

.message-bubble :deep(strong) {
  font-weight: 600;
  color: #67C23A;
}

.message-self .message-bubble :deep(strong) {
  color: #fff;
}

.message-bubble :deep(pre) {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.message-bubble :deep(code) {
  font-family: 'Courier New', monospace;
  font-size: 13px;
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

.chat-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-input :deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
}

.chat-input .el-button {
  align-self: flex-end;
}

@media (max-width: 768px) {
  .chat-window {
    left: 10px;
    bottom: 90px;
    width: calc(100vw - 20px);
    max-width: 450px;
  }
  
  .ai-assistant-wrapper {
    left: 10px;
    bottom: 10px;
  }
}
</style>




