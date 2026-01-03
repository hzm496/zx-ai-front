<template>
  <div class="profile-container">
    <el-card class="profile-header" shadow="never">
      <div class="header-content">
        <div class="avatar-section">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :before-upload="handleAvatarUpload"
              :http-request="uploadAvatar"
            >
              <el-avatar 
                :size="120" 
                :src="userInfo.avatar" 
                :icon="User"
                class="avatar-img" 
              />
              <div class="avatar-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </el-upload>
        </div>
        <div class="user-basic-info">
          <h2>{{ userInfo.nickname || userInfo.username }}</h2>
          <p class="role-tag">
            <el-tag type="warning" effect="dark">
              <el-icon><User /></el-icon>
              {{ userInfo.role === 'admin' ? '管理员' : '普通用户' }}
            </el-tag>
          </p>
          <div class="stats">
            <div class="stat-item">
              <span class="stat-value">{{ stats.courses }}</span>
              <span class="stat-label">课程数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.users }}</span>
              <span class="stat-label">用户数</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.orders }}</span>
              <span class="stat-label">订单数</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span><el-icon><User /></el-icon> 个人信息</span>
              <el-button type="primary" :icon="Edit" @click="isEditing = true" v-if="!isEditing">
                编辑资料
              </el-button>
            </div>
          </template>

          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="120px"
            class="profile-form"
          >
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="formData.username" disabled />
                </el-form-item>

                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="formData.nickname" :disabled="!isEditing" placeholder="请输入昵称" />
                </el-form-item>

                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="formData.phone" :disabled="!isEditing" placeholder="请输入手机号" />
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="formData.email" :disabled="!isEditing" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="formData.gender" :disabled="!isEditing">
                    <el-radio :label="1">男</el-radio>
                    <el-radio :label="2">女</el-radio>
                    <el-radio :label="0">保密</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="VIP状态">
                  <el-tag :type="userInfo.isVip ? 'success' : 'info'">
                    {{ userInfo.isVip ? 'VIP会员' : '普通会员' }}
                  </el-tag>
                </el-form-item>

                <el-form-item label="VIP到期时间" v-if="userInfo.isVip">
                  <span>{{ userInfo.vipExpireTime || '永久' }}</span>
                </el-form-item>

                <el-form-item label="注册时间">
                  <span>{{ userInfo.createTime }}</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item v-if="isEditing">
              <el-button type="primary" @click="handleSave" :loading="loading">保存修改</el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span><el-icon><Lock /></el-icon> 修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
            class="password-form"
          >
            <el-row :gutter="40">
              <el-col :span="12">
                <el-form-item label="原密码" prop="oldPassword">
                  <el-input
                    v-model="passwordForm.oldPassword"
                    type="password"
                    placeholder="请输入原密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="handlePasswordChange" :loading="passwordLoading">
                    修改密码
                  </el-button>
                  <el-button @click="resetPasswordForm">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Edit, Lock, Camera } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import * as adminAPI from '@/api/admin/user'
import * as adminFileAPI from '@/api/admin/file'

const userStore = useUserStore()
const formRef = ref(null)
const passwordFormRef = ref(null)

const userInfo = ref({})
const isEditing = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)

const stats = reactive({
  courses: 156,
  users: 1284,
  orders: 892
})

const formData = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 0
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
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

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await adminAPI.getUserInfo()
    userInfo.value = response
    Object.assign(formData, {
      username: response.username,
      nickname: response.nickname,
      phone: response.phone,
      email: response.email,
      gender: response.gender || 0
    })
  } catch (error) {
    console.error('获取用户信息失败：', error)
  }
}

// 保存修改
const handleSave = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    await adminAPI.updateUserInfo(formData)
    
    ElMessage.success('个人信息更新成功')
    isEditing.value = false
    await fetchUserInfo()
  } catch (error) {
    if (error !== false) {
      console.error('更新个人信息失败：', error)
      ElMessage.error('更新失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  fetchUserInfo()
}

// 修改密码
const handlePasswordChange = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    await adminAPI.updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功，请重新登录')
    resetPasswordForm()
    
    // 延迟跳转到登录页
    setTimeout(() => {
      userStore.logout()
      window.location.href = '/login'
    }, 1500)
  } catch (error) {
    if (error !== false) {
      console.error('修改密码失败：', error)
      ElMessage.error('密码修改失败，请检查原密码是否正确')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 头像上传前验证
const handleAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 上传头像
const uploadAvatar = async ({ file }) => {
  try {
    // 上传图片到服务器
    const url = await adminFileAPI.uploadImage(file)
    
    // 更新用户头像
    await adminAPI.updateUserInfo({ avatar: url })
    
    ElMessage.success('头像更新成功')
    await fetchUserInfo()
    userStore.setUserInfo(userInfo.value)
  } catch (error) {
    console.error('头像上传失败：', error)
    ElMessage.error('头像上传失败，请稍后重试')
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========== 头部卡片 ========== */
.profile-header {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.profile-header :deep(.el-card__body) {
  padding: 40px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 40px;
  color: white;
}

.avatar-section {
  position: relative;
}

.avatar-uploader {
  position: relative;
  cursor: pointer;
}

.avatar-img {
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 14px;
}

.avatar-uploader:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.user-basic-info h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  font-weight: 600;
}

.role-tag {
  margin-bottom: 20px;
}

.role-tag .el-tag {
  font-size: 14px;
  padding: 8px 16px;
}

.stats {
  display: flex;
  gap: 40px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

/* ========== 信息卡片 ========== */
.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-form,
.password-form {
  margin-top: 20px;
}

.profile-form :deep(.el-form-item__label),
.password-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.profile-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}
</style>

