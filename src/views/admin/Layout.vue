<template>
  <div class="admin-layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
        <div class="logo-container">
          <div v-if="!isCollapse" class="logo-content">
            <div class="logo-text">
              <h1>AI智学后台管理</h1>
              <p></p>
            </div>
          </div>
          <div v-else class="logo-icon-collapsed">🎓</div>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :router="true"
          unique-opened
          background-color="transparent"
          text-color="rgba(255, 255, 255, 0.85)"
          active-text-color="#fff"
          class="sidebar-menu"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>

          <el-sub-menu index="user">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/admin/users">用户列表</el-menu-item>
            <el-menu-item index="/admin/teachers">教师管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="course">
            <template #title>
              <el-icon><Reading /></el-icon>
              <span>课程管理</span>
            </template>
            <el-menu-item index="/admin/courses">课程列表</el-menu-item>
            <el-menu-item index="/admin/categories">分类管理</el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="order">
            <template #title>
              <el-icon><Tickets /></el-icon>
              <span>订单管理</span>
            </template>
            <el-menu-item index="/admin/orders/course">课程订单</el-menu-item>
            <el-menu-item index="/admin/orders/vip">会员订单</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/admin/withdraws">
            <el-icon><Wallet /></el-icon>
            <template #title>提现管理</template>
          </el-menu-item>

          <el-sub-menu index="marketing">
            <template #title>
              <el-icon><ShoppingBag /></el-icon>
              <span>营销管理</span>
            </template>
            <el-menu-item index="/admin/memberships">VIP价格管理</el-menu-item>
            <el-menu-item index="/admin/activities">活动管理</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/admin/customer-service">
            <el-badge :value="customerServiceUnread" :max="99" :hidden="customerServiceUnread === 0" class="menu-badge">
              <el-icon><Service /></el-icon>
            </el-badge>
            <template #title>在线客服</template>
          </el-menu-item>

          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统设置</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-container>
        <!-- 顶部导航栏 -->
        <el-header class="header">
          <div class="header-left">
            <el-icon class="collapse-icon" @click="toggleCollapse">
              <Fold v-if="!isCollapse" />
              <Expand v-else />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="header-right">
            <el-tooltip content="用户反馈" placement="bottom">
              <el-badge :value="unreadCount" :max="99" class="notification-badge" @click="goToFeedbacks">
                <el-icon :size="35" class="header-icon" style="cursor: pointer;"><Bell /></el-icon>
              </el-badge>
            </el-tooltip>

            <el-dropdown @command="handleCommand" class="user-dropdown-wrapper">
              <span class="user-dropdown">
                <el-avatar 
                  :size="36" 
                  :src="userInfo.avatar" 
                  :icon="User"
                />
                <span class="username">{{ userInfo.nickname || userInfo.username || '用户' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>
                    个人中心
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主要内容区 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  User,
  Reading,
  Tickets,
  Wallet,
  ShoppingBag,
  Setting,
  Present,
  Service,
  Fold,
  Expand,
  ArrowDown,
  Bell,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import * as adminAPI from '@/api/admin/user'
import * as feedbackAPI from '@/api/admin/feedback'
import { getUnreadTotal } from '@/api/admin/customerService'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)
const userInfo = ref({
  username: '',
  nickname: '',
  avatar: '',
  role: ''
})

// 反馈相关
const unreadCount = ref(0)

// 客服未读消息数
const customerServiceUnread = ref(0)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    path: item.path,
    title: item.meta.title
  }))
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await adminAPI.getUserInfo()
    userInfo.value = response
    userStore.setUserInfo(response)
  } catch (error) {
    console.error('获取用户信息失败：', error)
  }
}

// 用户下拉菜单操作
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await adminAPI.logout()
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出登录失败：', error)
      }
    }
  } else if (command === 'profile') {
    router.push('/admin/profile')
  }
}

// 获取未读反馈数量
const loadUnreadCount = async () => {
  try {
    const count = await feedbackAPI.getUnreadCount()
    unreadCount.value = count || 0
  } catch (error) {
    console.error('获取未读反馈数量失败：', error)
  }
}

// 跳转到反馈页面
const goToFeedbacks = () => {
  router.push('/admin/feedbacks')
}

// 获取客服未读消息数
const loadCustomerServiceUnread = async () => {
  try {
    customerServiceUnread.value = await getUnreadTotal()
  } catch (error) {
    console.error('获取客服未读数失败：', error)
  }
}

// 监听路由变化，如果离开客服页面就刷新未读数
watch(() => route.path, (newPath, oldPath) => {
  if (oldPath === '/admin/customer-service' && newPath !== '/admin/customer-service') {
    loadCustomerServiceUnread()
  }
})

onMounted(() => {
  // 初始化时获取用户信息
  fetchUserInfo()
  // 获取未读反馈数量
  loadUnreadCount()
  // 获取客服未读消息数
  loadCustomerServiceUnread()
  
  // 定时刷新未读数量
  setInterval(loadUnreadCount, 30000) // 反馈每30秒刷新
  
  // 客服未读数轮询：只在不在客服页面时才轮询
  setInterval(() => {
    if (route.path !== '/admin/customer-service') {
      loadCustomerServiceUnread()
    }
  }, 10000) // 每10秒刷新一次
})
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  overflow: hidden;
}

.el-container {
  height: 100%;
}

/* ========== 侧边栏样式 ========== */
.sidebar {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
  overflow-x: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo-container {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 20px;
}

.logo-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-icon-collapsed {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-text h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1px;
}

.logo-text p {
  margin: 0;
  font-size: 12px;
  opacity: 0.85;
  margin-top: 2px;
}

.sidebar-menu {
  border-right: none;
  padding: 10px 0;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  border-radius: 8px;
  margin: 4px 10px;
  transition: all 0.3s;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: rgba(255, 255, 255, 0.15) !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.2) !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 菜单上的未读气泡 */
.menu-badge {
  line-height: 1;
}

.menu-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: 2px solid #667eea;
}

/* ========== 顶部导航栏样式 ========== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.collapse-icon {
  font-size: 35px;
  cursor: pointer;
  transition: all 0.3s;
  color: #606266;
  padding: 8px;
  border-radius: 6px;
}

.collapse-icon:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 6px;
}

.header-icon:hover {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.notification-badge {
  cursor: pointer;
}

.notification-badge :deep(.el-badge__content) {
  font-size: 12px;
  height: 20px;
  line-height: 20px;
  padding: 0 6px;
  min-width: 20px;
}

.user-dropdown-wrapper {
  margin-left: 8px;
}

.user-dropdown-wrapper :deep(.el-dropdown) {
  outline: none !important;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.user-dropdown:hover {
  background: rgba(102, 126, 234, 0.05);
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.user-dropdown:focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.user-dropdown:active {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.username {
  color: #333;
  font-weight: 500;
  font-size: 14px;
}

/* ========== 主要内容区样式 ========== */
.main-content {
  background: #f5f7fa;
  overflow-y: auto;
  padding: 20px;
}

/* ========== 面包屑样式 ========== */
.header-left :deep(.el-breadcrumb__item) {
  font-weight: 500;
}

.header-left :deep(.el-breadcrumb__inner) {
  color: #606266;
  transition: color 0.3s;
}

.header-left :deep(.el-breadcrumb__inner:hover) {
  color: #667eea;
}

/* ========== 下拉菜单样式 ========== */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}
</style>

