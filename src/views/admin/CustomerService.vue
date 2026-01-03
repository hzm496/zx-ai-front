<template>
  <div class="customer-service-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span><el-icon><Service /></el-icon> 在线客服</span>
          <el-badge :value="totalUnread" :hidden="totalUnread === 0">
            <el-button size="small" @click="refreshSessions" :loading="loading">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </el-badge>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 左侧会话列表 -->
        <el-col :span="8">
          <div class="session-list">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户..."
              :prefix-icon="Search"
              clearable
              style="margin-bottom: 16px;"
            />

            <div v-loading="loading" style="min-height: 300px;">
              <div
                v-for="session in filteredSessions"
                :key="session.userId"
                class="session-item"
                :class="{ active: currentUserId === session.userId }"
                @click="selectSession(session)"
              >
                <el-badge :value="session.unreadCount" :hidden="session.unreadCount === 0">
                  <el-avatar :size="45" :src="session.avatar" :icon="UserFilled" />
                </el-badge>
                <div class="session-info">
                  <div class="session-header">
                    <span class="user-name">{{ session.nickname || session.username }}</span>
                    <span class="time">{{ formatTime(session.lastMessageTime) }}</span>
                  </div>
                  <div class="last-message">{{ session.lastMessage || '暂无消息' }}</div>
                </div>
              </div>

              <el-empty v-if="sessions.length === 0 && !loading" description="暂无会话" :image-size="100" />
            </div>
          </div>
        </el-col>

        <!-- 右侧聊天窗口 -->
        <el-col :span="16">
          <div v-if="currentUserId" class="chat-area">
            <!-- 聊天头部 -->
            <div class="chat-area-header">
              <el-avatar :size="40" :src="currentSession?.avatar" :icon="UserFilled" />
              <div class="user-info">
                <span class="user-name">{{ currentSession?.nickname || currentSession?.username }}</span>
                <span class="user-id">ID: {{ currentUserId }}</span>
              </div>
            </div>

            <!-- 消息列表 -->
            <div class="messages-container" ref="messagesRef">
              <div v-for="msg in currentMessages" :key="msg.id" class="message-row" :class="{ 'message-self': msg.senderType === 2 }">
                <el-avatar :size="36" :src="msg.senderAvatar" :icon="UserFilled" />
                <div class="message-box">
                  <div class="message-meta">
                    <span class="sender">{{ msg.senderName }}</span>
                    <span class="time">{{ formatTime(msg.createTime) }}</span>
                  </div>
                  <div class="message-text">{{ msg.content }}</div>
                </div>
              </div>
            </div>

            <!-- 输入框 -->
            <div class="input-area">
              <!-- 工具栏 -->
              <div class="input-toolbar">
                <el-popover
                  placement="top-start"
                  :width="320"
                  trigger="click"
                >
                  <template #reference>
                    <el-button size="small" :icon="ChatLineRound">表情</el-button>
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
                v-model="replyContent"
                type="textarea"
                :rows="4"
                placeholder="输入回复内容... (Shift+Enter换行)"
                :maxlength="500"
                show-word-limit
                @keydown.enter.exact.prevent="handleReply"
              />
              <el-button type="primary" @click="handleReply" :loading="replying" :disabled="!replyContent.trim()">
                发送 (Enter)
              </el-button>
            </div>
          </div>

          <el-empty v-else description="请选择一个会话开始聊天" :image-size="150" />
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Service, UserFilled, Search, Refresh, ChatLineRound } from '@element-plus/icons-vue'
import { getSessions, getUserMessages, replyMessage, getUnreadTotal } from '@/api/admin/customerService'

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

const sessions = ref([])
const currentUserId = ref(null)
const currentMessages = ref([])
const replyContent = ref('')
const loading = ref(false)
const replying = ref(false)
const searchKeyword = ref('')
const totalUnread = ref(0)
const messagesRef = ref(null)

let pollingTimer = null

// 当前会话
const currentSession = computed(() => {
  return sessions.value.find(s => s.userId === currentUserId.value)
})

// 过滤后的会话列表
const filteredSessions = computed(() => {
  if (!searchKeyword.value) return sessions.value
  
  return sessions.value.filter(s => 
    (s.nickname && s.nickname.includes(searchKeyword.value)) ||
    (s.username && s.username.includes(searchKeyword.value)) ||
    s.userId.toString().includes(searchKeyword.value)
  )
})

// 加载会话列表
const refreshSessions = async () => {
  try {
    loading.value = true
    sessions.value = await getSessions()
    await loadUnreadTotal()
  } catch (error) {
    console.error('加载会话失败：', error)
    ElMessage.error('加载会话失败')
  } finally {
    loading.value = false
  }
}

// 选择会话
const selectSession = async (session) => {
  currentUserId.value = session.userId
  await loadUserMessages(session.userId)
  
  // 清空该会话的未读数并立即刷新总未读数
  if (session.unreadCount > 0) {
    session.unreadCount = 0
  }
  
  // 立即刷新总未读数（会话列表打开时已读消息也会减少）
  setTimeout(() => {
    loadUnreadTotal()
  }, 500)
}

// 加载用户消息
const loadUserMessages = async (userId) => {
  try {
    currentMessages.value = await getUserMessages(userId, 100)
    scrollToBottom()
  } catch (error) {
    console.error('加载消息失败：', error)
    ElMessage.error('加载消息失败')
  }
}

// 回复消息
const handleReply = async () => {
  if (!replyContent.value.trim() || !currentUserId.value) return
  
  try {
    replying.value = true
    await replyMessage(currentUserId.value, replyContent.value.trim())
    replyContent.value = ''
    await loadUserMessages(currentUserId.value)
    
    // 回复后立即刷新会话列表和总未读数（后端已将用户消息标记为已读）
    await refreshSessions()
    
    ElMessage.success('发送成功')
  } catch (error) {
    console.error('发送失败：', error)
    ElMessage.error('发送失败')
  } finally {
    replying.value = false
  }
}

// 加载未读总数
const loadUnreadTotal = async () => {
  try {
    totalUnread.value = await getUnreadTotal()
  } catch (error) {
    console.error('加载未读数失败：', error)
  }
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

// 插入表情
const insertEmoji = (emoji) => {
  replyContent.value += emoji
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

// 开始轮询
const startPolling = () => {
  stopPolling()
  pollingTimer = setInterval(() => {
    refreshSessions()
    if (currentUserId.value) {
      loadUserMessages(currentUserId.value)
    }
  }, 3000) // 每3秒轮询（实时）
}

// 停止轮询
const stopPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

onMounted(() => {
  refreshSessions()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>

<style scoped>
.customer-service-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

/* 会话列表 */
.session-list {
  height: 600px;
  overflow-y: auto;
}

.session-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 8px;
  border: 1px solid transparent;
}

.session-item:hover {
  background: #f5f7fa;
  border-color: #409eff;
}

.session-item.active {
  background: #ecf5ff;
  border-color: #409eff;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #303133;
}

.time {
  font-size: 12px;
  color: #909399;
}

.last-message {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 聊天区域 */
.chat-area {
  height: 600px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.chat-area-header {
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  gap: 12px;
  align-items: center;
  background: #fafafa;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info .user-name {
  font-weight: 600;
  font-size: 15px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f5f7fa;
}

.message-row {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
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
  margin-bottom: 4px;
  font-size: 12px;
  color: #909399;
}

.message-self .message-meta {
  flex-direction: row-reverse;
}

.message-text {
  padding: 10px 14px;
  border-radius: 12px;
  background: white;
  word-wrap: break-word;
  line-height: 1.5;
}

.message-self .message-text {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  color: white;
}

.input-area {
  padding: 16px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: white;
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

.input-area .el-button {
  align-self: flex-end;
}
</style>

