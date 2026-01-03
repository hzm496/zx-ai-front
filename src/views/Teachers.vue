<template>
  <div class="teachers-page">
    <!-- 导航栏 -->
    <AppHeader active-nav="teachers" />

    <!-- 页面标题 -->
    <section class="page-header">
      <div class="container">
        <h1 class="title">名师阵容</h1>
        <p class="subtitle">汇聚业界资深专家，倾力打造精品课程</p>
      </div>
    </section>

    <!-- 名师列表 -->
    <section class="teachers-content">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon :size="40" class="is-loading"><Loading /></el-icon>
          <p>加载名师信息中...</p>
        </div>

        <!-- 名师网格 -->
        <div v-else-if="teachers.length > 0" class="teachers-grid">
          <div class="teacher-card" v-for="teacher in teachers" :key="teacher.id">
            <div class="teacher-avatar">
              <el-avatar 
                :size="120" 
                :src="teacher.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" 
              />
            </div>
            <div class="teacher-info">
              <h3 class="teacher-name">{{ teacher.name }}</h3>
              <div class="teacher-title-wrapper">
                <span class="teacher-title">{{ teacher.title }}</span>
              </div>
              <p class="teacher-intro">{{ teacher.intro }}</p>
              <p class="teacher-experience" v-if="teacher.experience">{{ teacher.experience }}</p>
            </div>
            <div class="teacher-footer">
              <el-button 
                type="primary" 
                @click="goToCourses(teacher.id, teacher.name)"
              >
                查看课程
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <el-empty description="暂无名师信息" />
        </div>

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[8, 12, 16, 20]"
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import * as teacherAPI from '@/api/web/teacher'

const router = useRouter()

// 分页数据
const teachers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)

// 加载名师列表
const loadTeachers = async () => {
  loading.value = true
  try {
    const response = await teacherAPI.getTeacherListByPage(currentPage.value, pageSize.value)
    console.log('📦 分页名师API响应：', response)
    
    // request.js拦截器会识别分页响应，返回完整的 response 对象
    if (response && response.data) {
      teachers.value = Array.isArray(response.data) ? response.data : []
      total.value = response.totalCount || 0
      console.log('✅ 名师列表加载成功，当前页', teachers.value.length, '位讲师，总共', total.value, '位')
    } else {
      teachers.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('❌ 加载名师列表失败：', error)
    ElMessage.error('加载名师列表失败')
    teachers.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadTeachers()
}

// 当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadTeachers()
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 查看讲师课程
const goToCourses = (teacherId, teacherName) => {
  router.push({
    path: '/web/teacher/courses',
    query: { teacherId, teacherName }
  })
}

onMounted(() => {
  loadTeachers()
})
</script>

<style scoped>
.teachers-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面标题 */
.page-header {
  padding: 60px 20px 40px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header .title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 15px;
}

.page-header .subtitle {
  font-size: 18px;
  opacity: 0.9;
}

/* 内容区域 */
.teachers-content {
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

/* 名师网格 */
.teachers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

@media (max-width: 1200px) {
  .teachers-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .teachers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .teachers-grid {
    grid-template-columns: 1fr;
  }
}

/* 名师卡片 */
.teacher-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.teacher-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.teacher-avatar {
  padding: 32px 32px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
}

.teacher-info {
  padding: 0 24px 20px;
  text-align: center;
  flex: 1;
}

.teacher-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.teacher-title-wrapper {
  margin-bottom: 12px;
}

.teacher-title {
  display: inline-block;
  font-size: 13px;
  color: white;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  padding: 6px 20px;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(67, 233, 123, 0.3);
}

.teacher-intro {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.teacher-experience {
  font-size: 12px;
  color: #999;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.teacher-footer {
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.teacher-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #667eea;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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

