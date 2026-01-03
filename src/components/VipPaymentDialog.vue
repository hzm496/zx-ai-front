<template>
  <el-dialog
    v-model="visible"
    title="支付VIP订单"
    width="550px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="payment-content" v-loading="loading">
      <!-- 订单信息 -->
      <div class="order-info">
        <h3>订单信息</h3>
        <div class="info-item">
          <span class="label">套餐：</span>
          <span class="value">{{ order?.packageName }}</span>
        </div>
        <div class="info-item">
          <span class="label">时长：</span>
          <span class="value">{{ order?.duration }}天</span>
        </div>
        <div class="info-item" v-if="order?.orderNo">
          <span class="label">订单号：</span>
          <span class="value">{{ order?.orderNo }}</span>
        </div>
        <div class="info-item amount">
          <span class="label">支付金额：</span>
          <span class="value price">¥{{ order?.price }}</span>
        </div>
      </div>

      <!-- 支付方式选择 -->
      <div class="payment-method-section">
        <h3>选择支付方式</h3>
        <el-radio-group v-model="paymentMethod" class="payment-methods">
          <el-radio :value="1" class="payment-method-item">
            <div class="method-content">
              <el-icon class="method-icon"><Wallet /></el-icon>
              <div class="method-info">
                <div class="method-name">钱包余额</div>
                <div class="method-desc">余额：¥{{ walletBalance }}</div>
              </div>
            </div>
          </el-radio>
          <el-radio :value="2" class="payment-method-item">
            <div class="method-content">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'%3E%3Cpath fill='%2300A0E9' d='M1024 512C1024 229.7 794.3 0 512 0S0 229.7 0 512s229.7 512 512 512 512-229.7 512-512z'/%3E%3Cpath fill='%23FFF' d='M784.1 561.9H208.7L130 415.6h724.8z'/%3E%3Cpath fill='%23FFF' d='M750.7 512.8c0-50.9-28.3-100.4-75.3-100.4-36.1 0-61.9 23.1-73.1 54.5h-82.9c13.8-77.6 73.1-127.8 156-127.8 95.9 0 164.1 65.3 164.1 154.5 0 56.9-24.7 102.8-64 131.1H566.7c44.3-23.7 75.9-62.1 75.9-111.9z'/%3E%3C/svg%3E" class="method-icon-img" alt="支付宝" />
              <div class="method-info">
                <div class="method-name">支付宝支付</div>
                <div class="method-desc">跳转支付宝安全支付</div>
              </div>
            </div>
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 支付密码（仅余额支付时显示） -->
      <div class="password-input" v-if="paymentMethod === 1">
        <el-form :model="form" :rules="rules" ref="formRef">
          <el-form-item label="支付密码" prop="paymentPassword">
            <el-input
              v-model="form.paymentPassword"
              type="password"
              placeholder="请输入6位数字支付密码"
              maxlength="6"
              show-password
              @keyup.enter="handlePay"
            />
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="paying" @click="handlePay">
        {{ paymentMethod === 2 ? '去支付' : '确认支付' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Wallet } from '@element-plus/icons-vue'
import { payVipOrder, createVipOrder } from '@/api/web/vip'
import { getWalletInfo } from '@/api/web/wallet'
import { createAlipayOrder } from '@/api/web/alipay'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  order: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'payment-success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const paying = ref(false)
const walletBalance = ref(0)
const formRef = ref(null)
const paymentMethod = ref(1) // 默认余额支付

const form = ref({
  paymentPassword: ''
})

const rules = {
  paymentPassword: [
    { required: true, message: '请输入支付密码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '支付密码必须为6位数字', trigger: 'blur' }
  ]
}

// 加载钱包余额
const loadWalletBalance = async () => {
  try {
    loading.value = true
    const wallet = await getWalletInfo()  // request.js已经返回res.data
    walletBalance.value = wallet?.balance || 0
  } catch (error) {
    console.error('获取钱包余额失败：', error)
  } finally {
    loading.value = false
  }
}

// 支付
const handlePay = async () => {
  try {
    paying.value = true
    
    // 如果没有订单号，说明是新订单，需要先创建
    let orderNo = props.order?.orderNo
    if (!orderNo) {
      const newOrder = await createVipOrder({
        packageType: props.order?.packageType,
        paymentMethod: paymentMethod.value
      })
      orderNo = newOrder.orderNo
    }
    
    // 根据支付方式处理
    if (paymentMethod.value === 1) {
      // 余额支付
      await handleBalancePay(orderNo)
    } else if (paymentMethod.value === 2) {
      // 支付宝支付
      await handleAlipay(orderNo)
    }
  } catch (error) {
    console.error('支付失败：', error)
    paying.value = false
  }
}

// 余额支付
const handleBalancePay = async (orderNo) => {
  if (!formRef.value) {
    paying.value = false
    return
  }
  
  await formRef.value.validate(async (valid) => {
    if (!valid) {
      paying.value = false
      return
    }
    
    // 检查余额
    if (walletBalance.value < props.order?.price) {
      ElMessage.error('余额不足，请先充值')
      paying.value = false
      return
    }
    
    try {
      // 支付订单
      await payVipOrder({
        orderNo: orderNo,
        paymentPassword: form.value.paymentPassword
      })
      
      ElMessage.success('支付成功')
      
      // 关闭对话框
      handleClose()
      
      // 通知父组件支付成功
      emit('payment-success')
    } catch (error) {
      console.error('余额支付失败：', error)
    } finally {
      paying.value = false
    }
  })
}

// 支付宝支付
const handleAlipay = async (orderNo) => {
  try {
    // 获取支付表单URL
    const payUrl = createAlipayOrder(orderNo)
    
    // 关闭对话框
    handleClose()
    
    // 跳转到支付宝支付页面（新窗口打开）
    window.open(payUrl, '_blank')
    
    ElMessage.info('已打开支付宝支付页面，请完成支付')
    
    // 通知父组件（可能需要轮询订单状态）
    emit('payment-success')
  } catch (error) {
    console.error('支付宝支付失败：', error)
  } finally {
    paying.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  form.value.paymentPassword = ''
  formRef.value?.clearValidate()
  paymentMethod.value = 1 // 重置为余额支付
  visible.value = false
}

// 监听对话框打开
watch(() => props.modelValue, (val) => {
  if (val) {
    loadWalletBalance()
  }
}, { immediate: true })
</script>

<style scoped>
.payment-content {
  padding: 20px 0;
}

.order-info {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.order-info h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.info-item .label {
  color: #909399;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.info-item.amount {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #dcdfe6;
}

.price {
  font-size: 24px;
  color: #f56c6c;
  font-weight: 700;
}

/* 支付方式选择 */
.payment-method-section {
  margin-bottom: 20px;
}

.payment-method-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: #303133;
}

.payment-methods {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-method-item {
  width: 100%;
  margin: 0;
  height: auto;
}

.payment-method-item :deep(.el-radio__label) {
  width: 100%;
  padding: 0;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.payment-method-item :deep(.el-radio__input.is-checked) ~ .el-radio__label .method-content {
  border-color: #409eff;
  background: #ecf5ff;
}

.method-content:hover {
  border-color: #409eff;
}

.method-icon {
  font-size: 32px;
  color: #409eff;
  flex-shrink: 0;
}

.method-icon-img {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 13px;
  color: #909399;
}

.password-input {
  margin-top: 20px;
}
</style>

