<template>
  <div class="category-courses-page">
    <!-- 导航栏 -->
    <AppHeader active-nav="courses" />

    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/web/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ categoryName || '课程分类' }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <h1 class="category-title">{{ categoryName }}</h1>
        <p class="category-desc">共找到 {{ total }} 门课程</p>
      </div>
    </section>

    <!-- 课程列表 -->
    <section class="courses-content">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon :size="40" class="is-loading"><Loading /></el-icon>
          <p>加载课程中...</p>
        </div>

        <!-- 课程网格 -->
        <div v-else-if="courses.length > 0" class="courses-grid">
          <div class="course-card" v-for="course in courses" :key="course.id">
            <div class="course-cover" @click="goToCourseDetail(course.id)">
              <img :src="course.cover || 'https://via.placeholder.com/400x240/667eea/ffffff?text=Course'" :alt="course.title" />
              <!-- 免费/VIP标签 -->
              <div class="course-tag tag-free" v-if="course.isFree === 1">免费</div>
              <div class="course-tag tag-vip" v-else>VIP免费</div>
              <!-- 完结状态 -->
              <div class="course-status-tag" v-if="course.totalChapterCount !== undefined">
                <el-tag 
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
              <!-- 播放按钮 -->
              <div class="play-overlay">
                <el-icon :size="50"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="course-info">
              <h3 class="course-title" @click="goToCourseDetail(course.id)">{{ course.title }}</h3>
              <p class="course-subtitle">{{ course.subTitle || course.description }}</p>
              
              <!-- 课程元信息 -->
              <div class="course-meta">
                <div class="meta-item">
                  <el-icon><User /></el-icon>
                  <span>{{ course.teacherName || '讲师' }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatDuration(course.duration) }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Reading /></el-icon>
                  <span>{{ course.buyCount }}人学习</span>
                </div>
              </div>

              <!-- 课程底部 -->
              <div class="course-footer">
                <div class="course-price">
                  <template v-if="course.isFree === 1">
                    <span class="price-free">免费</span>
                  </template>
                  <template v-else>
                    <span class="price-current">¥{{ course.price }}</span>
                    <span class="price-original" v-if="course.originalPrice && course.originalPrice > course.price">
                      ¥{{ course.originalPrice }}
                    </span>
                  </template>
                </div>
                <el-button 
                  type="primary" 
                  size="default"
                  @click="handleCourseAction(course)"
                >
                  {{ course.isFree === 1 ? '立即学习' : '立即购买' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="该分类下暂无课程">
            <el-button type="primary" @click="$router.push('/web/home')">返回首页</el-button>
          </el-empty>
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[12, 24, 36, 48]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Loading, 
  VideoPlay, 
  User, 
  Clock, 
  Reading 
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import * as courseAPI from '@/api/web/course'

const router = useRouter()
const route = useRoute()

// 分类信息
const categoryId = ref(null)
const categoryName = ref('')

// 课程列表数据
const courses = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 格式化课程时长
const formatDuration = (seconds) => {
  if (!seconds) return '未知'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}

// 加载课程列表
const loadCourses = async () => {
  if (!categoryId.value) {
    ElMessage.warning('缺少分类信息')
    return
  }

  loading.value = true
  try {
    const response = await courseAPI.getCoursesByCategory(categoryId.value, currentPage.value, pageSize.value)
    console.log('📦 分类课程API响应：', response)
    
    if (response && response.data) {
      courses.value = Array.isArray(response.data) ? response.data : []
      total.value = response.totalCount || 0
      console.log('✅ 课程列表加载成功，当前页', courses.value.length, '门课程，总共', total.value, '门')
    } else {
      courses.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('❌ 加载课程列表失败：', error)
    ElMessage.error('加载课程列表失败')
    courses.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadCourses()
}

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadCourses()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转到课程详情
const goToCourseDetail = (courseId) => {
  router.push({ path: '/web/course/detail', query: { id: courseId } })
}

// 处理课程操作（学习/购买）
const handleCourseAction = (course) => {
  if (course.isFree === 1) {
    // 免费课程，直接学习
    ElMessage.success(`开始学习：${course.title}（待实现）`)
    // router.push(`/web/course/${course.id}/learn`)
  } else {
    // 付费课程，跳转购买
    ElMessage.info(`购买课程：${course.title}（待实现订单功能）`)
    // router.push(`/web/course/${course.id}/buy`)
  }
}

// 页面初始化
onMounted(() => {
  categoryId.value = route.query.categoryId
  categoryName.value = route.query.categoryName || '课程分类'
  
  if (categoryId.value) {
    loadCourses()
  } else {
    ElMessage.error('缺少分类ID参数')
  }
})
</script>

<style scoped>
.category-courses-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  padding: 40px 20px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  margin-bottom: 20px;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
}

.breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: white;
}

.breadcrumb :deep(.el-breadcrumb__separator) {
  color: rgba(255, 255, 255, 0.6);
}

.category-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 10px 0;
}

.category-desc {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* 内容区域 */
.courses-content {
  padding: 60px 20px;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.loading-container .el-icon {
  margin-bottom: 16px;
}

/* 课程网格 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .courses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .courses-grid {
    grid-template-columns: 1fr;
  }
}

/* 课程卡片 */
.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 课程封面 */
.course-cover {
  position: relative;
  width: 100%;
  height: 220px;
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

/* 课程标签 */
.course-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  z-index: 2;
}

.tag-free {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.tag-vip {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.course-status-tag {
  position: absolute;
  bottom: 12px;
  left: 12px;
  z-index: 2;
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

/* 播放按钮 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.course-card:hover .play-overlay {
  opacity: 1;
}

.play-overlay .el-icon {
  color: white;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  padding: 20px;
}

/* 课程信息 */
.course-info {
  padding: 20px;
}

.course-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

.course-title:hover {
  color: #667eea;
}

.course-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.6;
}

/* 元信息 */
.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.meta-item .el-icon {
  font-size: 14px;
  color: #999;
}

/* 课程底部 */
.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.course-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-free {
  font-size: 20px;
  font-weight: 700;
  color: #43e97b;
}

.price-current {
  font-size: 24px;
  font-weight: 700;
  color: #f5576c;
}

.price-original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 40px;
}

.pagination-wrapper :deep(.el-pagination) {
  font-weight: 500;
}
</style>

