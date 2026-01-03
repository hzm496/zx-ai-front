<template>
  <div class="activities-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Present /></el-icon>
            活动管理
          </span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            创建活动
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="活动标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入活动标题"
            style="width: 250px;"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" style="width: 150px;" clearable>
            <el-option label="送会员" :value="1" />
            <el-option label="送优惠券" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" style="width: 120px;" clearable>
            <el-option label="禁用" :value="0" />
            <el-option label="启用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 活动列表 -->
      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="活动封面" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px;"
              :preview-src-list="[row.coverImage]"
            />
            <span v-else style="color: #909399;">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="活动标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="typeName" label="活动类型" width="120" />
        <el-table-column label="奖励内容" width="200">
          <template #default="{ row }">
            <el-tag v-if="row.type === 1" type="success">
              {{ row.vipDurationName }}会员
            </el-tag>
            <el-tag v-else-if="row.type === 2" type="warning">
              {{ row.couponAmount }}元券（满{{ row.couponMinAmount }}可用，{{ row.couponExpireDays }}天有效）
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="活动时间" width="180">
          <template #default="{ row }">
            <div style="font-size: 12px;">
              <div>{{ formatDateTime(row.startTime) }}</div>
              <div>至</div>
              <div>{{ formatDateTime(row.endTime) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="限制" width="120">
          <template #default="{ row }">
            <div style="font-size: 12px;">
              <div>每人{{ row.limitPerUser }}次</div>
              <div>总限{{ row.totalLimit || '不限' }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="领取进度" width="120">
          <template #default="{ row }">
            <span>{{ row.receiveCount }}</span>
            <span v-if="row.totalLimit > 0"> / {{ row.totalLimit }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="activityStatusName" label="活动状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getActivityStatusType(row.activityStatus)">
              {{ row.activityStatusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusName" label="启用状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 添加/编辑活动对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="150px"
        class="activity-form"
      >
        <el-form-item label="活动标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入活动标题" maxlength="100" show-word-limit />
        </el-form-item>

        <el-form-item label="活动描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活动类型" prop="type">
          <el-radio-group v-model="formData.type" @change="handleTypeChange">
            <el-radio :label="1">送会员</el-radio>
            <el-radio :label="2">送优惠券</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 送会员配置 -->
        <template v-if="formData.type === 1">
          <el-form-item label="VIP时长" prop="vipDuration">
            <el-select v-model="formData.vipDuration" placeholder="请选择VIP时长">
              <el-option label="体验卡（1天）" :value="1" />
              <el-option label="月卡（30天）" :value="30" />
              <el-option label="季卡（90天）" :value="90" />
              <el-option label="年卡（365天）" :value="365" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 送优惠券配置 -->
        <template v-if="formData.type === 2">
          <el-form-item label="优惠券金额" prop="couponAmount">
            <el-input-number
              v-model="formData.couponAmount"
              :min="1"
              :max="10000"
              :precision="2"
              placeholder="请输入金额"
            />
            <span style="margin-left: 10px;">元</span>
          </el-form-item>

          <el-form-item label="最低消费金额" prop="couponMinAmount">
            <el-input-number
              v-model="formData.couponMinAmount"
              :min="0"
              :max="100000"
              :precision="2"
              placeholder="请输入最低消费金额"
            />
            <span style="margin-left: 10px;">元</span>
          </el-form-item>

          <el-form-item label="优惠券有效期" prop="couponExpireDays">
            <el-input-number
              v-model="formData.couponExpireDays"
              :min="1"
              :max="365"
              placeholder="请输入有效天数"
            />
            <span style="margin-left: 10px;">天</span>
          </el-form-item>
        </template>

        <el-form-item label="活动封面">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            :http-request="handleUpload"
          >
            <img v-if="formData.coverImage" :src="formData.coverImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="formData.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="每人限领次数" prop="limitPerUser">
          <el-input-number v-model="formData.limitPerUser" :min="1" :max="100" />
          <span style="margin-left: 10px;">次</span>
        </el-form-item>

        <el-form-item label="活动总限额" prop="totalLimit">
          <el-input-number v-model="formData.totalLimit" :min="0" :max="999999" />
          <span style="margin-left: 10px;">（0表示不限制）</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh, Present } from '@element-plus/icons-vue'
import { getActivityList, addActivity, updateActivity, deleteActivity, updateActivityStatus } from '@/api/admin/activity'
import { uploadImage } from '@/api/admin/file'

const loading = ref(false)
const submitLoading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('创建活动')
const formRef = ref(null)
const isEdit = ref(false)

// 搜索表单
const searchForm = reactive({
  title: '',
  type: null,
  status: null
})

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表单数据
const formData = reactive({
  id: null,
  title: '',
  description: '',
  type: 1,
  coverImage: '',
  timeRange: [],
  startTime: null,
  endTime: null,
  limitPerUser: 1,
  totalLimit: 0,
  vipDuration: 30,
  couponAmount: null,
  couponMinAmount: null,
  couponExpireDays: 30
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入活动标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择活动类型', trigger: 'change' }
  ],
  vipDuration: [
    { required: true, message: '请选择VIP时长', trigger: 'change' }
  ],
  couponAmount: [
    { required: true, message: '请输入优惠券金额', trigger: 'blur' }
  ],
  couponExpireDays: [
    { required: true, message: '请输入优惠券有效期', trigger: 'blur' }
  ]
}

// 加载活动列表
const loadActivityList = async () => {
  try {
    loading.value = true
    const response = await getActivityList({
      ...searchForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    })
    tableData.value = response.data || []
    pagination.total = response.totalCount || 0
  } catch (error) {
    console.error('加载活动列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadActivityList()
}

// 重置
const handleReset = () => {
  searchForm.title = ''
  searchForm.type = null
  searchForm.status = null
  handleSearch()
}

// 添加活动
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '创建活动'
  resetForm()
  dialogVisible.value = true
}

// 编辑活动
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑活动'
  
  formData.id = row.id
  formData.title = row.title
  formData.description = row.description
  formData.type = row.type
  formData.coverImage = row.coverImage
  formData.timeRange = [row.startTime, row.endTime]
  formData.limitPerUser = row.limitPerUser
  formData.totalLimit = row.totalLimit
  
  if (row.type === 1) {
    formData.vipDuration = row.vipDuration
  } else if (row.type === 2) {
    formData.couponAmount = row.couponAmount
    formData.couponMinAmount = row.couponMinAmount
    formData.couponExpireDays = row.couponExpireDays
  }
  
  dialogVisible.value = true
}

// 删除活动
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该活动吗？删除后无法恢复！', '提示', {
      type: 'warning'
    })
    
    await deleteActivity(row.id)
    ElMessage.success('删除成功')
    loadActivityList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除活动失败：', error)
    }
  }
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    await updateActivityStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    console.error('更新状态失败：', error)
    row.status = row.status === 1 ? 0 : 1 // 恢复原状态
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (!formData.timeRange || formData.timeRange.length !== 2) {
      ElMessage.warning('请选择活动时间')
      return
    }
    
    submitLoading.value = true
    
    const data = {
      ...formData,
      startTime: formData.timeRange[0],
      endTime: formData.timeRange[1]
    }
    delete data.timeRange
    
    if (isEdit.value) {
      await updateActivity(data)
      ElMessage.success('更新成功')
    } else {
      await addActivity(data)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadActivityList()
  } catch (error) {
    if (error !== false) {
      console.error('提交失败：', error)
    }
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.title = ''
  formData.description = ''
  formData.type = 1
  formData.coverImage = ''
  formData.timeRange = []
  formData.limitPerUser = 1
  formData.totalLimit = 0
  formData.vipDuration = 30
  formData.couponAmount = null
  formData.couponMinAmount = null
  formData.couponExpireDays = 30
  formRef.value?.clearValidate()
}

// 活动类型改变
const handleTypeChange = () => {
  if (formData.type === 1) {
    formData.vipDuration = 30
  } else {
    formData.couponAmount = null
    formData.couponMinAmount = null
    formData.couponExpireDays = 30
  }
}

// 上传前验证
const handleBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB')
    return false
  }
  return true
}

// 自定义上传
const handleUpload = async ({ file }) => {
  try {
    const url = await uploadImage(file)
    formData.coverImage = url
    ElMessage.success('上传成功')
  } catch (error) {
    console.error('上传失败：', error)
    ElMessage.error('上传失败，请重试')
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return dateTime.replace('T', ' ')
}

// 获取活动状态类型
const getActivityStatusType = (status) => {
  const types = { 1: 'info', 2: 'success', 3: 'danger' }
  return types[status] || 'info'
}

onMounted(() => {
  loadActivityList()
})
</script>

<style scoped>
.activities-page {
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
  font-size: 18px;
  font-weight: 600;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #409eff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.activity-form :deep(.el-input),
.activity-form :deep(.el-textarea__inner) {
  width: 100%;
}

.activity-form :deep(.el-select) {
  width: 100%;
}

.activity-form :deep(.el-date-editor) {
  width: 100%;
}
</style>

