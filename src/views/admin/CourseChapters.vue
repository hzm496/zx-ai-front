<template>
  <div class="course-chapters-page">
    <div class="page-header">
      <h2>课程章节管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/admin/courses' }">课程管理</el-breadcrumb-item>
        <el-breadcrumb-item>章节管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="course-info-card" shadow="never">
      <div class="course-info">
        <span class="course-title">{{ courseTitle }}</span>
        <el-button type="primary" :icon="Plus" @click="handleAddChapter(0)">添加节</el-button>
      </div>
    </el-card>

    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="chapterTree"
        row-key="id"
        :tree-props="{ children: 'children' }"
        border
        style="width: 100%"
      >
        <!-- <el-table-column prop="id" label="ID" width="80" align="center" /> -->
        <el-table-column prop="title" label="章节标题" min-width="200" />
        <!-- <el-table-column prop="sort" label="排序" width="80" align="center" /> -->
        <el-table-column prop="videoDuration" label="时长（秒）" width="120" align="center">
          <template #default="{ row }">
            {{ row.videoDuration ? formatDuration(row.videoDuration) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="isFree" label="试看" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isFree === 1" type="success" size="small">免费</el-tag>
            <el-tag v-else type="info" size="small">付费</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" size="small">正常</el-tag>
            <el-tag v-else type="danger" size="small">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="warning" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除该章节吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" size="small" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑章节对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formTitle"
      width="700px"
      @close="handleFormDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="章节标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入章节标题" />
        </el-form-item>

        <el-form-item label="视频">
          <el-upload
            class="video-uploader"
            :action="uploadAction"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleVideoSuccess"
            :on-progress="handleVideoProgress"
            :before-upload="beforeVideoUpload"
            accept="video/*"
          >
            <div v-if="formData.videoUrl" class="video-preview">
              <video :src="formData.videoUrl" controls style="max-width: 100%; max-height: 300px"></video>
              <div class="video-info">
                <el-button type="text" @click.stop="handleRemoveVideo">删除视频</el-button>
              </div>
            </div>
            <el-button v-else :loading="uploading" type="primary" :icon="UploadFilled">
              {{ uploading ? '上传中...' : '点击上传视频' }}
            </el-button>
          </el-upload>
          <div class="upload-tip">支持 mp4、avi、mov 等格式，建议大小不超过500MB（可选，章节可以不上传视频）</div>
        </el-form-item>

              <el-form-item label="视频时长(秒)">
          <el-input-number v-model="formData.videoDuration" :min="0" style="width: 100%" />
          <div class="upload-tip">通常会自动识别，识别失败时可手动输入</div>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item label="是否试看">
          <el-radio-group v-model="formData.isFree">
            <el-radio :label="0">付费</el-radio>
            <el-radio :label="1">免费试看</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="0">禁用</el-radio>
            <el-radio :label="1">正常</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="formLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, UploadFilled } from '@element-plus/icons-vue'
import * as chapterAPI from '@/api/admin/chapter'
import { getToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const courseId = ref(route.query.courseId)
const courseTitle = ref(route.query.courseTitle || '未知课程')
const chapterTree = ref([])
const loading = ref(false)
const formDialogVisible = ref(false)
const formRef = ref(null)
const formLoading = ref(false)
const formTitle = ref('添加章')
const isEdit = ref(false)
const uploading = ref(false)

// 上传配置
const uploadAction = computed(() => {
  // 使用完整的API路径，与adminRequest保持一致
  return '/api/admin/file/upload/video'
})

const uploadHeaders = computed(() => {
  const token = getToken()
  return {
    'Authorization': token && !token.startsWith('Bearer ') ? `Bearer ${token}` : token
  }
})

const formData = reactive({
  id: null,
  courseId: null,
  title: '',
  videoUrl: '',
  videoDuration: 0,
  parentId: 0,
  sort: 0,
  isFree: 0,
  status: 1
})

const formRules = {
  title: [{ required: true, message: '请输入章节标题', trigger: 'blur' }]
}

// 加载章节列表
const loadChapterTree = async () => {
  if (!courseId.value) {
    ElMessage.error('缺少课程ID参数')
    router.push('/admin/courses')
    return
  }

  try {
    loading.value = true
    const response = await chapterAPI.getChapterTree(courseId.value)
    chapterTree.value = response || []
  } catch (error) {
    console.error('获取章节列表失败：', error)
    ElMessage.error('获取章节列表失败')
  } finally {
    loading.value = false
  }
}

// 添加章节
const handleAddChapter = (parentId) => {
  isEdit.value = false
  formTitle.value = '添加节'
  formData.parentId = parentId || 0
  resetForm()
  formData.courseId = courseId.value
  formDialogVisible.value = true
}

// 编辑章节
const handleEdit = (row) => {
  isEdit.value = true
  formTitle.value = '编辑节'
  Object.assign(formData, row)
  formDialogVisible.value = true
}

// 提交表单
const handleFormSubmit = async () => {
  try {
    await formRef.value.validate()
    formLoading.value = true

    if (isEdit.value) {
      await chapterAPI.updateChapter(formData)
      ElMessage.success('章节更新成功')
    } else {
      const { id, ...addData } = formData
      await chapterAPI.addChapter(addData)
      ElMessage.success('章节添加成功')
    }

    formDialogVisible.value = false
    loadChapterTree()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  } finally {
    formLoading.value = false
  }
}

// 删除章节
const handleDelete = async (id) => {
  try {
    await chapterAPI.deleteChapter(id)
    ElMessage.success('删除成功')
    loadChapterTree()
  } catch (error) {
    ElMessage.error(error.message || '删除失败')
  }
}

// 视频上传前检查
const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt500M = file.size / 1024 / 1024 < 500

  if (!isVideo) {
    ElMessage.error('只能上传视频文件！')
    return false
  }
  if (!isLt500M) {
    ElMessage.error('视频大小不能超过 500MB！')
    return false
  }
  uploading.value = true
  return true
}

// 视频上传进度
const handleVideoProgress = () => {
  uploading.value = true
}

// 视频上传成功
const handleVideoSuccess = (response) => {
  uploading.value = false
  console.log('视频上传响应：', response)
  
  if (response && response.success === true && response.data) {
    formData.videoUrl = response.data
    ElMessage.success('视频上传成功')
    
    // 自动识别视频时长（静默处理，失败不提示）
    getVideoDuration(response.data)
  } else {
    ElMessage.error(response?.message || '视频上传失败')
  }
}

// 自动获取视频时长
const getVideoDuration = (videoUrl) => {
  const video = document.createElement('video')
  video.crossOrigin = 'anonymous'  // 设置跨域属性
  video.preload = 'metadata'
  video.src = videoUrl
  
  // 设置超时，避免长时间等待
  const timeout = setTimeout(() => {
    console.warn('视频时长识别超时，请手动输入')
    video.src = ''
  }, 5000)
  
  video.onloadedmetadata = () => {
    clearTimeout(timeout)
    const duration = Math.floor(video.duration)
    if (duration && duration > 0) {
      formData.videoDuration = duration
      ElMessage.success(`时长已自动识别：${formatDuration(duration)}`)
    }
    // 释放资源
    video.src = ''
  }
  
  video.onerror = () => {
    clearTimeout(timeout)
    // 静默失败，不弹提示，只在控制台记录
    console.warn('视频时长自动识别失败，需要手动输入')
    // 释放资源
    video.src = ''
  }
}

// 删除视频
const handleRemoveVideo = () => {
  formData.videoUrl = ''
  formData.videoDuration = 0
}

// 格式化时长
const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    courseId: courseId.value,
    title: '',
    videoUrl: '',
    videoDuration: 0,
    parentId: 0,
    sort: 0,
    isFree: 0,
    status: 1
  })
}

// 关闭对话框
const handleFormDialogClose = () => {
  formRef.value?.clearValidate()
  resetForm()
}

onMounted(() => {
  loadChapterTree()
})
</script>

<style scoped>
.course-chapters-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.course-info-card {
  margin-bottom: 20px;
}

.course-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.table-card {
  margin-bottom: 20px;
}

.video-uploader {
  width: 100%;
}

.video-preview {
  position: relative;
  display: inline-block;
}

.video-info {
  margin-top: 10px;
  text-align: center;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}
</style>

