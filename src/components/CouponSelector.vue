<template>
  <div class="coupon-selector">
    <!-- 优惠券选择按钮 -->
    <div class="coupon-trigger" @click="showDialog = true">
      <el-icon><Ticket /></el-icon>
      <span v-if="!selectedCoupon">选择优惠券</span>
      <span v-else class="selected-coupon">
        {{ selectedCoupon.name }} 
        <span class="discount-tag">-¥{{ discountAmount }}</span>
      </span>
      <el-icon class="arrow-icon"><ArrowRight /></el-icon>
    </div>

    <!-- 优惠券选择对话框 -->
    <el-dialog
      v-model="showDialog"
      title="选择优惠券"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="coupon-list">
        <!-- 无优惠券 -->
        <el-empty v-if="coupons.length === 0" description="暂无可用优惠券" :image-size="100" />

        <!-- 不使用优惠券选项 -->
        <div 
          v-if="coupons.length > 0"
          class="coupon-item" 
          :class="{ selected: selectedCouponId === null }"
          @click="selectCoupon(null)"
        >
          <div class="coupon-content">
            <div class="coupon-name">不使用优惠券</div>
            <div class="coupon-desc">支付原价 ¥{{ coursePrice }}</div>
          </div>
          <el-icon v-if="selectedCouponId === null" class="selected-icon" color="#67C23A">
            <CircleCheck />
          </el-icon>
        </div>

        <!-- 优惠券列表 -->
        <div
          v-for="coupon in coupons"
          :key="coupon.userCouponId"
          class="coupon-item"
          :class="{ 
            selected: selectedCouponId === coupon.userCouponId,
            disabled: !coupon.canUse
          }"
          @click="coupon.canUse && selectCoupon(coupon.userCouponId)"
        >
          <div class="coupon-left">
            <div class="coupon-value">
              <span v-if="coupon.type === 1" class="value-text">¥{{ coupon.discountAmount }}</span>
              <span v-else class="value-text">{{ (coupon.discountRate * 10).toFixed(1) }}折</span>
            </div>
            <div class="coupon-type-tag">{{ coupon.typeName }}</div>
          </div>
          
          <div class="coupon-content">
            <div class="coupon-name">{{ coupon.name }}</div>
            <div class="coupon-desc">
              满¥{{ coupon.minAmount }}可用
              <span v-if="coupon.type === 2 && coupon.maxDiscount">
                （最多优惠¥{{ coupon.maxDiscount }}）
              </span>
            </div>
            <div class="coupon-expire">有效期至：{{ formatExpireTime(coupon.expireTime) }}</div>
            <div v-if="!coupon.canUse" class="unusable-reason">{{ coupon.unusableReason }}</div>
          </div>
          
          <el-icon v-if="coupon.canUse && selectedCouponId === coupon.userCouponId" class="selected-icon" color="#67C23A">
            <CircleCheck />
          </el-icon>
        </div>
      </div>

      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmSelection">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Ticket, ArrowRight, CircleCheck } from '@element-plus/icons-vue'
import { getAvailableCoupons, calculateDiscountedPrice } from '@/api/web/coupon'

const props = defineProps({
  courseId: {
    type: Number,
    required: true
  },
  coursePrice: {
    type: Number,
    required: true
  },
  modelValue: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'discount-change'])

const showDialog = ref(false)
const coupons = ref([])
const selectedCouponId = ref(props.modelValue)
const selectedCoupon = ref(null)
const discountAmount = ref(0)

// 监听外部 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  selectedCouponId.value = newVal
  updateSelectedCoupon()
})

// 加载可用优惠券
const loadCoupons = async () => {
  try {
    coupons.value = await getAvailableCoupons(props.courseId, props.coursePrice)
  } catch (error) {
    console.error('加载优惠券失败：', error)
    ElMessage.error('加载优惠券失败')
  }
}

// 选择优惠券
const selectCoupon = (userCouponId) => {
  selectedCouponId.value = userCouponId
}

// 确认选择
const confirmSelection = async () => {
  // 计算优惠金额
  if (selectedCouponId.value) {
    try {
      const result = await calculateDiscountedPrice(props.coursePrice, selectedCouponId.value)
      discountAmount.value = result.discountAmount
      
      // 查找选中的优惠券
      selectedCoupon.value = coupons.value.find(c => c.userCouponId === selectedCouponId.value)
      
      emit('update:modelValue', selectedCouponId.value)
      emit('discount-change', {
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice,
        couponName: result.couponName
      })
      
      ElMessage.success('已选择优惠券')
    } catch (error) {
      console.error('计算优惠失败：', error)
      ElMessage.error('计算优惠失败')
      return
    }
  } else {
    // 不使用优惠券
    selectedCoupon.value = null
    discountAmount.value = 0
    emit('update:modelValue', null)
    emit('discount-change', {
      discountAmount: 0,
      finalPrice: props.coursePrice,
      couponName: null
    })
  }
  
  showDialog.value = false
}

// 更新选中的优惠券信息
const updateSelectedCoupon = () => {
  if (selectedCouponId.value && coupons.value.length > 0) {
    selectedCoupon.value = coupons.value.find(c => c.userCouponId === selectedCouponId.value)
  } else {
    selectedCoupon.value = null
    discountAmount.value = 0
  }
}

// 格式化过期时间
const formatExpireTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

// 打开对话框时加载优惠券
watch(showDialog, (newVal) => {
  if (newVal) {
    loadCoupons()
  }
})
</script>

<style scoped>
.coupon-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.coupon-trigger:hover {
  border-color: #67C23A;
  background: #f0f9ff;
}

.selected-coupon {
  flex: 1;
  color: #67C23A;
  font-weight: 600;
}

.discount-tag {
  color: #e74c3c;
  font-size: 14px;
  margin-left: 8px;
}

.arrow-icon {
  color: #909399;
}

.coupon-list {
  max-height: 500px;
  overflow-y: auto;
}

.coupon-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.coupon-item:hover {
  border-color: #67C23A;
  box-shadow: 0 2px 12px rgba(103, 194, 58, 0.2);
}

.coupon-item.selected {
  border-color: #67C23A;
  background: #f0f9ff;
}

.coupon-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.coupon-item.disabled:hover {
  border-color: #e0e0e0;
  box-shadow: none;
}

.coupon-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  padding-right: 16px;
  border-right: 2px dashed #e0e0e0;
}

.coupon-value {
  margin-bottom: 4px;
}

.value-text {
  font-size: 28px;
  font-weight: bold;
  color: #e74c3c;
}

.coupon-type-tag {
  font-size: 12px;
  color: #909399;
}

.coupon-content {
  flex: 1;
  padding-left: 16px;
}

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.coupon-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.coupon-expire {
  font-size: 12px;
  color: #909399;
}

.unusable-reason {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 6px;
}

.selected-icon {
  font-size: 24px;
  margin-left: 12px;
}
</style>

