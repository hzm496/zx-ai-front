<template>
  <div class="memberships-page">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Coin /></el-icon>
            VIP价格管理
          </span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">
            添加会员套餐
          </el-button>
        </div>
      </template>

      <!-- 会员配置列表 -->
      <el-table 
        :data="tableData" 
        v-loading="loading" 
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="会员名称" width="150" />
        <el-table-column label="时长" width="120">
          <template #default="{ row }">
            {{ row.duration }}天
          </template>
        </el-table-column>
        <el-table-column label="价格" width="150">
          <template #default="{ row }">
            <div>
              <span style="color: #F56C6C; font-weight: bold; font-size: 16px;">¥{{ row.price }}</span>
              <span v-if="row.originalPrice && row.originalPrice > 0" style="color: #909399; text-decoration: line-through; margin-left: 8px;">¥{{ row.originalPrice }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
      >
        <el-form-item label="会员名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入会员名称，如：月度会员"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="时长（天）" prop="duration">
          <el-input-number
            v-model="formData.duration"
            :min="1"
            :max="3650"
            placeholder="请输入时长"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="价格（元）" prop="price">
          <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="0.01"
            placeholder="请输入价格"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="原价（元）">
          <el-input-number
            v-model="formData.originalPrice"
            :min="0"
            :precision="2"
            :step="0.01"
            placeholder="请输入原价（选填）"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="会员描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入会员描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="排序">
          <el-input-number
            v-model="formData.sort"
            :min="0"
            placeholder="排序值越小越靠前"
            style="width: 100%;"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import { Plus, Edit, Delete, Coin } from '@element-plus/icons-vue'
import {
  getMembershipList,
  addMembership,
  updateMembership,
  deleteMembership
} from '@/api/admin/membership'

// 数据
const loading = ref(false)
const tableData = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)
const submitLoading = ref(false)

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  duration: null,
  price: null,
  originalPrice: null,
  description: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入会员名称', trigger: 'blur' }
  ],
  duration: [
    { required: true, message: '请输入时长', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ]
}

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getMembershipList()
    console.log('会员配置API响应:', res)
    
    // 处理两种响应格式
    if (Array.isArray(res)) {
      // 直接返回数组
      tableData.value = res
      console.log('表格数据已更新（数组格式）:', tableData.value)
    } else if (res.success) {
      // 包装在Response对象中
      tableData.value = res.data || []
      console.log('表格数据已更新（Response格式）:', tableData.value)
    } else {
      console.error('API返回失败:', res)
      ElMessage.error(res.message || '获取列表失败')
    }
  } catch (error) {
    console.error('获取会员配置列表失败:', error)
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  dialogTitle.value = '添加会员套餐'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑会员套餐'
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    duration: row.duration,
    price: row.price,
    originalPrice: row.originalPrice,
    description: row.description,
    sort: row.sort,
    status: row.status
  })
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除会员套餐"${row.name}"吗？删除后将清除前台缓存。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 删除操作，响应拦截器会返回 res.data（可能是 null）
    await deleteMembership(row.id)
    ElMessage.success('删除成功，已清除前台缓存')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    const api = formData.id ? updateMembership : addMembership
    // 添加/更新操作，响应拦截器会返回 res.data（可能是 null）
    // 如果没有抛出异常，说明操作成功
    await api(formData)
    
    ElMessage.success(formData.id ? '更新成功，已清除前台缓存' : '添加成功')
    dialogVisible.value = false
    getList()
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    duration: null,
    price: null,
    originalPrice: null,
    description: '',
    sort: 0,
    status: 1
  })
  formRef.value?.clearValidate()
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return dateTime.replace('T', ' ')
}

// 生命周期
onMounted(() => {
  getList()
})
</script>

<style scoped>
.memberships-page {
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
  font-weight: bold;
}

:deep(.el-table .el-button + .el-button) {
  margin-left: 8px;
}
</style>

    