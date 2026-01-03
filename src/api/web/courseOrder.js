import request from '@/utils/request'

/**
 * 创建课程订单
 * @param {Object} data - 订单信息
 * @returns {Promise}
 */
export const createCourseOrder = (data) => {
  return request({
    url: '/course/order/create',
    method: 'post',
    data
  })
}

/**
 * 支付宝支付回调
 * @param {Object} params - 回调参数
 * @returns {Promise}
 */
export const alipayCallback = (params) => {
  return request({
    url: '/course/order/alipay/callback',
    method: 'post',
    params
  })
}

/**
 * 分页查询用户的课程订单列表
 * @param {Number} pageNo - 页码
 * @param {Number} pageSize - 每页数量
 * @returns {Promise}
 */
export const getUserCourseOrdersPage = (pageNo, pageSize) => {
  return request({
    url: '/course/order/list',
    method: 'get',
    params: { pageNo, pageSize }
  })
}

/**
 * 取消订单
 * @param {String} orderNo - 订单号
 * @returns {Promise}
 */
export const cancelCourseOrder = (orderNo) => {
  return request({
    url: '/course/order/cancel',
    method: 'post',
    params: { orderNo }
  })
}

/**
 * 继续支付订单（获取订单信息）
 * @param {String} orderNo - 订单号
 * @returns {Promise}
 */
export const continuePayOrder = (orderNo) => {
  return request({
    url: '/course/order/continue-pay',
    method: 'get',
    params: { orderNo }
  })
}

/**
 * 继续支付 - 余额支付
 * @param {String} orderNo - 订单号
 * @param {String} payPassword - 支付密码
 * @returns {Promise}
 */
export const continueBalancePay = (orderNo, payPassword) => {
  return request({
    url: '/course/order/continue-pay/balance',
    method: 'post',
    params: { orderNo, payPassword }
  })
}

