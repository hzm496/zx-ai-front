<template>
  <header class="app-header">
    <div class="header-content">
      <!-- Logo -->
      <div class="logo" @click="goToHome">
        <span class="logo-icon">🎓</span>
        <span class="logo-text">AI智学伴侣</span>
      </div>
      
      <!-- 导航菜单 -->
      <nav class="nav">
        <a 
          v-for="item in navItems" 
          :key="item.key"
          :class="['nav-item', { active: activeNav === item.key }]"
          @click="handleNavClick(item)"
        >
          {{ item.label }}
        </a>
      </nav>
      
      <!-- 用户信息/登录注册 -->
      <div class="header-actions">
        <!-- 已登录 -->
        <template v-if="userStore.isLogin">
          <el-dropdown @command="handleCommand">
            <div class="user-info-wrapper">
              <el-avatar 
                :size="40" 
                :src="userStore.userInfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
              />
               <div class="user-details">
                 <div class="username-row">
                   <span class="username">{{ userStore.userInfo.username || '用户' }}</span>
                   <span v-if="userStore.isAnnualVip" class="vip-badge annual">
                     <el-icon><Star /></el-icon>
                     超级会员SVIP
                   </span>
                   <span v-else-if="userStore.isVip" class="vip-badge">
                     <el-icon><Star /></el-icon>
                     VIP
                   </span>
                 </div>
               </div>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        
        <!-- 未登录 -->
        <template v-else>
          <el-button type="text" @click="goToLogin">登录</el-button>
          <el-button type="primary" @click="goToRegister">注册</el-button>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// Props
const props = defineProps({
  activeNav: {
    type: String,
    default: 'courses' // 默认高亮"课程"
  }
})

const router = useRouter()
const userStore = useUserStore()

// 导航项配置
const navItems = [
  { key: 'courses', label: '课程', path: '/web/home', anchor: '#courses' },
  { key: 'categories', label: '课程分类', path: '/web/categories' },
  { key: 'ai-assistant', label: '🤖 AI助手', path: '/web/ai-assistant' },
  { key: 'activities', label: '🎉 限时活动', path: '/web/activities' },
  { key: 'teachers', label: '名师', path: '/web/teachers' },
  { key: 'vip', label: '👑 开通VIP', path: '/web/vip' },
  { key: 'about', label: '关于我们', path: '/web/about' }
]

// 处理导航点击
const handleNavClick = (item) => {
  if (item.anchor && item.path === '/web/home') {
    // 如果是锚点且目标是首页，直接跳转到首页并滚动到对应位置
    if (router.currentRoute.value.path === '/web/home') {
      // 已在首页，直接滚动
      const element = document.querySelector(item.anchor)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // 不在首页，先跳转到首页
      router.push(item.path).then(() => {
        setTimeout(() => {
          const element = document.querySelector(item.anchor)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      })
    }
  } else if (item.path) {
    // 普通路由跳转
    router.push(item.path)
  }
}

// 跳转到首页
const goToHome = () => {
  router.push('/web/home')
}

// 跳转到登录页
const goToLogin = () => {
  router.push('/login')
}

// 跳转到注册页
const goToRegister = () => {
  router.push({ path: '/login', query: { mode: 'register' } })
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    userStore.logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Logo样式 */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 导航菜单样式 */
.nav {
  display: flex;
  gap: 40px;
}

.nav-item {
  color: #333;
  font-size: 16px;
  text-decoration: none !important;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
  cursor: pointer;
  outline: none;
}

.nav-item:hover {
  color: #667eea;
  text-decoration: none !important;
}

.nav-item:focus {
  outline: none;
  text-decoration: none !important;
}

.nav-item:visited {
  color: inherit;
  text-decoration: none !important;
}

.nav-item.active {
  color: #667eea;
  border-bottom-color: #667eea;
  font-weight: 500;
  text-decoration: none !important;
}

/* 用户操作区域 */
.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.header-actions :deep(.el-dropdown) {
  border: none !important;
  outline: none !important;
}

.user-info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 16px 6px 6px;
  border-radius: 24px;
  background: rgba(102, 126, 234, 0.05);
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.3s;
}

.user-info-wrapper:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
}

/* 超级会员SVIP样式 */
.vip-badge.annual {
  background: linear-gradient(135deg, #9b59b6 0%, #e74c3c 50%, #f39c12 100%);
  box-shadow: 0 2px 8px rgba(155, 89, 182, 0.5);
  animation: svip-glow 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.vip-badge.annual::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: svip-shine 3s ease-in-out infinite;
}

@keyframes svip-glow {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(155, 89, 182, 0.5);
  }
  50% {
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.8), 0 0 20px rgba(231, 76, 60, 0.5);
  }
}

@keyframes svip-shine {
  0% {
    transform: translateX(-100%) translateY(-100%);
  }
  100% {
    transform: translateX(100%) translateY(100%);
  }
}

.vip-badge .el-icon {
  font-size: 12px;
  position: relative;
  z-index: 1;
}

.dropdown-icon {
  font-size: 14px;
  color: #999;
  transition: transform 0.3s;
}

.user-info-wrapper:hover .dropdown-icon {
  transform: rotate(180deg);
}

/* Element Plus 按钮样式覆盖 */
.header-actions :deep(.el-button) {
  font-size: 14px;
}

.header-actions :deep(.el-button--text) {
  color: #667eea;
}

.header-actions :deep(.el-button--primary) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.header-actions :deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
}
</style>

