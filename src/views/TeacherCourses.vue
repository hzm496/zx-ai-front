<template>
  <div class="teacher-courses-page">
    <!-- 顶部导航栏 -->
    <AppHeader active-nav="teachers" />

    <!-- 页面标题 -->
    <section class="page-header">
      <div class="container">
        <h1 class="title">{{ teacherName }} 的课程</h1>
        <p class="subtitle">共 {{ courses.length }} 门课程</p>
      </div>
    </section>

    <!-- 课程列表 -->
    <section class="courses-section">
      <div class="container">
        <!-- 加载中 -->
        <div v-if="loading" class="loading-container">
          <el-icon :size="40" class="is-loading"><Loading /></el-icon>
          <p>加载课程中...</p>
        </div>

        <!-- 课程卡片 -->
        <div v-else-if="courses.length > 0" class="courses-grid">
          <div class="course-card" v-for="course in courses" :key="course.id">
            <div class="course-cover" @click="goToCourseDetail(course.id)">
              <img :src="course.cover || 'https://via.placeholder.com/300x200'" :alt="course.title" />
              <div class="course-overlay">
                <!-- 免费课程显示免费标签 -->
                <div v-if="course.isFree === 1" class="free-badge">
                  <span class="free-text">免费</span>
                </div>
                <!-- 付费课程显示VIP免费标签 -->
                <div v-else class="vip-badge">
                  <span class="vip-icon">👑</span>
                  <span class="vip-text">VIP免费</span>
                </div>
              </div>
              <!-- 完结状态标签 -->
              <div class="course-status">
                <el-tag 
                  v-if="course.totalChapterCount !== undefined" 
                  :type="!course.chapterCount || course.chapterCount === 0 ? 'danger' : (course.chapterCount >= course.totalChapterCount ? 'success' : 'warning')"
                  :class="{ 'enrolling-tag': !course.chapterCount || course.chapterCount === 0 }"
                  size="small"
                  effect="dark"
                >
                  <template v-if="!course.chapterCount || course.chapterCount === 0">
                    🔥 报名中
                  </template>
                  <template v-else>
                    {{ course.chapterCount >= course.totalChapterCount ? '已完结' : '更新中' }}
                  </template>
                </el-tag>
              </div>
            </div>
            <div class="course-content">
              <h3 class="course-title" @click="goToCourseDetail(course.id)">{{ course.title }}</h3>
              <p class="course-subtitle" v-if="course.subTitle">{{ course.subTitle }}</p>
              <p class="course-description">{{ course.description }}</p>
              
              <div class="course-meta">
                <div class="meta-item">
                  <el-tag size="small" :type="getDifficultyType(course.difficulty)">
                    {{ course.difficultyName }}
                  </el-tag>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatDuration(course.duration) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ formatNumber(course.buyCount) }}人学习</span>
                </div>
              </div>

              <div class="course-footer">
                <div class="course-price">
                  <span v-if="course.isFree === 1" class="free-tag">免费</span>
                  <template v-else>
                    <span class="current-price">¥{{ course.price }}</span>
                    <span v-if="course.originalPrice && course.originalPrice > course.price" class="original-price">
                      ¥{{ course.originalPrice }}
                    </span>
                  </template>
                </div>
                <el-button 
                  v-if="course.isFree === 1" 
                  type="success" 
                  size="default"
                  @click="goToCourseDetail(course.id)"
                >
                  立即学习
                </el-button>
                <el-button 
                  v-else 
                  type="danger" 
                  size="default"
                  @click="goToCourseDetail(course.id)"
                >
                  立即购买
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else class="empty-container">
          <el-empty description="该讲师暂无课程" />
          <el-button type="primary" @click="goHome" style="margin-top: 20px">返回首页</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, Clock, User, ArrowRight } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import * as courseAPI from '@/api/web/course'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const courses = ref([])
const teacherName = ref('')

// 加载课程列表
const loadCourses = async () => {
  const teacherId = route.query.teacherId
  teacherName.value = route.query.teacherName || '讲师'
  
  if (!teacherId) {
    ElMessage.error('讲师ID不存在')
    router.push('/web/home')
    return
  }

  try {
    loading.value = true
    const response = await courseAPI.getCoursesByTeacherId(teacherId)
    console.log('课程数据：', response)
    
    if (response && Array.isArray(response)) {
      courses.value = response
    } else {
      courses.value = []
    }
  } catch (error) {
    console.error('获取课程列表失败：', error)
    ElMessage.error('获取课程列表失败')
    courses.value = []
  } finally {
    loading.value = false
  }
}

// 获取难度类型
const getDifficultyType = (difficulty) => {
  const typeMap = {
    1: 'success',
    2: 'info',
    3: 'warning',
    4: 'danger'
  }
  return typeMap[difficulty] || 'info'
}

// 格式化时长
const formatDuration = (minutes) => {
  if (!minutes) return '0分钟'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num
}

// 跳转到课程详情
const goToCourseDetail = (courseId) => {
  router.push({ path: '/web/course/detail', query: { id: courseId } })
}

// 返回首页
const goHome = () => {
  router.push('/web/home')
}

onMounted(() => {
  loadCourses()
})
</script>

<style scoped>
.teacher-courses-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 页面标题 */
.page-header {
  padding: 60px 20px 40px;
  text-align: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header .title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-header .subtitle {
  font-size: 18px;
  color: #666;
}

/* 课程区域 */
.courses-section {
  padding: 40px 20px 80px;
}

.loading-container {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.loading-container p {
  margin-top: 20px;
  font-size: 16px;
}

.empty-container {
  padding: 80px 20px;
  text-align: center;
}

/* 课程网格 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 30px;
}

/* 课程卡片 */
.course-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.3);
}

.course-cover {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.course-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.course-card:hover .course-cover img {
  transform: scale(1.1);
}

.course-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.course-status {
  position: absolute;
  bottom: 12px;
  left: 12px;
}

/* 报名中标签动画 */
.enrolling-tag {
  animation: pulse-fire 1.5s ease-in-out infinite;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8c42 100%) !important;
  border: none !important;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
}

@keyframes pulse-fire {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.6);
  }
}

.free-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

.free-text {
  letter-spacing: 1px;
}

.vip-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 165, 0, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

.vip-icon {
  font-size: 16px;
  animation: rotate 3s linear infinite;
}

.vip-text {
  letter-spacing: 1px;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(255, 165, 0, 0.4);
  }
  50% {
    box-shadow: 0 6px 16px rgba(255, 165, 0, 0.6);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(15deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.course-content {
  padding: 20px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: pointer;
  transition: color 0.3s;
}

.course-title:hover {
  color: #667eea;
}

.course-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0 0 12px 0;
}

.course-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 14px;
}

.meta-item .el-icon {
  font-size: 16px;
}

.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.course-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.free-tag {
  font-size: 20px;
  font-weight: 600;
  color: #67c23a;
}

.current-price {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* 响应式 */
@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }

  .page-header .title {
    font-size: 32px;
  }
}
</style>

