<template>
  <div class="users-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>用户管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.username"
            placeholder="请输入用户名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="性别">
          <el-select
            v-model="searchForm.gender"
            placeholder="请选择性别"
            clearable
            style="width: 120px"
          >
            <el-option label="男" :value="1" />
            <el-option label="女" :value="2" />
            <el-option label="保密" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="VIP状态">
          <el-select
            v-model="searchForm.isVip"
            placeholder="请选择VIP状态"
            clearable
            style="width: 150px"
          >
            <el-option label="VIP会员" :value="1" />
            <el-option label="普通用户" :value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户状态">
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

    <!-- 用户列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="header-actions">
            <el-button :icon="Refresh" circle @click="loadUserList" />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="userList"
        border
        stripe
        style="width: 100%"
      >
        <!-- <el-table-column type="index" label="序号" width="60" align="center" />
        
        <el-table-column prop="id" label="用户ID" width="80" align="center" /> -->
        
        <el-table-column prop="username" label="用户名" width="150" />
        
        <el-table-column prop="nickname" label="昵称" width="150" />
        
        <el-table-column prop="avatar" label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar" :icon="User" />
          </template>
        </el-table-column>
        
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.gender === 1" type="primary" size="small">男</el-tag>
            <el-tag v-else-if="row.gender === 2" type="danger" size="small">女</el-tag>
            <el-tag v-else type="info" size="small">保密</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号" width="130" />
        
        <el-table-column prop="email" label="邮箱" width="180" />
        
        <el-table-column prop="isVip" label="VIP状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isVip" type="success" effect="dark">
              <el-icon><StarFilled /></el-icon> VIP
            </el-tag>
            <el-tag v-else type="info">普通</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="vipExpireTime" label="VIP到期时间" width="180">
          <template #default="{ row }">
            {{ row.isVip ? (row.vipExpireTime || '永久') : '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">正常</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册时间" width="180" />

        <el-table-column label="操作" width="250" fixed="right" align="center">
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
              title="确定要删除该用户吗？"
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

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="用户详情"
      width="600px"
    >
      <el-descriptions :column="1" border v-if="currentUser">
        <el-descriptions-item label="用户ID">{{ currentUser.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="头像">
          <el-avatar :size="60" :src="currentUser.avatar" :icon="User" />
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          <el-tag v-if="currentUser.gender === 1" type="primary">男</el-tag>
          <el-tag v-else-if="currentUser.gender === 2" type="danger">女</el-tag>
          <el-tag v-else type="info">保密</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ currentUser.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="VIP状态">
          <el-tag v-if="currentUser.isVip" type="success">VIP会员</el-tag>
          <el-tag v-else type="info">普通用户</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="VIP到期时间" v-if="currentUser.isVip">
          {{ currentUser.vipExpireTime || '永久' }}
        </el-descriptions-item>
        <el-descriptions-item label="用户状态">
          <el-tag v-if="currentUser.status === 1" type="success">正常</el-tag>
          <el-tag v-else type="danger">禁用</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ currentUser.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ currentUser.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑用户信息"
      width="600px"
      @close="handleEditDialogClose"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="editForm.gender">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
            <el-radio :label="0">保密</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSubmit" :loading="editLoading">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Delete, Edit, User, StarFilled } from '@element-plus/icons-vue'
import * as adminAPI from '@/api/admin/user'

// 搜索表单
const searchForm = reactive({
  username: '',
  gender: null,
  isVip: null,
  status: null
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 用户列表
const userList = ref([])
const loading = ref(false)

// 查看详情对话框
const dialogVisible = ref(false)
const currentUser = ref(null)

// 编辑用户对话框
const editDialogVisible = ref(false)
const editFormRef = ref(null)
const editLoading = ref(false)
const editForm = reactive({
  id: null,
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 0
})

// 编辑表单验证规则
const editRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 加载用户列表
const loadUserList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    
    const response = await adminAPI.getUserList(params)
    
    // 根据后端返回的分页结构处理数据
    if (response && response.data) {
      userList.value = response.data
      pagination.total = response.totalCount || 0
    } else {
      userList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取用户列表失败：', error)
    ElMessage.error('获取用户列表失败')
    userList.value = []
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadUserList()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.gender = null
  searchForm.isVip = null
  searchForm.status = null
  pagination.pageNum = 1
  loadUserList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadUserList()
}

// 当前页改变
const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadUserList()
}

// 查看用户
const handleView = async (row) => {
  try {
    const response = await adminAPI.getUserById(row.id)
    currentUser.value = response
    dialogVisible.value = true
  } catch (error) {
    console.error('获取用户详情失败：', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 删除用户
const handleDelete = async (id) => {
  try {
    await adminAPI.deleteUser(id)
    ElMessage.success('删除成功')
    loadUserList()
  } catch (error) {
    console.error('删除用户失败：', error)
    ElMessage.error('删除用户失败')
  }
}

// 编辑用户
const handleEdit = (row) => {
  editForm.id = row.id
  editForm.username = row.username
  editForm.nickname = row.nickname || ''
  editForm.phone = row.phone || ''
  editForm.email = row.email || ''
  editForm.gender = row.gender || 0
  editDialogVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  try {
    await editFormRef.value.validate()
    editLoading.value = true

    const updateData = {
      nickname: editForm.nickname,
      phone: editForm.phone,
      email: editForm.email,
      gender: editForm.gender
    }

    await adminAPI.updateUserInfoByAdmin(editForm.id, updateData)
    
    ElMessage.success('用户信息更新成功')
    editDialogVisible.value = false
    loadUserList()
  } catch (error) {
    if (error !== false) {
      console.error('更新用户信息失败：', error)
      ElMessage.error('更新失败，请稍后重试')
    }
  } finally {
    editLoading.value = false
  }
}

// 关闭编辑对话框
const handleEditDialogClose = () => {
  editFormRef.value?.clearValidate()
}

onMounted(() => {
  loadUserList()
})
</script>

<style scoped>
.users-page {
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
</style>

