<template>
  <el-dialog
    v-model="visible"
    title="申请提现"
    width="600px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-alert 
        title="提现说明"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <div style="font-size: 13px; line-height: 1.8">
            1. 单笔提现金额：1-10000元<br>
            2. 手续费：1%（从提现金额中扣除）<br>
            3. 提现后将在1-3个工作日内到账<br>
            4. 提现后余额将立即扣除，审核通过后到账
          </div>
        </template>
      </el-alert>

      <el-form-item label="提现金额" prop="amount">
        <el-input-number
          v-model="formData.amount"
          :min="1"
          :max="10000"
          :precision="2"
          :step="10"
          style="width: 100%"
          placeholder="请输入提现金额"
        />
        <div class="amount-hint">
          <span>可提现余额：¥{{ availableBalance }}</span>
          <el-button link type="primary" @click="setMaxAmount">全部提现</el-button>
        </div>
      </el-form-item>

      <el-form-item label="实际到账">
        <div class="actual-amount">
          <span class="amount">¥{{ actualAmount }}</span>
          <span class="fee-hint">（已扣除手续费 ¥{{ fee }}）</span>
        </div>
      </el-form-item>

      <el-form-item label="提现方式" prop="accountType">
        <el-radio-group v-model="formData.accountType" disabled>
          <el-radio :label="1">支付宝</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-alert
        v-if="bindAlipayAccount"
        :closable="false"
        type="info"
        style="margin-bottom: 20px"
      >
        <template #title>
          <div class="bind-info">
            <div class="info-row">
              <span class="label">收款账号：</span>
              <span class="value">{{ bindAlipayAccount }}</span>
            </div>
            <div class="info-row">
              <span class="label">账户姓名：</span>
              <span class="value">{{ bindAlipayName }}</span>
            </div>
          </div>
        </template>
      </el-alert>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="选填，可备注特殊说明"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确认提现
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createWithdrawOrder } from '@/api/web/withdraw'

const visible = ref(false)
const loading = ref(false)
const formRef = ref(null)
const availableBalance = ref(0)
const bindAlipayAccount = ref('')
const bindAlipayName = ref('')

const formData = ref({
  amount: null,
  accountType: 1, // 默认支付宝，使用钱包绑定的账号
  remark: ''
})

const formRules = {
  amount: [
    { required: true, message: '请输入提现金额', trigger: 'blur' },
    { type: 'number', min: 1, max: 10000, message: '提现金额为1-10000元', trigger: 'blur' }
  ]
}

// 计算手续费（1%）
const fee = computed(() => {
  if (!formData.value.amount) return '0.00'
  const feeAmount = (formData.value.amount * 0.01).toFixed(2)
  return feeAmount
})

// 计算实际到账金额
const actualAmount = computed(() => {
  if (!formData.value.amount) return '0.00'
  const actual = (formData.value.amount - parseFloat(fee.value)).toFixed(2)
  return actual
})

// 设置最大提现金额
const setMaxAmount = () => {
  formData.value.amount = Math.min(availableBalance.value, 10000)
}

// 打开对话框
const open = (balance = 0, alipayAccount = '', alipayName = '') => {
  availableBalance.value = balance
  bindAlipayAccount.value = alipayAccount
  bindAlipayName.value = alipayName
  visible.value = true
}

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
  formData.value = {
    amount: null,
    accountType: 1,
    remark: ''
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 验证余额
    if (formData.value.amount > availableBalance.value) {
      ElMessage.error('提现金额超过可用余额')
      return
    }
    
    loading.value = true
    await createWithdrawOrder(formData.value)
    
    ElMessage.success('提现申请已提交，请等待审核')
    visible.value = false
    
    // 触发成功回调
    emit('success')
  } catch (error) {
    console.error('提现申请失败：', error)
    if (error !== false) {
      ElMessage.error(error.message || '提现申请失败')
    }
  } finally {
    loading.value = false
  }
}

const emit = defineEmits(['success'])

defineExpose({
  open
})
</script>

<style scoped>
.amount-hint {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.actual-amount {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.actual-amount .amount {
  font-size: 24px;
  font-weight: 600;
  color: #67c23a;
}

.actual-amount .fee-hint {
  font-size: 13px;
  color: #909399;
}

:deep(.el-alert__content) {
  padding: 0;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.bind-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bind-info .info-row {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.bind-info .label {
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.bind-info .value {
  color: #303133;
  font-weight: 600;
}
</style>

