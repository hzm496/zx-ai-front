<template>
  <div class="vip-orders-page">
    <div class="page-header">
      <h2>会员订单</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>会员订单</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="用户ID">
          <el-input
            v-model.number="searchForm.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 140px"
          >
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已取消" :value="2" />
            <el-option label="已退款" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>会员订单列表</span>
          <div class="header-actions">
            <el-button :icon="Refresh" circle @click="loadOrderList" />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="orderList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单号" width="180" show-overflow-tooltip />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="vipName" label="会员类型" width="120" />
        <el-table-column prop="duration" label="有效期" width="100" align="center">
          <template #default="{ row }">
            {{ row.duration || '-' }} 天
          </template>
        </el-table-column>
        <el-table-column prop="originalAmount" label="原价" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.originalAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="discountAmount" label="优惠金额" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.discountAmount > 0" style="color: #E6A23C">-¥{{ row.discountAmount }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="payAmount" label="实付金额" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #F56C6C; font-weight: 600">¥{{ row.payAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待支付</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已支付</el-tag>
            <el-tag v-else-if="row.status === 2" type="info">已取消</el-tag>
            <el-tag v-else-if="row.status === 3" type="danger">已退款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" :icon="View" @click="handleView(row)">查看</el-button>
            <el-popconfirm title="确定要删除该订单吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" size="small" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

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

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="订单详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="订单ID">{{ viewData.id }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ viewData.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ viewData.userId }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ viewData.username }}</el-descriptions-item>
        <el-descriptions-item label="订单类型">
          <el-tag type="success">会员订单</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag v-if="viewData.status === 0" type="warning">待支付</el-tag>
          <el-tag v-else-if="viewData.status === 1" type="success">已支付</el-tag>
          <el-tag v-else-if="viewData.status === 2" type="info">已取消</el-tag>
          <el-tag v-else-if="viewData.status === 3" type="danger">已退款</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="会员类型">{{ viewData.vipName }}</el-descriptions-item>
        <el-descriptions-item label="有效期">{{ viewData.duration || '-' }} 天</el-descriptions-item>
        <el-descriptions-item label="原价">¥{{ viewData.originalAmount }}</el-descriptions-item>
        <el-descriptions-item label="优惠金额">
          <span v-if="viewData.discountAmount > 0" style="color: #E6A23C">-¥{{ viewData.discountAmount }}</span>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="实付金额">
          <span style="color: #F56C6C; font-weight: 600">¥{{ viewData.payAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ viewData.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="取消时间">{{ viewData.cancelTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款时间">{{ viewData.refundTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款原因" :span="2" v-if="viewData.refundReason">
          {{ viewData.refundReason }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Delete } from '@element-plus/icons-vue'
import * as vipOrderAPI from '@/api/admin/vipOrder'

const searchForm = reactive({
  orderNo: '',
  userId: null,
  type: 2, // 固定为会员订单
  status: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const orderList = ref([])
const loading = ref(false)
const viewDialogVisible = ref(false)
const viewData = ref(null)

const loadOrderList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await vipOrderAPI.getVipOrderList(params)
    if (response && response.data) {
      orderList.value = response.data
      pagination.total = response.totalCount || 0
    } else {
      orderList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取VIP订单列表失败：', error)
    ElMessage.error('获取VIP订单列表失败')
    orderList.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadOrderList()
}

const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.userId = null
  searchForm.status = null
  pagination.pageNum = 1
  loadOrderList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadOrderList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadOrderList()
}

const handleView = async (row) => {
  try {
    const response = await vipOrderAPI.getVipOrderById(row.id)
    viewData.value = response.data
    viewDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取VIP订单详情失败')
  }
}

const handleDelete = async (id) => {
  try {
    await vipOrderAPI.deleteVipOrder(id)
    ElMessage.success('删除成功')
    loadOrderList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped>
.vip-orders-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}
</style>

