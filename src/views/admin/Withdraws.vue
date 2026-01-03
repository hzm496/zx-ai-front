<template>
  <div class="withdraws-page">
    <div class="page-header">
      <h2>提现管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>提现管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="流水号">
          <el-input
            v-model="searchForm.withdrawNo"
            placeholder="请输入提现流水号"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="用户ID">
          <el-input-number
            v-model="searchForm.userId"
            placeholder="请输入用户ID"
            :controls="false"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 140px"
          >
            <el-option label="待处理" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="已拒绝" :value="2" />
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
          <span>提现列表</span>
          <div class="header-actions">
            <el-button :icon="Refresh" circle @click="loadWithdrawList" />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="withdrawList"
        border
        stripe
        style="width: 100%"
      >
        <!-- <el-table-column prop="id" label="ID" width="80" align="center" /> -->
        <el-table-column prop="withdrawNo" label="流水号" width="200" show-overflow-tooltip />
        <el-table-column label="用户名" width="150" align="center">
          <template #default="{ row }">
            <span>{{ row.nickname || row.username || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="提现金额" width="120" align="center">
          <template #default="{ row }">
            <span style="color: #F56C6C; font-weight: 600">¥{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际到账" width="120" align="center">
          <template #default="{ row }">
            <span style="color: #67C23A; font-weight: 600">¥{{ row.actualAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="fee" label="手续费" width="100" align="center">
          <template #default="{ row }">
            ¥{{ row.fee }}
          </template>
        </el-table-column>
        <el-table-column prop="accountType" label="提现方式" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.accountType === 1" type="primary">支付宝</el-tag>
            <el-tag v-else-if="row.accountType === 2" type="success">微信</el-tag>
            <el-tag v-else-if="row.accountType === 3" type="warning">银行卡</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountName" label="账户姓名" width="120" />
        <el-table-column prop="accountInfo" label="账户信息" width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待处理</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已完成</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger">已拒绝</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="申请时间" width="170" align="center" />
        <el-table-column label="操作" width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" :icon="View" @click="handleView(row)">查看</el-button>
            <el-button 
              v-if="row.status == 0" 
              type="success" 
              size="small" 
              @click="handleProcess(row, 1)"
            >
              处理
            </el-button>
            <el-button 
              v-if="row.status == 0" 
              type="danger" 
              size="small" 
              @click="handleProcess(row, 2)"
            >
              拒绝
            </el-button>
            <el-popconfirm 
              v-if="row.status === 2"
              title="确定要删除该提现记录吗？" 
              @confirm="handleDelete(row.id)"
            >
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
      title="提现详情"
      width="700px"
    >
      <el-descriptions :column="2" border v-if="viewData">
        <el-descriptions-item label="流水号" :span="2">{{ viewData.withdrawNo }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ viewData.nickname || viewData.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="提现状态">
          <el-tag v-if="viewData.status === 0" type="warning">待处理</el-tag>
          <el-tag v-else-if="viewData.status === 1" type="success">已完成</el-tag>
          <el-tag v-else-if="viewData.status === 2" type="danger">已拒绝</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提现金额">
          <span style="color: #F56C6C; font-weight: 600">¥{{ viewData.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="手续费">¥{{ viewData.fee }}</el-descriptions-item>
        <el-descriptions-item label="实际到账">
          <span style="color: #67C23A; font-weight: 600">¥{{ viewData.actualAmount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="提现方式">
          <el-tag v-if="viewData.accountType === 1" type="primary">支付宝</el-tag>
          <el-tag v-else-if="viewData.accountType === 2" type="success">微信</el-tag>
          <el-tag v-else-if="viewData.accountType === 3" type="warning">银行卡</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="账户姓名">{{ viewData.accountName }}</el-descriptions-item>
        <el-descriptions-item label="账户信息" :span="2">{{ viewData.accountInfo }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ viewData.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ viewData.processTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="拒绝原因" :span="2" v-if="viewData.rejectReason">
          <span style="color: #F56C6C">{{ viewData.rejectReason }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2" v-if="viewData.remark">
          {{ viewData.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 处理对话框 -->
    <el-dialog
      v-model="processDialogVisible"
      :title="processType === 1 ? '处理提现转账' : '审核拒绝'"
      width="600px"
    >
      <el-form ref="processFormRef" :model="processForm" :rules="processRules" label-width="100px">
        <el-alert
          v-if="processType === 1"
          title="确认转账信息无误后，系统将直接调用支付宝接口向用户转账"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        />
        <el-alert
          v-else
          title="确认拒绝该提现申请？"
          type="error"
          :closable="false"
          style="margin-bottom: 20px"
        />
        
        <el-form-item label="流水号">
          <el-text>{{ processForm.withdrawNo }}</el-text>
        </el-form-item>
        
        <el-form-item label="提现金额">
          <el-text type="danger" size="large">¥{{ processForm.amount }}</el-text>
        </el-form-item>
        
        <el-form-item label="实际到账">
          <el-text type="success" size="large">¥{{ processForm.actualAmount }}</el-text>
        </el-form-item>
        
        <!-- 通过时显示转账信息 -->
        <template v-if="processType === 1">
          <el-divider content-position="left">
            <el-icon style="vertical-align: middle; margin-right: 5px"><CreditCard /></el-icon>
            支付宝转账信息
          </el-divider>
          
          <el-form-item label="付款账号">
            <el-tag type="primary" effect="dark" size="large">aovfwp5109@sandbox.com</el-tag>
          </el-form-item>
          
          <el-form-item label="收款账号">
            <el-tag type="success" size="large">{{ processForm.accountInfo }}</el-tag>
            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
              用户填写的提现账号
            </div>
          </el-form-item>
          
          <el-form-item label="收款姓名">
            <el-tag type="success" size="large">{{ processForm.accountName }}</el-tag>
            <div style="font-size: 12px; color: #909399; margin-top: 5px;">
              用户填写的账户姓名
            </div>
          </el-form-item>
          
          <el-form-item label="转账金额">
            <el-text type="success" size="large" tag="b" style="font-size: 24px;">¥{{ processForm.actualAmount }}</el-text>
          </el-form-item>
          
          <el-divider />
        </template>
        
        <el-form-item v-if="processType === 2" label="拒绝原因" prop="rejectReason">
          <el-input
            v-model="processForm.rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="processForm.remark"
            type="textarea"
            :rows="2"
            placeholder="选填"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="processDialogVisible = false">取消</el-button>
        <el-button 
          :type="processType === 1 ? 'success' : 'danger'" 
          @click="handleProcessSubmit"
          :loading="processLoading"
        >
          {{ processType === 1 ? (processLoading ? '转账中...' : '确认处理并转账') : '确认拒绝' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, View, Delete, CreditCard } from '@element-plus/icons-vue'
import * as withdrawAPI from '@/api/admin/withdraw'

const searchForm = reactive({
  withdrawNo: '',
  userId: null,
  status: null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const withdrawList = ref([])
const loading = ref(false)
const viewDialogVisible = ref(false)
const viewData = ref(null)
const processDialogVisible = ref(false)
const processFormRef = ref(null)
const processLoading = ref(false)
const processType = ref(1) // 1-通过，2-拒绝

const processForm = reactive({
  id: null,
  withdrawNo: '',
  amount: 0,
  actualAmount: 0,
  accountType: 1,
  accountInfo: '',
  accountName: '',
  status: 1,
  rejectReason: '',
  remark: ''
})

const processRules = {
  rejectReason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' }
  ]
}

const loadWithdrawList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const response = await withdrawAPI.getWithdrawList(params)
    if (response && response.data) {
      withdrawList.value = response.data
      pagination.total = response.totalCount || 0
    } else {
      withdrawList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取提现列表失败：', error)
    ElMessage.error('获取提现列表失败')
    withdrawList.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadWithdrawList()
}

const handleReset = () => {
  searchForm.withdrawNo = ''
  searchForm.userId = null
  searchForm.status = null
  pagination.pageNum = 1
  loadWithdrawList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadWithdrawList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadWithdrawList()
}

const handleView = async (row) => {
  try {
    const response = await withdrawAPI.getWithdrawById(row.id)
    viewData.value = response  // request.js 已经解包了 data，直接使用 response
    viewDialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取提现详情失败')
  }
}

const handleProcess = (row, type) => {
  processType.value = type
  Object.assign(processForm, {
    id: row.id,
    withdrawNo: row.withdrawNo,
    amount: row.amount,
    actualAmount: row.actualAmount,
    accountType: row.accountType,
    accountInfo: row.accountInfo,
    accountName: row.accountName,
    status: type,
    rejectReason: '',
    remark: ''
  })
  processDialogVisible.value = true
}

const handleProcessSubmit = async () => {
  try {
    if (processType.value === 2) {
      await processFormRef.value.validate()
    }
    
    processLoading.value = true
    
    const submitData = {
      id: processForm.id,
      status: processForm.status,
      rejectReason: processForm.rejectReason,
      remark: processForm.remark
    }
    
    const response = await withdrawAPI.processWithdraw(submitData)
    
    if (processType.value === 1) {
      // 处理转账：转账成功
      if (response && response.orderId) {
        ElMessage.success({
          message: `转账成功！支付宝转账单号：${response.orderId}`,
          duration: 5000,
          type: 'success'
        })
      } else {
        ElMessage.success({
          message: '转账成功！',
          duration: 3000,
          type: 'success'
        })
      }
    } else {
      ElMessage.success('审核拒绝成功')
    }
    
    processDialogVisible.value = false
    loadWithdrawList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败，请重试')
    }
  } finally {
    processLoading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await withdrawAPI.deleteWithdraw(id)
    ElMessage.success('删除成功')
    loadWithdrawList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadWithdrawList()
})
</script>

<style scoped>
.withdraws-page {
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

