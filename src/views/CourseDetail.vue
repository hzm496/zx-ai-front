<template>
  <div class="course-detail-page">
    <!-- 顶部导航栏 -->
    <AppHeader />

    <!-- 加载中 -->
    <div v-if="loading" class="loading-container">
      <el-icon :size="50" class="is-loading"><Loading /></el-icon>
      <p>加载课程详情中...</p>
    </div>

    <!-- 课程详情 -->
    <div v-else-if="course" class="detail-content">
      <!-- 课程头部信息 -->
      <section class="course-header">
        <div class="header-bg" :style="{ backgroundImage: `url(${course.cover})` }"></div>
        <div class="header-overlay">
          <div class="container">
            <div class="header-info">
              <div class="course-cover">
                <img :src="course.cover" :alt="course.title" />
              </div>
              <div class="course-basic">
                <h1 class="course-title">{{ course.title }}</h1>
                <p class="course-subtitle" v-if="course.subTitle">{{ course.subTitle }}</p>
                
                <div class="course-meta">
                  <el-tag :type="getDifficultyType(course.difficulty)" size="large">
                    {{ course.difficultyName }}
                  </el-tag>
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    {{ course.teacherName }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Folder /></el-icon>
                    {{ course.categoryName }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Clock /></el-icon>
                    {{ formatDuration(course.duration) }}
                  </span>
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    {{ formatNumber(course.buyCount) }}人学习
                  </span>
                </div>

                <div class="course-price-action">
                  <div class="price-section">
                    <span v-if="course.isFree === 1" class="free-tag">免费</span>
                    <template v-else>
                      <span class="current-price">¥{{ course.price }}</span>
                      <span v-if="course.originalPrice && course.originalPrice > course.price" class="original-price">
                        ¥{{ course.originalPrice }}
                      </span>
                    </template> 
                  </div>
                  <div class="action-buttons">
                    <el-button v-if="course.isFree === 1" type="primary" size="large" @click="handleStartLearning">
                      立即学习
                    </el-button>
                    <el-button v-else-if="course.purchased" type="success" size="large" @click="handleStartLearning">
                      继续学习
                    </el-button>
                    <el-button v-else type="danger" size="large" @click="handlePurchase">
                      立即购买
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 课程内容区域 -->
      <section class="course-content-section">
        <div class="container">
          <el-row :gutter="30">
            <!-- 左侧章节列表 -->
            <el-col :span="8">
              <el-card class="chapter-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span><el-icon><Menu /></el-icon> 课程目录</span>
                    <el-tag size="small">共{{ course.chapterCount || 0 }}节</el-tag>
                  </div>
                </template>

                <div class="chapter-list">
                  <!-- 章节列表（扁平） -->
                  <div
                    v-for="(chapter, index) in course.chapters"
                    :key="chapter.id"
                    class="chapter-item-flat"
                    :class="{ 
                      'is-free': chapter.isFree === 1,
                      'active': currentChapter && currentChapter.id === chapter.id
                    }"
                    @click="handleChapterClick(chapter)"
                  >
                    <div class="chapter-info">
                      <span class="chapter-number">{{ index + 1 }}</span>
                      <span class="chapter-title">{{ chapter.title }}</span>
                      <el-tag v-if="chapter.isFree === 1" type="success" size="small" class="preview-tag">
                        试看
                      </el-tag>
                    </div>
                    <div class="chapter-meta">
                      <el-icon><VideoPlay /></el-icon>
                      <span class="duration">{{ chapter.videoDurationFormat || '00:00' }}</span>
                    </div>
                  </div>

                  <!-- 持续更新中提示 -->
                  <div 
                    v-if="course.chapters && course.chapters.length > 0 && course.totalChapterCount && course.chapterCount < course.totalChapterCount" 
                    class="updating-tip"
                  >
                    <el-icon><Clock /></el-icon>
                    <span>持续更新中.....</span>
                  </div>

                  <!-- 无章节提示 -->
                  <el-empty v-if="!course.chapters || course.chapters.length === 0" 
                            description="暂无课程目录" 
                            :image-size="100" />
                </div>
              </el-card>
            </el-col>

            <!-- 右侧课程详情 -->
            <el-col :span="16">
              <!-- 视频播放器 -->
              <el-card class="video-card" shadow="hover" v-if="currentChapter">
                <template #header>
                  <div class="video-header">
                    <span><el-icon><VideoPlay /></el-icon> {{ currentChapter.title }}</span>
                    <el-tag v-if="currentChapter.isFree === 1" type="success" size="small">试看</el-tag>
                  </div>
                </template>
                <div class="video-container">
                  <video 
                    v-if="currentChapter.videoUrl"
                    ref="videoRef"
                    :key="currentChapter.id"
                    :src="currentChapter.videoUrl" 
                    controls 
                    controlslist="nodownload"
                    class="video-player"
                    @play="handleVideoPlay"
                    @pause="handleVideoPause"
                    @ended="handleVideoEnded"
                  >
                    您的浏览器不支持视频播放
                  </video>
                  <div v-else class="no-video">
                    <el-icon :size="60"><VideoCameraFilled /></el-icon>
                    <p>该章节暂无视频</p>
                  </div>
                </div>
              </el-card>

              <!-- 讲师信息 -->
              <el-card class="teacher-card" shadow="hover">
                <template #header>
                  <span><el-icon><User /></el-icon> 讲师介绍</span>
                </template>
                <div class="teacher-info">
                  <el-avatar :size="60" :src="course.teacherAvatar" :icon="User" />
                  <div class="teacher-details">
                    <h3>{{ course.teacherName }}</h3>
                    <p>资深讲师</p>
                  </div>
                </div>
              </el-card>

              <!-- 课程描述 -->
              <el-card class="description-card" shadow="hover">
                <template #header>
                  <span><el-icon><Document /></el-icon> 课程介绍</span>
                </template>
                <div class="course-description">
                  <p>{{ course.description }}</p>
                </div>
              </el-card>

              <!-- 课程大纲 -->
              <el-card v-if="course.outline" class="outline-card" shadow="hover">
                <template #header>
                  <span><el-icon><List /></el-icon> 课程大纲</span>
                </template>
                <div class="course-outline">
                  <pre>{{ course.outline }}</pre>
                </div>
              </el-card>

              <!-- 课程评论 -->
              <CourseComment 
                v-if="course" 
                :courseId="course.id" 
                :showRating="true" 
                :totalComments="course.commentCount || 0"
                @comment-changed="handleCommentChanged"
              />
            </el-col>
          </el-row>
        </div>
      </section>
    </div>

    <!-- 数据为空 -->
    <div v-else class="empty-container">
      <el-empty description="课程不存在" />
      <el-button type="primary" @click="goBack">返回</el-button>
    </div>

    <!-- 购买对话框 -->
    <el-dialog
      v-model="showPurchaseDialog"
      title="购买课程"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="purchase-dialog-content">
        <div class="course-purchase-info">
          <div class="purchase-course-title">{{ course?.title }}</div>
          <div class="purchase-price">
            <span class="price-label">课程原价：</span>
            <span class="original-price-text">¥{{ course?.price }}</span>
          </div>
          <div v-if="discountInfo.discountAmount > 0" class="discount-info">
            <span class="price-label">优惠金额：</span>
            <span class="discount-amount">-¥{{ discountInfo.discountAmount }}</span>
          </div>
          <div class="purchase-price final-price-row">
            <span class="price-label">实付金额：</span>
            <span class="price-value">¥{{ discountInfo.finalPrice || course?.price }}</span>
          </div>
        </div>

        <el-divider />

        <el-form :model="purchaseForm" label-width="100px">
          <el-form-item label="优惠券">
            <CouponSelector
              v-if="course"
              v-model="purchaseForm.couponId"
              :courseId="course.id"
              :coursePrice="course.price"
              @discount-change="handleDiscountChange"
            />
          </el-form-item>
          
          <el-form-item label="支付方式">
            <el-radio-group v-model="purchaseForm.payType">
              <el-radio :label="1" border>
                <span style="display: flex; align-items: center; justify-content: space-between; width: 280px;">
                  <span>余额支付</span>
                  <span v-if="walletInfo" class="wallet-balance">
                    余额：¥{{ walletInfo.balance || 0 }}
                  </span>
                </span>
              </el-radio>
              <el-radio :label="2" border style="margin-top: 12px;">
                支付宝支付
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="支付密码" v-if="purchaseForm.payType === 1">
            <el-input
              v-model="purchaseForm.payPassword"
              type="password"
              placeholder="请输入支付密码"
              show-password
              clearable
            />
            <div class="form-tip">
              提示：余额支付需要输入支付密码
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showPurchaseDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="purchaseLoading"
          @click="handleSubmitPurchase"
        >
          确认支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Loading, 
  User, 
  Clock, 
  Folder,
  Menu,
  VideoPlay,
  Document,
  List
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import CourseComment from '@/components/CourseComment.vue'
import CouponSelector from '@/components/CouponSelector.vue'
import { getCourseDetail } from '@/api/web/course'
import { checkUserHasCourse } from '@/api/web/userCourse'
import { createCourseOrder } from '@/api/web/courseOrder'
import { getWalletInfo } from '@/api/web/wallet'
import { useUserStore } from '@/stores/user'
import { saveLearningRecord, getLearningRecordByChapter, getLearningRecordByCourse } from '@/api/web/learningRecord'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loading = ref(false)
const course = ref(null)
const currentChapter = ref(null)
const videoRef = ref(null)

// 购买相关
const showPurchaseDialog = ref(false)
const purchaseForm = ref({
  payType: 1, // 1-余额支付，2-支付宝支付
  payPassword: '',
  couponId: null // 选中的优惠券ID
})
const purchaseLoading = ref(false)
const walletInfo = ref(null)

// 优惠信息
const discountInfo = ref({
  discountAmount: 0,
  finalPrice: 0,
  couponName: null
})

// 学习记录相关
let progressTimer = null // 定时器，用于定时保存学习进度
const SAVE_INTERVAL = 5000 // 每5秒保存一次进度

// 加载课程详情
const loadCourseDetail = async () => {
  const courseId = route.query.id
  if (!courseId) {
    ElMessage.error('课程ID不存在')
    router.push('/web/home')
    return
  }

  try {
    loading.value = true
    const response = await getCourseDetail(courseId)
    course.value = response
    
    // 如果用户已登录，检查是否已购买该课程
    if (userStore.token) {
      try {
        const checkResult = await checkUserHasCourse(courseId)
        course.value.purchased = checkResult.hasCourse
      } catch (error) {
        console.error('检查课程购买状态失败：', error)
        course.value.purchased = false
      }
    }
  } catch (error) {
    console.error('加载课程详情失败：', error)
    ElMessage.error('加载课程详情失败')
  } finally {
    loading.value = false
  }
}

// 获取难度类型
const getDifficultyType = (difficulty) => {
  const types = {
    1: 'success',
    2: 'primary',
    3: 'warning',
    4: 'danger'
  }
  return types[difficulty] || 'info'
}

// 格式化时长
const formatDuration = (minutes) => {
  if (!minutes) return '0分钟'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`
  }
  return `${mins}分钟`
}

// 格式化数字
const formatNumber = (num) => {
  if (!num) return 0
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num
}

// 检查VIP是否过期
const checkVipExpired = () => {
  const userInfo = userStore.userInfo
  if (!userInfo.isVip) return true
  if (!userInfo.vipExpireTime) return false
  
  const expireDate = new Date(userInfo.vipExpireTime)
  const now = new Date()
  return expireDate < now
}

// 处理章节点击
const handleChapterClick = async (chapter) => {
  // 保存当前章节的学习进度（如果有正在播放的视频）
  if (currentChapter.value && videoRef.value && userStore.token) {
    await saveLearningProgress()
  }
  
  // 如果是试看的，直接播放
  if (chapter.isFree === 1) {
    currentChapter.value = chapter
    ElMessage.success(`播放：${chapter.title}（试看）`)
    // 滚动到视频播放器位置
    setTimeout(() => {
      document.querySelector('.video-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return
  }

  // 检查用户是否已登录
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 已购买课程，直接播放
  if (course.value.purchased) {
    currentChapter.value = chapter
    ElMessage.success(`播放：${chapter.title}`)
    // 滚动到视频播放器位置
    setTimeout(() => {
      document.querySelector('.video-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return
  }
  
  // 检查VIP状态
  const userInfo = userStore.userInfo
  
  // VIP已过期
  if (userInfo.isVip && checkVipExpired()) {
    ElMessageBox.confirm(
      '您的VIP会员已过期，请续费后继续观看课程',
      'VIP已过期',
      {
        confirmButtonText: '立即续费',
        cancelButtonText: '购买此课程',
        distinguishCancelAndClose: true,
        type: 'warning'
      }
    ).then(() => {
      // 续费VIP
      router.push('/web/vip')
    }).catch((action) => {
      if (action === 'cancel') {
        // 购买单个课程
        handlePurchase()
      }
    })
    return
  }

  // VIP有效，可以播放
  if (userStore.isVip) {
    currentChapter.value = chapter
    ElMessage.success(`播放：${chapter.title}`)
    // 滚动到视频播放器位置
    setTimeout(() => {
      document.querySelector('.video-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return
  }

  // 未购买且非VIP，提示购买
  ElMessageBox.confirm(
    '该课程需要购买后才能观看，您可以选择购买课程或开通VIP会员',
    '提示',
    {
      confirmButtonText: '立即购买',
      cancelButtonText: '开通VIP',
      distinguishCancelAndClose: true,
      type: 'warning'
    }
  ).then(() => {
    // 购买课程
    handlePurchase()
  }).catch((action) => {
    if (action === 'cancel') {
      // 开通VIP - 跳转到VIP详情页
      router.push('/web/vip')
    }
  })
}

// 视频播放事件
const handleVideoPlay = () => {
  console.log('视频开始播放')
  startProgressTracking()
}

// 视频暂停事件
const handleVideoPause = () => {
  console.log('视频暂停')
  stopProgressTracking()
  saveLearningProgress() // 暂停时保存进度
}

// 视频播放结束事件
const handleVideoEnded = () => {
  stopProgressTracking()
  saveLearningProgress(true) // 播放结束时保存进度，标记为已完成
  ElMessage.success('视频播放完成')
  // TODO: 可以自动播放下一节
}

// 开始学习
const handleStartLearning = () => {
  if (course.value.chapters && course.value.chapters.length > 0) {
    const firstChapter = course.value.chapters[0]
    handleChapterClick(firstChapter)
  } else {
    ElMessage.warning('课程暂无章节')
  }
}

// 页面初始化时，如果有章节且是试看或已购买，自动加载章节
const initFirstChapter = async () => {
  if (!course.value || !course.value.chapters || course.value.chapters.length === 0) {
    return
  }
  
  // 如果第一节是试看，或者用户已购买/是VIP
  if (course.value.chapters[0].isFree === 1 || course.value.purchased || course.value.isVip) {
    // 如果用户已登录且已购买/是VIP，尝试加载学习记录
    if (userStore.token && (course.value.purchased || course.value.isVip)) {
      try {
        const learningRecord = await getLearningRecordByCourse(course.value.id)
        
        if (learningRecord && learningRecord.chapterId) {
          // 找到上次学习的章节
          const lastChapter = course.value.chapters.find(ch => ch.id === learningRecord.chapterId)
          
          if (lastChapter) {
            console.log('🎯 从学习记录恢复：', lastChapter.title, '进度：', learningRecord.progressPercent + '%')
            
            // 显示欢迎提示
            const progressPercent = learningRecord.progressPercent || 0
            if (progressPercent > 0 && progressPercent < 100) {
              setTimeout(() => {
                ElMessage.success(`欢迎回来！继续学习「${lastChapter.title}」，已完成 ${progressPercent}%`)
              }, 800)
            }
            
            // 设置当前章节（watch 会自动处理进度恢复）
            currentChapter.value = lastChapter
            return
          }
        }
      } catch (error) {
        console.error('获取学习记录失败：', error)
      }
    }
    
    // 没有学习记录或获取失败，加载第一节
    currentChapter.value = course.value.chapters[0]
  }
}

// 处理优惠变化
const handleDiscountChange = (discount) => {
  discountInfo.value = discount
  console.log('优惠信息已更新：', discount)
}

// 购买课程
const handlePurchase = async () => {
  if (!userStore.token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 重置优惠信息
  discountInfo.value = {
    discountAmount: 0,
    finalPrice: course.value.price,
    couponName: null
  }
  purchaseForm.value.couponId = null
  
  // 加载钱包信息
  try {
    walletInfo.value = await getWalletInfo()
  } catch (error) {
    console.error('获取钱包信息失败：', error)
  }
  
  showPurchaseDialog.value = true
}

// 提交购买
const handleSubmitPurchase = async () => {
  if (purchaseForm.value.payType === 1 && !purchaseForm.value.payPassword) {
    ElMessage.warning('请输入支付密码')
    return
  }
  
  try {
    purchaseLoading.value = true
    
    const response = await createCourseOrder({
      courseId: course.value.id,
      payType: purchaseForm.value.payType,
      payPassword: purchaseForm.value.payPassword,
      couponId: purchaseForm.value.couponId // 传递优惠券ID
    })
    
    if (purchaseForm.value.payType === 1) {
      // 余额支付成功
      ElMessage.success('购买成功！')
      showPurchaseDialog.value = false
      // 重新加载课程详情
      await loadCourseDetail()
    } else if (purchaseForm.value.payType === 2) {
      // 支付宝支付
      const { orderNo, courseTitle, payAmount } = response
      
      // 调用支付宝支付
      const payResult = await handleAlipay(orderNo, courseTitle, payAmount)
      
      if (payResult.success) {
        ElMessage.success('支付成功！')
        showPurchaseDialog.value = false
        await loadCourseDetail()
      }
    }
    
  } catch (error) {
  } finally {
    purchaseLoading.value = false
  }
}

// 处理支付宝支付
const handleAlipay = async (orderNo, courseTitle, payAmount) => {
  return new Promise((resolve) => {
    ElMessageBox.confirm(
      `课程：${courseTitle}\n金额：¥${payAmount}\n\n即将跳转到支付宝沙箱支付`,
      '支付宝支付',
      {
        confirmButtonText: '确认支付',
        cancelButtonText: '取消',
        type: 'info'
      }
    ).then(() => {
      // 打开支付宝支付页面（通过Nginx代理访问）
      const payUrl = `/api/web/alipay/course/pay?orderNo=${orderNo}`
      window.open(payUrl, '_blank')
      
      ElMessage.info('请在新窗口中完成支付，支付成功后会自动跳转')
      
      // 关闭购买对话框
      showPurchaseDialog.value = false
      
      // 支付宝会在支付完成后重定向回前端页面
      resolve({ success: false }) // 这里返回false，因为支付还在进行中
    }).catch(() => {
      resolve({ success: false })
    })
  })
}

// 返回
const goBack = () => {
  router.back()
}

// 监听章节变化，确保视频正确加载并自动播放
watch(currentChapter, async (newChapter, oldChapter) => {
  if (newChapter && newChapter.videoUrl) {
    // 等待 DOM 更新
    await nextTick()
    
    // 获取 video 元素并手动加载
    if (videoRef.value) {
      try {
        // 如果用户已登录，查询该章节的学习记录
        let learningProgress = 0
        if (userStore.token) {
          try {
            const record = await getLearningRecordByChapter(course.value.id, newChapter.id)
            if (record && record.progress > 0) {
              learningProgress = record.progress
              console.log(`📖 查询到学习记录：${learningProgress}秒 (${record.progressPercent}%)`)
            }
          } catch (error) {
            console.error('查询学习记录失败：', error)
          }
        }
        
        // 重新加载视频
        videoRef.value.load()
        
        // 监听视频加载完成
        videoRef.value.addEventListener('loadeddata', async () => {
          try {
            // 如果有学习进度，设置进度
            if (learningProgress > 0) {
              videoRef.value.currentTime = learningProgress
              console.log(`✅ 已设置学习进度到：${learningProgress}秒`)
            }
            
            // 尝试自动播放
            await videoRef.value.play()
            console.log('视频自动播放成功')
          } catch (playError) {
            console.warn('视频自动播放失败（可能被浏览器阻止）：', playError)
            ElMessage.info('请点击播放按钮开始观看')
          }
        }, { once: true })
      } catch (error) {
        console.error('视频加载失败：', error)
      }
    }
  }
})

// 处理评论变化事件（只更新评论数量，不刷新整个页面）
const handleCommentChanged = (commentCount) => {
  // 只更新评论数量，不刷新整个页面
  if (course.value && typeof commentCount === 'number') {
    course.value.commentCount = commentCount
  }
  // 评论列表的刷新由 CourseComment 组件内部处理
}

// ==================== 学习记录功能 ====================

// 开始进度跟踪
const startProgressTracking = () => {
  // 清除之前的定时器
  stopProgressTracking()
  
  // 设置新的定时器，每5秒保存一次进度
  progressTimer = setInterval(() => {
    saveLearningProgress()
  }, SAVE_INTERVAL)
}

// 停止进度跟踪
const stopProgressTracking = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

// 保存学习进度
const saveLearningProgress = async (isFinished = false) => {
  if (!userStore.token || !currentChapter.value || !videoRef.value) {
    return
  }
  
  try {
    const progress = Math.floor(videoRef.value.currentTime) // 当前播放进度（秒）
    const duration = Math.floor(videoRef.value.duration) || currentChapter.value.videoDuration // 视频总时长（秒）
    
    if (!duration || progress < 0) {
      return
    }
    
    await saveLearningRecord({
      courseId: course.value.id,
      chapterId: currentChapter.value.id,
      progress: progress,
      duration: duration
    })
    
    console.log(`学习进度已保存：${progress}/${duration}秒`)
  } catch (error) {
    console.error('保存学习进度失败：', error)
  }
}

// 注意：学习进度的恢复已在 watch(currentChapter) 中自动处理，无需单独调用

onMounted(async () => {
  await loadCourseDetail()
  await initFirstChapter()
})

// 组件卸载时清除定时器并保存最后的进度
onBeforeUnmount(() => {
  stopProgressTracking()
  if (userStore.token && currentChapter.value && videoRef.value) {
    saveLearningProgress()
  }
})
</script>

<style scoped>
.course-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ========== 加载状态 ========== */
.loading-container,
.empty-container {
  text-align: center;
  padding: 100px 20px;
  color: #909399;
}

.loading-container .el-icon {
  margin-bottom: 20px;
  color: #667eea;
}

/* ========== 课程头部 ========== */
.course-header {
  position: relative;
  background: #1a1a1a;
  color: white;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  filter: blur(20px);
  opacity: 0.3;
}

.header-overlay {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  padding: 60px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-info {
  display: flex;
  gap: 40px;
}

.course-cover {
  flex-shrink: 0;
}

.course-cover img {
  width: 300px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.course-basic {
  flex: 1;
}

.course-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 10px 0;
  color: white;
}

.course-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 20px 0;
}

.course-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.course-price-action {
  display: flex;
  align-items: center;
  gap: 30px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.free-tag {
  font-size: 32px;
  font-weight: 700;
  color: #67c23a;
}

.current-price {
  font-size: 36px;
  font-weight: 700;
  color: #ff6b6b;
}

.original-price {
  font-size: 18px;
  text-decoration: line-through;
  opacity: 0.7;
}

/* ========== 内容区域 ========== */
.course-content-section {
  padding: 40px 20px;
}

.el-card {
  margin-bottom: 20px;
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ========== 章节列表 ========== */
/* 视频播放器样式 */
.video-card {
  margin-bottom: 20px;
}

.video-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.video-header span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.video-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 宽高比 */
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.3;
}

.no-video .el-icon {
  margin-bottom: 10px;
}

.no-video p {
  margin: 0;
  font-size: 16px;
}

.chapter-card {
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
}

.chapter-card :deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.chapter-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 滚动条样式 */
.chapter-list::-webkit-scrollbar {
  width: 6px;
}

.chapter-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chapter-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.chapter-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.chapter-item-flat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
  background: white;
  position: relative;
}

.chapter-item-flat:hover {
  background: #f5f7fa;
  border-color: #667eea;
  transform: translateX(4px);
}

.chapter-item-flat.is-free {
  background: #f0f9ff;
  border-color: #b3e0ff;
}

.chapter-item-flat.is-free:hover {
  background: #e1f3ff;
  border-color: #667eea;
}

/* 当前播放章节高亮 */
.chapter-item-flat.active {
  background: #ecf5ff;
  border-color: #409eff;
  border-left-width: 3px;
}

.chapter-item-flat.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: #409eff;
  border-radius: 8px 0 0 8px;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.chapter-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 50%;
}

.chapter-item-flat.is-free .chapter-number {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.chapter-title {
  flex: 1;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.preview-tag {
  margin-left: 8px;
}

.chapter-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 13px;
}

.chapter-meta .el-icon {
  font-size: 16px;
}

.duration {
  min-width: 45px;
  text-align: right;
}

/* 更新提示 */
.updating-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
  border-top: 1px dashed #e4e7ed;
}

.updating-tip .el-icon {
  font-size: 16px;
  color: #667eea;
}

/* ========== 讲师信息 ========== */
.teacher-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.teacher-details h3 {
  margin: 0 0 6px 0;
  font-size: 18px;
  color: #333;
}

.teacher-details p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

/* ========== 课程描述 ========== */
.course-description,
.course-outline {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
}

.course-outline pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: inherit;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .header-info {
    flex-direction: column;
    gap: 20px;
  }

  .course-cover img {
    width: 100%;
    max-width: 300px;
  }

  .course-title {
    font-size: 24px;
  }

  .course-price-action {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}

/* 购买对话框样式 */
.purchase-dialog-content {
  padding: 10px 0;
}

.course-purchase-info {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.purchase-course-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.purchase-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.final-price-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #e0e0e0;
}

.price-label {
  font-size: 14px;
  color: #606266;
}

.original-price-text {
  font-size: 16px;
  color: #909399;
}

.discount-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.discount-amount {
  font-size: 18px;
  font-weight: 600;
  color: #67C23A;
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #f56c6c;
}

.wallet-balance {
  font-size: 12px;
  color: #67c23a;
  font-weight: 600;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

:deep(.el-radio) {
  width: 100%;
  margin-right: 0;
}

:deep(.el-radio__label) {
  width: 100%;
}
</style>

