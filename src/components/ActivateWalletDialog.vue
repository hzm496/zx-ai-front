<template>
  <el-dialog
    v-model="visible"
    title="开通钱包"
    width="450px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="activate-content">
      <el-alert
        title="开通钱包后，您可以使用余额支付购买VIP会员"
        type="info"
        :closable="false"
        show-icon
      />

      <el-form :model="form" :rules="rules" ref="formRef" label-width="110px" class="form-container">
        <el-form-item label="支付密码" prop="paymentPassword">
          <el-input
            v-model="form.paymentPassword"
            type="password"
            placeholder="请输入6位数字密码"
            maxlength="6"
            show-password
          />
          <div class="form-tip">支付密码为6位数字，用于支付时验证</div>
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            maxlength="6"
            show-password
          />
        </el-form-item>

        <el-divider content-position="left">绑定支付宝账号</el-divider>

        <el-form-item label="支付宝账号" prop="alipayAccount">
          <el-input
            v-model="form.alipayAccount"
            placeholder="请输入支付宝账号"
            clearable
          />
          <div class="form-tip">用于提现时自动填充</div>
        </el-form-item>

        <el-form-item label="账户姓名" prop="alipayName">
          <el-input
            v-model="form.alipayName"
            placeholder="请输入支付宝账户姓名"
            clearable
            @keyup.enter="handleActivate"
          />
          <div class="form-tip">需与支付宝实名认证姓名一致</div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="activating" @click="handleActivate">
        立即开通
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { activateWallet } from '@/api/web/wallet'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'activate-success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const activating = ref(false)
const formRef = ref(null)

const form = ref({
  paymentPassword: '',
  confirmPassword: '',
  alipayAccount: '',
  alipayName: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.paymentPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  paymentPassword: [
    { required: true, message: '请输入支付密码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '支付密码必须为6位数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认支付密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  alipayAccount: [
    { required: true, message: '请输入支付宝账号', trigger: 'blur' }
  ],
  alipayName: [
    { required: true, message: '请输入账户姓名', trigger: 'blur' }
  ]
}

// 开通钱包
const handleActivate = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    try {
      activating.value = true
      await activateWallet({
        paymentPassword: form.value.paymentPassword,
        confirmPassword: form.value.confirmPassword,
        alipayAccount: form.value.alipayAccount,
        alipayName: form.value.alipayName
      })
      
      // 关闭对话框
      handleClose()
      
      // 通知父组件开通成功（父组件负责显示成功消息）
      emit('activate-success')
    } catch (error) {
      // 错误信息已由 request.js 统一处理，这里只记录日志
      console.error('开通钱包失败：', error)
    } finally {
      activating.value = false
    }
  })
}

// 关闭对话框
const handleClose = () => {
  form.value.paymentPassword = ''
  form.value.confirmPassword = ''
  form.value.alipayAccount = ''
  form.value.alipayName = ''
  formRef.value?.clearValidate()
  visible.value = false
}
</script>

<style scoped>
.activate-content {
  padding: 10px 0;
}

.el-alert {
  margin-bottom: 25px;
}

.form-container {
  margin-top: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>

