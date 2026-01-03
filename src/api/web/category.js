/**
 * Web端 - 课程分类 API
 * 
 * @author AI Assistant
 * @date 2025-10-16
 */

import { webRequest } from '@/utils/request'

/**
 * 获取所有分类列表
 */
export const getCategoryList = () => {
  return webRequest({
    url: '/category/list',
    method: 'get'
  })
}

/**
 * 获取顶级分类列表（用于学习路径展示）
 */
export const getTopCategories = () => {
  return webRequest({
    url: '/category/top',
    method: 'get'
  })
}

/**
 * 根据分类ID获取课程列表
 */
export const getCoursesByCategory = (categoryId) => {
  return webRequest({
    url: `/category/${categoryId}/courses`,
    method: 'get'
  })
}

/**
 * 获取热门分类列表（包含课程数量）
 */
export const getHotCategories = () => {
  return webRequest({
    url: '/category/hot',
    method: 'get'
  })
}

