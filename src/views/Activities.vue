<template>
  <div class="activities-page">
    <!-- 顶部导航 -->
    <AppHeader active-nav="activities" />

    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <h1>🎁 限时活动</h1>
        <p>免费领取会员、优惠券，更多福利等你来拿</p>
      </div>
    </section>

    <!-- 活动列表 -->
    <section class="activities-section">
      <div class="container">
        <div v-loading="loading" class="activities-content">
          <!-- 无活动提示 -->
          <el-empty v-if="!loading && activities.length === 0" description="暂无活动">
            <el-button type="primary" @click="$router.push('/web/home')">返回首页</el-button>
          </el-empty>

          <!-- 活动卡片 -->
          <div v-else class="activities-grid">
            <el-card
              v-for="activity in activities"
              :key="activity.id"
              class="activity-card"
              shadow="hover"
            >
              <!-- 活动封面 -->
              <div class="activity-cover">
                <el-image
                  :src="activity.coverImage || 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800'"
                  fit="cover"
                />
                <div class="activity-type-badge">
                  <el-tag :type="activity.type === 1 ? 'success' : 'warning'" effect="dark" size="large">
                    {{ activity.typeName }}
                  </el-tag>
                </div>
              </div>

              <!-- 活动内容 -->
              <div class="activity-content">
                <h3 class="activity-title">{{ activity.title }}</h3>
                <p class="activity-description">{{ activity.description }}</p>

                <!-- 奖励信息 -->
                <div class="reward-info">
                  <div v-if="activity.type === 1" class="reward-vip">
                    <el-icon size="30" color="#67c23a"><Medal /></el-icon>
                    <div class="reward-text">
                      <span class="reward-label">赠送</span>
                      <span class="reward-value">{{ activity.vipDurationName }}会员</span>
                    </div>
                  </div>
                  <div v-else-if="activity.type === 2" class="reward-coupon">
                    <el-icon size="30" color="#e6a23c"><Ticket /></el-icon>
                    <div class="reward-text">
                      <span class="reward-label">赠送</span>
                      <span class="reward-value">¥{{ activity.couponAmount }} 优惠券</span>
                      <span class="reward-tip">满{{ activity.couponMinAmount }}可用，{{ activity.couponExpireDays }}天有效</span>
                    </div>
                  </div>
                </div>

                <!-- 活动时间 -->
                <div class="activity-time">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatDate(activity.startTime) }} - {{ formatDate(activity.endTime) }}</span>
                </div>

                <!-- 领取进度 -->
                <div class="activity-progress">
                  <span>已领取：{{ activity.receiveCount }}</span>
                  <span v-if="activity.totalLimit > 0"> / {{ activity.totalLimit }}</span>
                  <span v-if="activity.limitPerUser > 0" class="limit-tip">
                    （每人限{{ activity.limitPerUser }}次）
                  </span>
                </div>
              </div>

              <!-- 领取按钮（移到卡片底部） -->
              <div class="activity-footer">
                <el-button
                  type="primary"
                  size="large"
                  class="receive-btn"
                  :disabled="isActivityDisabled(activity)"
                  @click="handleReceive(activity)"
                >
                  <template v-if="activity.hasReceived">
                    已领取
                  </template>
                  <template v-else-if="isActivityExpired(activity)">
                    {{ getCannotReceiveReason(activity) }}
                  </template>
                  <template v-else>
                    立即领取
                  </template>
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, Medal, Ticket } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import { getAvailableActivities, receiveActivity } from '@/api/web/activity'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const activities = ref([])

// 加载活动列表
const loadActivities = async () => {
  try {
    loading.value = true
    const response = await getAvailableActivities()
    activities.value = response || []
  } catch (error) {
    console.error('加载活动列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 领取活动
const handleReceive = async (activity) => {
  // 检查登录
  if (!userStore.token) {
    ElMessage.warning('请先登录后再领取活动奖励')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认领取「${activity.title}」吗？`,
      '提示',
      {
        confirmButtonText: '确认领取',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    const response = await receiveActivity(activity.id)
    ElMessage.success(response || '领取成功')
    
    // 重新加载活动列表
    await loadActivities()
    
    // 刷新用户信息（因为可能获得了VIP）
    if (activity.type === 1) {
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('领取失败：', error)
    }
  }
}

// 判断按钮是否应该禁用（只有硬性条件才禁用）
const isActivityDisabled = (activity) => {
  // 已领取
  if (activity.hasReceived) return true
  
  const now = new Date()
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)
  
  // 活动未开始或已结束
  if (now < startTime || now > endTime) return true
  
  // 活动已领完
  if (activity.totalLimit > 0 && activity.receiveCount >= activity.totalLimit) return true
  
  // 用户已达领取上限（需要登录后才知道）
  if (userStore.token && activity.userReceiveCount >= activity.limitPerUser) return true
  
  return false
}

// 判断活动是否过期或不可领取
const isActivityExpired = (activity) => {
  if (activity.hasReceived) return false
  
  const now = new Date()
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)
  
  if (now < startTime) return true
  if (now > endTime) return true
  if (activity.totalLimit > 0 && activity.receiveCount >= activity.totalLimit) return true
  if (userStore.token && activity.userReceiveCount >= activity.limitPerUser) return true
  
  return false
}

// 获取不能领取的原因
const getCannotReceiveReason = (activity) => {
  const now = new Date()
  const startTime = new Date(activity.startTime)
  const endTime = new Date(activity.endTime)
  
  if (now < startTime) return '活动未开始'
  if (now > endTime) return '活动已结束'
  if (activity.totalLimit > 0 && activity.receiveCount >= activity.totalLimit) {
    return '已领完'
  }
  if (activity.userReceiveCount >= activity.limitPerUser) {
    return '已达领取上限'
  }
  return '暂不可领取'
}

// 格式化日期
const formatDate = (dateTime) => {
  if (!dateTime) return ''
  return dateTime.split(' ')[0]
}

onMounted(() => {
  loadActivities()
})
</script>

<style scoped>
.activities-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.page-header h1 {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 15px 0;
}

.page-header p {
  font-size: 18px;
  opacity: 0.9;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* 活动区域 */
.activities-section {
  padding: 40px 20px;
}

.activities-content {
  min-height: 400px;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

.activity-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.activity-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0;
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.activity-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.activity-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.activity-type-badge {
  position: absolute;
  top: 15px;
  right: 15px;
}

.activity-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #303133;
}

.activity-description {
  font-size: 14px;
  color: #606266;
  margin: 0 0 20px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.reward-info {
  background: linear-gradient(135deg, #f5f7fa 0%, #ecf5ff 100%);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

.reward-vip,
.reward-coupon {
  display: flex;
  align-items: center;
  gap: 15px;
}

.reward-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.reward-label {
  font-size: 13px;
  color: #909399;
}

.reward-value {
  font-size: 22px;
  font-weight: 700;
  color: #409eff;
}

.reward-tip {
  font-size: 12px;
  color: #909399;
}

.activity-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 10px;
}

.activity-progress {
  font-size: 13px;
  color: #606266;
  margin-bottom: 0;
  flex: 1;
}

.limit-tip {
  color: #909399;
}

.activity-footer {
  padding: 0 20px 20px 20px;
  background: white;
}

.receive-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}
</style>

