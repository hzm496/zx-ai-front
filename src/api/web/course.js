import { webRequest } from '@/utils/request'

/**
 * 根据讲师ID获取课程列表
 */
export function getCoursesByTeacherId(teacherId) {
  return webRequest({
    url: `/course/teacher/${teacherId}`,
    method: 'get'
  })
}

/**
 * 获取推荐课程列表
 */
export function getRecommendCourses() {
  return webRequest({
    url: '/course/recommend',
    method: 'get'
  })
}

/**
 * 根据分类ID分页查询课程列表
 * @param {number} categoryId - 分类ID
 * @param {number} pageNo - 页码
 * @param {number} pageSize - 每页大小
 * @param {number} isFree - 是否免费（可选：1-免费，0-付费，不传-全部）
 */
export function getCoursesByCategory(categoryId, pageNo, pageSize, isFree) {
  const params = { pageNo, pageSize }
  if (isFree !== undefined && isFree !== null) {
    params.isFree = isFree
  }
  return webRequest({
    url: `/course/category/${categoryId}`,
    method: 'get',
    params
  })
}

/**
 * 获取课程详情（包含章节信息）
 */
export function getCourseDetail(courseId) {
  return webRequest({
    url: `/course/detail/${courseId}`,
    method: 'get'
  })
}

/**
 * 获取课程章节列表（树形结构）
 */
export function getCourseChapters(courseId) {
  return webRequest({
    url: `/course/chapters/${courseId}`,
    method: 'get'
  })
}

/**
 * 获取所有课程分类
 */
export function getCourseCategories() {
  return webRequest({
    url: '/course/categories',
    method: 'get'
  })
}

/**
 * 根据课程标题搜索课程
 */
export function searchCourseByTitle(title) {
  return webRequest({
    url: '/course/search',
    method: 'get',
    params: { title }
  })
}
