import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/web/home'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录', noAuth: true }
    },
    {
      path: '/web/home',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { title: '首页', noAuth: true }
    },
    {
      path: '/web/about',
      name: 'About',
      component: () => import('@/views/About.vue'),
      meta: { title: '关于我们', noAuth: true }
    },
    {
      path: '/web/teachers',
      name: 'WebTeachers',
      component: () => import('@/views/Teachers.vue'),
      meta: { title: '名师阵容', noAuth: true }
    },
    {
      path: '/web/teacher/courses',
      name: 'TeacherCourses',
      component: () => import('@/views/TeacherCourses.vue'),
      meta: { title: '讲师课程', noAuth: true }
    },
    {
      path: '/web/categories',
      name: 'WebCategories',
      component: () => import('@/views/Categories.vue'),
      meta: { title: '课程分类', noAuth: true }
    },
    {
      path: '/web/ai-assistant',
      name: 'AIAssistantPage',
      component: () => import('@/views/AIAssistantPage.vue'),
      meta: { title: 'AI助手', requireAuth: true }
    },
    {
      path: '/web/category/courses',
      name: 'CategoryCourses',
      component: () => import('@/views/CategoryCourses.vue'),
      meta: { title: '分类课程', noAuth: true }
    },
    {
      path: '/web/course/detail',
      name: 'CourseDetail',
      component: () => import('@/views/CourseDetail.vue'),
      meta: { title: '课程详情', noAuth: true }
    },
    {
      path: '/web/avatar-preview',
      name: 'AvatarPreview',
      component: () => import('@/views/AvatarPreview.vue'),
      meta: { title: '头像预览', noAuth: true }
    },
    {
      path: '/web/vip',
      name: 'VipIntro',
      component: () => import('@/views/VipIntro.vue'),
      meta: { title: 'VIP会员', noAuth: true }
    },
    {
      path: '/web/vip/detail',
      name: 'VipDetail',
      component: () => import('@/views/VipDetail.vue'),
      meta: { title: '我的VIP' }
    },
    {
      path: '/payment-success',
      name: 'PaymentSuccess',
      component: () => import('@/views/PaymentSuccess.vue'),
      meta: { title: '支付成功', noAuth: true }
    },
    {
      path: '/web/activities',
      name: 'Activities',
      component: () => import('@/views/Activities.vue'),
      meta: { title: '限时活动', noAuth: true }
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: () => import('@/views/Maintenance.vue'),
      meta: { title: '系统维护', noAuth: true, noMaintenanceCheck: true }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { title: '个人中心', requireAuth: true, role: 'common_user' }
    },
    {
      path: '/web/profile',
      name: 'WebProfile',
      component: () => import('@/views/Profile.vue'),
      meta: { title: '个人中心', requireAuth: true, role: 'common_user' }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/Layout.vue'),
      redirect: '/admin/dashboard',
      meta: { requireAuth: true, role: 'admin' },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '仪表盘', requireAuth: true, role: 'admin' }
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/admin/Users.vue'),
          meta: { title: '用户列表', requireAuth: true, role: 'admin' }
        },
        {
          path: 'courses',
          name: 'Courses',
          component: () => import('@/views/admin/Courses.vue'),
          meta: { title: '课程列表', requireAuth: true, role: 'admin' }
        },
        {
          path: 'course/chapters',
          name: 'CourseChapters',
          component: () => import('@/views/admin/CourseChapters.vue'),
          meta: { title: '章节管理', requireAuth: true, role: 'admin' }
        },
        {
          path: 'teachers',
          name: 'AdminTeachers',
          component: () => import('@/views/admin/Teachers.vue'),
          meta: { title: '讲师管理', requireAuth: true, role: 'admin' }
        },
        {
          path: 'categories',
          name: 'Categories',
          component: () => import('@/views/admin/Categories.vue'),
          meta: { title: '分类管理', requireAuth: true, role: 'admin' }
        },
        {
          path: 'orders',
          name: 'Orders',
          redirect: '/admin/orders/course',
          meta: { title: '订单管理', requireAuth: true, role: 'admin' },
          children: [
            {
              path: 'course',
              name: 'CourseOrders',
              component: () => import('@/views/admin/CourseOrders.vue'),
              meta: { title: '课程订单', requireAuth: true, role: 'admin' }
            },
            {
              path: 'vip',
              name: 'VipOrders',
              component: () => import('@/views/admin/VipOrders.vue'),
              meta: { title: '会员订单', requireAuth: true, role: 'admin' }
            }
          ]
        },
        {
          path: 'withdraws',
          name: 'Withdraws',
          component: () => import('@/views/admin/Withdraws.vue'),
          meta: { title: '提现管理', requireAuth: true, role: 'admin' }
        },
        {
          path: 'memberships',
          name: 'Memberships',
          component: () => import('@/views/admin/Memberships.vue'),
          meta: { title: 'VIP价格管理', requireAuth: true, role: 'admin' }
        },
        {
          path: 'feedbacks',
          name: 'Feedbacks',
          component: () => import('@/views/admin/Feedbacks.vue'),
          meta: { title: '用户反馈', requireAuth: true, role: 'admin' }
        },
        {
          path: 'activities',
          name: 'AdminActivities',
          component: () => import('@/views/admin/Activities.vue'),
          meta: { title: '活动管理', requireAuth: true, role: 'admin' }
        },
        {
          path: 'customer-service',
          name: 'AdminCustomerService',
          component: () => import('@/views/admin/CustomerService.vue'),
          meta: { title: '在线客服', requireAuth: true, role: 'admin' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/admin/Settings.vue'),
          meta: { title: '系统设置', requireAuth: true, role: 'admin' }
        },
        {
          path: 'profile',
          name: 'AdminProfile',
          component: () => import('@/views/admin/Profile.vue'),
          meta: { title: '个人中心', requireAuth: true, role: 'admin' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: { title: '404' }
    }
  ]
})

// 防止循环跳转的标志
let isNavigating = false

// 验证token格式是否有效
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false
  // token应该是非空字符串，且长度合理
  return token.trim().length > 10
}

// 验证用户信息是否完整
const isValidUserInfo = (userInfo) => {
  if (!userInfo || typeof userInfo !== 'object') return false
  // 至少应该有id和role字段
  return userInfo.id && userInfo.role
}

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  // 避免循环跳转
  if (isNavigating) {
    console.log('🔄 正在跳转中，跳过守卫检查')
    next()
    return
  }

  const userStore = useUserStore()
  
  // 1. 检查维护模式（管理后台和维护页面除外）
  if (!to.path.startsWith('/admin') && to.path !== '/maintenance' && !to.meta.noMaintenanceCheck) {
    try {
      // 从sessionStorage获取缓存的维护状态（避免频繁请求）
      const cached = sessionStorage.getItem('maintenance_status')
      const cacheTime = sessionStorage.getItem('maintenance_check_time')
      const now = Date.now()
      
      let maintenanceEnabled = false
      
      // 如果缓存超过5秒，重新请求（确保维护状态快速更新）
      if (!cached || !cacheTime || now - parseInt(cacheTime) > 5000) {
        const { getPublicConfigs } = await import('@/api/web/systemConfig')
        const configs = await getPublicConfigs()
        maintenanceEnabled = configs['maintenance.enabled'] === 'true'
        
        // 缓存结果
        sessionStorage.setItem('maintenance_status', maintenanceEnabled ? 'true' : 'false')
        sessionStorage.setItem('maintenance_check_time', String(now))
      } else {
        maintenanceEnabled = cached === 'true'
      }
      
      // 如果处于维护模式，跳转到维护页面
      if (maintenanceEnabled) {
        isNavigating = true
        next('/maintenance')
        setTimeout(() => { isNavigating = false }, 500)
        return
      }
    } catch (error) {
      console.error('检查维护状态失败：', error)
      // 如果检查失败，继续正常访问
    }
  }
  
  // 2. 验证登录状态的完整性
  const localToken = localStorage.getItem('token')
  const localUserInfo = localStorage.getItem('userInfo')
  const storeToken = userStore.token
  const storeUserInfo = userStore.userInfo
  
  // 检查localStorage和store的一致性
  let needSync = false
  if (localToken !== storeToken) {
    console.warn('⚠️ Token状态不一致，正在同步')
    needSync = true
  }
  
  // 验证token和userInfo的有效性
  const hasValidToken = isValidToken(localToken) && isValidToken(storeToken)
  const hasValidUserInfo = isValidUserInfo(storeUserInfo)
  const isLogin = hasValidToken && hasValidUserInfo
  const userRole = storeUserInfo?.role || ''
  
  // 状态异常处理
  if (!isLogin && (localToken || localUserInfo)) {
    // 有token或userInfo但验证不通过，清空所有状态
    console.warn('⚠️ 登录状态异常，清空所有登录信息')
    userStore.logout()
  } else if (needSync && hasValidToken) {
    // 需要同步但token有效，重新加载userInfo
    try {
      const userInfoObj = JSON.parse(localUserInfo || '{}')
      if (isValidUserInfo(userInfoObj)) {
        userStore.setToken(localToken)
        userStore.setUserInfo(userInfoObj)
      }
    } catch (e) {
      console.error('同步用户信息失败：', e)
      userStore.logout()
    }
  }

  // 3. 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - ZX AI Learning` : 'ZX AI Learning'

  // 4. 登录页处理
  if (to.path === '/login') {
    if (isLogin) {
      // 已登录，跳转到对应首页
      console.log('=== 路由守卫：访问登录页但已登录 ===')
      console.log('用户角色:', userRole)
      console.log('Store信息:', { 
        hasToken: !!userStore.token, 
        userInfo: userStore.userInfo,
        role: userStore.userInfo?.role 
      })
      
      isNavigating = true
      const targetPath = userRole === 'admin' ? '/admin' : '/web/home'
      console.log('重定向到:', targetPath)
      console.log('================')
      
      next(targetPath)
      setTimeout(() => { isNavigating = false }, 500)
    } else {
      next()
    }
    return
  }

  // 5. 需要认证的页面
  if (to.meta.requireAuth) {
    // 未登录：跳转登录页
    if (!isLogin) {
      console.log('🔒 需要登录才能访问：', to.path)
      // 避免重复提示
      if (from.path !== '/login' && !from.path.startsWith('/login')) {
        ElMessage.warning('请先登录')
      }
      isNavigating = true
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      setTimeout(() => { isNavigating = false }, 500)
      return
    }

    // 已登录：检查角色权限
    const requiredRole = to.meta.role
    if (requiredRole && requiredRole !== userRole) {
      console.warn('⚠️ 权限不足：需要', requiredRole, '当前', userRole)
      ElMessage.error('没有权限访问该页面')
      isNavigating = true
      const fallbackPath = userRole === 'admin' ? '/admin' : '/web/home'
      next(fallbackPath)
      setTimeout(() => { isNavigating = false }, 500)
      return
    }
  }

  // 6. 放行
  next()
})

export default router
