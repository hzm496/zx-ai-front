<template>
  <div class="payment-success-page">
    <div class="success-card">
      <div class="success-icon">
        <el-icon :size="80" color="#67c23a">
          <SuccessFilled />
        </el-icon>
      </div>
      
      <h1 class="success-title">{{ successTitle }}</h1>
      
      <div class="order-info" v-if="orderNo">
        <p class="order-no">订单号：{{ orderNo }}</p>
      </div>
      
      <div class="success-message">
        <p>{{ successMessage }}</p>
        <p class="tip">请关闭此页面，返回原页面刷新查看详情</p>
      </div>
      
      <div class="actions">
        <el-button type="success" size="large" @click="closeWindow">
          关闭此页面
        </el-button>
      </div>
      
      <div class="guide">
        <p class="guide-text">💡 温馨提示：</p>
        <ul>
          <li>请关闭此标签页</li>
          <li>返回原来的页面</li>
          <li>刷新页面即可查看订单</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SuccessFilled } from '@element-plus/icons-vue'

const route = useRoute()
const orderNo = ref('')
const paymentType = ref('')

// 根据支付类型显示不同的标题
const successTitle = computed(() => {
  if (route.query.error) {
    return '支付失败'
  }
  
  switch (paymentType.value) {
    case 'vip':
      return 'VIP开通成功！'
    case 'course':
      return '课程购买成功！'
    case 'recharge':
      return '充值成功！'
    case 'transfer':
      return '转账成功！'
    default:
      return '支付成功！'
  }
})

// 根据支付类型显示不同的消息
const successMessage = computed(() => {
  if (route.query.error) {
    return '支付过程出现异常，请联系客服'
  }
  
  switch (paymentType.value) {
    case 'vip':
      return '恭喜您成为VIP会员，现在可以畅享全站课程'
    case 'course':
      return '课程已添加到"我的课程"，可以开始学习了'
    case 'recharge':
      return '充值金额已到账，可在"我的钱包"中查看'
    case 'transfer':
      return '转账已完成，可在"提现管理"中查看'
    default:
      return '您的订单已支付成功'
  }
})

// 关闭窗口
const closeWindow = () => {
  // 尝试关闭窗口
  window.close()
  
  // 如果无法关闭（某些浏览器限制），显示提示
  setTimeout(() => {
    alert('请手动关闭此标签页')
  }, 100)
}

onMounted(() => {
  orderNo.value = route.query.orderNo || ''
  paymentType.value = route.query.type || ''
})
</script>

<style scoped>
.payment-success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.success-card {
  background: white;
  border-radius: 20px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon {
  margin-bottom: 30px;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.success-title {
  font-size: 32px;
  color: #67c23a;
  margin-bottom: 20px;
  font-weight: bold;
}

.order-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 25px;
}

.order-no {
  font-size: 14px;
  color: #606266;
  margin: 0;
  font-family: monospace;
}

.success-message {
  margin-bottom: 30px;
}

.success-message p {
  font-size: 16px;
  color: #303133;
  margin: 10px 0;
}

.success-message .tip {
  font-size: 14px;
  color: #909399;
  font-weight: normal;
}

.actions {
  margin-bottom: 30px;
}

.guide {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 10px;
  padding: 20px;
  text-align: left;
}

.guide-text {
  font-size: 16px;
  color: #409eff;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.guide ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 2;
}

.guide li {
  font-size: 14px;
}
</style>

