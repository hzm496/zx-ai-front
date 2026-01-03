import { adminRequest } from '@/utils/request'

/**
 * 分页查询活动列表
 * @param {Object} data - 查询参数
 * @returns {Promise}
 */
export const getActivityList = (data) => {
  return adminRequest({
    url: '/activity/list',
    method: 'post',
    data
  })
}

/**
 * 添加活动
 * @param {Object} data - 活动信息
 * @returns {Promise}
 */
export const addActivity = (data) => {
  return adminRequest({
    url: '/activity/add',
    method: 'post',
    data
  })
}

/**
 * 更新活动
 * @param {Object} data - 活动信息
 * @returns {Promise}
 */
export const updateActivity = (data) => {
  return adminRequest({
    url: '/activity/update',
    method: 'post',
    data
  })
}

/**
 * 删除活动
 * @param {Number} id - 活动ID
 * @returns {Promise}
 */
export const deleteActivity = (id) => {
  return adminRequest({
    url: `/activity/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 更新活动状态
 * @param {Number} id - 活动ID
 * @param {Number} status - 状态
 * @returns {Promise}
 */
export const updateActivityStatus = (id, status) => {
  return adminRequest({
    url: `/activity/status/${id}`,
    method: 'put',
    params: { status }
  })
}

