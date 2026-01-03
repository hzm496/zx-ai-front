/**
 * Admin 后台管理 - 课程章节 API
 * 
 * @author AI Assistant
 * @date 2025-10-16
 */

import { adminRequest } from '@/utils/request'

/**
 * 获取课程的章节列表（树形结构）
 */
export const getChapterTree = (courseId) => {
  return adminRequest({
    url: `/chapter/tree/${courseId}`,
    method: 'get'
  })
}

/**
 * 添加章节
 */
export const addChapter = (data) => {
  return adminRequest({
    url: '/chapter/add',
    method: 'post',
    data
  })
}

/**
 * 更新章节
 */
export const updateChapter = (data) => {
  return adminRequest({
    url: '/chapter/update',
    method: 'put',
    data
  })
}

/**
 * 删除章节
 */
export const deleteChapter = (id) => {
  return adminRequest({
    url: `/chapter/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 根据ID获取章节详情
 */
export const getChapterById = (id) => {
  return adminRequest({
    url: `/chapter/getById/${id}`,
    method: 'get'
  })
}

