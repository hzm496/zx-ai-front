<template>
  <div class="vip-detail-page">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="logo" @click="$router.push('/web/home')">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">智学AI在线教育平台</span>
        </div>
        <div class="nav-right">
          <el-button text @click="$router.push('/web/home')">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-button text @click="$router.push('/web/profile')">
            <el-icon><User /></el-icon>
            个人中心
          </el-button>
        </div>
      </div>
    </div>

    <div class="vip-detail-container">
      <!-- VIP状态卡片 -->
      <el-card class="vip-status-card" :class="{ 'is-vip': vipStatus.isVip, 'is-svip': isAnnualVip }" shadow="hover">
        <div class="status-content">
          <div class="status-icon">
            <el-icon size="80"><Medal /></el-icon>
          </div>
          <div class="status-info">
            <h2>{{ isAnnualVip ? '超级会员SVIP' : (vipStatus.isVip ? 'VIP会员' : '普通用户') }}</h2>
            <p v-if="vipStatus.isVip">到期时间：{{ vipStatus.vipExpireTime }}</p>
            <p v-if="vipStatus.isVip">剩余天数：{{ vipStatus.remainingDays }}天</p>
            <p v-else>开通VIP，尊享全站课程</p>
          </div>
          <div class="status-action">
            <el-button 
              type="primary" 
              size="large"
              @click="$router.push('/web/vip')"
            >
              {{ vipStatus.isVip ? '续费会员' : '立即开通' }}
            </el-button>
          </div>
        </div>
      </el-card>



      <el-row :gutter="20">
        <!-- 左侧：会员权益 -->
        <el-col :span="10">
          <el-card shadow="hover" class="benefits-card">
            <template #header>
              <div class="card-header">
                <el-icon><Trophy /></el-icon>
                <span>会员专属权益</span>
              </div>
            </template>

            <div class="benefit-list">
              <div 
                v-for="(benefit, index) in benefits" 
                :key="index"
                class="benefit-item"
                :class="{ 'active': vipStatus.isVip }"
              >
                <div class="benefit-icon">
                  <el-icon :size="40" :color="vipStatus.isVip ? benefit.color : '#909399'">
                    <component :is="benefit.icon" />
                  </el-icon>
                </div>
                <div class="benefit-content">
                  <h4>{{ benefit.title }}</h4>
                  <p>{{ benefit.desc }}</p>
                </div>
                <div class="benefit-status">
                  <el-tag v-if="vipStatus.isVip" type="success">已开通</el-tag>
                  <el-tag v-else type="info">未开通</el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：交易记录 -->
        <el-col :span="14">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <!-- VIP开通记录 -->
            <el-tab-pane label="VIP开通记录" name="vip">
              <el-card shadow="hover" class="orders-card">
                <template #header>
                  <div class="card-header">
                    <el-icon><DocumentCopy /></el-icon>
                    <span>开通记录</span>
                  </div>
                </template>

            <el-table 
              :data="orderList" 
              v-loading="loading"
              stripe
              style="width: 100%"
            >
              <el-table-column prop="orderNo" label="订单号" width="180" show-overflow-tooltip />
              <el-table-column prop="packageName" label="套餐" width="100" />
              <el-table-column prop="duration" label="时长" width="80">
                <template #default="{ row }">
                  {{ row.duration }}天
                </template>
              </el-table-column>
              <el-table-column prop="price" label="金额" width="80">
                <template #default="{ row }">
                  <span class="price-text">¥{{ row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="paymentMethod" label="支付方式" width="120">
                <template #default="{ row }">
                  <el-tag :type="getPaymentMethodType(row.paymentMethod)" size="small">
                    <el-icon style="vertical-align: middle; margin-right: 4px;">
                      <component :is="getPaymentIcon(row.paymentMethod)" />
                    </el-icon>
                    {{ row.paymentMethodName || '未知' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="payTime" label="开通时间" width="180" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getStatusType(row.status)">
                    {{ row.statusName }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container" v-if="total > pageSize">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="total"
                layout="prev, pager, next"
                @current-change="loadOrders"
              />
            </div>

            <el-empty v-if="orderList.length === 0 && !loading" description="暂无开通记录" />
              </el-card>
            </el-tab-pane>

           

          </el-tabs>
        </el-col>
      </el-row>
    </div>

    <!-- 充值对话框 -->
    <RechargeDialog ref="rechargeDialogRef" @success="handleRechargeSuccess" />
    
    <!-- 激活钱包对话框 -->
    <ActivateWalletDialog ref="activateWalletDialogRef" @success="handleActivateSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  User,
  Medal,
  Trophy,
  DocumentCopy,
  VideoPlay,
  Download,
  Service,
  Star,
  Wallet,
  Plus,
  Money,
  CreditCard
} from '@element-plus/icons-vue'
import { getVipStatus } from '@/api/web/vip'
import { getVipOrders } from '@/api/web/vip'
import { getWalletInfo, getTransactions } from '@/api/web/wallet'
import RechargeDialog from '@/components/RechargeDialog.vue'
import ActivateWalletDialog from '@/components/ActivateWalletDialog.vue'

const router = useRouter()
const route = useRoute()

// VIP状态
const vipStatus = ref({
  isVip: false,
  vipExpireTime: null,
  remainingDays: 0,
  statusText: '非会员'
})

// 判断是否为超级会员（剩余天数大于365天）
const isAnnualVip = computed(() => {
  return vipStatus.value.isVip && vipStatus.value.remainingDays > 365
})

// 会员权益
const benefits = [
  {
    icon: markRaw(VideoPlay),
    color: '#409eff',
    title: '无限观看',
    desc: '畅享全站所有课程，无限制观看'
  },
  {
    icon: markRaw(Download),
    color: '#67c23a',
    title: '离线下载',
    desc: '支持课程离线下载，随时随地学习'
  },
  {
    icon: markRaw(Service),
    color: '#e6a23c',
    title: '优先客服',
    desc: '专属客服优先响应，贴心服务'
  },
  {
    icon: markRaw(Star),
    color: '#f56c6c',
    title: '专属标识',
    desc: '尊贵VIP身份标识，彰显身份'
  }
]

// 订单列表
const orderList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 标签页
const activeTab = ref('vip')

// 钱包信息
const walletInfo = ref({
  balance: 0,
  isActivated: 0,
  status: 1
})

// 钱包交易记录
const transactionList = ref([])
const walletLoading = ref(false)
const walletCurrentPage = ref(1)
const walletPageSize = ref(10)
const walletTotal = ref(0)

// 充值对话框引用
const rechargeDialogRef = ref(null)
const activateWalletDialogRef = ref(null)

// 加载VIP状态
const loadVipStatus = async () => {
  try {
    const data = await getVipStatus()
    vipStatus.value = data
  } catch (error) {
    console.error('获取VIP状态失败：', error)
  }
}

// 加载订单记录
const loadOrders = async () => {
  try {
    loading.value = true
    const response = await getVipOrders(currentPage.value, pageSize.value)
    orderList.value = response.data || []
    total.value = response.totalCount || 0
  } catch (error) {
    console.error('获取订单记录失败：', error)
  } finally {
    loading.value = false
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'warning',  // 待支付
    1: 'success',  // 已支付
    2: 'info',     // 已取消
    3: 'danger'    // 已退款
  }
  return typeMap[status] || 'info'
}

// 获取支付方式标签类型
const getPaymentMethodType = (paymentMethod) => {
  const typeMap = {
    1: 'success',  // 余额支付
    2: 'primary'   // 支付宝支付
  }
  return typeMap[paymentMethod] || 'info'
}

// 获取支付方式图标
const getPaymentIcon = (paymentMethod) => {
  const iconMap = {
    1: markRaw(Wallet),      // 余额支付
    2: markRaw(CreditCard)   // 支付宝支付
  }
  return iconMap[paymentMethod] || markRaw(Money)
}

// 加载钱包信息
const loadWalletInfo = async () => {
  try {
    const data = await getWalletInfo()
    walletInfo.value = data
  } catch (error) {
    console.error('获取钱包信息失败：', error)
  }
}

// 加载钱包交易记录
const loadTransactions = async () => {
  try {
    walletLoading.value = true
    const response = await getTransactions(walletCurrentPage.value, walletPageSize.value)
    transactionList.value = response.data || []
    walletTotal.value = response.totalCount || 0
  } catch (error) {
    console.error('获取交易记录失败：', error)
  } finally {
    walletLoading.value = false
  }
}

// 获取交易类型标签
const getTransactionType = (type) => {
  const typeMap = {
    1: 'success',  // 充值
    2: 'warning',  // 消费
    3: 'info'      // 退款
  }
  return typeMap[type] || 'info'
}

// 打开充值对话框
const openRechargeDialog = () => {
  if (rechargeDialogRef.value) {
    rechargeDialogRef.value.open()
  }
}

// 激活钱包
const activateWallet = () => {
  if (activateWalletDialogRef.value) {
    activateWalletDialogRef.value.open()
  }
}

// 充值成功回调
const handleRechargeSuccess = () => {
  console.log('充值成功，刷新数据')
  // 延迟刷新，等待支付完成
  setTimeout(() => {
    loadWalletInfo()
    loadTransactions()
  }, 2000)
}

// 激活钱包成功回调
const handleActivateSuccess = () => {
  console.log('钱包激活成功')
  loadWalletInfo()
}

// 标签页切换
const handleTabClick = (tab) => {
  console.log('切换标签页:', tab.props.name)
  if (tab.props.name === 'wallet') {
    loadTransactions()
  }
}

onMounted(() => {
  loadVipStatus()
  loadOrders()
  loadWalletInfo()
  
  // 检查URL参数，如果是充值成功返回，显示提示
  const rechargeSuccess = route.query.rechargeSuccess
  if (rechargeSuccess === 'true') {
    ElMessage.success('充值成功！')
    // 刷新钱包数据
    setTimeout(() => {
      loadWalletInfo()
      loadTransactions()
    }, 1000)
  }
})
</script>

<style scoped>
.vip-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 顶部导航 */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: white;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.nav-right {
  display: flex;
  gap: 10px;
}

.nav-right .el-button {
  color: white;
}

.nav-right .el-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 容器 */
.vip-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 钱包卡片 */
.wallet-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.wallet-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.wallet-icon {
  color: #ffd700;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.wallet-details h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
}

.wallet-details .balance {
  margin: 5px 0;
  font-size: 32px;
  font-weight: 700;
  color: #ffd700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.wallet-details .wallet-status {
  margin: 5px 0;
  font-size: 14px;
  opacity: 0.9;
}

.wallet-details .warning-text {
  color: #f56c6c;
  font-weight: 600;
}

/* VIP状态卡片 */
.vip-status-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

.vip-status-card.is-vip {
  background: linear-gradient(135deg, #2c1654 0%, #5b2c83 50%, #1a0e2e 100%);
  border: 2px solid rgba(218, 165, 32, 0.4);
  box-shadow: 0 8px 32px rgba(218, 165, 32, 0.25), 0 0 60px rgba(91, 44, 131, 0.3);
  position: relative;
  overflow: hidden;
}

.vip-status-card.is-vip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(218, 165, 32, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.status-icon {
  color: #909399;
  font-size: 80px;
}

.vip-status-card.is-vip .status-icon {
  color: #ffd700;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
  }
}

.status-info {
  flex: 1;
}

.status-info h2 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #303133;
}

.vip-status-card.is-vip .status-info h2 {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  font-weight: 700;
}

.status-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 15px;
}

.vip-status-card.is-vip .status-info p {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 超级会员SVIP样式 */
.vip-status-card.is-svip {
  background: linear-gradient(135deg, #9b59b6 0%, #e74c3c 50%, #f39c12 100%);
  border: 2px solid rgba(243, 156, 18, 0.5);
  box-shadow: 0 8px 32px rgba(231, 76, 60, 0.3), 0 0 60px rgba(155, 89, 182, 0.4);
  animation: svip-border-glow 3s ease-in-out infinite;
}

.vip-status-card.is-svip::before {
  background: 
    radial-gradient(circle at 20% 50%, rgba(243, 156, 18, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(231, 76, 60, 0.15) 0%, transparent 50%);
  animation: svip-bg-shift 4s ease-in-out infinite;
}

.vip-status-card.is-svip .status-icon {
  animation: svip-icon-glow 2s ease-in-out infinite;
}

.vip-status-card.is-svip .status-info h2 {
  background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 50%, #ffd700 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: none;
  animation: svip-text-shine 3s ease-in-out infinite;
}

@keyframes svip-border-glow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(231, 76, 60, 0.3), 0 0 60px rgba(155, 89, 182, 0.4);
  }
  50% {
    box-shadow: 0 12px 40px rgba(231, 76, 60, 0.5), 0 0 80px rgba(243, 156, 18, 0.6);
  }
}

@keyframes svip-bg-shift {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes svip-icon-glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(243, 156, 18, 0.8));
    transform: scale(1);
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(231, 76, 60, 1));
    transform: scale(1.05);
  }
}

@keyframes svip-text-shine {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* 卡片头部 */
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 权益列表 */
.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 12px;
  transition: all 0.3s;
}

.benefit-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.benefit-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.benefit-content {
  flex: 1;
}

.benefit-content h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
  color: #303133;
}

.benefit-content p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

/* 订单卡片 */
.orders-card {
  min-height: 500px;
}

.price-text {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 金额样式 */
.amount-plus {
  color: #67c23a;
  font-weight: 600;
}

.amount-minus {
  color: #f56c6c;
  font-weight: 600;
}

/* 交易记录卡片 */
.transactions-card,
.recharge-orders-card {
  min-height: 400px;
}

/* 响应式 */
@media (max-width: 768px) {
  .vip-detail-container {
    padding: 20px 10px;
  }
  
  .status-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>

