import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  // 计算属性
  const isLogin = computed(() => {
    // 必须同时具有token和有效的userInfo
    const hasToken = !!token.value
    const hasUserInfo = userInfo.value && Object.keys(userInfo.value).length > 0
    return hasToken && hasUserInfo
  })
  const userRole = computed(() => userInfo.value.role || '')
  const isAdmin = computed(() => userRole.value === 'admin')
  const isCommonUser = computed(() => userRole.value === 'common_user')
  
  // 实时检查VIP是否过期
  const isVip = computed(() => {
    if (!userInfo.value.isVip) return false
    
    // 如果没有过期时间，认为是永久VIP
    if (!userInfo.value.vipExpireTime) return true
    
    // 检查是否过期
    const expireDate = new Date(userInfo.value.vipExpireTime)
    const now = new Date()
    
    return expireDate > now
  })
  
  // 计算剩余天数
  const vipRemainingDays = computed(() => {
    if (!userInfo.value.isVip || !userInfo.value.vipExpireTime) return 0
    const expireTime = new Date(userInfo.value.vipExpireTime)
    const now = new Date()
    const diffTime = expireTime - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  })
  
  // 是否为年费会员（剩余天数大于365天）
  const isAnnualVip = computed(() => {
    return isVip.value && vipRemainingDays.value > 365
  })

  // 设置 token
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  // 登录
  const login = (loginData) => {
    setToken(loginData.token)
    setUserInfo(loginData)
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = {}
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLogin,
    userRole,
    isAdmin,
    isCommonUser,
    isVip,
    vipRemainingDays,
    isAnnualVip,
    setToken,
    setUserInfo,
    login,
    logout
  }
})

