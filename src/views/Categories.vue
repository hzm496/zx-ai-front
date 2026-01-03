<template>
  <div class="categories-page">
    <!-- 导航栏 -->
    <AppHeader active-nav="categories" />

    <!-- 页面头部 -->
    

    <!-- 上下布局内容 -->
    <section class="categories-content">
      <div class="container">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-icon :size="50" class="is-loading"><Loading /></el-icon>
          <p>加载分类中...</p>
        </div>

        <!-- 上下布局 -->
        <div v-else-if="categories.length > 0" class="layout-wrapper">
          <!-- 分类导航盒子（包含两层导航） -->
          <div class="category-nav-box">
            <!-- 第一层导航：父分类 -->
            <div class="category-nav">
              <div 
                v-for="parentCategory in parentCategories"
                :key="parentCategory.id"
                class="nav-tab"
                :class="{ active: currentParentId === parentCategory.id }"
                @click="handleParentCategoryClick(parentCategory)"
              >
                {{ parentCategory.name }}
              </div>
            </div>

            <!-- 第二层导航：免费标签 + 子分类 -->
            <div v-if="currentParentId" class="category-sub-nav">
              <!-- 免费课程标签（始终显示） -->
              <div 
                class="sub-nav-tab free-tab"
                :class="{ active: isFreeFilter }"
                @click="handleFreeFilterClick"
              >
                免费
              </div>
              
              <!-- 子分类标签（如果有子分类） -->
              <div 
                v-for="child in currentChildren"
                :key="child.id"
                class="sub-nav-tab"
                :class="{ active: currentCategoryId === child.id && !isFreeFilter }"
                @click="selectCategory(child.id, child.name)"
              >
                {{ child.name }}
              </div>
            </div>
          </div>

          <!-- 下方课程列表 -->
          <main class="course-main">
            <!-- 当前分类信息 -->
            <div class="current-category-header">
              <h2>{{ currentCategoryName }}</h2>
              <span class="course-total">共 {{ courses.length }} 门课程</span>
            </div>

            <!-- 课程加载状态 -->
            <div v-if="coursesLoading" class="courses-loading">
              <el-icon :size="40" class="is-loading"><Loading /></el-icon>
              <p>加载课程中...</p>
            </div>

            <!-- 课程列表 -->
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
                  </div>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <el-empty v-else description="该分类暂无课程" />

            <!-- 分页 -->
            <div v-if="courses.length > 0 && total > 0" class="pagination-wrapper">
              <el-pagination
                v-model:current-page="pageNo"
                v-model:page-size="pageSize"
                :page-sizes="[12, 24, 36, 48]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                background
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
              />
            </div>
          </main>
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="暂无分类" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Loading, ArrowRight, 
  Monitor, Document, TrendCharts, 
  Cpu, Iphone, Picture,
  Location, SetUp, FolderOpened,
  VideoPlay, User, Reading
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { getCourseCategories, getCoursesByCategory } from '@/api/web/course'

const router = useRouter()
const route = useRoute()

const categories = ref([])
const loading = ref(false)

// 课程相关状态
const courses = ref([])
const coursesLoading = ref(false)
const currentCategoryId = ref(null)
const currentCategoryName = ref('')

// 分页相关状态
const pageNo = ref(1)
const pageSize = ref(6)
const total = ref(0)

// 父分类列表（parent_id = 0）
const parentCategories = ref([])

// 当前选中的父分类ID
const currentParentId = ref(null)

// 当前父分类下的子分类列表
const currentChildren = ref([])

// 是否启用免费课程筛选
const isFreeFilter = ref(false)

// 缓存当前父分类的所有免费课程
const cachedFreeCourses = ref([])

// 获取分类图标
const getCategoryIcon = (categoryName) => {
  const iconMap = {
    'Java': Document,
    'Python': Document,
    'JavaScript': Document,
    'C++': Document,
    '前端开发': Monitor,
    '后端开发': Cpu,
    '移动开发': Iphone,
    '数据分析': TrendCharts,
    '人工智能': Cpu,
    '机器学习': TrendCharts,
    '设计': Picture,
    '产品': Location,
    '运维': SetUp,
    '项目管理': FolderOpened,
  }
  
  // 模糊匹配
  for (const [key, icon] of Object.entries(iconMap)) {
    if (categoryName.includes(key)) {
      return icon
    }
  }
  
  return Document // 默认图标
}


// 计算父分类及其所有子分类的课程总数
const getTotalCourseCount = (parentCategory) => {
  let total = parentCategory.courseCount || 0
  if (parentCategory.children && parentCategory.children.length > 0) {
    parentCategory.children.forEach(child => {
      total += child.courseCount || 0
    })
  }
  return total
}

// 处理父分类点击
const handleParentCategoryClick = (parentCategory) => {
  currentParentId.value = parentCategory.id
  isFreeFilter.value = false // 重置免费筛选
  cachedFreeCourses.value = [] // 清空免费课程缓存
  
  // 如果有子分类，显示子分类导航
  if (parentCategory.children && parentCategory.children.length > 0) {
    currentChildren.value = parentCategory.children
    // 默认选择第一个有课程的子分类
    const firstChild = parentCategory.children.find(child => child.courseCount > 0)
    if (firstChild) {
      selectCategory(firstChild.id, firstChild.name)
    }
  } else {
    // 没有子分类，清空子分类列表，加载父分类的课程
    currentChildren.value = []
    if (parentCategory.courseCount > 0) {
      selectCategory(parentCategory.id, parentCategory.name)
    }
  }
}

// 加载课程分类
const loadCategories = async () => {
  try {
    loading.value = true
    const response = await getCourseCategories()
    console.log('🔍 分类API返回数据:', response)
    console.log('🔍 数据类型:', typeof response)
    console.log('🔍 是否为数组:', Array.isArray(response))
    
    categories.value = response || []
    console.log('🔍 categories.value:', categories.value)
    
    // 提取父分类（parent_id = 0 或 parentId = 0）
    parentCategories.value = categories.value.filter(cat => 
      cat.parentId === 0 || cat.parent_id === 0 || !cat.parentId
    )
    console.log('🔍 父分类列表:', parentCategories.value)
    
    // 默认选择第一个父分类
    if (parentCategories.value.length > 0) {
      const firstParent = parentCategories.value[0]
      console.log('🔍 默认选择第一个父分类:', firstParent.name)
      handleParentCategoryClick(firstParent)
    } else {
      console.log('⚠️ 分类数据为空')
    }
  } catch (error) {
    console.error('❌ 加载分类失败：', error)
    ElMessage.error('加载分类失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 选择分类并加载该分类下的课程
const selectCategory = async (categoryId, categoryName) => {
  isFreeFilter.value = false // 取消免费筛选
  currentCategoryId.value = categoryId
  currentCategoryName.value = categoryName
  pageNo.value = 1 // 重置页码
  await loadCoursesByCategory(categoryId)
}

// 处理免费课程筛选
const handleFreeFilterClick = async () => {
  isFreeFilter.value = true
  currentCategoryId.value = null
  currentCategoryName.value = '免费课程'
  pageNo.value = 1
  
  // 如果已经有缓存，直接使用缓存数据分页
  if (cachedFreeCourses.value.length > 0) {
    const start = (pageNo.value - 1) * pageSize.value
    const end = start + pageSize.value
    courses.value = cachedFreeCourses.value.slice(start, end)
    total.value = cachedFreeCourses.value.length
    return
  }
  
  // 收集需要查询的分类ID列表（父分类 + 所有子分类）
  const categoryIds = [currentParentId.value]
  if (currentChildren.value && currentChildren.value.length > 0) {
    currentChildren.value.forEach(child => {
      categoryIds.push(child.id)
    })
  }
  
  console.log('查询这些分类的免费课程：', categoryIds)
  
  // 向后端发送请求，获取这些分类下的所有免费课程
  try {
    coursesLoading.value = true
    
    // 并发查询所有分类的免费课程
    const promises = categoryIds.map(id => 
      getCoursesByCategory(id, 1, 100, 1).catch(err => {
        console.error(`查询分类${id}的免费课程失败：`, err)
        return { data: [], totalCount: 0 }
      })
    )
    
    const responses = await Promise.all(promises)
    
    // 合并所有结果
    let allFreeCourses = []
    responses.forEach(response => {
      const coursesData = response.data || response.records || []
      allFreeCourses = [...allFreeCourses, ...coursesData]
    })
    
    // 去重（根据课程ID）
    const uniqueCourses = Array.from(
      new Map(allFreeCourses.map(course => [course.id, course])).values()
    )
    
    // 缓存结果
    cachedFreeCourses.value = uniqueCourses
    
    // 分页处理
    const start = (pageNo.value - 1) * pageSize.value
    const end = start + pageSize.value
    courses.value = uniqueCourses.slice(start, end)
    total.value = uniqueCourses.length
    
    console.log(`找到 ${uniqueCourses.length} 门免费课程`)
  } catch (error) {
    console.error('加载免费课程失败：', error)
    ElMessage.error('加载免费课程失败，请稍后重试')
    courses.value = []
    total.value = 0
  } finally {
    coursesLoading.value = false
  }
}

// 加载指定分类下的课程
const loadCoursesByCategory = async (categoryId) => {
  try {
    coursesLoading.value = true
    // 不传 isFree 参数，获取所有课程
    const response = await getCoursesByCategory(categoryId, pageNo.value, pageSize.value, null)
    // 后端返回的数据结构：{ data: [...], pageNo, totalCount, pageSize, totalPage }
    courses.value = response.data || response.records || []
    total.value = response.totalCount || 0
  } catch (error) {
    console.error('加载课程失败：', error)
    ElMessage.error('加载课程失败，请稍后重试')
    courses.value = []
    total.value = 0
  } finally {
    coursesLoading.value = false
  }
}

// 处理分页变化
const handlePageChange = (page) => {
  pageNo.value = page
  if (isFreeFilter.value) {
    // 如果是免费筛选模式，使用缓存数据分页
    const start = (pageNo.value - 1) * pageSize.value
    const end = start + pageSize.value
    courses.value = cachedFreeCourses.value.slice(start, end)
  } else {
    loadCoursesByCategory(currentCategoryId.value)
  }
}

// 处理每页数量变化
const handleSizeChange = (size) => {
  pageSize.value = size
  pageNo.value = 1 // 重置到第一页
  if (isFreeFilter.value) {
    // 如果是免费筛选模式，使用缓存数据重新分页
    const start = 0
    const end = pageSize.value
    courses.value = cachedFreeCourses.value.slice(start, end)
  } else {
    loadCoursesByCategory(currentCategoryId.value)
  }
}

// 跳转到课程详情页
const goToCourseDetail = (courseId) => {
  router.push({
    path: '/web/course/detail',
    query: { id: courseId }
  })
}

onMounted(async () => {
  await loadCategories()
  
  // 检查 URL 中是否有 categoryId 参数（从学习路径等页面跳转过来）
  const categoryIdFromQuery = route.query.categoryId
  if (categoryIdFromQuery && categories.value.length > 0) {
    const categoryId = parseInt(categoryIdFromQuery)
    
    // 在所有分类中查找目标分类
    let targetCategory = null
    let parentCategory = null
    
    for (const parent of categories.value) {
      if (parent.id === categoryId) {
        targetCategory = parent
        break
      }
      if (parent.children && parent.children.length > 0) {
        const child = parent.children.find(c => c.id === categoryId)
        if (child) {
          targetCategory = child
          parentCategory = parent
          break
        }
      }
    }
    
    if (targetCategory) {
      if (parentCategory) {
        // 找到的是子分类，切换到对应的父分类，然后选择该子分类
        currentParentId.value = parentCategory.id
        currentChildren.value = parentCategory.children
        selectCategory(targetCategory.id, targetCategory.name)
      } else {
        // 找到的是父分类
        handleParentCategoryClick(targetCategory)
      }
    }
  }
})
</script>

<style scoped>
.categories-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ========== 页面横幅 ========== */
.page-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.banner-content {
  max-width: 800px;
  margin: 0 auto;
}

.banner-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.banner-subtitle {
  font-size: 20px;
  opacity: 0.95;
  line-height: 1.6;
}

/* ========== 分类内容 ========== */
.categories-content {
  padding: 40px 20px;
  background: #f5f7fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  color: #909399;
}

.loading-container .el-icon {
  color: #667eea;
}

/* ========== 上下布局 ========== */
.layout-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 600px;
}

/* 分类导航盒子（包含两层导航） */
.category-nav-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 16px 20px;
}

/* 第一层导航 */
.category-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

/* 当没有子分类时，不显示分隔线 */
.category-nav:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

/* 第一层导航标签（父分类） */
.nav-tab {
  padding: 8px 20px;
  background: #f5f7fa;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
  white-space: nowrap;
}

.nav-tab:hover {
  background: #ecf5ff;
  color: #409eff;
}

.nav-tab.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

/* 第二层导航 */
.category-sub-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding-top: 16px;
}

/* 第二层导航标签（子分类） */
.sub-nav-tab {
  padding: 6px 16px;
  background: #f5f7fa;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
  white-space: nowrap;
}

.sub-nav-tab:hover {
  background: #ecf5ff;
  color: #409eff;
}

.sub-nav-tab.active {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

/* 免费标签特殊样式 */
.free-tab {
  background: #f0f9ff;
  color: #67c23a;
  border: 1px solid #b3e5b3;
}

.free-tab:hover {
  background: #e1f3d8;
  color: #529b2e;
  border-color: #95d475;
}

.free-tab.active {
  background: #67c23a;
  color: white;
  border-color: #67c23a;
}

/* 课程主区域 */
.course-main {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.current-category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.current-category-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.course-total {
  font-size: 14px;
  color: #909399;
}

.courses-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 20px;
  color: #909399;
}

.courses-loading .el-icon {
  color: #667eea;
}

/* 课程网格 */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
}

.course-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.course-cover {
  position: relative;
  width: 100%;
  padding-top: 60%;
  overflow: hidden;
  cursor: pointer;
}

.course-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.course-card:hover .course-cover img {
  transform: scale(1.05);
}

.course-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  z-index: 1;
}

.tag-free {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.tag-vip {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.course-status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 1;
}

.enrolling-tag {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%) !important;
  border: none !important;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
  }
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  opacity: 0;
  transition: all 0.3s;
}

.course-card:hover .play-overlay {
  opacity: 1;
}

.course-info {
  padding: 16px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.course-title:hover {
  color: #667eea;
}

.course-subtitle {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.meta-item .el-icon {
  font-size: 14px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.course-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price-free {
  font-size: 18px;
  font-weight: 700;
  color: #43e97b;
}

.price-current {
  font-size: 20px;
  font-weight: 700;
  color: #ff6b6b;
}

.price-original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0 10px;
  border-top: 1px solid #f0f0f0;
}

.pagination-wrapper :deep(.el-pagination) {
  font-weight: 500;
}

.pagination-wrapper :deep(.el-pagination.is-background .btn-next),
.pagination-wrapper :deep(.el-pagination.is-background .btn-prev),
.pagination-wrapper :deep(.el-pagination.is-background .el-pager li) {
  border-radius: 6px;
}

.pagination-wrapper :deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.pagination-wrapper :deep(.el-pagination.is-background .el-pager li:not(.is-disabled):hover) {
  color: #667eea;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1200px) {
  .courses-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .banner-title {
    font-size: 32px;
  }
  
  .banner-subtitle {
    font-size: 16px;
  }
  
  .category-nav-box {
    padding: 12px 16px;
  }
  
  .nav-tab {
    font-size: 13px;
    padding: 6px 16px;
  }
  
  .sub-nav-tab {
    font-size: 12px;
    padding: 5px 14px;
  }
  
  .course-main {
    padding: 20px;
  }
  
  .courses-grid {
    grid-template-columns: 1fr;
  }
  
  .current-category-header h2 {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 24px;
  }
  
  .category-nav,
  .category-sub-nav {
    gap: 8px;
  }
  
  .nav-tab,
  .sub-nav-tab {
    font-size: 12px;
  }
}
</style>

