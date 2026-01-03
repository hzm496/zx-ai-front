<template>
  <!-- 客服悬浮按钮 -->
  <div class="customer-service-wrapper">
    <!-- 未读消息角标 -->
    <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="service-badge">
      <div class="service-button" @click="toggleChat">
        <el-icon :size="28"><Service /></el-icon>
        <span class="service-text">客服</span>
      </div>
    </el-badge>

    <!-- 聊天窗口 -->
    <transition name="chat-slide">
      <div v-if="showChat" class="chat-window">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="header-info">
            <el-icon :size="20"><Service /></el-icon>
            <span class="header-title">在线客服</span>
            <el-tag size="small" type="success">在线</el-tag>
          </div>
          <div class="header-actions">
            <el-tooltip content="清除会话历史" placement="bottom">
              <el-icon class="action-btn" @click="handleClearHistory"><Delete /></el-icon>
            </el-tooltip>
            <el-icon class="close-btn" @click="closeChat"><Close /></el-icon>
          </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="chat-content" ref="chatContentRef">
          <div v-if="messages.length === 0" class="empty-message">
            <el-icon :size="50" color="#909399"><ChatDotRound /></el-icon>
            <p>暂无消息，有问题随时咨询~</p>
          </div>

          <div v-for="msg in messages" :key="msg.id" class="message-item" :class="{ 'message-self': msg.senderType === 1 }">
            <el-avatar :size="36" :src="msg.senderAvatar" :icon="UserFilled" />
            <div class="message-content">
              <div class="message-info">
                <span class="sender-name">{{ msg.senderName }}</span>
                <span class="send-time">{{ formatTime(msg.createTime) }}</span>
              </div>
              <div class="message-bubble">
                {{ msg.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <!-- 工具栏 -->
          <div class="input-toolbar">
            <el-popover
              placement="top-start"
              :width="320"
              trigger="click"
            >
              <template #reference>
                <el-button size="small" circle>
                  <el-icon><ChatLineRound /></el-icon>
                </el-button>
              </template>
              <div class="emoji-panel">
                <div 
                  v-for="emoji in emojiList" 
                  :key="emoji" 
                  class="emoji-item"
                  @click="insertEmoji(emoji)"
                >
                  {{ emoji }}
                </div>
              </div>
            </el-popover>
          </div>

          <el-input
            v-model="inputMessage"
            type="textarea"
            :rows="3"
             placeholder="请输入消息... (Shift+Enter换行)"
            :maxlength="500"
            show-word-limit
            @keydown.enter.exact.prevent="handleSend"
          />
          <el-button type="primary" @click="handleSend" :loading="sending" :disabled="!inputMessage.trim()">
            发送 (Enter)
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Service, Close, ChatDotRound, UserFilled, Delete, ChatLineRound } from '@element-plus/icons-vue'
import { sendMessage, getMessages, getUnreadCount, markAsRead, clearHistory } from '@/api/web/customerService'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const showChat = ref(false)
const messages = ref([])
const inputMessage = ref('')
const sending = ref(false)
const unreadCount = ref(0)
const chatContentRef = ref(null)

let pollingTimer = null

// 表情列表
const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
  '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬',
  '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
  '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴',
  '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏',
  '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
  '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
  '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌'
]

// 打开/关闭聊天窗口
const toggleChat = () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    return
  }
  
  showChat.value = !showChat.value
  
  if (showChat.value) {
    loadMessages()
    startPolling()
    markMessagesAsRead()
  } else {
    stopPolling()
  }
}

// 关闭聊天
const closeChat = () => {
  showChat.value = false
  stopPolling()
}

// 加载消息
const loadMessages = async () => {
  try {
    messages.value = await getMessages(50)
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败：', error)
  }
}

// 发送消息
const handleSend = async () => {
  if (!inputMessage.value.trim()) {
    return
  }
  
  try {
    sending.value = true
    await sendMessage({ content: inputMessage.value.trim() })
    inputMessage.value = ''
    await loadMessages()
  } catch (error) {
    console.error('发送消息失败：', error)
    ElMessage.error('发送失败，请重试')
  } finally {
    sending.value = false
  }
}

// 标记消息为已读
const markMessagesAsRead = async () => {
  try {
    await markAsRead()
    unreadCount.value = 0
  } catch (error) {
    console.error('标记已读失败：', error)
  }
}

// 获取未读数量
const loadUnreadCount = async () => {
  if (!userStore.token) return
  
  try {
    unreadCount.value = await getUnreadCount()
  } catch (error) {
    console.error('获取未读数量失败：', error)
  }
}

// 开始轮询
const startPolling = () => {
  stopPolling()
  pollingTimer = setInterval(() => {
    loadMessages()
  }, 3000) // 每3秒轮询一次
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatContentRef.value) {
    chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight
  }
}

// 插入表情
const insertEmoji = (emoji) => {
  inputMessage.value += emoji
}

// 清除会话历史
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有聊天记录吗？此操作不可恢复！',
      '清除会话',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await clearHistory()
    messages.value = []
    ElMessage.success('会话历史已清除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清除历史失败：', error)
      ElMessage.error('清除失败')
    }
  }
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
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

onMounted(() => {
  // 只在未打开聊天窗口时定期检查未读消息（检查是否有新消息的提示）
  setInterval(() => {
    if (!showChat.value) {
      loadUnreadCount()
    }
  }, 10000) // 每10秒检查一次未读数
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped>
.customer-service-wrapper {
  position: fixed;
  right: -70px; /* 默认隐藏大部分，只露出30px */
  bottom: 30px;
  z-index: 1000;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* 平滑缓动动画 */
}

/* 鼠标悬浮时滑出 */
.customer-service-wrapper:hover {
  right: 20px;
}

.service-badge {
  display: block;
}

.service-button {
  width: 100px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 30px 0 0 30px; /* 左侧圆角 */
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 8px;
  color: white;
  cursor: pointer;
  box-shadow: -4px 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  padding: 0 15px 0 10px;
}

.service-button:hover {
  box-shadow: -6px 6px 20px rgba(102, 126, 234, 0.6);
}

.service-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.chat-window {
  position: fixed;
  right: 30px;
  bottom: 110px;
  width: 380px;
  height: 550px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.message-item {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.message-item.message-self {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 70%;
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
  padding: 10px 14px;
  border-radius: 12px;
  background: white;
  word-wrap: break-word;
  line-height: 1.5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.message-self .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.chat-input {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-toolbar {
  display: flex;
  gap: 8px;
}

.emoji-panel {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 8px;
  max-height: 240px;
  overflow-y: auto;
  padding: 8px;
}

.emoji-item {
  font-size: 24px;
  cursor: pointer;
  text-align: center;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
}

.emoji-item:hover {
  background: #f5f7fa;
  transform: scale(1.2);
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
    right: 10px;
    bottom: 90px;
    width: calc(100vw - 20px);
    max-width: 380px;
  }
  
  .customer-service-wrapper {
    right: 10px;
    bottom: 10px;
  }
}
</style>


