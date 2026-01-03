<template>
  <el-dialog
    v-model="dialogVisible"
    title="钱包充值"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <!-- 快捷金额选择 -->
      <el-form-item label="充值金额">
        <div class="amount-grid">
          <div
            v-for="amount in quickAmounts"
            :key="amount"
            class="amount-item"
            :class="{ active: form.amount === amount }"
            @click="selectAmount(amount)"
          >
            ¥{{ amount }}
          </div>
        </div>
      </el-form-item>

      <!-- 自定义金额输入 -->
      <el-form-item label="自定义金额" prop="amount">
        <el-input
          v-model.number="form.amount"
          type="number"
          placeholder="请输入充值金额"
          :min="0.01"
          :step="0.01"
        >
          <template #prepend>¥</template>
        </el-input>
        <div class="amount-hint">最低充值金额：0.01元</div>
      </el-form-item>

      <!-- 支付方式 -->
      <el-form-item label="支付方式" prop="paymentMethod">
        <el-radio-group v-model="form.paymentMethod">
          <el-radio :label="1">
            <span class="payment-option">
              <el-icon><CreditCard /></el-icon>
              支付宝支付
            </span>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 充值说明 -->
      <el-alert
        title="充值说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <div class="recharge-tips">
            <p>1. 充值金额将实时到账您的钱包余额</p>
            <p>2. 使用支付宝沙箱环境进行测试</p>
            <p>3. 支付成功后会自动跳转回钱包页面</p>
          </div>
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确认充值
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { CreditCard } from '@element-plus/icons-vue'
import { createRechargeOrder, getAlipayUrl } from '@/api/web/recharge'

const dialogVisible = ref(false)
const formRef = ref(null)
const loading = ref(false)

// 快捷金额选项
const quickAmounts = [10, 50, 100, 200, 500, 1000]

// 表单数据
const form = reactive({
  amount: 50,
  paymentMethod: 1
})

// 表单验证规则
const rules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '充值金额必须大于0.01元', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
}

// 定义 emit
const emit = defineEmits(['success'])

/**
 * 选择快捷金额
 */
const selectAmount = (amount) => {
  form.amount = amount
}

/**
 * 打开对话框
 */
const open = () => {
  dialogVisible.value = true
}

/**
 * 关闭对话框
 */
const handleClose = () => {
  dialogVisible.value = false
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
  form.amount = 50
  form.paymentMethod = 1
}

/**
 * 提交充值订单
 */
const handleSubmit = async () => {
  // 表单验证
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
  } catch (error) {
    console.log('表单验证失败', error)
    return
  }

  loading.value = true

  try {
    console.log('📤 提交充值订单:', form)

    // 1. 创建充值订单
    const result = await createRechargeOrder({
      amount: form.amount,
      paymentMethod: form.paymentMethod
    })

    console.log('✅ 充值订单创建成功:', result)

    const orderNo = result.orderNo

    // 2. 打开支付宝支付页面
    const payUrl = getAlipayUrl(orderNo)
    console.log('💳 打开支付宝支付:', payUrl)

    // 在新窗口中打开支付页面
    window.open(payUrl, '_blank')

    ElMessage.success('订单创建成功，请在新窗口完成支付')

    // 关闭对话框
    handleClose()

    // 通知父组件刷新数据
    emit('success')
  } catch (error) {
    console.error('❌ 创建充值订单失败:', error)
    ElMessage.error(error.message || '创建充值订单失败')
  } finally {
    loading.value = false
  }
}

// 暴露方法给父组件
defineExpose({
  open
})
</script>

<style scoped>
.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.amount-item {
  padding: 16px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.amount-item:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}

.amount-item.active {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}

.amount-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.payment-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.recharge-tips {
  line-height: 1.8;
}

.recharge-tips p {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>

