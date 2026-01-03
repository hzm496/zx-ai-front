<template>
  <div class="course-comment">
    <el-card shadow="hover">
      <template #header>
        <div class="comment-header">
          <span><el-icon><ChatDotRound /></el-icon> 课程评论</span>
          <el-tag v-if="props.totalComments > 0">{{ props.totalComments }} 条评论</el-tag>
        </div>
      </template>

      <!-- 发表评论输入框 -->
      <div class="comment-input-section">
        <div class="user-avatar">
          <el-avatar :src="userStore.userInfo?.avatar" :icon="UserFilled" />
        </div>
        <div class="input-wrapper">
          <el-input
            v-model="newCommentContent"
            type="textarea"
            :rows="3"
            placeholder="写下你的评论..."
            maxlength="1000"
            show-word-limit
            :disabled="!userStore.token"
          />
          <div class="input-actions">
            <div class="rating-section" v-if="showRating">
              <span class="rating-label">评分：</span>
              <el-rate v-model="newCommentRating" :disabled="!userStore.token" />
            </div>
            <el-button 
              type="primary" 
              :disabled="!userStore.token || !newCommentContent.trim()"
              :loading="submitting"
              @click="handleSubmitComment"
            >
              发表评论
            </el-button>
          </div>
          <div v-if="!userStore.token" class="login-tip">
            <el-text type="warning">请先 <el-link type="primary" @click="goToLogin">登录</el-link> 后发表评论</el-text>
          </div>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list" v-loading="loading">
        <div v-if="commentList.length === 0 && !loading" class="empty-comment">
          <el-empty description="暂无评论，快来发表第一条评论吧~" :image-size="120" />
        </div>

        <div v-else class="comment-items">
          <div 
            v-for="comment in commentList" 
            :key="comment.id" 
            class="comment-item"
          >
            <!-- 一级评论 -->
            <div class="comment-main">
              <div class="comment-avatar">
                <el-avatar :src="comment.avatar" :icon="UserFilled" />
              </div>
              <div class="comment-content-wrapper">
                <div class="comment-user-info">
                  <span class="user-nickname">{{ comment.nickname || '匿名用户' }}</span>
                  <el-rate 
                    v-if="comment.rating" 
                    v-model="comment.rating" 
                    disabled 
                    size="small"
                    class="comment-rating"
                  />
                  <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
                </div>
                <div class="comment-text">{{ comment.content }}</div>
                <div class="comment-actions">
                  <el-button 
                    text 
                    :type="comment.isLiked ? 'primary' : 'default'"
                    size="small"
                    @click="handleLikeComment(comment)"
                  >
                    <el-icon><StarFilled v-if="comment.isLiked" /><Star v-else /></el-icon>
                    {{ comment.likeCount || 0 }}
                  </el-button>
                  <el-button 
                    text 
                    size="small"
                    @click="handleReply(comment)"
                  >
                    <el-icon><ChatLineRound /></el-icon>
                    回复
                  </el-button>
                  <el-button 
                    v-if="canDelete(comment)"
                    text 
                    type="danger" 
                    size="small"
                    @click="handleDeleteComment(comment)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>

                <!-- 第一条回复预览 -->
                <div v-if="comment.firstReply" class="reply-preview">
                  <div class="reply-item">
                    <el-avatar :src="comment.firstReply.avatar" :icon="UserFilled" size="small" />
                    <div class="reply-content">
                      <span class="reply-user">{{ comment.firstReply.nickname }}</span>
                      <span v-if="comment.firstReply.replyToNickname" class="reply-to">
                        回复 <span class="reply-to-user">{{ comment.firstReply.replyToNickname }}</span>
                      </span>
                      <span class="reply-text">：{{ comment.firstReply.content }}</span>
                    </div>
                    <div class="reply-actions">
                      <el-button 
                        text 
                        :type="comment.firstReply.isLiked ? 'primary' : 'default'"
                        size="small"
                        @click="handleLikeComment(comment.firstReply)"
                      >
                        <el-icon><StarFilled v-if="comment.firstReply.isLiked" /><Star v-else /></el-icon>
                        {{ comment.firstReply.likeCount || 0 }}
                      </el-button>
                    </div>
                  </div>
                </div>

                <!-- 展开更多回复按钮 -->
                <div 
                  v-if="comment.replyCount > (comment.firstReply ? 1 : 0)"
                  class="show-more-replies"
                  @click="handleToggleReplies(comment)"
                >
                  <el-icon><ArrowDown v-if="!comment.showReplies" /><ArrowUp v-else /></el-icon>
                  <span>{{ comment.showReplies ? '收起' : '展开' }}剩余 {{ comment.replyCount - (comment.firstReply ? 1 : 0) }} 条回复</span>
                </div>

                <!-- 展开的回复列表 -->
                <div v-if="comment.showReplies" class="replies-section" v-loading="comment.loadingReplies">
                  <div 
                    v-for="reply in comment.replies" 
                    :key="reply.id"
                    class="reply-item"
                  >
                    <el-avatar :src="reply.avatar" :icon="UserFilled" size="small" />
                    <div class="reply-content">
                      <div class="reply-header">
                        <span class="reply-user">{{ reply.nickname }}</span>
                        <span v-if="reply.replyToNickname" class="reply-to">
                          回复 <span class="reply-to-user">{{ reply.replyToNickname }}</span>
                        </span>
                        <span class="reply-time">{{ formatTime(reply.createTime) }}</span>
                      </div>
                      <div class="reply-text">{{ reply.content }}</div>
                      <div class="reply-actions">
                        <el-button 
                          text 
                          :type="reply.isLiked ? 'primary' : 'default'"
                          size="small"
                          @click="handleLikeComment(reply)"
                        >
                          <el-icon><StarFilled v-if="reply.isLiked" /><Star v-else /></el-icon>
                          {{ reply.likeCount || 0 }}
                        </el-button>
                        <el-button 
                          text 
                          size="small"
                          @click="handleReply(comment, reply)"
                        >
                          <el-icon><ChatLineRound /></el-icon>
                          回复
                        </el-button>
                        <el-button 
                          v-if="canDelete(reply)"
                          text 
                          type="danger" 
                          size="small"
                          @click="handleDeleteComment(reply, comment)"
                        >
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-button>
                      </div>
                    </div>
                  </div>

                  <!-- 加载更多回复按钮 -->
                  <div 
                    v-if="comment.hasMoreReplies"
                    class="load-more-replies"
                    @click="handleLoadMoreReplies(comment)"
                  >
                    <el-button text type="primary" size="small">加载更多回复...</el-button>
                  </div>
                </div>

                <!-- 回复输入框 -->
                <div v-if="replyingTo?.id === comment.id" class="reply-input-section">
                  <el-avatar :src="userStore.userInfo?.avatar" :icon="UserFilled" size="small" />
                  <div class="reply-input-wrapper">
                    <el-input
                      ref="replyInputRef"
                      v-model="replyContent"
                      type="textarea"
                      :rows="2"
                      :placeholder="`回复 ${replyingToUser?.nickname || comment.nickname}...`"
                      maxlength="1000"
                      show-word-limit
                    />
                    <div class="reply-input-actions">
                      <el-button size="small" @click="cancelReply">取消</el-button>
                      <el-button 
                        type="primary" 
                        size="small"
                        :disabled="!replyContent.trim()"
                        :loading="submitting"
                        @click="handleSubmitReply"
                      >
                        发送
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalCount > pageSize" class="comment-pagination">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="totalCount"
            layout="prev, pager, next"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ChatDotRound, 
  UserFilled, 
  Star,
  StarFilled,
  ChatLineRound,
  Delete,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { 
  getFirstLevelComments, 
  getRepliesByParentId,
  createComment,
  deleteComment,
  likeComment,
  unlikeComment
} from '@/api/web/comment'

const props = defineProps({
  courseId: {
    type: Number,
    required: true
  },
  showRating: {
    type: Boolean,
    default: true
  },
  totalComments: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['comment-changed'])

const router = useRouter()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)
const commentList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

// 新评论
const newCommentContent = ref('')
const newCommentRating = ref(5)

// 回复相关
const replyingTo = ref(null) // 正在回复的一级评论
const replyingToUser = ref(null) // 正在回复的具体用户（可能是二级评论）
const replyContent = ref('')
const replyInputRef = ref(null)

// 加载一级评论列表
const loadComments = async () => {
  try {
    loading.value = true
    const response = await getFirstLevelComments(props.courseId, currentPage.value, pageSize.value)
    
    // 为每条评论添加额外的状态
    commentList.value = (response.data || []).map(comment => ({
      ...comment,
      showReplies: false,
      replies: [],
      loadingReplies: false,
      replyPage: 1,
      hasMoreReplies: comment.replyCount > (comment.firstReply ? 1 : 0)
    }))
    
    totalCount.value = response.totalCount || 0
  } catch (error) {
    console.error('加载评论失败：', error)
    ElMessage.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

// 加载回复列表
const loadReplies = async (comment, page = 1) => {
  try {
    comment.loadingReplies = true
    const response = await getRepliesByParentId(comment.id, page, pageSize.value)
    
    if (page === 1) {
      comment.replies = response.data || []
    } else {
      comment.replies.push(...(response.data || []))
    }
    
    comment.replyPage = page
    const totalReplies = response.totalCount || 0
    comment.hasMoreReplies = comment.replies.length < totalReplies
  } catch (error) {
    console.error('加载回复失败：', error)
    ElMessage.error('加载回复失败')
  } finally {
    comment.loadingReplies = false
  }
}

// 发表评论
const handleSubmitComment = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再发表评论')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  if (!newCommentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }

  try {
    submitting.value = true
    await createComment({
      courseId: props.courseId,
      content: newCommentContent.value.trim(),
      rating: props.showRating ? newCommentRating.value : null,
      parentId: 0
    })
    
    ElMessage.success('评论成功')
    newCommentContent.value = ''
    newCommentRating.value = 5
    
    // 重新加载第一页评论
    currentPage.value = 1
    await loadComments()
    
    // 通知父组件评论数量已变化，传递新的评论总数
    emit('comment-changed', totalCount.value)
  } catch (error) {
    console.error('发表评论失败：', error)
    ElMessage.error(error.message || '发表评论失败')
  } finally {
    submitting.value = false
  }
}

// 处理回复
const handleReply = (comment, replyToUser = null) => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再回复评论')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  replyingTo.value = comment
  replyingToUser.value = replyToUser
  replyContent.value = ''
  
  // 聚焦输入框
  nextTick(() => {
    if (replyInputRef.value) {
      replyInputRef.value.focus()
    }
  })
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  replyingToUser.value = null
  replyContent.value = ''
}

// 提交回复
const handleSubmitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  // 保存当前回复的评论引用（因为后面会调用 cancelReply 清空）
  const targetComment = replyingTo.value

  try {
    submitting.value = true
    await createComment({
      courseId: props.courseId,
      content: replyContent.value.trim(),
      parentId: targetComment.id,
      replyToUserId: replyingToUser.value?.userId || targetComment.userId
    })
    
    ElMessage.success('回复成功')
    
    // 重新加载该评论的回复
    if (targetComment.showReplies) {
      await loadReplies(targetComment, 1)
    } else {
      // 如果未展开，则展开回复
      targetComment.showReplies = true
      await loadReplies(targetComment, 1)
    }
    
    // 更新回复数量
    targetComment.replyCount++
    
    // 清空回复输入框
    cancelReply()
    
    // 通知父组件评论数量已变化（回复不改变一级评论总数，但通知刷新）
    emit('comment-changed', totalCount.value)
  } catch (error) {
    console.error('回复失败：', error)
    ElMessage.error(error.message || '回复失败')
  } finally {
    submitting.value = false
  }
}

// 展开/收起回复
const handleToggleReplies = async (comment) => {
  comment.showReplies = !comment.showReplies
  
  if (comment.showReplies && comment.replies.length === 0) {
    await loadReplies(comment, 1)
  }
}

// 加载更多回复
const handleLoadMoreReplies = async (comment) => {
  await loadReplies(comment, comment.replyPage + 1)
}

// 点赞/取消点赞
const handleLikeComment = async (comment) => {
  if (!userStore.token) {
    ElMessage.warning('请先登录后再点赞')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  try {
    if (comment.isLiked) {
      await unlikeComment(comment.id)
      comment.isLiked = false
      comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1)
    } else {
      await likeComment(comment.id)
      comment.isLiked = true
      comment.likeCount = (comment.likeCount || 0) + 1
    }
  } catch (error) {
    console.error('点赞操作失败：', error)
    ElMessage.error(error.message || '操作失败')
  }
}

// 删除评论
const handleDeleteComment = async (comment, parentComment = null) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteComment(comment.id)
    ElMessage.success('删除成功')
    
    // 重新加载评论列表
    if (parentComment) {
      // 删除的是回复
      await loadReplies(parentComment, 1)
      parentComment.replyCount--
    } else {
      // 删除的是一级评论
      await loadComments()
    }
    
    // 通知父组件评论数量已变化，传递新的评论总数
    emit('comment-changed', totalCount.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评论失败：', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 判断是否可以删除
const canDelete = (comment) => {
  return userStore.userInfo && userStore.userInfo.id === comment.userId
}

// 分页切换
const handlePageChange = (page) => {
  currentPage.value = page
  loadComments()
  
  // 滚动到评论区顶部
  document.querySelector('.course-comment')?.scrollIntoView({ behavior: 'smooth' })
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }
}

// 跳转登录
const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  loadComments()
})
</script>

<style scoped>
.course-comment {
  margin-top: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.comment-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========== 评论输入区 ========== */
.comment-input-section {
  display: flex;
  gap: 12px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 24px;
}

.user-avatar {
  flex-shrink: 0;
}

.input-wrapper {
  flex: 1;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.rating-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-label {
  font-size: 14px;
  color: #606266;
}

.login-tip {
  margin-top: 8px;
  font-size: 13px;
}

/* ========== 评论列表 ========== */
.comment-list {
  min-height: 200px;
}

.empty-comment {
  padding: 40px 0;
}

.comment-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-main {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content-wrapper {
  flex: 1;
}

.comment-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.user-nickname {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.comment-rating {
  font-size: 12px;
}

.comment-time {
  font-size: 13px;
  color: #909399;
}

.comment-text {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 12px;
  font-size: 14px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.comment-actions {
  display: flex;
  gap: 16px;
}

.comment-actions .el-button {
  padding: 4px 8px;
}

/* ========== 回复区域 ========== */
.reply-preview {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.replies-section {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.reply-user {
  font-weight: 600;
  color: #303133;
  font-size: 13px;
}

.reply-to {
  font-size: 12px;
  color: #909399;
}

.reply-to-user {
  color: #409eff;
}

.reply-time {
  font-size: 12px;
  color: #909399;
}

.reply-text {
  color: #606266;
  line-height: 1.6;
  font-size: 13px;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin-bottom: 8px;
}

.reply-actions {
  display: flex;
  gap: 12px;
}

.reply-actions .el-button {
  padding: 2px 6px;
  font-size: 12px;
}

.show-more-replies {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  margin-top: 12px;
  padding: 6px 0;
  user-select: none;
}

.show-more-replies:hover {
  color: #66b1ff;
}

.load-more-replies {
  text-align: center;
  margin-top: 8px;
}

/* 回复输入框 */
.reply-input-section {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.reply-input-wrapper {
  flex: 1;
}

.reply-input-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}

/* ========== 分页 ========== */
.comment-pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .comment-input-section {
    flex-direction: column;
  }
  
  .input-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .rating-section {
    justify-content: center;
  }
  
  .comment-actions {
    flex-wrap: wrap;
  }
}
</style>

