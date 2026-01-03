/**
 * Admin 后台管理 - 课程分类管理 API
 * 
 * @author AI Assistant
 * @date 2025-10-13
 */

import { adminRequest } from '@/utils/request'

/**
 * 获取所有分类列表
 */
export const getCategoryList = () => {
  return adminRequest({
    url: '/category/list',
    method: 'get'
  })
}

/**
 * 添加分类
 */
export const addCategory = (data) => {
  return adminRequest({
    url: '/category/add',
    method: 'post',
    data
  })
}

/**
 * 更新分类信息
 */
export const updateCategory = (data) => {
  return adminRequest({
    url: '/category/update',
    method: 'put',
    data
  })
}

/**
 * 删除分类
 */
export const deleteCategory = (id) => {
  return adminRequest({
    url: `/category/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID获取分类详情
 */
export const getCategoryById = (id) => {
  return adminRequest({
    url: `/category/getById/${id}`,
    method: 'get'
  })
}

