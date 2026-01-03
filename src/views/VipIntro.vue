<template>
  <div class="vip-intro-page">
    <!-- 顶部导航栏 -->
    <AppHeader active-nav="vip" />

    <div class="vip-content">
      <!-- VIP标题区域 -->
      <section class="vip-hero">
        <div class="container">
          <h1 class="hero-title">
            <el-icon class="crown-icon"><StarFilled /></el-icon>
            开通VIP会员
          </h1>
          <p class="hero-subtitle">畅享全站所有课程，学习无限制</p>
        </div>
      </section>

    

      

      <!-- 套餐选择 -->
      <section class="vip-packages">
        <div class="container">
          <h2 class="section-title">选择套餐</h2>
          <el-row :gutter="30" justify="center">
            <el-col 
              :span="7" 
              v-for="pkg in packages" 
              :key="pkg.id"
            >
              <el-card 
                class="package-card"
                :class="{ 'recommended': pkg.recommended, 'selected': selectedPackage === pkg.id }"
                shadow="hover"
                @click="selectPackage(pkg)"
              >
                <div v-if="pkg.recommended" class="recommend-badge">推荐</div>
                <h3 class="package-name">{{ pkg.name }}</h3>
                <div class="package-price">
                  <span class="price">¥{{ pkg.price }}</span>
                  <span class="original-price">¥{{ pkg.originalPrice }}</span>
                </div>
                <p class="package-desc">{{ pkg.description }}</p>
                <div class="package-duration">{{ pkg.duration }}天</div>
              </el-card>
            </el-col>
          </el-row>


      

          <div class="action-area">
            <el-button 
              type="primary" 
              size="large"
              :disabled="!selectedPackage"
              :loading="purchasing"
              @click="handlePurchase"
            >
              {{ isVip ? '立即续费' : '立即开通' }}
            </el-button>
          </div>
        </div>
      </section>


          <!-- 会员对比 -->
          <section class="vip-comparison">
        <div class="container">
          <h2 class="section-title">开通会员 · 尽享特权</h2>
          <div class="comparison-table">
            <el-table :data="comparisonData" style="width: 100%" :show-header="true" class="dark-table">
              <el-table-column prop="feature" label="功能特权" min-width="200" align="left">
                <template #default="{ row }">
                  <div class="feature-cell">
                    <el-icon :size="20" :color="row.iconColor">
                      <component :is="row.icon" />
                    </el-icon>
                    <span>{{ row.feature }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="普通用户" width="150" align="center">
                <template #default="{ row }">
                  <span v-if="row.normal === true" class="status-icon success">
                    <el-icon :size="24"><CircleCheck /></el-icon>
                  </span>
                  <span v-else-if="row.normal === false" class="status-icon error">
                    <el-icon :size="24"><CircleClose /></el-icon>
                  </span>
                  <span v-else class="status-text">{{ row.normal }}</span>
                </template>
              </el-table-column>
              <el-table-column label="VIP会员" width="150" align="center">
                <template #default="{ row }">
                  <span v-if="row.vip === true" class="status-icon success gold">
                    <el-icon :size="24"><CircleCheck /></el-icon>
                  </span>
                  <span v-else-if="row.vip === false" class="status-icon error">
                    <el-icon :size="24"><CircleClose /></el-icon>
                  </span>
                  <span v-else class="status-text gold">{{ row.vip }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="vip-faq">
        <div class="container">
          <h2 class="section-title">常见问题</h2>
          <el-collapse accordion>
            <el-collapse-item title="1. VIP会员有什么权益？" name="1">
              <p>VIP会员可以免费观看平台所有课程，无需单独购买。同时享有优先客服支持。</p>
            </el-collapse-item>
            <el-collapse-item title="2. 开通VIP后如何使用？" name="2">
              <p>开通成功后，您可以直接观看所有付费课程，无需任何额外操作。</p>
            </el-collapse-item>
            <el-collapse-item title="3. VIP到期后会自动续费吗？" name="3">
              <p>不会自动续费，到期后需要手动续费。</p>
            </el-collapse-item>
            <el-collapse-item title="4. 可以退款吗？" name="4">
              <p>VIP会员开通后不支持退款，请谨慎购买。</p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </section>
    </div>

    <!-- VIP支付对话框 -->
    <VipPaymentDialog 
      v-if="showPaymentDialog"
      v-model="showPaymentDialog"
      :order="currentOrder"
      @payment-success="handlePaymentSuccess"
    />

    <!-- 开通钱包对话框 -->
    <ActivateWalletDialog
      v-if="showActivateWalletDialog"
      v-model="showActivateWalletDialog"
      @activate-success="handleWalletActivated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  StarFilled,
  VideoPlay,
  Download,
  Service,
  Trophy,
  CircleCheck,
  CircleClose,
  Film,
  Clock,
  ChatDotRound,
  Medal
} from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import VipPaymentDialog from '@/components/VipPaymentDialog.vue'
import ActivateWalletDialog from '@/components/ActivateWalletDialog.vue'
import { getVipPackages, createVipOrder, getVipStatus } from '@/api/web/vip'
import { getWalletInfo } from '@/api/web/wallet'
import { getUserInfo } from '@/api/web/user'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 会员权益 - 使用 markRaw 避免图标组件被响应式包装
const benefits = ref([
  {
    icon: markRaw(VideoPlay),
    color: '#409eff',
    title: '无限观看',
    desc: '畅享全站所有课程'
  },
  {
    icon: markRaw(Download),
    color: '#67c23a',
    title: '离线下载',
    desc: '支持课程离线观看'
  },
  {
    icon: markRaw(Service),
    color: '#e6a23c',
    title: '优先客服',
    desc: '专属客服优先响应'
  },
  {
    icon: markRaw(Trophy),
    color: '#f56c6c',
    title: '专属标识',
    desc: '尊贵VIP身份标识'
  }
])

// 会员对比数据
const comparisonData = ref([
  {
    icon: markRaw(Film),
    iconColor: '#409eff',
    feature: '课程观看',
    normal: '免费课程',
    vip: '全站课程'
  },
  {
    icon: markRaw(VideoPlay),
    iconColor: '#67c23a',
    feature: '视频清晰度',
    normal: '标清',
    vip: '超清/蓝光'
  },
  {
    icon: markRaw(Download),
    iconColor: '#e6a23c',
    feature: '离线下载',
    normal: false,
    vip: true
  },
  {
    icon: markRaw(Clock),
    iconColor: '#f56c6c',
    feature: '学习记录',
    normal: true,
    vip: true
  },
  {
    icon: markRaw(ChatDotRound),
    iconColor: '#909399',
    feature: '客服优先级',
    normal: '普通',
    vip: '优先响应'
  },
  {
    icon: markRaw(Medal),
    iconColor: '#ffd700',
    feature: '专属身份标识',
    normal: false,
    vip: true
  }
])

// 套餐列表
const packages = ref([])
const selectedPackage = ref(null)
const purchasing = ref(false)
const isVip = ref(false)

// 对话框
const showPaymentDialog = ref(false)
const showActivateWalletDialog = ref(false)
const currentOrder = ref(null)

// 加载套餐列表
const loadPackages = async () => {
  try {
    const response = await getVipPackages()
    packages.value = response || []  // request.js已经返回res.data，所以直接使用response
    
    // 自动标记推荐套餐（第2个套餐，即季卡）
    if (packages.value.length >= 2) {
      packages.value[1].recommended = true
    }
    
    // 默认选中推荐套餐（或第一个套餐）
    const recommendedPkg = packages.value.find(p => p.recommended)
    if (recommendedPkg) {
      selectedPackage.value = recommendedPkg.id
    } else if (packages.value.length > 0) {
      selectedPackage.value = packages.value[0].id
    }
  } catch (error) {
    // 错误信息已由 request.js 统一处理
    console.error('加载套餐失败：', error)
  }
}

// 加载VIP状态
const loadVipStatus = async () => {
  if (!userStore.token) return
  
  try {
    const response = await getVipStatus()
    isVip.value = response?.isVip || false  // request.js已经返回res.data
  } catch (error) {
    console.error('获取VIP状态失败：', error)
  }
}

// 选择套餐
const selectPackage = (pkg) => {
  selectedPackage.value = pkg.id
}

// 购买VIP
const handlePurchase = async () => {
  // 检查登录
  if (!userStore.token) {
    ElMessage.warning('请先登录后再开通VIP会员')
    router.push({
      path: '/login',
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  // 检查钱包
  try {
    const wallet = await getWalletInfo()  // request.js已经返回res.data
    
    if (!wallet || wallet.isActivated === 0) {
      // 钱包未开通，提示开通
      ElMessage.warning('请先开通钱包')
      showActivateWalletDialog.value = true
      return
    }
  } catch (error) {
    // 错误信息已由 request.js 统一处理
    console.error('获取钱包信息失败：', error)
    return
  }

  // 获取选中的套餐信息
  const selectedPkg = packages.value.find(p => p.id === selectedPackage.value)
  if (!selectedPkg) {
    ElMessage.error('请选择套餐')
    return
  }

  // 直接打开支付对话框，传递套餐信息而不是订单
  currentOrder.value = {
    packageType: selectedPkg.id, // 使用id作为packageType
    packageName: selectedPkg.name,
    duration: selectedPkg.duration,
    price: selectedPkg.price
  }
  showPaymentDialog.value = true
}

// 钱包开通成功
const handleWalletActivated = () => {
  ElMessage.success('钱包开通成功，请继续购买VIP')
  // 重新尝试购买
  setTimeout(() => {
    handlePurchase()
  }, 500)
}

// 支付成功
const handlePaymentSuccess = async () => {
  ElMessage.success('恭喜您成为VIP会员！')
  
  // 刷新用户信息
  try {
    const userInfoData = await getUserInfo()
    userStore.setUserInfo(userInfoData)
  } catch (error) {
    console.error('刷新用户信息失败：', error)
  }
  
  // 重新加载VIP状态
  await loadVipStatus()
}

// 检查支付宝支付返回结果
const checkPaymentResult = () => {
  const route = router.currentRoute.value
  if (route.query.paymentSuccess === 'true') {
    // 显示支付成功提示框
    ElMessageBox.alert(
      '恭喜您成功开通VIP会员！现在可以畅享全站所有课程。',
      '🎉 开通成功',
      {
        confirmButtonText: '查看我的VIP',
        type: 'success',
        center: true,
        callback: () => {
          // 移除URL参数
          router.replace('/web/vip')
          // 跳转到VIP详情页
          router.push('/web/vip/detail')
        }
      }
    )
    
    // 刷新用户信息和VIP状态
    handlePaymentSuccess()
  }
}

onMounted(() => {
  loadPackages()
  loadVipStatus()
  // 检查是否从支付宝返回
  checkPaymentResult()
})
</script>

<style scoped>
.vip-intro-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  position: relative;
  /* 移除 overflow-x: hidden，因为它会导致 position: sticky 失效 */
}

.vip-intro-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(218, 165, 32, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.vip-content {
  padding-bottom: 60px;
  position: relative;
  z-index: 1;
  overflow-x: hidden; /* 将 overflow 移到内容区域，避免影响 sticky */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* VIP Hero区域 */
.vip-hero {
  text-align: center;
  padding: 100px 20px 80px;
  background: linear-gradient(180deg, rgba(218, 165, 32, 0.15) 0%, transparent 100%);
}

.hero-title {
  font-size: 56px;
  font-weight: 700;
  margin: 0 0 25px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  color: #fff;
  text-shadow: 0 4px 20px rgba(218, 165, 32, 0.3);
  letter-spacing: 2px;
}

.crown-icon {
  font-size: 60px;
  color: #daa520;
  filter: drop-shadow(0 0 20px rgba(218, 165, 32, 0.6));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.hero-subtitle {
  font-size: 22px;
  color: #e0e0e0;
  opacity: 0.95;
  letter-spacing: 1px;
  font-weight: 300;
}

/* 会员对比表 */
.vip-comparison {
  padding: 80px 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
}

.comparison-table {
  max-width: 1100px;
  margin: 0 auto;
  background: linear-gradient(135deg, rgba(50, 50, 70, 0.95) 0%, rgba(40, 40, 60, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6), 0 0 80px rgba(218, 165, 32, 0.15);
  border: 1px solid rgba(218, 165, 32, 0.3);
}

.comparison-table :deep(.el-table) {
  background: transparent !important;
  color: #f5f5f5;
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
}

.comparison-table :deep(.el-table__inner-wrapper) {
  background: transparent !important;
}

.comparison-table :deep(.el-table__header-wrapper) {
  background: linear-gradient(135deg, rgba(218, 165, 32, 0.25) 0%, rgba(255, 215, 0, 0.15) 100%) !important;
}

.comparison-table :deep(.el-table__header) {
  background: transparent !important;
}

.comparison-table :deep(.el-table th) {
  background: transparent !important;
  color: #ffd700 !important;
  font-weight: 700;
  font-size: 18px;
  padding: 20px 0;
  border-bottom: 2px solid rgba(218, 165, 32, 0.5) !important;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.comparison-table :deep(.el-table th.el-table__cell) {
  background-color: transparent !important;
}

.comparison-table :deep(.el-table__body) {
  background: transparent !important;
}

.comparison-table :deep(.el-table td) {
  background: transparent !important;
  background-color: transparent !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f0f0f0;
  font-size: 16px;
  padding: 24px 0;
}

.comparison-table :deep(.el-table td.el-table__cell) {
  background-color: transparent !important;
}

.comparison-table :deep(.el-table__row) {
  background: transparent !important;
  background-color: transparent !important;
  transition: all 0.3s;
}

.comparison-table :deep(.el-table__row:hover) {
  background: linear-gradient(90deg, rgba(218, 165, 32, 0.15) 0%, rgba(255, 215, 0, 0.1) 100%) !important;
  transform: translateX(5px);
}

.comparison-table :deep(.el-table__row:hover td) {
  background: transparent !important;
  background-color: transparent !important;
}

.comparison-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: rgba(0, 0, 0, 0.1) !important;
  background-color: rgba(0, 0, 0, 0.1) !important;
}

.comparison-table :deep(.el-table__empty-block) {
  background: transparent !important;
}

.feature-cell {
  display: flex;
  align-items: center;
  gap: 15px;
  font-weight: 600;
  font-size: 16px;
}

.status-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.status-icon.success {
  color: #67c23a;
  filter: drop-shadow(0 2px 4px rgba(103, 194, 58, 0.3));
}

.status-icon.error {
  color: #8a8a8a;
  opacity: 0.6;
}

.status-icon.gold {
  color: #ffd700;
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.8));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.status-text {
  font-weight: 600;
  color: #b0b0b0;
  font-size: 15px;
}

.status-text.gold {
  color: #ffd700;
  font-weight: 700;
  font-size: 16px;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.6);
  letter-spacing: 0.5px;
}

/* 会员权益 */
.vip-benefits {
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.section-title {
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 60px;
  color: #daa520;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(218, 165, 32, 0.3);
}

.benefit-card {
  text-align: center;
  padding: 40px 20px;
  transition: all 0.4s ease;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 15px;
  border: 1px solid rgba(218, 165, 32, 0.2);
}

.benefit-card:hover {
  transform: translateY(-15px);
  background: rgba(218, 165, 32, 0.1);
  border-color: rgba(218, 165, 32, 0.5);
  box-shadow: 0 15px 40px rgba(218, 165, 32, 0.2);
}

.benefit-card h3 {
  margin: 25px 0 15px 0;
  font-size: 22px;
  color: #fff;
  font-weight: 600;
  letter-spacing: 1px;
}

.benefit-card p {
  color: #b0b0b0;
  font-size: 15px;
  line-height: 1.6;
}

/* 套餐选择 */
.vip-packages {
  padding: 80px 20px;
  background: rgba(0, 0, 0, 0.2);
}

.vip-packages :deep(.el-row) {
  margin-top: 20px;
}

.vip-packages :deep(.el-col) {
  margin-bottom: 25px;
}

.package-card {
  position: relative;
  text-align: center;
  padding: 50px 35px;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.package-card:hover {
  transform: translateY(-15px) scale(1.02);
  box-shadow: 0 20px 60px rgba(218, 165, 32, 0.3);
  border-color: rgba(218, 165, 32, 0.5);
}

/* 推荐套餐：未选中时只是稍微突出 */
.package-card.recommended {
  transform: scale(1.03);
}

.package-card.recommended:hover {
  transform: translateY(-15px) scale(1.05);
}

/* 选中状态：任何套餐被选中时的样式 */
.package-card.selected {
  border-color: #daa520;
  box-shadow: 0 15px 50px rgba(218, 165, 32, 0.4);
  background: linear-gradient(145deg, rgba(218, 165, 32, 0.15) 0%, rgba(218, 165, 32, 0.05) 100%);
  transform: scale(1.05);
}

.package-card.selected:hover {
  transform: translateY(-15px) scale(1.07);
}

/* 推荐套餐被选中时：最强的视觉效果 */
.package-card.recommended.selected {
  background: linear-gradient(145deg, rgba(218, 165, 32, 0.25) 0%, rgba(218, 165, 32, 0.12) 100%);
  box-shadow: 0 20px 60px rgba(218, 165, 32, 0.5);
  border-color: #ffd700;
  transform: scale(1.08);
}

.package-card.recommended.selected:hover {
  transform: translateY(-15px) scale(1.1);
}

.recommend-badge {
  position: absolute;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #daa520 0%, #ffd700 100%);
  color: #1a1a2e;
  padding: 6px 20px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(218, 165, 32, 0.5);
  animation: pulse 2s ease-in-out infinite;
  white-space: nowrap;
  z-index: 10;
}

@keyframes pulse {
  0%, 100% { 
    box-shadow: 0 8px 25px rgba(218, 165, 32, 0.5);
  }
  50% { 
    box-shadow: 0 8px 35px rgba(218, 165, 32, 0.8);
  }
}

.package-name {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 25px;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: color 0.3s ease;
}

/* 只有选中时才显示金色 */
.package-card.selected .package-name {
  color: #daa520;
}

.package-price {
  margin-bottom: 20px;
}

.price {
  font-size: 52px;
  font-weight: 800;
  background: linear-gradient(135deg, #daa520 0%, #ffd700 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
  text-shadow: 0 4px 15px rgba(218, 165, 32, 0.3);
}

.original-price {
  font-size: 18px;
  color: #808080;
  text-decoration: line-through;
  margin-left: 12px;
  opacity: 0.6;
}

.package-desc {
  color: #b0b0b0;
  font-size: 15px;
  margin-bottom: 25px;
  line-height: 1.6;
  letter-spacing: 0.5px;
  transition: color 0.3s ease;
}

/* 选中时描述文字更亮 */
.package-card.selected .package-desc {
  color: #e0e0e0;
}

.package-duration {
  display: inline-block;
  background: linear-gradient(135deg, rgba(218, 165, 32, 0.2) 0%, rgba(218, 165, 32, 0.1) 100%);
  color: #daa520;
  padding: 10px 28px;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  border: 1px solid rgba(218, 165, 32, 0.3);
  box-shadow: 0 4px 15px rgba(218, 165, 32, 0.2);
}

.action-area {
  text-align: center;
  margin-top: 60px;
}

.action-area .el-button {
  padding: 20px 70px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #daa520 0%, #ffd700 100%);
  border: none;
  border-radius: 50px;
  color: #1a1a2e;
  box-shadow: 0 10px 35px rgba(218, 165, 32, 0.4);
  transition: all 0.4s ease;
}

.action-area .el-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 45px rgba(218, 165, 32, 0.6);
  background: linear-gradient(135deg, #ffd700 0%, #daa520 100%);
}

.action-area .el-button:active {
  transform: translateY(-1px);
}

/* FAQ */
.vip-faq {
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}

.vip-faq :deep(.el-collapse) {
  border: none;
  background: transparent;
}

.vip-faq :deep(.el-collapse-item) {
  margin-bottom: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(218, 165, 32, 0.2);
  overflow: hidden;
}

.vip-faq :deep(.el-collapse-item__header) {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: none;
  padding: 20px 25px;
  letter-spacing: 0.5px;
}

.vip-faq :deep(.el-collapse-item__header):hover {
  background: rgba(218, 165, 32, 0.1);
  color: #daa520;
}

.vip-faq :deep(.el-collapse-item__wrap) {
  background: transparent;
  border: none;
}

.vip-faq :deep(.el-collapse-item__content) {
  padding: 20px 25px;
  color: #b0b0b0;
  line-height: 1.8;
  border-top: 1px solid rgba(218, 165, 32, 0.1);
}

.vip-faq p {
  line-height: 1.8;
  color: #b0b0b0;
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .package-card {
    margin-bottom: 30px;
  }
  
  .package-card.recommended {
    transform: scale(1);
  }
  
  .action-area .el-button {
    padding: 16px 50px;
    font-size: 18px;
  }
}
</style>

