<template>
  <div class="about-page">
    <!-- 导航栏 -->
    <AppHeader active-nav="about" />

    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <h1 class="hero-title animate-fade-in">
          <span class="gradient-text">智学AI伴侣</span>
        </h1>
        <p class="hero-subtitle animate-slide-up">
          打造智能化在线教育平台，让学习更简单、更高效
        </p>
        <div class="hero-stats animate-slide-up-delayed">
          <div class="stat-item">
            <div class="stat-number">10万+</div>
            <div class="stat-label">注册学员</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">1000+</div>
            <div class="stat-label">精品课程</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">500+</div>
            <div class="stat-label">名师讲师</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">98%</div>
            <div class="stat-label">学员满意度</div>
          </div>
        </div>
      </div>
      <div class="scroll-indicator">
        <el-icon :size="32"><ArrowDown /></el-icon>
      </div>
    </section>

    <!-- 公司简介 -->
    <section class="intro-section">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <h2 class="section-title">关于我们</h2>
          <div class="title-underline"></div>
        </div>
        <div class="intro-content">
          <div class="intro-text animate-on-scroll" style="animation-delay: 0.2s">
            <p class="intro-paragraph">
              智学AI伴侣成立于2023年，是一家致力于将人工智能技术与在线教育深度融合的创新型企业。
              我们相信，科技的力量能够让教育变得更加公平、高效和个性化。
            </p>
            <p class="intro-paragraph">
              通过先进的AI算法和大数据分析，我们为每一位学员提供个性化的学习路径，
              帮助他们在最短的时间内掌握所需技能，实现职业发展和个人成长的双重目标。
            </p>
            <p class="intro-paragraph">
              我们汇聚了来自全球顶尖高校和知名企业的专家讲师，打造了涵盖技术、设计、商业、语言等
              多个领域的优质课程体系，致力于成为每个人终身学习的最佳伴侣。
            </p>
          </div>
          <div class="intro-image animate-on-scroll" style="animation-delay: 0.4s">
            <div class="image-card">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600" alt="团队协作" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 愿景使命 -->
    <section class="vision-section">
      <div class="container">
        <div class="vision-grid">
          <div class="vision-card vision-card-1 animate-on-scroll">
            <div class="vision-icon">
              <el-icon :size="48"><Star /></el-icon>
            </div>
            <h3 class="vision-title">我们的愿景</h3>
            <p class="vision-text">
              成为全球领先的AI驱动在线教育平台，让优质教育触手可及，
              让每个人都能通过学习改变命运，实现梦想。
            </p>
          </div>
          <div class="vision-card vision-card-2 animate-on-scroll" style="animation-delay: 0.2s">
            <div class="vision-icon">
              <el-icon :size="48"><Trophy /></el-icon>
            </div>
            <h3 class="vision-title">我们的使命</h3>
            <p class="vision-text">
              用科技赋能教育，用数据驱动学习，为每一位学员提供个性化、
              智能化的学习体验，助力他们在职场和人生道路上持续成长。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 核心价值观 -->
    <section class="values-section">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <h2 class="section-title">核心价值观</h2>
          <div class="title-underline"></div>
        </div>
        <div class="values-grid">
          <div class="value-card animate-on-scroll" v-for="(value, index) in values" :key="index" :style="{ 'animation-delay': `${index * 0.1}s` }">
            <div class="value-number">{{ index + 1 }}</div>
            <div class="value-icon" :style="{ background: value.color }">
              <component :is="value.icon" style="width: 32px; height: 32px; color: white;" />
            </div>
            <h3 class="value-title">{{ value.title }}</h3>
            <p class="value-desc">{{ value.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 发展历程 -->
    <section class="timeline-section">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <h2 class="section-title">发展历程</h2>
          <div class="title-underline"></div>
        </div>
        <div class="timeline">
          <div class="timeline-item animate-on-scroll" v-for="(item, index) in timeline" :key="index" :style="{ 'animation-delay': `${index * 0.15}s` }">
            <div class="timeline-dot"></div>
            <div class="timeline-card">
              <div class="timeline-year">{{ item.year }}</div>
              <h3 class="timeline-title">{{ item.title }}</h3>
              <p class="timeline-desc">{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 团队介绍 -->
    <section class="team-section">
      <div class="container">
        <div class="section-header animate-on-scroll">
          <h2 class="section-title">核心团队</h2>
          <div class="title-underline"></div>
          <p class="section-subtitle">汇聚行业精英，共同推动教育变革</p>
        </div>
        <div class="team-grid">
          <div class="team-card animate-on-scroll" v-for="(member, index) in team" :key="index" :style="{ 'animation-delay': `${index * 0.1}s` }">
            <div class="team-avatar">
              <img :src="member.avatar" :alt="member.name" />
              <div class="team-overlay">
                <div class="team-social">
                  <el-icon :size="20"><Message /></el-icon>
                </div>
              </div>
            </div>
            <h3 class="team-name">{{ member.name }}</h3>
            <p class="team-position">{{ member.position }}</p>
            <p class="team-desc">{{ member.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我们 -->
    <section class="contact-section">
      <div class="container">
        <div class="contact-content animate-on-scroll">
          <div class="contact-info">
            <h2 class="contact-title">联系我们</h2>
            <p class="contact-subtitle">有任何问题或建议，欢迎随时与我们联系</p>
            <div class="contact-items">
              <div class="contact-item">
                <el-icon :size="24" class="contact-icon"><Location /></el-icon>
                <div class="contact-detail">
                  <div class="contact-label">公司地址</div>
                  <div class="contact-value">福建省厦门市集美区厦门理工学院</div>
                </div>
              </div>
              <div class="contact-item">
                <el-icon :size="24" class="contact-icon"><Phone /></el-icon>
                <div class="contact-detail">
                  <div class="contact-label">联系电话</div>
                  <div class="contact-value">400-123-4567</div>
                </div>
              </div>
              <div class="contact-item">
                <el-icon :size="24" class="contact-icon"><Message /></el-icon>
                <div class="contact-detail">
                  <div class="contact-label">电子邮箱</div>
                  <div class="contact-value">18150930872@163.com</div>
                </div>
              </div>
              <div class="contact-item">
                <el-icon :size="24" class="contact-icon"><Clock /></el-icon>
                <div class="contact-detail">
                  <div class="contact-label">工作时间</div>
                  <div class="contact-value">周一至周五 9:00-18:00</div>
                </div>
              </div>
            </div>
          </div>
          <div class="contact-form-wrapper">
            <el-form :model="contactForm" class="contact-form" label-position="top">
              <el-form-item label="姓名:">
                <el-input v-model="contactForm.username" placeholder="请输入您的姓名" size="large" />
              </el-form-item>
              <el-form-item label="邮箱📫:">
                <el-input v-model="contactForm.email" type="email" placeholder="请输入您的邮箱" size="large" />
              </el-form-item>
              <el-form-item label="手机号📱:">
                <el-input v-model="contactForm.phone" placeholder="请输入您的手机号（选填）" size="large" />
              </el-form-item>
              <el-form-item label="留言:">
                <el-input 
                  v-model="contactForm.content" 
                  type="textarea" 
                  :rows="4"
                  placeholder="请输入您的留言内容"
                  size="large"
                />
              </el-form-item>
              <el-button 
                type="primary" 
                size="large" 
                class="submit-btn" 
                @click="handleSubmit"
                :loading="submitting"
              >
                发送消息
              </el-button>
            </el-form>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Star,
  Trophy,
  ArrowDown,
  Location,
  Phone,
  Message,
  Clock,
  Promotion,
  MagicStick,
  Medal,
  TrendCharts
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { getRandomAvatar } from '@/config/avatars'
import * as feedbackAPI from '@/api/web/feedback'

// 数字计数动画
const animateNumber = (element, start, end, duration) => {
  let startTimestamp = null
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp
    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
    const value = Math.floor(progress * (end - start) + start)
    element.textContent = value >= 10000 ? `${Math.floor(value / 10000)}万+` : `${value}+`
    if (progress < 1) {
      window.requestAnimationFrame(step)
    }
  }
  window.requestAnimationFrame(step)
}

// 滚动动画
const observeElements = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          
          // 如果是统计数字，触发计数动画
          if (entry.target.classList.contains('stat-number')) {
            const text = entry.target.textContent
            const numbers = text.match(/\d+/)
            if (numbers) {
              const targetNumber = parseInt(numbers[0]) * (text.includes('万') ? 10000 : 1)
              animateNumber(entry.target, 0, targetNumber, 2000)
            }
          }
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  )

  // 观察所有需要动画的元素
  const elements = document.querySelectorAll('.animate-on-scroll, .stat-number')
  elements.forEach((el) => observer.observe(el))

  return observer
}

let observer = null

onMounted(() => {
  // 延迟一点执行，确保DOM已渲染
  setTimeout(() => {
    observer = observeElements()
  }, 100)
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
  }
})

// 核心价值观
const values = [
  {
    title: '学员至上',
    desc: '始终将学员需求放在首位，提供最优质的学习体验和服务',
    icon: Star,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    title: '创新驱动',
    desc: '持续探索AI技术在教育领域的应用，引领行业创新发展',
    icon: MagicStick,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    title: '追求卓越',
    desc: '对品质精益求精，打造行业标杆级的课程内容和平台服务',
    icon: Trophy,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    title: '开放共享',
    desc: '拥抱开放合作，与合作伙伴共同构建教育生态圈',
    icon: Promotion,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  {
    title: '诚信负责',
    desc: '以诚信为本，对学员、讲师和合作伙伴负责',
    icon: Medal,
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    title: '持续成长',
    desc: '与学员和团队共同成长，在变化中不断进步',
    icon: TrendCharts,
    color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
  }
]

// 发展历程
const timeline = [
  {
    year: '2023.01',
    title: '公司成立',
    desc: '智学AI伴侣正式成立，开始探索AI+教育的创新模式'
  },
  {
    year: '2023.09',
    title: '智能升级',
    desc: '引入AI学习助手，实现个性化学习路径推荐，课程数突破500门'
  },
  {
    year: '2023.12',
    title: '重要里程碑',
    desc: '注册学员突破10万，成为行业领先的在线教育平台'
  },
  {
    year: '2024',
    title: '未来展望',
    desc: '持续优化平台功能，打造更智能、更高效的学习体验'
  }
]

// 团队成员
const team = [
  {
    name: '黄志明',
    position: '创始人 & CEO',
    desc: '清华大学计算机系，前Google高级工程师，10年AI研发经验',
    avatar: getRandomAvatar('cartoon')
  },
  {
    name: '李雅婷',
    position: '联合创始人 & CTO',
    desc: '斯坦福大学博士，AI教育领域专家，曾任职于Facebook',
    avatar: getRandomAvatar('cartoon')
  },
  {
    name: '王建国',
    position: 'CPO 产品总监',
    desc: '10年互联网产品经验，曾负责知名在线教育平台产品规划',
    avatar: getRandomAvatar('cartoon')
  },
  {
    name: '陈思思',
    position: '教研总监',
    desc: '北京师范大学教育学博士，15年教育行业从业经验',
    avatar: getRandomAvatar('cartoon')
  }
]

// 联系表单
const contactForm = ref({
  username: '',
  email: '',
  phone: '',
  content: ''
})

const submitting = ref(false)

const handleSubmit = async () => {
  // 验证必填项
  if (!contactForm.value.username || !contactForm.value.email || !contactForm.value.content) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  // 验证邮箱格式
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(contactForm.value.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }
  
  try {
    submitting.value = true
    await feedbackAPI.submitFeedback(contactForm.value)
    ElMessage.success('感谢您的反馈，我们会尽快与您联系！')
    // 清空表单
    contactForm.value = { username: '', email: '', phone: '', content: '' }
  } catch (error) {
    console.error('提交反馈失败：', error)
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ========== 英雄区域 ========== */
.hero-section {
  position: relative;
  height: 70vh;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
  padding: 0 20px;
}

.hero-title {
  font-size: 72px;
  font-weight: 800;
  margin-bottom: 24px;
  letter-spacing: -2px;
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
}

.hero-subtitle {
  font-size: 24px;
  margin-bottom: 60px;
  opacity: 0.95;
}

.hero-stats {
  display: flex;
  gap: 60px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 16px;
  opacity: 0.9;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  animation: bounce 2s infinite;
  cursor: pointer;
}

@keyframes bounce {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(10px);
  }
}

/* 动画 */
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

.animate-slide-up {
  animation: slideUp 1s ease-out 0.3s both;
}

.animate-slide-up-delayed {
  animation: slideUp 1s ease-out 0.6s both;
}

/* 滚动触发动画 */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 数字动画 */
.stat-number {
  animation: countUp 2s ease-out;
}

@keyframes countUp {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========== 通用样式 ========== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-title {
  font-size: 42px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

.title-underline {
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  margin: 0 auto;
  border-radius: 2px;
}

.section-subtitle {
  font-size: 18px;
  color: #666;
  margin-top: 16px;
}

/* ========== 公司简介 ========== */
.intro-section {
  padding: 100px 20px;
  background: white;
}

.intro-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.intro-paragraph {
  font-size: 16px;
  line-height: 2;
  color: #555;
  margin-bottom: 20px;
  text-indent: 2em;
}

.intro-image {
  position: relative;
}

.image-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  transform: rotate(2deg);
  transition: transform 0.3s;
}

.image-card:hover {
  transform: rotate(0deg) scale(1.05);
}

.image-card img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
}

/* ========== 愿景使命 ========== */
.vision-section {
  padding: 100px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.vision-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
}

.vision-card {
  background: white;
  padding: 50px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.vision-card:hover {
  transform: translateY(-10px);
}

.vision-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 24px;
}

.vision-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.vision-text {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
}

/* ========== 核心价值观 ========== */
.values-section {
  padding: 100px 20px;
  background: white;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
}

.value-card {
  position: relative;
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border: 2px solid transparent;
}

.value-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.value-number {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 48px;
  font-weight: 700;
  color: #f0f0f0;
}

.value-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.value-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

.value-desc {
  font-size: 15px;
  line-height: 1.6;
  color: #666;
}

/* ========== 发展历程 ========== */
.timeline-section {
  padding: 100px 20px;
  background: #f5f7fa;
}

.timeline {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 80px;
  height: 2px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.timeline-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 10px;
}

.timeline-dot {
  position: absolute;
  top: 71px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
  z-index: 1;
  transition: all 0.3s;
}

.timeline-item:hover .timeline-dot {
  width: 24px;
  height: 24px;
  top: 69px;
  background: #764ba2;
}

.timeline-card {
  background: white;
  padding: 24px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  text-align: center;
  width: 100%;
  margin-top: 120px;
}

.timeline-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.timeline-year {
  display: inline-block;
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
}

.timeline-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.timeline-desc {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
}

/* ========== 团队介绍 ========== */
.team-section {
  padding: 100px 20px;
  background: white;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.team-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  text-align: center;
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.team-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
}

.team-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.team-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.team-card:hover .team-overlay {
  opacity: 1;
}

.team-social {
  color: white;
  cursor: pointer;
}

.team-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.team-position {
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
  margin-bottom: 12px;
}

.team-desc {
  font-size: 13px;
  line-height: 1.6;
  color: #666;
}

/* ========== 联系我们 ========== */
.contact-section {
  padding: 100px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  background: white;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.contact-title {
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
}

.contact-subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

.contact-items {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.contact-icon {
  color: #667eea;
  flex-shrink: 0;
}

.contact-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 4px;
}

.contact-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.contact-form-wrapper {
  background: #f9fafb;
  padding: 40px;
  border-radius: 12px;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
}

/* 响应式 */
@media (max-width: 1024px) {
  .intro-content,
  .vision-grid,
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .timeline {
    flex-direction: column;
    gap: 40px;
  }
  
  .timeline::before {
    left: 20px;
    right: auto;
    top: 0;
    bottom: 0;
    width: 2px;
    height: auto;
  }
  
  .timeline-item {
    padding-left: 60px;
  }
  
  .timeline-dot {
    left: 20px;
    top: 20px;
    transform: translateX(-50%);
  }
  
  .timeline-card {
    margin-top: 0;
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 60vh;
    min-height: 500px;
  }
  
  .hero-title {
    font-size: 48px;
  }
  
  .hero-subtitle {
    font-size: 18px;
  }
  
  .hero-stats {
    gap: 30px;
  }
  
  .stat-number {
    font-size: 32px;
  }
  
  .section-title {
    font-size: 32px;
  }
  
  .values-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }
}
</style>

