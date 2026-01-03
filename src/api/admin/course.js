/**
 * Admin 后台管理 - 课程管理 API
 * 
 * @author AI Assistant
 * @date 2025-10-13
 */

import { adminRequest } from '@/utils/request'

/**
 * 获取课程列表（分页）
 */
export const getCourseList = (data) => {
  return adminRequest({
    url: '/course/list',
    method: 'post',
    data
  })
}

/**
 * 添加课程
 */
export const addCourse = (data) => {
  return adminRequest({
    url: '/course/add',
    method: 'post',
    data
  })
}

/**
 * 更新课程信息
 */
export const updateCourse = (data) => {
  return adminRequest({
    url: '/course/update',
    method: 'put',
    data
  })
}

/**
 * 删除课程
 */
export const deleteCourse = (id) => {
  return adminRequest({
    url: `/course/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID获取课程详情
 */
export const getCourseById = (id) => {
  return adminRequest({
    url: `/course/getById/${id}`,
    method: 'get'
  })
}

