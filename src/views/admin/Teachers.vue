<template>
  <div class="teachers-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>讲师管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>讲师管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="讲师姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入讲师姓名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="职称">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入职称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 讲师列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>讲师列表</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加讲师</el-button>
            <el-button :icon="Refresh" circle @click="loadTeacherList" />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="teacherList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column prop="name" label="讲师姓名" width="120" />
        
        <el-table-column prop="avatar" label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" :icon="User" />
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="职称" width="150" />
        
        <el-table-column prop="intro" label="简介" min-width="200" show-overflow-tooltip />

        <el-table-column prop="sort" label="排序" width="80" align="center" />

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">正常</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="180" />

        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="View"
              @click="handleView(row)"
            >
              查看
            </el-button>
            <el-button
              type="warning"
              size="small"
              :icon="Edit"
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除该讲师吗？"
              confirm-button-text="确定"
              cancel-button-text="取消"
              @confirm="handleDelete(row.id)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="讲师详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="currentTeacher">
        <el-descriptions-item label="讲师ID">{{ currentTeacher.id }}</el-descriptions-item>
        <el-descriptions-item label="讲师姓名">{{ currentTeacher.name }}</el-descriptions-item>
        <el-descriptions-item label="职称">{{ currentTeacher.title }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag v-if="currentTeacher.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="头像" :span="2">
          <el-avatar :size="80" :src="currentTeacher.avatar" :icon="User" />
        </el-descriptions-item>
        <el-descriptions-item label="简介" :span="2">{{ currentTeacher.intro || '-' }}</el-descriptions-item>
        <el-descriptions-item label="详细描述" :span="2">{{ currentTeacher.description || '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作经历" :span="2">{{ currentTeacher.experience || '-' }}</el-descriptions-item>
        <el-descriptions-item label="排序">{{ currentTeacher.sort }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTeacher.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 添加/编辑对话框 -->
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
        label-width="100px"
      >
        <el-form-item label="讲师姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入讲师姓名" />
        </el-form-item>

        <el-form-item label="头像" prop="avatar">
          <div class="avatar-uploader-container">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :http-request="handleAvatarUpload"
              :before-upload="beforeAvatarUpload"
              accept="image/*"
            >
              <img v-if="formData.avatar" :src="formData.avatar" class="avatar-preview" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="avatar-tip">建议上传 200x200 像素的图片</div>
          </div>
        </el-form-item>

        <el-form-item label="职称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入职称" />
        </el-form-item>

        <el-form-item label="简介" prop="intro">
          <el-input
            v-model="formData.intro"
            type="textarea"
            :rows="3"
            placeholder="请输入简介"
          />
        </el-form-item>

        <el-form-item label="详细描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入详细描述"
          />
        </el-form-item>

        <el-form-item label="工作经历" prop="experience">
          <el-input
            v-model="formData.experience"
            type="textarea"
            :rows="4"
            placeholder="请输入工作经历"
          />
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="formLoading">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Delete, Edit, Plus, User } from '@element-plus/icons-vue'
import * as teacherAPI from '@/api/admin/teacher'
import { uploadImage } from '@/api/admin/file'

// 搜索表单
const searchForm = reactive({
  name: '',
  title: '',
  status: null
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 讲师列表
const teacherList = ref([])
const loading = ref(false)

// 查看详情对话框
const dialogVisible = ref(false)
const currentTeacher = ref(null)

// 添加/编辑对话框
const formDialogVisible = ref(false)
const formRef = ref(null)
const formLoading = ref(false)
const formTitle = ref('添加讲师')
const isEdit = ref(false)

const formData = reactive({
  id: null,
  name: '',
  avatar: '',
  title: '',
  intro: '',
  description: '',
  experience: '',
  status: 1,
  sort: 0
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入讲师姓名', trigger: 'blur' }
  ],
  title: [
    { required: true, message: '请输入职称', trigger: 'blur' }
  ]
}

// 加载讲师列表
const loadTeacherList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const response = await teacherAPI.getTeacherList(params)
    
    if (response && response.data) {
      teacherList.value = response.data
      pagination.total = response.totalCount || 0
    } else {
      teacherList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取讲师列表失败：', error)
    ElMessage.error('获取讲师列表失败')
    teacherList.value = []
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadTeacherList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.title = ''
  searchForm.status = null
  pagination.pageNum = 1
  loadTeacherList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadTeacherList()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadTeacherList()
}

// 查看讲师详情
const handleView = async (row) => {
  try {
    const response = await teacherAPI.getTeacherById(row.id)
    currentTeacher.value = response
    dialogVisible.value = true
  } catch (error) {
    console.error('获取讲师详情失败：', error)
    ElMessage.error('获取讲师详情失败')
  }
}

// 添加讲师
const handleAdd = () => {
  isEdit.value = false
  formTitle.value = '添加讲师'
  resetForm()
  formDialogVisible.value = true
}

// 编辑讲师
const handleEdit = (row) => {
  isEdit.value = true
  formTitle.value = '编辑讲师'
  formData.id = row.id
  formData.name = row.name
  formData.avatar = row.avatar || ''
  formData.title = row.title || ''
  formData.intro = row.intro || ''
  formData.description = row.description || ''
  formData.experience = row.experience || ''
  formData.status = row.status
  formData.sort = row.sort || 0
  formDialogVisible.value = true
}

// 自定义头像上传
const handleAvatarUpload = async (options) => {
  try {
    const response = await uploadImage(options.file)
    console.log(response);
    if (response) {
      formData.avatar = response
      ElMessage.success('头像上传成功')
    } else {
      ElMessage.error(response?.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败：', error)
    ElMessage.error('头像上传失败')
  }
}

// 上传前验证
const beforeAvatarUpload = (file) => {
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

// 提交表单
const handleFormSubmit = async () => {
  try {
    await formRef.value.validate()
    formLoading.value = true

    if (isEdit.value) {
      await teacherAPI.updateTeacher(formData)
      ElMessage.success('讲师信息更新成功')
    } else {
      const { id, ...addData } = formData
      await teacherAPI.addTeacher(addData)
      ElMessage.success('讲师添加成功')
    }
    
    formDialogVisible.value = false
    loadTeacherList()
  } catch (error) {
    if (error !== false) {
      console.error('操作失败：', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  } finally {
    formLoading.value = false
  }
}

// 删除讲师
const handleDelete = async (id) => {
  try {
    await teacherAPI.deleteTeacher(id)
    ElMessage.success('删除成功')
    loadTeacherList()
  } catch (error) {
    console.error('删除讲师失败：', error)
    ElMessage.error('删除讲师失败')
  }
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.avatar = ''
  formData.title = ''
  formData.intro = ''
  formData.description = ''
  formData.experience = ''
  formData.status = 1
  formData.sort = 0
}

// 关闭表单对话框
const handleFormDialogClose = () => {
  formRef.value?.clearValidate()
  resetForm()
}

onMounted(() => {
  loadTeacherList()
})
</script>

<style scoped>
.teachers-page {
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

/* 头像上传样式 */
.avatar-uploader-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.avatar-uploader :deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.avatar-tip {
  font-size: 12px;
  color: #999;
}
</style>

