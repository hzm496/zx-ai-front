import request from '@/utils/request'

/**
 * 分页查询用户的课程列表（我的课程）
 * @param {Number} pageNo - 页码
 * @param {Number} pageSize - 每页数量
 * @returns {Promise}
 */
export const getUserCoursesPage = (pageNo, pageSize) => {
  return request({
    url: '/user/course/my',
    method: 'get',
    params: { pageNo, pageSize }
  })
}

/**
 * 检查用户是否拥有课程
 * @param {Number} courseId - 课程ID
 * @returns {Promise}
 */
export const checkUserHasCourse = (courseId) => {
  return request({
    url: `/user/course/check/${courseId}`,
    method: 'get'
  })
}

