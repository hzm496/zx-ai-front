<template>
  <div class="course-orders-page">
    <h2>课程订单管理</h2>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="课程标题">
          <el-input
            v-model="searchForm.courseTitle"
            placeholder="请输入课程标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已取消" :value="2" />
            <el-option label="已退款" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="支付方式">
          <el-select v-model="searchForm.payType" placeholder="全部" clearable style="width: 150px">
            <el-option label="余额支付" :value="1" />
            <el-option label="支付宝" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="orderList"
        v-loading="loading"
        border
        style="width: 100%"
      >
        <!-- <el-table-column type="index" label="序号" width="60" align="center" /> -->
        
        <el-table-column prop="orderNo" label="订单号" width="190" />
        
        <el-table-column label="课程信息" width="418">
          <template #default="{ row }">
            <div class="course-info">
              <el-image
                v-if="row.courseCover"
                :src="row.courseCover"
                fit="cover"
                class="course-cover"
              >
                <template #error>
                  <div class="image-slot">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="course-title">{{ row.courseTitle }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <div class="amount-info">
              <div class="pay-amount">¥{{ row.payAmount }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="payTypeName" label="支付方式" width="100" align="center" />

        <el-table-column label="订单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.statusName }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="支付时间" width="180">
          <template #default="{ row }">
            {{ row.payTime ? formatTime(row.payTime) : '-' }}
          </template>
        </el-table-column>

        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="订单详情"
      width="600px"
    >
      <div v-if="currentOrder" class="order-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ currentOrder.username }}
          </el-descriptions-item>
          <el-descriptions-item label="课程标题">
            {{ currentOrder.courseTitle }}
          </el-descriptions-item>
         
          <el-descriptions-item label="原价">
            ¥{{ currentOrder.originalPrice }}
          </el-descriptions-item>
          <el-descriptions-item label="实付金额">
            ¥{{ currentOrder.payAmount }}
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ currentOrder.payTypeName }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ currentOrder.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.alipayTradeNo" label="支付宝交易号">
            {{ currentOrder.alipayTradeNo }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(currentOrder.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.payTime" label="支付时间">
            {{ formatTime(currentOrder.payTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.cancelTime" label="取消时间">
            {{ formatTime(currentOrder.cancelTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.refundTime" label="退款时间">
            {{ formatTime(currentOrder.refundTime) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.refundReason" label="退款原因">
            {{ currentOrder.refundReason }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Picture } from '@element-plus/icons-vue'
import { getCourseOrderList } from '@/api/admin/courseOrder'

// 搜索表单
const searchForm = ref({
  orderNo: '',
  courseTitle: '',
  status: null,
  payType: null
})

// 订单列表
const orderList = ref([])
const loading = ref(false)

// 分页
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 订单详情
const showDetailDialog = ref(false)
const currentOrder = ref(null)

// 加载订单列表
const loadOrderList = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    const response = await getCourseOrderList(params)
    orderList.value = response.data || []
    pagination.value.total = response.totalCount || 0
  } catch (error) {
    console.error('加载订单列表失败：', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.pageNum = 1
  loadOrderList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    orderNo: '',
    courseTitle: '',
    status: null,
    payType: null
  }
  handleSearch()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  loadOrderList()
}

// 页码改变
const handleCurrentChange = (page) => {
  pagination.value.pageNum = page
  loadOrderList()
}

// 查看详情
const handleViewDetail = (row) => {
  currentOrder.value = row
  showDetailDialog.value = true
}

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    0: 'warning',  // 待支付
    1: 'success',  // 已支付
    2: 'info',     // 已取消
    3: 'danger'    // 已退款
  }
  return types[status] || 'info'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped>
.course-orders-page {
  padding: 20px;
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.table-card {
  margin-top: 20px;
}

.course-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.course-cover {
  width: 60px;
  height: 45px;
  border-radius: 4px;
  flex-shrink: 0;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.course-title {
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  word-break: break-all;
}

.amount-info {
  text-align: right;
}

.pay-amount {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
  margin-top: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.order-detail {
  padding: 10px 0;
}
</style>
