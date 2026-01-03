<template>
  <div class="feedbacks-page">
    <h2>用户反馈管理</h2>
    
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-radio-group v-model="feedbackFilter" @change="loadFeedbackList" size="default">
        <el-radio-button :value="null">全部</el-radio-button>
        <el-radio-button :value="0">未读</el-radio-button>
        <el-radio-button :value="1">已读</el-radio-button>
      </el-radio-group>
      <el-input 
        v-model="feedbackKeyword" 
        placeholder="搜索用户名、邮箱或内容" 
        style="width: 300px;"
        size="default"
        clearable
        @clear="loadFeedbackList"
        @keyup.enter="loadFeedbackList"
      >
        <template #append>
          <el-button :icon="Search" @click="loadFeedbackList" />
        </template>
      </el-input>
    </div>

    <!-- 反馈列表 -->
    <el-card class="feedback-card">
      <el-table 
        :data="feedbackList" 
        style="width: 100%;"
        v-loading="feedbackLoading"
        @row-click="handleFeedbackRowClick"
        :row-class-name="getFeedbackRowClass"
      >
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="content" label="反馈内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="isRead" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isRead === 1 ? 'success' : 'warning'" size="small">
              {{ row.isRead === 1 ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="提交时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.isRead === 0" 
              link 
              type="primary" 
              size="small"
              @click.stop="markAsReadHandler(row)"
            >
              标记已读
            </el-button>
            <el-button 
              link 
              type="primary" 
              size="small"
              @click.stop="showReplyDialog(row)"
            >
              回复
            </el-button>
            <el-button 
              link 
              type="danger" 
              size="small"
              @click.stop="deleteFeedbackHandler(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="feedbackPageNum"
        v-model:page-size="feedbackPageSize"
        :total="feedbackTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="loadFeedbackList"
        @size-change="loadFeedbackList"
        style="margin-top: 20px; justify-content: flex-end;"
      />
    </el-card>

    <!-- 反馈详情对话框 -->
    <el-dialog 
      v-model="feedbackDetailVisible" 
      title="反馈详情" 
      width="600px"
    >
      <div class="feedback-detail" v-if="currentFeedback">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户">{{ currentFeedback.username }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentFeedback.email }}</el-descriptions-item>
          <el-descriptions-item label="手机" v-if="currentFeedback.phone">{{ currentFeedback.phone }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ currentFeedback.createTime }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentFeedback.isRead === 1 ? 'success' : 'warning'" size="small">
              {{ currentFeedback.isRead === 1 ? '已读' : '未读' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="反馈内容">
            <div style="white-space: pre-wrap;">{{ currentFeedback.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="回复内容" v-if="currentFeedback.reply">
            <div style="white-space: pre-wrap;">{{ currentFeedback.reply }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>

    <!-- 回复对话框 -->
    <el-dialog 
      v-model="replyDialogVisible" 
      title="回复反馈" 
      width="500px"
    >
      <el-input 
        v-model="replyContent" 
        type="textarea" 
        :rows="6"
        placeholder="请输入回复内容"
      />
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply" :loading="replySubmitting">提交回复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import * as feedbackAPI from '@/api/admin/feedback'

// 反馈相关
const feedbackFilter = ref(null)
const feedbackKeyword = ref('')
const feedbackList = ref([])
const feedbackLoading = ref(false)
const feedbackPageNum = ref(1)
const feedbackPageSize = ref(10)
const feedbackTotal = ref(0)
const feedbackDetailVisible = ref(false)
const currentFeedback = ref(null)
const replyDialogVisible = ref(false)
const replyContent = ref('')
const replySubmitting = ref(false)

// 加载反馈列表
const loadFeedbackList = async () => {
  try {
    feedbackLoading.value = true
    const response = await feedbackAPI.getFeedbackList({
      pageNum: feedbackPageNum.value,
      pageSize: feedbackPageSize.value,
      isRead: feedbackFilter.value,
      keyword: feedbackKeyword.value
    })
    feedbackList.value = response.data || []
    feedbackTotal.value = response.totalCount || 0
  } catch (error) {
    console.error('获取反馈列表失败：', error)
    ElMessage.error('获取反馈列表失败')
  } finally {
    feedbackLoading.value = false
  }
}

// 点击反馈行
const handleFeedbackRowClick = (row) => {
  currentFeedback.value = row
  feedbackDetailVisible.value = true
  // 如果是未读状态，自动标记为已读
  if (row.isRead === 0) {
    markAsReadHandler(row)
  }
}

// 获取反馈行的 class
const getFeedbackRowClass = ({ row }) => {
  return row.isRead === 0 ? 'unread-row' : ''
}

// 标记为已读
const markAsReadHandler = async (row) => {
  try {
    await feedbackAPI.markAsRead(row.id)
    ElMessage.success('已标记为已读')
    loadFeedbackList()
  } catch (error) {
    console.error('标记已读失败：', error)
    ElMessage.error('标记已读失败')
  }
}

// 显示回复对话框
const showReplyDialog = (row) => {
  currentFeedback.value = row
  replyContent.value = row.reply || ''
  replyDialogVisible.value = true
}

// 提交回复
const submitReply = async () => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  try {
    replySubmitting.value = true
    await feedbackAPI.replyFeedback(currentFeedback.value.id, replyContent.value)
    ElMessage.success('回复成功')
    replyDialogVisible.value = false
    loadFeedbackList()
  } catch (error) {
    console.error('回复失败：', error)
    ElMessage.error('回复失败')
  } finally {
    replySubmitting.value = false
  }
}

// 删除反馈
const deleteFeedbackHandler = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条反馈吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await feedbackAPI.deleteFeedback(row.id)
    ElMessage.success('删除成功')
    loadFeedbackList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败：', error)
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadFeedbackList()
})
</script>

<style scoped>
.feedbacks-page {
  padding: 20px;
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.feedback-card {
  margin-top: 20px;
}

.unread-row {
  background-color: #ecf5ff;
  font-weight: 500;
}

:deep(.el-table__row) {
  cursor: pointer;
}

.feedback-detail {
  padding: 16px 0;
}
</style>

