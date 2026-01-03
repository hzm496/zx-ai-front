/**
 * Admin 后台管理 - 统计数据 API
 * 
 * @author AI Assistant
 * @date 2025-10-16
 */

import { adminRequest } from '@/utils/request'

/**
 * 获取统计列表（分页）
 */
export const getStatisticsList = (data) => {
  return adminRequest({
    url: '/statistics/list',
    method: 'post',
    data
  })
}

/**
 * 查询最近N天的统计数据
 */
export const getRecentDays = (days) => {
  return adminRequest({
    url: `/statistics/recent/${days}`,
    method: 'get'
  })
}

/**
 * 获取仪表盘总览数据
 */
export const getDashboardOverview = () => {
  return adminRequest({
    url: '/statistics/dashboard/overview',
    method: 'get'
  })
}

/**
 * 获取课程分类分布
 */
export const getCourseCategoryDistribution = () => {
  return adminRequest({
    url: '/statistics/course/distribution',
    method: 'get'
  })
}

/**
 * 获取最近N天每日注册用户数
 */
export const getDailyUserCount = (days) => {
  return adminRequest({
    url: `/statistics/daily/users/${days}`,
    method: 'get'
  })
}

/**
 * 获取最近N天每日订单数趋势
 */
export const getDailyOrderTrend = (days) => {
  return adminRequest({
    url: `/statistics/daily/orders/${days}`,
    method: 'get'
  })
}

/**
 * 获取最近N天每日新增课程数
 */
export const getDailyCourseCount = (days) => {
  return adminRequest({
    url: `/statistics/daily/courses/${days}`,
    method: 'get'
  })
}

