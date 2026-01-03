import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { getToken } from './auth'
import { useUserStore } from '@/stores/user'

// 是否为开发环境
const isDev = import.meta.env.DEV

// 防止重复跳转到登录页
let isRedirectingToLogin = false

// 创建两个 axios 实例，分别对应不同的后端服务
const createRequest = (baseURL) => {
  const service = axios.create({
    baseURL,
    timeout: 30000,
    withCredentials: false
  })

  // 请求拦截器
  service.interceptors.request.use(
    config => {
      // 从 localStorage 获取 token
      let token = getToken()
      if (token) {
        // 确保 token 格式为 "Bearer {token}"
        // 如果后端返回的 token 已经包含 "Bearer "，则直接使用
        // 如果没有，则添加 "Bearer " 前缀
        if (!token.startsWith('Bearer ')) {
          token = `Bearer ${token}`
        }
        config.headers['Authorization'] = token
        if (isDev) {
          console.log('✅ 请求携带 Token:', token.substring(0, 30) + '...')
        }
      } else {
        if (isDev) {
          console.warn('⚠️ 未找到 Token')
        }
      }
      if (isDev) {
        console.log('📤 发送请求:', config.method.toUpperCase(), config.url)
      }
      return config
    },
    error => {
      console.error('❌ 请求错误：', error)
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  service.interceptors.response.use(
    response => {
      const res = response.data
      if (isDev) {
        console.log('📥 收到响应:', response.config.url)
        console.log('响应数据:', res)
      }
      
      // 如果返回的状态码不是 200，则认为是错误
      if (res.success === false) {
        const errorCode = res.errorCode
        
        // 处理认证相关错误 (401)
        if (errorCode === '401' || errorCode === 401 || errorCode === 'TOKEN_INVALID') {
          if (!isRedirectingToLogin) {
            isRedirectingToLogin = true
            ElMessage.error(res.message || '未登录或登录已过期')
            console.warn('⚠️ Token 失效，跳转登录页')
            
            // 使用userStore清空状态
            const userStore = useUserStore()
            userStore.logout()
            
            // 立即跳转到登录页，使用replace避免返回
            router.replace({
              path: '/login',
              query: { redirect: router.currentRoute.value.fullPath }
            }).then(() => {
              // 跳转完成后重置标志
              setTimeout(() => {
                isRedirectingToLogin = false
              }, 500)
            })
          }
          return Promise.reject(new Error(res.message || '未登录'))
        }
        
        // 处理权限相关错误 (403)
        if (errorCode === '403' || errorCode === 403) {
          ElMessage.error(res.message || '权限不足')
          return Promise.reject(new Error(res.message || '权限不足'))
        }
        
        // 处理其他错误
        ElMessage.error(res.message || '请求失败')
        return Promise.reject(new Error(res.message || '请求失败'))
      }
      
      // 判断是否为分页响应（包含 totalCount 字段）
      if (res.totalCount !== undefined) {
        // 分页响应，返回完整对象（包含 data, totalCount, pageNo 等）
        return res
      }
      
      // 普通响应，返回 data 字段
      return res.data
    },
    error => {
      console.error('❌ 响应错误：', error)
      console.error('错误详情:', error.response)
      
      // 处理 HTTP 错误状态码
      if (error.response) {
        const status = error.response.status
        const data = error.response.data
        
        console.error(`HTTP ${status} 错误:`, data)
        console.error('完整错误响应:', error.response)
        
        switch (status) {
          case 401:
            if (!isRedirectingToLogin) {
              isRedirectingToLogin = true
              ElMessage.error('未授权，请重新登录')
              const userStore = useUserStore()
              userStore.logout()
              router.replace({
                path: '/login',
                query: { redirect: router.currentRoute.value.fullPath }
              }).then(() => {
                setTimeout(() => {
                  isRedirectingToLogin = false
                }, 500)
              })
            }
            break
          case 403:
            ElMessage.error('拒绝访问，权限不足')
            break
          case 404:
            ElMessage.error('请求错误，未找到该资源')
            break
          case 500:
            ElMessage.error(data?.message || '服务器错误')
            break
          default:
            ElMessage.error(data?.message || `请求失败 (${status})`)
        }
      } else if (error.request) {
        // 请求已发送但没有收到响应
        console.error('未收到服务器响应:', error.request)
        ElMessage.error('网络错误，请检查网络连接')
      } else {
        // 请求配置出错
        console.error('请求配置错误:', error.message)
        ElMessage.error('请求配置错误')
      }
      
      return Promise.reject(error)
    }
  )

  return service
}

// Web 端服务 (8081)
export const webRequest = createRequest('/api/web')

// Admin 端服务 (8082)
export const adminRequest = createRequest('/api/admin')

// 默认导出 web 端
export default webRequest

