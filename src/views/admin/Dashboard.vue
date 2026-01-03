<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    
    <!-- 数据统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon user"><User /></el-icon>
            <div class="stat-info">
              <div class="stat-title">总用户数</div>
              <div class="stat-value">{{ statistics.totalUsers || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon course"><Reading /></el-icon>
            <div class="stat-info">
              <div class="stat-title">总课程数</div>
              <div class="stat-value">{{ statistics.totalCourses || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon order"><Tickets /></el-icon>
            <div class="stat-info">
              <div class="stat-title">今日收入</div>
              <div class="stat-value">¥{{ statistics.todayRevenue || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon revenue"><Money /></el-icon>
            <div class="stat-info">
              <div class="stat-title">总收入</div>
              <div class="stat-value">¥{{ statistics.totalRevenue || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
  <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>课程分类分布</span>
            </div>
          </template>
          <div ref="courseChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
        <!-- 课程新增趋势 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>课程新增趋势（最近7天）</span>
            </div>
          </template>
          <div ref="courseNewChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>订单趋势（最近7天）</span>
            </div>
          </template>
          <div ref="orderChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>用户增长趋势（最近7天）</span>
            </div>
          </template>
          <div ref="userChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>  
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Reading, Tickets, Money } from '@element-plus/icons-vue'
import * as statisticsAPI from '@/api/admin/statistics'
import * as echarts from 'echarts'

// 统计数据
const statistics = ref({
  totalUsers: 0,
  totalCourses: 0,
  totalOrders: 0,
  totalRevenue: 0
})

// 图表实例
const orderChartRef = ref(null)
const userChartRef = ref(null)
const courseChartRef = ref(null)
const courseNewChartRef = ref(null)
let orderChart = null
let userChart = null
let courseChart = null
let courseNewChart = null

// 加载仪表盘数据
const loadDashboardData = async () => {
  try {
    const response = await statisticsAPI.getDashboardOverview()
    if (response) {
      statistics.value = response
    }
  } catch (error) {
    console.error('获取仪表盘数据失败：', error)
    ElMessage.error('获取仪表盘数据失败')
  }
}

// 加载订单趋势数据
const loadOrderTrend = async () => {
  try {
    const response = await statisticsAPI.getDailyOrderTrend(7)
    console.log('订单趋势数据：', response)
    if (response && response.length > 0) {
      renderOrderChart(response)
    } else {
      renderOrderChart([])
    }
  } catch (error) {
    console.error('获取订单趋势失败：', error)
    renderOrderChart([])
  }
}

// 加载用户增长趋势（从user表直接查询）
const loadUserTrend = async () => {
  try {
    const response = await statisticsAPI.getDailyUserCount(7)
    console.log('用户趋势数据：', response)
    if (response && response.length > 0) {
      renderUserChart(response)
    } else {
      // 如果没有数据，渲染一个空图表
      renderUserChart([])
    }
  } catch (error) {
    console.error('获取用户趋势失败：', error)
    renderUserChart([])
  }
}

// 加载课程分类分布
const loadCourseDistribution = async () => {
  try {
    const response = await statisticsAPI.getCourseCategoryDistribution()
    console.log('课程分布数据：', response)
    if (response && response.length > 0) {
      renderCourseChart(response)
    } else {
      // 如果没有数据，渲染一个空图表
      renderCourseChart([])
    }
  } catch (error) {
    console.error('获取课程分布失败：', error)
    renderCourseChart([])
  }
}

// 加载课程新增趋势
const loadCourseNewTrend = async () => {
  try {
    const response = await statisticsAPI.getDailyCourseCount(7)
    console.log('课程新增趋势数据：', response)
    if (response && response.length > 0) {
      renderCourseNewChart(response)
    } else {
      renderCourseNewChart([])
    }
  } catch (error) {
    console.error('获取课程新增趋势失败：', error)
    renderCourseNewChart([])
  }
}

// 渲染订单趋势图（双折线图：课程订单 + VIP订单）
const renderOrderChart = (data) => {
  nextTick(() => {
    if (!orderChartRef.value) {
      console.error('orderChartRef 未找到')
      return
    }

    if (orderChart) {
      orderChart.dispose()
    }

    orderChart = echarts.init(orderChartRef.value)

    // 处理数据
    let dates, courseOrders, vipOrders
    if (!data || data.length === 0) {
      dates = []
      courseOrders = []
      vipOrders = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        courseOrders.push(0)
        vipOrders.push(0)
      }
    } else {
      // 处理返回的数据
      const today = new Date()
      const dataMap = new Map()
      
      data.forEach(item => {
        dataMap.set(item.date, {
          courseOrderCount: item.courseOrderCount || 0,
          vipOrderCount: item.vipOrderCount || 0
        })
      })
      
      // 生成最近7天的完整数据
      dates = []
      courseOrders = []
      vipOrders = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        const dayData = dataMap.get(dateStr) || { courseOrderCount: 0, vipOrderCount: 0 }
        courseOrders.push(dayData.courseOrderCount)
        vipOrders.push(dayData.vipOrderCount)
      }
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data: ['课程订单', 'VIP订单'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLabel: {
          formatter: (value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '订单数',
        minInterval: 1
      },
      series: [
        {
          name: '课程订单',
          type: 'line',
          smooth: true,
          data: courseOrders,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#409EFF'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ])
          }
        },
        {
          name: 'VIP订单',
          type: 'line',
          smooth: true,
          data: vipOrders,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#F56C6C'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
            ])
          }
        }
      ]
    }

    orderChart.setOption(option)
  })
}

// 渲染用户增长趋势图（折线图）
const renderUserChart = (data) => {
  nextTick(() => {
    if (!userChartRef.value) {
      console.error('userChartRef 未找到')
      return
    }

    if (userChart) {
      userChart.dispose()
    }

    userChart = echarts.init(userChartRef.value)

    // 如果没有数据，生成最近7天的日期和0数据
    let dates, newUsers
    if (!data || data.length === 0) {
      dates = []
      newUsers = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        newUsers.push(0)
      }
    } else {
      // 处理返回的数据，确保有完整的7天数据
      const today = new Date()
      const dateMap = new Map()
      
      // 将返回的数据放入Map
      data.forEach(item => {
        dateMap.set(item.date, item.userCount || 0)
      })
      
      // 生成最近7天的完整数据
      dates = []
      newUsers = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        newUsers.push(dateMap.get(dateStr) || 0)
      }
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}<br/>注册用户：{c} 人'
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
        data: dates,
        axisLabel: {
          formatter: (value) => {
            // 格式化日期显示
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '注册人数',
        minInterval: 1
      },
      series: [
        {
          name: '注册用户',
          type: 'line',
          smooth: true,
          data: newUsers,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#409EFF'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.4)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
            ])
          }
        }
      ]
    }

    userChart.setOption(option)
  })
}

// 渲染课程分类分布图（饼图）
const renderCourseChart = (data) => {
  nextTick(() => {
    if (!courseChartRef.value) {
      console.error('courseChartRef 未找到')
      return
    }

    if (courseChart) {
      courseChart.dispose()
    }

    courseChart = echarts.init(courseChartRef.value)

    // 如果没有数据，显示空状态
    let chartData, legendData
    if (!data || data.length === 0) {
      chartData = [{ name: '暂无数据', value: 1 }]
      legendData = ['暂无数据']
    } else {
      chartData = data.map(item => ({
        name: item.categoryName,
        value: item.courseCount
      }))
      legendData = data.map(item => item.categoryName)
    }

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        data: legendData
      },
      series: [
        {
          name: '课程分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: chartData
        }
      ]
    }

    courseChart.setOption(option)
  })
}

// 渲染课程新增趋势图（折线图）
const renderCourseNewChart = (data) => {
  nextTick(() => {
    if (!courseNewChartRef.value) {
      console.error('courseNewChartRef 未找到')
      return
    }

    if (courseNewChart) {
      courseNewChart.dispose()
    }

    courseNewChart = echarts.init(courseNewChartRef.value)

    // 如果没有数据，生成最近7天的日期和0数据
    let dates, newCourses
    if (!data || data.length === 0) {
      dates = []
      newCourses = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        newCourses.push(0)
      }
    } else {
      // 处理返回的数据，确保有完整的7天数据
      const today = new Date()
      const dateMap = new Map()
      
      // 将返回的数据放入Map
      data.forEach(item => {
        dateMap.set(item.date, item.courseCount || 0)
      })
      
      // 生成最近7天的完整数据
      dates = []
      newCourses = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dates.push(dateStr)
        newCourses.push(dateMap.get(dateStr) || 0)
      }
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}<br/>新增课程：{c} 门'
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
        data: dates,
        axisLabel: {
          formatter: (value) => {
            // 格式化日期显示
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '课程数',
        minInterval: 1
      },
      series: [
        {
          name: '新增课程',
          type: 'line',
          smooth: true,
          data: newCourses,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#67C23A'
          },
          lineStyle: {
            width: 3
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(103, 194, 58, 0.4)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ])
          }
        }
      ]
    }

    courseNewChart.setOption(option)
  })
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  orderChart?.resize()
  userChart?.resize()
  courseChart?.resize()
  courseNewChart?.resize()
}

onMounted(() => {
  loadDashboardData()
  loadOrderTrend()
  loadUserTrend()
  loadCourseDistribution()
  loadCourseNewTrend()

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  orderChart?.dispose()
  userChart?.dispose()
  courseChart?.dispose()
  courseNewChart?.dispose()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  font-size: 48px;
  margin-right: 20px;
}

.stat-icon.user {
  color: #409eff;
}

.stat-icon.course {
  color: #67c23a;
}

.stat-icon.order {
  color: #e6a23c;
}

.stat-icon.revenue {
  color: #f56c6c;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.chart-container {
  height: 300px;
  width: 100%;
}
</style>
