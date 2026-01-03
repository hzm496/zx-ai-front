import { webRequest } from '@/utils/request'

/**
 * 查询可领取的活动列表
 * @returns {Promise}
 */
export const getAvailableActivities = () => {
  return webRequest({
    url: '/activity/list',
    method: 'get'
  })
}

/**
 * 领取活动奖励
 * @param {Number} activityId - 活动ID
 * @returns {Promise}
 */
export const receiveActivity = (activityId) => {
  return webRequest({
    url: `/activity/receive/${activityId}`,
    method: 'post'
  })
}

