<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <!-- 左侧信息区 -->
    <div class="left-section">
      <div class="brand-info">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="80" fill="url(#gradient)" opacity="0.2"/>
              <path d="M70 100 L100 70 L130 100 L100 130 Z" fill="url(#gradient)"/>
              <circle cx="100" cy="100" r="15" fill="#fff"/>
            </svg>
          </div>
          <h1 class="brand-name">智学 AI 在线教育平台</h1>
        </div>
        <p class="brand-slogan">智能学习，开启未来</p>
        <div class="feature-list">
          <div class="feature-item">
            <i class="feature-icon">🤖</i>
            <span>AI智能辅导</span>
          </div>
          <div class="feature-item">
            <i class="feature-icon">📚</i>
            <span>海量课程资源</span>
          </div>
          <div class="feature-item">
            <i class="feature-icon">🎯</i>
            <span>个性化学习路径</span>
          </div>
          <div class="feature-item">
            <i class="feature-icon">📊</i>
            <span>智能数据分析</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区 -->
    <div class="right-section">
      <div class="login-box">
        <div class="login-header">
          <h2 class="login-title">{{ isLogin ? '欢迎回来' : '加入我们' }}</h2>
          <p class="login-subtitle">{{ isLogin ? '登录以继续您的学习之旅' : '创建账号开始学习' }}</p>
        </div>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
              clearable
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 注册模式下的重复密码 -->
          <el-form-item v-if="!isLogin" prop="confirmPassword">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              size="large"
              show-password
              clearable
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 注册模式下的验证码 -->
          <el-form-item v-if="!isLogin" prop="captcha">
            <div class="captcha-wrapper">
              <el-input
                v-model="form.captcha"
                placeholder="请输入验证码"
                size="large"
                clearable
                maxlength="6"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
              </el-input>
              <div class="captcha-image" @click="refreshCaptcha">
                <span class="captcha-text">{{ captchaText }}</span>
                <el-icon class="refresh-icon"><RefreshRight /></el-icon>
              </div>
            </div>
          </el-form-item>

          <el-form-item v-if="isLogin" prop="role">
            <el-select 
              v-model="form.role" 
              placeholder="请选择角色" 
              size="large"
              style="width: 100%"
            >
              <template #prefix>
                <el-icon><Avatar /></el-icon>
              </template>
              <el-option label="🎓 普通用户" value="common_user" />
              <el-option label="👨‍💼 管理员" value="admin" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleSubmit"
              class="submit-btn"
            >
              {{ isLogin ? '立即登录' : '立即注册' }}
            </el-button>
          </el-form-item>

          <div class="switch-mode">
            <span class="switch-text">{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
            <el-link type="primary" @click="switchMode" :underline="false">
              {{ isLogin ? '立即注册' : '立即登录' }}
            </el-link>
          </div>

          <div class="browse-home">
            <el-button 
              text 
              @click="goToHome" 
              class="browse-home-btn"
            >
              <el-icon><HomeFilled /></el-icon>
              去首页逛逛
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Avatar, HomeFilled, Key, RefreshRight } from '@element-plus/icons-vue'
import { login, register } from '@/api/web/user'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLogin = ref(true) // true: 登录模式, false: 注册模式
const loading = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: '',
  role: 'common_user'
})

// 验证码相关
const captchaText = ref('')
const captchaAnswer = ref('')

// 验证重复密码
const validateConfirmPassword = (rule, value, callback) => {
  if (!isLogin.value) {
    if (!value) {
      callback(new Error('请再次输入密码'))
    } else if (value !== form.password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 验证验证码
const validateCaptcha = (rule, value, callback) => {
  if (!isLogin.value) {
    if (!value) {
      callback(new Error('请输入验证码'))
    } else if (value.toLowerCase() !== captchaAnswer.value.toLowerCase()) {
      callback(new Error('验证码错误'))
    } else {
      callback()
    }
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  captcha: [
    { validator: validateCaptcha, trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 生成验证码
const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10)
  const num2 = Math.floor(Math.random() * 10)
  const operators = ['+', '-', '×']
  const operator = operators[Math.floor(Math.random() * operators.length)]
  
  captchaText.value = `${num1} ${operator} ${num2} = ?`
  
  switch (operator) {
    case '+':
      captchaAnswer.value = String(num1 + num2)
      break
    case '-':
      captchaAnswer.value = String(num1 - num2)
      break
    case '×':
      captchaAnswer.value = String(num1 * num2)
      break
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  generateCaptcha()
  form.captcha = ''
}

// 切换登录/注册模式
const switchMode = () => {
  isLogin.value = !isLogin.value
  formRef.value?.clearValidate()
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  form.captcha = ''
  form.role = 'common_user'
  
  // 切换到注册模式时生成验证码
  if (!isLogin.value) {
    generateCaptcha()
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true

    if (isLogin.value) {
      // 登录
      const res = await login({
        username: form.username,
        password: form.password,
        role: form.role
      })

      // 保存用户信息
      userStore.login(res)
      
      console.log('=== 登录成功 ===')
      console.log('用户信息:', res)
      console.log('用户角色:', res.role)
      console.log('Store中的角色:', userStore.userRole)
      
      ElMessage.success('登录成功')

      // 获取重定向路径
      const redirect = route.query.redirect
      
      // 根据角色和重定向路径跳转
      if (redirect && redirect !== '/login') {
        // 如果有重定向路径，跳转回原页面
        console.log('跳转到重定向页面:', redirect)
        router.push(redirect)
      } else if (res.role === 'admin') {
        // 管理员跳转到管理后台
        console.log('管理员登录，跳转到 /admin')
        router.push('/admin')
      } else {
        // 普通用户跳转到首页
        console.log('普通用户登录，跳转到 /web/home')
        router.push('/web/home')
      }
      console.log('================')
    } else {
      // 注册
      await register({
        username: form.username,
        password: form.password
      })

      ElMessage.success('注册成功，请登录')
      switchMode()
    }
  } catch (error) {
    console.error('操作失败：', error)
  } finally {
    loading.value = false
  }
}

// 跳转到首页
const goToHome = () => {
  router.push('/web/home')
}

// 页面加载时检查是否需要显示注册模式
onMounted(() => {
  if (route.query.mode === 'register') {
    isLogin.value = false
    generateCaptcha()
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: 10%;
  animation-delay: 5s;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: 20%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-30px) scale(1.1);
  }
}

/* 左侧信息区 */
.left-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  z-index: 1;
}

.brand-info {
  max-width: 500px;
  color: white;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  animation: slideInLeft 0.6s ease-out;
}

.logo-icon {
  width: 60px;
  height: 60px;
  margin-right: 15px;
}

.brand-name {
  font-size: 42px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(to right, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-slogan {
  font-size: 20px;
  margin-bottom: 50px;
  opacity: 0.95;
  animation: slideInLeft 0.6s ease-out 0.2s both;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  animation: slideInLeft 0.6s ease-out 0.4s both;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

.feature-icon {
  font-size: 28px;
  margin-right: 12px;
}

.feature-item span {
  font-size: 15px;
  font-weight: 500;
}

/* 右侧登录区 */
.right-section {
  flex: 0 0 520px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  padding: 60px;
  position: relative;
  z-index: 1;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.login-box {
  width: 100%;
  max-width: 400px;
  animation: slideInRight 0.6s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.login-form {
  margin-top: 20px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 12px 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.submit-btn:active {
  transform: translateY(0);
}

.switch-mode {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #7f8c8d;
}

.switch-text {
  margin-right: 8px;
}

.switch-mode :deep(.el-link) {
  font-weight: 600;
  font-size: 14px;
}

.browse-home {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e8e8e8;
}

.browse-home-btn {
  font-size: 14px;
  color: #7f8c8d;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.browse-home-btn:hover {
  color: #667eea;
  transform: translateX(5px);
}

.browse-home-btn .el-icon {
  font-size: 16px;
}

/* 验证码样式 */
.captcha-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
}

.captcha-wrapper :deep(.el-input) {
  flex: 1;
}

.captcha-image {
  flex-shrink: 0;
  width: 140px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  user-select: none;
}

.captcha-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.captcha-text {
  color: white;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 4px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.refresh-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  transition: transform 0.3s ease;
}

.captcha-image:hover .refresh-icon {
  transform: rotate(180deg);
}

/* 动画 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .left-section {
    display: none;
  }
  
  .right-section {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .right-section {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 26px;
  }
  
  .login-subtitle {
    font-size: 13px;
  }
}
</style>

