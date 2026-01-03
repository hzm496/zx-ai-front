<template>
  <div class="maintenance-page">
    <div class="maintenance-container">
      <div class="maintenance-icon">
        <el-icon :size="120" color="#909399"><Tools /></el-icon>
      </div>
      
      <h1 class="maintenance-title">{{ maintenanceConfig.title || '系统维护中' }}</h1>
      
      <p class="maintenance-message">
        {{ maintenanceConfig.message || '系统正在升级维护，给您带来不便敬请谅解！' }}
      </p>
      
      <div v-if="maintenanceConfig.endTime" class="maintenance-time">
        <el-icon><Clock /></el-icon>
        <span>预计恢复时间：{{ maintenanceConfig.endTime }}</span>
      </div>
      
      <div class="maintenance-actions">
        <el-button type="primary" size="large" @click="checkStatus">
          <el-icon><Refresh /></el-icon>
          刷新状态
        </el-button>
      
      </div>
      
      <div class="maintenance-footer">
        <p>{{ websiteName }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Tools, Clock, Refresh } from '@element-plus/icons-vue'
import { getPublicConfigs } from '@/api/web/systemConfig'

const router = useRouter()

const websiteName = ref('智学AI在线教育平台')
const maintenanceConfig = ref({
  title: '系统维护中',
  message: '系统正在升级维护，给您带来不便敬请谅解！',
  endTime: ''
})

let autoCheckTimer = null

// 加载维护配置
const loadMaintenanceConfig = async () => {
  try {
    const configs = await getPublicConfigs()
    
    websiteName.value = configs['website.name'] || '智学AI在线教育平台'
    maintenanceConfig.value = {
      title: configs['maintenance.title'] || '系统维护中',
      message: configs['maintenance.message'] || '系统正在升级维护，给您带来不便敬请谅解！',
      endTime: configs['maintenance.end_time'] || ''
    }
  } catch (error) {
    console.error('加载维护配置失败：', error)
  }
}

// 自动检查维护状态（静默模式）
const autoCheckStatus = async () => {
  try {
    // 清除sessionStorage中的缓存，强制重新获取最新状态
    sessionStorage.removeItem('maintenance_status')
    sessionStorage.removeItem('maintenance_check_time')
    
    const configs = await getPublicConfigs()
    const maintenanceEnabled = configs['maintenance.enabled'] === 'true'
    
    if (!maintenanceEnabled) {
      // 停止自动检查
      if (autoCheckTimer) {
        clearInterval(autoCheckTimer)
      }
      
      ElMessage.success('系统已恢复正常，即将跳转...')
      setTimeout(() => {
        router.push('/web/home')
      }, 1000)
    }
  } catch (error) {
    console.error('自动检查状态失败：', error)
  }
}

// 手动检查维护状态
const checkStatus = async () => {
  try {
    // 清除sessionStorage中的缓存
    sessionStorage.removeItem('maintenance_status')
    sessionStorage.removeItem('maintenance_check_time')
    
    const configs = await getPublicConfigs()
    const maintenanceEnabled = configs['maintenance.enabled'] === 'true'
    
    if (!maintenanceEnabled) {
      ElMessage.success('系统已恢复正常，即将跳转...')
      setTimeout(() => {
        router.push('/web/home')
      }, 1000)
    } else {
      ElMessage.info('系统仍在维护中，请稍后再试')
    }
  } catch (error) {
    console.error('检查状态失败：', error)
    ElMessage.error('检查失败')
  }
}

// 跳转到管理后台
const goToAdmin = () => {
  router.push('/admin')
}

onMounted(() => {
  loadMaintenanceConfig()
  
  // 启动自动检查（每10秒检查一次）
  autoCheckTimer = setInterval(() => {
    autoCheckStatus()
  }, 10000)
  
  // 立即执行一次检查
  setTimeout(() => {
    autoCheckStatus()
  }, 5000)
})

onUnmounted(() => {
  // 清理定时器
  if (autoCheckTimer) {
    clearInterval(autoCheckTimer)
  }
})
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.maintenance-container {
  max-width: 600px;
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.maintenance-icon {
  margin-bottom: 30px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.maintenance-title {
  font-size: 32px;
  color: #303133;
  margin: 0 0 20px 0;
  font-weight: 600;
}

.maintenance-message {
  font-size: 16px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 30px 0;
}

.maintenance-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #909399;
  margin-bottom: 40px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.maintenance-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 40px;
}

.maintenance-footer {
  padding-top: 30px;
  border-top: 1px solid #e4e7ed;
  font-size: 14px;
  color: #909399;
}

.maintenance-footer p {
  margin: 0;
}
</style>


