<template>
  <div class="home-page">
    <!-- 导航栏 -->
    <AppHeader active-nav="courses" />

    <!-- 轮播图 -->
    <section class="banner-section">
      <el-carousel height="500px" :interval="4000" arrow="always">
        <el-carousel-item v-for="banner in banners" :key="banner.id">
          <div class="banner-item" :style="{ background: banner.gradient }">
            <div class="banner-content">
              <div class="banner-text">
                <h1 class="banner-title" v-html="banner.title"></h1>
                <p class="banner-subtitle">{{ banner.subtitle }}</p>
                <div class="banner-actions">
                
                    <el-button v-if="banner.buttonText" type="primary" size="large" round @click="handleBannerAction(banner)">
                      {{ banner.buttonText }}
                    </el-button>
   
                </div>  
                <div class="banner-stats">
                  <div class="stat-item" v-for="stat in banner.stats" :key="stat.label">
                    <span class="stat-value">{{ stat.value }}</span>
                    <span class="stat-label">{{ stat.label }}</span>
                  </div>
                </div>
              </div>
              <div class="banner-image">
                <div class="float-card" v-for="(card, index) in banner.floatCards" :key="index" :style="card.style">
                  <el-icon :size="24">
                    <component :is="card.icon" />
                  </el-icon>
                  <span>{{ card.text }}</span>
                </div>
                <div class="main-illustration">{{ banner.emoji }}</div>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 数据统计 -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in platformStats" :key="stat.label">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="32">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 推荐课程 -->
    <section class="courses-section" id="courses">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">精品推荐</h2>
          <p class="section-subtitle">精心挑选的优质课程，助力你的职业发展</p>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="coursesLoading" class="loading-container" style="text-align: center; padding: 60px 0;">
          <el-icon :size="40" class="is-loading"><Loading /></el-icon>
          <p>加载课程中...</p>
        </div>
        
        <!-- 课程列表 -->
        <div v-else-if="recommendCourses.length > 0" class="courses-grid">
          <div class="course-card" v-for="course in recommendCourses" :key="course.id" @click="goToCourse(course.id)">
            <div class="course-image">
              <img :src="course.cover || 'https://via.placeholder.com/400x240/667eea/ffffff?text=Course'" :alt="course.title" />
              <div class="course-tag" v-if="course.isFree === 1">免费</div>
              <div class="course-tag tag-hot" v-else-if="course.buyCount > 5000">热门</div>
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
            </div>
            <div class="course-info">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-desc">{{ course.subTitle || course.description }}</p>
              <div class="course-meta">
                <div class="teacher-info" v-if="course.teacherName">
                  <el-avatar :size="24" :src="course.teacherAvatar || getRandomAvatar('cartoon')" />
                  <span>{{ course.teacherName }}</span>
                </div>
                <div class="course-students">
                  <el-icon><User /></el-icon>
                  <span>{{ course.buyCount }}人学习</span>
                </div>
              </div>
              <div class="course-footer">
                <div class="course-price">
                  <template v-if="course.isFree === 1">
                    <span class="price-free">免费</span>
                  </template>
                  <template v-else>
                    <span class="price-current">¥{{ course.price }}</span>
                    <span class="price-original" v-if="course.originalPrice && course.originalPrice > course.price">¥{{ course.originalPrice }}</span>
                  </template>
                </div>
                <el-button type="primary" size="small">
                  {{ course.isFree === 1 ? '立即学习' : '立即购买' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
          
        <!-- 空状态 -->
        <div v-else class="empty-courses" style="text-align: center; padding: 60px 0;">
          <el-empty description="暂无推荐课程" />
        </div>
      </div>
    </section>

    <!-- 名师介绍 - 跑马灯无缝滚动 -->
    <section class="teachers-section" id="teachers">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">名师阵容</h2>
          <p class="section-subtitle">业界资深专家，倾囊相授</p>
        </div>
        
        <div v-if="teachers.length > 0" class="teachers-marquee-wrapper">
          <div class="teachers-marquee">
            <div class="teachers-marquee-content">
              <!-- 第一组数据 -->
              <div class="teacher-card" v-for="teacher in teachers" :key="'a-' + teacher.id">
                <div class="teacher-avatar">
                  <el-avatar :size="100" :src="teacher.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                </div>
                <h3 class="teacher-name">{{ teacher.name }}</h3>
                <div class="teacher-title-wrapper">
                  <span class="teacher-title">{{ teacher.title }}</span>
                </div>
                <p class="teacher-intro">{{ teacher.intro }}</p>
                
              </div>
              <!-- 第二组数据（复制，实现无缝） -->
              <div class="teacher-card" v-for="teacher in teachers" :key="'b-' + teacher.id">
                <div class="teacher-avatar">
                  <el-avatar :size="100" :src="teacher.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
                </div>
                <h3 class="teacher-name">{{ teacher.name }}</h3>
                <div class="teacher-title-wrapper">
                  <span class="teacher-title">{{ teacher.title }}</span>
                </div>
                <p class="teacher-intro">{{ teacher.intro }}</p>
                
              </div>
            </div>
          </div>
          
          <div class="view-all-btn">
            <el-button type="primary" size="large" @click="goToTeachersList">
              查看全部名师
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        
        <div v-else class="empty-teachers">
          <el-empty description="暂无讲师数据" />
        </div>
      </div>
    </section>

    <!-- 用户评价 -->
    <section class="reviews-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">学员心声</h2>
          <p class="section-subtitle">来自真实学员的反馈</p>
        </div>
        <div class="reviews-carousel">
          <el-carousel height="300px" :autoplay="true" :interval="5000" indicator-position="outside">
            <el-carousel-item v-for="(reviewGroup, index) in reviewGroups" :key="index">
              <div class="reviews-grid">
                <div class="review-card" v-for="review in reviewGroup" :key="review.id">
                  <div class="review-header">
                    <el-avatar :size="50" :src="review.avatar" />
                    <div class="review-user">
                      <h4>{{ review.name }}</h4>
                      <el-rate v-model="review.rating" disabled size="small" />
                    </div>
                  </div>
                  <p class="review-content">{{ review.content }}</p>
                  <div class="review-course">学习课程：{{ review.course }}</div>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
    </section>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于智学AI</h3>
            <p>专注于AI时代的在线教育平台</p>
            <p>让学习更智能，让成长更高效</p>
          </div>
          <div class="footer-section">
            <h3>快速链接</h3>
            <a href="#courses">课程中心</a>
            <a href="#teachers">名师团队</a>
          </div>
          <div class="footer-section">
            <h3>联系我们</h3>
            <p>📧 contact@zxai.com</p>
            <p>📱 400-888-8888</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 ZX AI Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
// import {router} from '@/router'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Reading, 
  Trophy,
  Clock,
  Star,
  VideoPlay,
  Medal,
  TrendCharts,
  ArrowRight,
  Loading,
  User
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import * as teacherAPI from '@/api/web/teacher'
import * as courseAPI from '@/api/web/course'
import * as categoryAPI from '@/api/web/category'
import { cartoonAvatars, getRandomAvatar } from '@/config/avatars'
import router from '@/router'


// 轮播图数据
const banners = ref([
  {
    id: 1,
    title: '开启AI学习之旅<br/>解锁未来无限可能',
    subtitle: '专业导师团队 + 实战项目驱动 + 终身学习社区',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    emoji: '🚀',
    stats: [
      { value: '10万+', label: '学员' },
      { value: '500+', label: '课程' },
      { value: '98%', label: '好评率' }
    ],
    floatCards: [
      { icon: 'Reading', text: 'Python', style: { top: '10%', left: '60%' } },
      { icon: 'TrendCharts', text: 'AI算法', style: { top: '50%', left: '70%' } },
      { icon: 'Trophy', text: '认证证书', style: { bottom: '20%', left: '65%' } }
    ]
  },
  {
    id: 2,
    title: '双十一特惠<br/>全场课程5折起',
    subtitle: '限时优惠，错过再等一年',
    buttonText: '立即抢购',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    emoji: '🎉',
    stats: [
      { value: '5折', label: '最低' },
      { value: '7天', label: '倒计时' },
      { value: '限时', label: '特惠' }
    ],
    floatCards: [
      { icon: 'Star', text: '限时优惠', style: { top: '15%', left: '65%' } },
      { icon: 'Medal', text: '送会员', style: { top: '45%', left: '75%' } },
      { icon: 'Trophy', text: '送好礼', style: { bottom: '25%', left: '60%' } }
    ]
  },
  {
    id: 3,
    title: '零基础到就业<br/>6个月成为AI工程师',
    subtitle: '企业级项目实战 + 1对1就业指导',
    buttonText: '查看名师',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    emoji: '💼',
    stats: [
      { value: '6个月', label: '周期' },
      { value: '12K+', label: '平均薪资' },
      { value: '95%', label: '就业率' }
    ],
    floatCards: [
      { icon: 'VideoPlay', text: '实战项目', style: { top: '20%', left: '62%' } },
      { icon: 'User', text: '1v1辅导', style: { top: '50%', left: '72%' } },
      { icon: 'Trophy', text: '就业推荐', style: { bottom: '18%', left: '67%' } }
    ]
  }
])

// 平台统计数据
const platformStats = ref([
  { icon: 'User', label: '注册学员', value: '100,000+', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { icon: 'Reading', label: '优质课程', value: '500+', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { icon: 'Trophy', label: '学习时长', value: '100万+小时', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { icon: 'Star', label: '好评率', value: '98%', color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

// 热门分类
const categories = ref([])
const categoriesLoading = ref(false)

// 预设的渐变色方案（用于美化分类卡片）
const gradientColors = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
]

// 分类名称对应的图片映射（使用免费图片资源）
const categoryImages = {
  'Python编程': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
  'Python': 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
  'Java编程': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  'Java': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
  '人工智能': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
  'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
  '数据分析': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  '数据科学': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  '前端开发': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
  '前端': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
  'Web开发': 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
  '后端开发': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
  '后端': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
  '移动开发': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
  '移动端': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
  'Android': 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400',
  'iOS': 'https://images.unsplash.com/photo-1621768216002-5ac171876625?w=400',
  '云计算': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
  '云服务': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400',
  '区块链': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
  '数据库': 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400',
  '网络安全': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
  '安全': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
  '大数据': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
  '机器学习': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400',
  '深度学习': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400',
  'UI设计': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
  '设计': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
  '运维': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400',
  'DevOps': 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400',
  '测试': 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
  '默认': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
}

// 加载热门分类
const loadHotCategories = async () => {
  categoriesLoading.value = true
  try {
    const data = await categoryAPI.getHotCategories()
    console.log('📦 热门分类API响应：', data)
    
    if (data && Array.isArray(data)) {
      // 为每个分类添加颜色和图片
      categories.value = data.map((category, index) => ({
        ...category,
        count: category.courseCount,
        color: gradientColors[index % gradientColors.length],
        // 优先使用后端返回的 cover 字段，如果没有则使用映射图片，最后使用默认图片
        image: category.cover || categoryImages[category.name] || categoryImages['默认']
      }))
      console.log('✅ 热门分类加载成功，共', data.length, '个分类')
    } else {
      console.warn('⚠️ 热门分类数据格式不正确')
      categories.value = []
    }
  } catch (error) {
    console.error('❌ 加载热门分类失败：', error)
    ElMessage.error('加载热门分类失败')
    categories.value = []
  } finally {
    categoriesLoading.value = false
  }
}

// 推荐课程
const recommendCourses = ref([])
const coursesLoading = ref(false)

// 加载推荐课程
const loadRecommendCourses = async () => {
  coursesLoading.value = true
  try {
    // 注意：响应拦截器已经返回了 data，所以 res 就是课程数组
    const data = await courseAPI.getRecommendCourses()
    console.log('📦 推荐课程API响应：', data)
    
    if (data && Array.isArray(data)) {
      recommendCourses.value = data
      console.log('✅ 推荐课程加载成功，共', data.length, '门课程')
      console.log('课程详情：', data)
    } else {
      console.warn('⚠️ 推荐课程数据格式不正确')
      recommendCourses.value = []
    }
  } catch (error) {
    console.error('❌ 加载推荐课程失败：', error)
    ElMessage.error('加载推荐课程失败')
    recommendCourses.value = []
  } finally {
    coursesLoading.value = false
  }
}

// 名师团队
const teachers = ref([])

// 加载讲师列表
const loadTeachers = async () => {
  try {
    const response = await teacherAPI.getTeacherList()
    console.log('讲师数据：', response)
    
    if (response && Array.isArray(response)) {
      teachers.value = response
    } else {
      teachers.value = []
    }
  } catch (error) {
    console.error('获取讲师列表失败：', error)
    // 失败时使用空数组，不影响页面其他部分显示
    teachers.value = []
  }
}

// 跳转到讲师课程列表
const goToTeacherCourses = (teacherId, teacherName) => {
  router.push({
    path: '/web/teacher/courses',
    query: { teacherId, teacherName }
  })
}

// 跳转到名师列表页面
const goToTeachersList = () => {
  router.push('/web/teachers')
}

// 从动漫头像列表中随机选择
const getRandomCartoonAvatar = () => {
  const randomIndex = Math.floor(Math.random() * cartoonAvatars.length)
  return cartoonAvatars[randomIndex]
}

// 用户评价（分组显示）
const reviewGroups = ref([
  [
    {
      id: 1,
      name: '小明',
      avatar: getRandomCartoonAvatar(),
      rating: 5,
      content: '课程内容非常实用，老师讲解清晰易懂，项目实战很有帮助！',
      course: 'Python全栈开发'
    },
    {
      id: 2,
      name: '小红',
      avatar: getRandomCartoonAvatar(),
      rating: 5,
      content: '从零基础到现在能独立做项目，感谢智学AI的优质课程！',
      course: 'Vue3实战课程'
    },
    {
      id: 3,
      name: '小刚',
      avatar: getRandomCartoonAvatar(),
      rating: 4,
      content: '学习体验很好，社区氛围也很棒，推荐给大家！',
      course: 'Java微服务'
    }
  ],
  [
    {
      id: 4,
      name: '小丽',
      avatar: getRandomCartoonAvatar(),
      rating: 5,
      content: '老师很负责，答疑及时，课程质量高，值得推荐！',
      course: 'AI机器学习'
    },
    {
      id: 5,
      name: '小华',
      avatar: getRandomCartoonAvatar(),
      rating: 5,
      content: '通过这门课程成功转行，现在已经找到满意的工作了！',
      course: '前端就业班'
    },
    {
      id: 6,
      name: '小芳',
      avatar: getRandomCartoonAvatar(),
      rating: 4,
      content: '内容丰富，项目实战很有价值，学到了很多东西！',
      course: '数据分析'
    }
  ]
])

// 方法
const handleBannerAction = (banner) => {
  if(banner.buttonText=='查看名师'){
    // router.push
    router.push('/web/teachers')
  }else if(banner.buttonText=='立即抢购'){
    router.push('/web/categories')
  }
}

const goToCategory = (categoryId) => {
  // 查找分类名称
  const category = categories.value.find(c => c.id === categoryId)
  router.push({
    path: '/web/category/courses',
    query: { 
      categoryId, 
      categoryName: category?.name || '课程分类' 
    }
  })
}

const goToCourse = (courseId) => {
  router.push({ path: '/web/course/detail', query: { id: courseId } })
}

// 这些方法已移至 AppHeader 组件

// 页面加载时获取数据
onMounted(() => {
  loadHotCategories()
  loadTeachers()
  loadRecommendCourses()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 轮播图 */
.banner-section {
  margin-bottom: 60px;
}

.banner-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.banner-content {
  max-width: 1200px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 60px;
}

.banner-text {
  flex: 1;
  color: #fff;
}

.banner-title {
  font-size: 48px;
  font-weight: 800;
  margin: 0 0 20px 0;
  line-height: 1.3;
}

.banner-subtitle {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.95;
}

.banner-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}

.banner-stats {
  display: flex;
  gap: 48px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
}

.stat-label {
  font-size: 16px;
  opacity: 1;
  color: white;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.banner-image {
  flex: 1;
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-illustration {
  font-size: 200px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.float-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px 20px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  animation: float 4s ease-in-out infinite;
  color: #667eea;
  font-weight: 600;
}

/* 统计数据 */
.stats-section {
  margin: -40px 0 60px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card {
  background: #fff;
  padding: 32px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 20px;
  color: black;
}

/* 通用容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 通用区块标题 */
.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 16px;
  color: #666;
}

/* 分类区块 */
.category-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* 新的现代化分类网格 */
.category-grid-modern {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .category-grid-modern {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .category-grid-modern {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .category-grid-modern {
    grid-template-columns: 1fr;
  }
}

/* 现代化分类卡片 */
.category-card-modern {
  position: relative;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.category-card-modern:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* 背景渐变层 */
.category-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  z-index: 1;
}

/* 卡片内容 */
.category-card-content {
  position: relative;
  padding: 28px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 2;
}

/* 分类图片容器 */
.category-image-wrapper {
  flex-shrink: 0;
  width: 70px;
  height: 70px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
}

.category-card-modern:hover .category-image-wrapper {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.category-card-modern:hover .category-image {
  transform: scale(1.1);
}

/* 分类信息 */
.category-info {
  flex: 1;
  min-width: 0;
}

.category-name-modern {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 统计信息 */
.category-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.category-count-modern {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #7f8c8d;
  font-weight: 500;
}

.category-count-modern .el-icon {
  font-size: 16px;
  color: #667eea;
}

.category-arrow {
  font-size: 18px;
  color: #bdc3c7;
  transition: all 0.3s;
}

.category-card-modern:hover .category-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* 光泽效果 */
.category-card-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  transform: translateX(-100%) translateY(-100%) rotate(45deg);
  transition: all 0.6s;
  pointer-events: none;
}

.category-card-modern:hover .category-card-shine {
  transform: translateX(0) translateY(0) rotate(45deg);
}

/* 课程区块 */
.courses-section {
  padding: 60px 0;
}

.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.course-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.course-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
}

.course-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.course-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255,107,107,0.95);
  color: #fff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.course-tag.tag-hot {
  background: rgba(255, 107, 107, 0.95);
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

.course-info {
  padding: 20px;
}

.course-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 13px;
  color: #666;
}

.teacher-info,
.course-students {
  display: flex;
  align-items: center;
  gap: 6px;
}

.course-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.course-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-current {
  font-size: 20px;
  font-weight: bold;
  color: #ff6b6b;
}

.price-original {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.price-free {
  font-size: 20px;
  font-weight: bold;
  color: #52c41a;
}

/* 学习路径 */
.path-section {
  padding: 60px 0;
  background: #fff;
}

.path-timeline {
  max-width: 800px;
  margin: 0 auto;
}

.path-item {
  display: flex;
  gap: 32px;
  margin-bottom: 48px;
  position: relative;
}

.path-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 24px;
  top: 60px;
  width: 2px;
  height: calc(100% + 28px);
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
}

.path-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
}

.path-content {
  flex: 1;
}

.path-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.path-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.path-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.path-cta {
  text-align: center;
  padding: 60px 40px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border-radius: 24px;
  margin-top: 20px;
}

.path-cta p {
  font-size: 18px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.path-cta .el-button {
  font-size: 16px;
  padding: 16px 40px;
}

/* 名师区块 */
.teachers-section {
  padding: 60px 0;
}

/* 跑马灯容器 */
.teachers-marquee-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 20px 0;
}

.teachers-marquee {
  width: 100%;
  overflow: hidden;
}

.teachers-marquee-content {
  display: flex;
  gap: 24px;
  animation: marquee 40s linear infinite; /* 40秒完成一轮滚动，速度较慢 */
  will-change: transform;
}

/* 鼠标悬停时暂停动画 */
.teachers-marquee:hover .teachers-marquee-content {
  animation-play-state: paused;
}

/* 跑马灯滚动动画 */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%); /* 滚动一半的距离（因为我们复制了一份数据） */
  }
}

.view-all-btn {
  text-align: center;
  margin-top: 30px;
}

.teacher-card {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.3s;
  flex-shrink: 0; /* 防止卡片缩小 */
  width: 280px; /* 固定宽度 */
  min-height: 380px;
  display: flex;
  flex-direction: column;
}

.teacher-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.teacher-avatar {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.teacher-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  text-align: center;
}

.teacher-title-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
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
  transition: all 0.3s;
}

.teacher-title:hover {
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.4);
  transform: translateY(-2px);
}

.teacher-intro {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
  text-align: center;
  line-height: 1.6;
  flex: 1; /* 让intro占据剩余空间 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.teacher-experience {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
  line-height: 1.6;
  text-align: center;
}

.teacher-stats {
  display: flex;
  justify-content: center;
  padding-top: 16px;
  margin-top: auto; /* 自动推到卡片底部 */
  border-top: 1px solid #f0f0f0;
}

.empty-teachers {
  padding: 40px 0;
}

.teacher-stat {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.teacher-stat.clickable {
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.teacher-stat.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.teacher-stat .arrow-icon {
  font-size: 16px;
  transition: transform 0.3s;
}

.teacher-stat.clickable:hover .arrow-icon {
  transform: translateX(4px);
}

.teacher-stat .stat-value {
  font-size: 20px;
  font-weight: 600;
}

.teacher-stat.clickable .stat-value {
  color: white;
}

.teacher-stat .stat-label {
  font-size: 14px;
}

.teacher-stat.clickable .stat-label {
  color: rgba(255, 255, 255, 0.9);
}

/* 用户评价 */
.reviews-section {
  padding: 60px 0;
  background: #fff;
}

.reviews-carousel {
  max-width: 1200px;
  margin: 0 auto;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  padding: 20px;
}

.review-card {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 12px;
}

.review-header {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.review-user h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.review-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
}

.review-course {
  font-size: 12px;
  color: #999;
}

/* 底部 */
.footer {
  background: #2c3e50;
  color: #fff;
  padding: 60px 0 30px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px;
  margin-bottom: 40px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 16px;
}

.footer-section p,
.footer-section a {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 8px;
  display: block;
  text-decoration: none;
}

.footer-section a:hover {
  color: #fff;
}

.footer-bottom {
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.5);
  font-size: 13px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .stats-grid,
  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .teachers-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .reviews-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    text-align: center;
    padding: 40px 20px;
  }
  
  .banner-title {
    font-size: 32px;
  }
  
  .banner-image {
    height: 200px;
  }
  
  .main-illustration {
    font-size: 120px;
  }
  
  .stats-grid,
  .category-grid,
  .teachers-grid,
  .reviews-grid {
    grid-template-columns: 1fr;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>
