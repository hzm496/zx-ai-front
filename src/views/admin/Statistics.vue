<template>
  <div class="statistics-page">
    <div class="page-header">
      <h2>数据统计</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 日期筛选 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="searchForm" inline>
        <el-form-item label="查询天数">
          <el-select v-model="searchForm.days" placeholder="选择天数" style="width: 150px">
            <el-option label="最近7天" :value="7" />
            <el-option label="最近15天" :value="15" />
            <el-option label="最近30天" :value="30" />
            <el-option label="最近90天" :value="90" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据趋势图 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>用户增长趋势</span>
              <el-icon><TrendCharts /></el-icon>
            </div>
          </template>
          <div ref="userChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>订单增长趋势</span>
              <el-icon><TrendCharts /></el-icon>
            </div>
          </template>
          <div ref="orderChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>收入趋势</span>
              <el-icon><Money /></el-icon>
            </div>
          </template>
          <div ref="revenueChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>课程增长趋势</span>
              <el-icon><Reading /></el-icon>
            </div>
          </template>
          <div ref="courseChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 统计数据表格 -->
    <el-card class="table-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>统计数据列表</span>
          <el-button :icon="Refresh" circle @click="loadStatisticsList" />
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="statisticsList"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="statDate" label="日期" width="120" align="center" />
        <el-table-column prop="newUserCount" label="新增用户" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success">{{ row.newUserCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="activeUserCount" label="活跃用户" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="primary">{{ row.activeUserCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="newOrderCount" label="新增订单" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.newOrderCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额" width="120" align="center">
          <template #default="{ row }">
            <span style="color: #F56C6C; font-weight: 600">¥{{ row.orderAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="newCourseCount" label="新增课程" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">{{ row.newCourseCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="learningDuration" label="学习时长" width="120" align="center">
          <template #default="{ row }">
            {{ formatDuration(row.learningDuration) }}
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, TrendCharts, Money, Reading } from '@element-plus/icons-vue'
import * as statisticsAPI from '@/api/admin/statistics'
import * as echarts from 'echarts'

const searchForm = reactive({
  days: 7
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

const statisticsList = ref([])
const loading = ref(false)
const chartData = ref([])

// 图表实例引用
const userChartRef = ref(null)
const orderChartRef = ref(null)
const revenueChartRef = ref(null)
const courseChartRef = ref(null)

let userChart = null
let orderChart = null
let revenueChart = null
let courseChart = null

// 加载统计数据
const loadRecentData = async () => {
  try {
    const response = await statisticsAPI.getRecentDays(searchForm.days)
    chartData.value = response || []
    renderCharts()
  } catch (error) {
    console.error('获取统计数据失败：', error)
    ElMessage.error('获取统计数据失败')
  }
}

// 加载统计列表
const loadStatisticsList = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const response = await statisticsAPI.getStatisticsList(params)
    if (response && response.data) {
      statisticsList.value = response.data
      pagination.total = response.totalCount || 0
    } else {
      statisticsList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取统计列表失败：', error)
    ElMessage.error('获取统计列表失败')
    statisticsList.value = []
  } finally {
    loading.value = false
  }
}

// 渲染图表
const renderCharts = () => {
  nextTick(() => {
    if (!chartData.value || chartData.value.length === 0) {
      return
    }

    const dates = chartData.value.map(item => item.statDate)
    
    // 用户增长趋势图
    renderUserChart(dates)
    
    // 订单增长趋势图
    renderOrderChart(dates)
    
    // 收入趋势图
    renderRevenueChart(dates)
    
    // 课程增长趋势图
    renderCourseChart(dates)
  })
}

// 用户增长趋势图
const renderUserChart = (dates) => {
  if (!userChartRef.value) return
  
  if (userChart) {
    userChart.dispose()
  }
  
  userChart = echarts.init(userChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增用户', '活跃用户']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: chartData.value.map(item => item.newUserCount),
        smooth: true,
        itemStyle: { color: '#67C23A' }
      },
      {
        name: '活跃用户',
        type: 'line',
        data: chartData.value.map(item => item.activeUserCount),
        smooth: true,
        itemStyle: { color: '#409EFF' }
      }
    ]
  }
  
  userChart.setOption(option)
}

// 订单增长趋势图
const renderOrderChart = (dates) => {
  if (!orderChartRef.value) return
  
  if (orderChart) {
    orderChart.dispose()
  }
  
  orderChart = echarts.init(orderChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增订单']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增订单',
        type: 'line',
        data: chartData.value.map(item => item.newOrderCount),
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230, 162, 60, 0.3)' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.05)' }
          ])
        },
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  
  orderChart.setOption(option)
}

// 收入趋势图
const renderRevenueChart = (dates) => {
  if (!revenueChartRef.value) return
  
  if (revenueChart) {
    revenueChart.dispose()
  }
  
  revenueChart = echarts.init(revenueChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: ¥{c}'
    },
    legend: {
      data: ['订单金额']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [
      {
        name: '订单金额',
        type: 'bar',
        data: chartData.value.map(item => item.orderAmount),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#F56C6C' },
            { offset: 1, color: '#FFA07A' }
          ])
        }
      }
    ]
  }
  
  revenueChart.setOption(option)
}

// 课程增长趋势图
const renderCourseChart = (dates) => {
  if (!courseChartRef.value) return
  
  if (courseChart) {
    courseChart.dispose()
  }
  
  courseChart = echarts.init(courseChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增课程']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增课程',
        type: 'line',
        data: chartData.value.map(item => item.newCourseCount),
        smooth: true,
        itemStyle: { color: '#909399' }
      }
    ]
  }
  
  courseChart.setOption(option)
}

// 格式化时长（秒转小时）
const formatDuration = (seconds) => {
  if (!seconds) return '0小时'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}小时${minutes}分钟` : `${minutes}分钟`
}

const handleSearch = () => {
  loadRecentData()
}

const handleReset = () => {
  searchForm.days = 7
  loadRecentData()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  loadStatisticsList()
}

const handleCurrentChange = (page) => {
  pagination.pageNum = page
  loadStatisticsList()
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  userChart?.resize()
  orderChart?.resize()
  revenueChart?.resize()
  courseChart?.resize()
}

onMounted(() => {
  loadRecentData()
  loadStatisticsList()
  
  window.addEventListener('resize', handleResize)
})

// 组件销毁时清理
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  userChart?.dispose()
  orderChart?.dispose()
  revenueChart?.dispose()
  courseChart?.dispose()
})
</script>

<style scoped>
.statistics-page {
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

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.chart-container {
  height: 350px;
  width: 100%;
}

.table-card {
  margin-bottom: 20px;
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

