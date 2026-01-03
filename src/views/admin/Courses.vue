<template>
  <div class="courses-page">
    <div class="page-header">
      <h2>课程管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>课程管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="课程标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入课程标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="下架" :value="0" />
            <el-option label="上架" :value="1" />
            <el-option label="审核中" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>课程列表</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加课程</el-button>
            <el-button :icon="Refresh" circle @click="loadCourseList" />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="courseList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="title" label="课程标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="categoryName" label="分类" width="120" />
        <el-table-column prop="teacherName" label="讲师" width="100" />
        <el-table-column prop="price" label="价格" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.isFree" style="color: #67C23A">免费</span>
            <span v-else>¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="buyCount" label="购买数" width="90" align="center" />
        <el-table-column prop="viewCount" label="浏览量" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">上架</el-tag>
            <el-tag v-else-if="row.status === 0" type="danger">下架</el-tag>
            <el-tag v-else type="warning">审核中</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="350" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="success" size="small" :icon="VideoPlay" @click="handleChapterManage(row)">章节</el-button>
            <el-button type="primary" size="small" :icon="View" @click="handleView(row)">查看</el-button>
            <el-button type="warning" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除该课程吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" size="small" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formTitle"
      width="800px"
      @close="handleFormDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="课程标题" prop="title">
              <el-input v-model="formData.title" placeholder="请输入课程标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="副标题" prop="subTitle">
              <el-input v-model="formData.subTitle" placeholder="请输入副标题" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="课程封面" prop="cover">
              <div class="cover-uploader-container">
                <el-upload
                  class="cover-uploader"
                  :show-file-list="false"
                  :http-request="handleCoverUpload"
                  :before-upload="beforeCoverUpload"
                  accept="image/*"
                >
                  <img v-if="formData.cover" :src="formData.cover" class="cover-preview" />
                  <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="cover-tip">建议上传 16:9 比例的图片，推荐尺寸 800x450</div>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="cat in categories"
                  :key="cat.id"
                  :label="cat.name"
                  :value="cat.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="讲师">
              <el-select v-model="formData.teacherId" placeholder="请选择讲师" style="width: 100%">
                <el-option
                  v-for="teacher in teachers"
                  :key="teacher.id"
                  :label="teacher.name"
                  :value="teacher.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格">
              <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否免费">
              <el-radio-group v-model="formData.isFree">
                <el-radio :label="0">付费</el-radio>
                <el-radio :label="1">免费</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="难度">
              <el-select v-model="formData.difficulty" placeholder="请选择难度" style="width: 100%">
                <el-option label="入门" :value="1" />
                <el-option label="初级" :value="2" />
                <el-option label="中级" :value="3" />
                <el-option label="高级" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="formData.status">
                <el-radio :label="0">下架</el-radio>
                <el-radio :label="1">上架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="课程描述">
              <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入课程描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="formLoading">保存</el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="课程详情"
      width="800px"
    >
      <div v-if="viewData" class="course-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="课程ID">{{ viewData.id }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
          
          <el-descriptions-item label="课程标题" :span="2">{{ viewData.title }}</el-descriptions-item>
          
          <el-descriptions-item label="副标题" :span="2">{{ viewData.subTitle || '-' }}</el-descriptions-item>
          
          <el-descriptions-item label="封面" :span="2">
            <img v-if="viewData.cover" :src="viewData.cover" style="max-width: 200px; max-height: 120px; border-radius: 4px;" />
            <span v-else>-</span>
          </el-descriptions-item>
          
          <el-descriptions-item label="分类">{{ viewData.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="讲师">{{ viewData.teacherName || '-' }}</el-descriptions-item>
          
          <el-descriptions-item label="价格">
            <span v-if="viewData.isFree" style="color: #67C23A; font-weight: bold;">免费</span>
            <span v-else>¥{{ viewData.price }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="原价">¥{{ viewData.originalPrice }}</el-descriptions-item>
          
          <el-descriptions-item label="难度">{{ getDifficultyText(viewData.difficulty) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="viewData.status === 1" type="success">{{ getStatusText(viewData.status) }}</el-tag>
            <el-tag v-else-if="viewData.status === 0" type="danger">{{ getStatusText(viewData.status) }}</el-tag>
            <el-tag v-else type="warning">{{ getStatusText(viewData.status) }}</el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="时长">{{ viewData.duration || 0 }} 分钟</el-descriptions-item>
          <el-descriptions-item label="排序">{{ viewData.sort || 0 }}</el-descriptions-item>
          
        
          
          <el-descriptions-item label="总章节数">
            <el-tag type="primary">{{ viewData.totalChapterCount || 0 }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="试看章节数">
            <el-tag v-if="viewData.trialChapterCount > 0" type="success">{{ viewData.trialChapterCount }}</el-tag>
            <el-tag v-else type="info">0</el-tag>
          </el-descriptions-item>
          
          <el-descriptions-item label="课程描述" :span="2">
            <div style="max-height: 200px; overflow-y: auto;">
              {{ viewData.description || '-' }}
            </div>
          </el-descriptions-item>
          
          <el-descriptions-item label="更新时间" :span="2">{{ viewData.updateTime }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(viewData)">编辑</el-button>
        <el-button type="success" :icon="VideoPlay" @click="handleChapterManage(viewData)">管理章节</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Delete, Edit, Plus, VideoPlay } from '@element-plus/icons-vue'
import * as courseAPI from '@/api/admin/course'
import * as categoryAPI from '@/api/admin/category'
import * as teacherAPI from '@/api/admin/teacher'
import { uploadImage } from '@/api/admin/file'

const router = useRouter()

const searchForm = reactive({
  title: '',
  categoryId: null,
  status: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const courseList = ref([])
const categories = ref([])
const teachers = ref([])
const loading = ref(false)
const formDialogVisible = ref(false)
const formRef = ref(null)
const formLoading = ref(false)
const formTitle = ref('添加课程')
const isEdit = ref(false)

// 查看详情相关
const viewDialogVisible = ref(false)
const viewData = ref(null)

const formData = reactive({
  id: null,
  title: '',
  subTitle: '',
  categoryId: null,
  teacherId: null,
  description: '',
  price: 0,
  isFree: 0,
  difficulty: 1,
  status: 1
})

const formRules = {
  title: [{ required: true, message: '请输入课程标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const loadCourseList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await courseAPI.getCourseList(params)
    console.log('📦 课程列表响应:', response)  // 调试日志
    if (response && response.data) {
      courseList.value = response.data
      pagination.total = response.totalCount || response.total || 0
      console.log('✅ 课程数量:', courseList.value.length, '总数:', pagination.total)
    } else {
      courseList.value = []
      pagination.total = 0
      console.warn('⚠️ 响应数据为空')
    }
  } catch (error) {
    console.error('获取课程列表失败：', error)
    ElMessage.error('获取课程列表失败')
    courseList.value = []
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await categoryAPI.getCategoryList()
    categories.value = response || []
  } catch (error) {
    console.error('获取分类列表失败：', error)
  }
}

const loadTeachers = async () => {
  try {
    const response = await teacherAPI.getTeacherList({ pageNum: 1, pageSize: 100 })
    teachers.value = response?.data || []
  } catch (error) {
    console.error('获取讲师列表失败：', error)
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadCourseList()
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.categoryId = null
  searchForm.status = null
  pagination.pageNum = 1
  loadCourseList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadCourseList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadCourseList()
}

const handleChapterManage = (row) => {
  viewDialogVisible.value = false  // 关闭查看对话框
  router.push({
    path: '/admin/course/chapters',
    query: {
      courseId: row.id,
      courseTitle: row.title
    }
  })
}

const handleView = async (row) => {
  try {
    const response = await courseAPI.getCourseById(row.id)
    if (response) {
      viewData.value = response
      viewDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取课程详情失败：', error)
    ElMessage.error('获取课程详情失败')
  }
}

// 格式化难度
const getDifficultyText = (difficulty) => {
  const map = { 1: '入门', 2: '初级', 3: '中级', 4: '高级' }
  return map[difficulty] || '未知'
}

// 格式化状态
const getStatusText = (status) => {
  const map = { 0: '下架', 1: '上架', 2: '审核中' }
  return map[status] || '未知'
}

// 格式化数字（大数字显示为 1.2w）
const formatNumber = (num) => {
  if (num === null || num === undefined) return 0
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num
}

const handleAdd = () => {
  isEdit.value = false
  formTitle.value = '添加课程'
  resetForm()
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formTitle.value = '编辑课程'
  Object.assign(formData, row)
  viewDialogVisible.value = false  // 关闭查看对话框
  formDialogVisible.value = true
}

// 自定义封面上传
const handleCoverUpload = async (options) => {
  try {
    const response = await uploadImage(options.file)
    console.log(response)
    if (response) {
      formData.cover = response
      ElMessage.success('封面上传成功')
    } else {
      ElMessage.error('封面上传失败')
    }
  } catch (error) {
    console.error('封面上传失败：', error)
    ElMessage.error('封面上传失败')
  }
}

// 上传前验证
const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！')
    return false
  }
  return true
}

const handleFormSubmit = async () => {
  try {
    await formRef.value.validate()
    formLoading.value = true
    if (isEdit.value) {
      await courseAPI.updateCourse(formData)
      ElMessage.success('课程更新成功')
    } else {
      const { id, ...addData } = formData
      await courseAPI.addCourse(addData)
      ElMessage.success('课程添加成功')
    }
    formDialogVisible.value = false
    loadCourseList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await courseAPI.deleteCourse(id)
    ElMessage.success('删除成功')
    loadCourseList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    title: '',
    subTitle: '',
    categoryId: null,
    teacherId: null,
    description: '',
    price: 0,
    isFree: 0,
    difficulty: 1,
    status: 1
  })
}

const handleFormDialogClose = () => {
  formRef.value?.clearValidate()
  resetForm()
}

onMounted(() => {
  loadCourseList()
  loadCategories()
  loadTeachers()
})
</script>

<style scoped>
.courses-page {
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

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

/* 封面上传样式 */
.cover-uploader-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 280px;
  height: 158px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-preview {
  width: 280px;
  height: 158px;
  display: block;
  object-fit: cover;
}

.cover-tip {
  font-size: 12px;
  color: #999;
}
</style>

