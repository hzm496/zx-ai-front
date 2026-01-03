/**
 * 认证相关工具函数
 */

/**
 * 获取 token
 */
export const getToken = () => {
  return localStorage.getItem('token')
}

/**
 * 设置 token
 * 注意：建议后端直接返回完整的 "Bearer {token}" 格式
 * 如果后端只返回 token，前端会在请求拦截器中自动添加 "Bearer " 前缀
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token)
  }
}

/**
 * 移除 token
 */
export const removeToken = () => {
  localStorage.removeItem('token')
}

/**
 * 检查 token 是否存在
 */
export const hasToken = () => {
  const token = getToken()
  return !!token
}

/**
 * 检查 token 格式是否正确（应该以 Bearer 开头）
 */
export const isValidTokenFormat = () => {
  const token = getToken()
  if (!token) return false
  return token.startsWith('Bearer ')
}

/**
 * 获取格式化的 token（确保有 Bearer 前缀）
 */
export const getFormattedToken = () => {
  let token = getToken()
  if (!token) return null
  
  // 如果 token 不以 "Bearer " 开头，添加前缀
  if (!token.startsWith('Bearer ')) {
    token = `Bearer ${token}`
  }
  return token
}

/**
 * 调试：打印当前 token 状态
 */
export const debugToken = () => {
  const token = getToken()
  console.log('=== Token 调试信息 ===')
  console.log('Token 存在:', hasToken())
  console.log('Token 格式正确:', isValidTokenFormat())
  if (token) {
    console.log('Token 预览:', token.substring(0, 40) + '...')
    console.log('Token 长度:', token.length)
    console.log('格式化后的 Token:', getFormattedToken()?.substring(0, 40) + '...')
  } else {
    console.log('Token: 未找到')
  }
  console.log('======================')
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  try {
    return userInfoStr ? JSON.parse(userInfoStr) : null
  } catch (error) {
    console.error('解析用户信息失败:', error)
    return null
  }
}

/**
 * 清除所有认证信息
 */
export const clearAuth = () => {
  removeToken()
  localStorage.removeItem('userInfo')
  console.log('✅ 认证信息已清除')
}

