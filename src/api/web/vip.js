import { webRequest } from '@/utils/request'

/**
 * 获取VIP套餐列表
 */
export function getVipPackages() {
  return webRequest({
    url: '/vip/packages',
    method: 'get'
  })
}

/**
 * 创建VIP订单
 */
export function createVipOrder(data) {
  return webRequest({
    url: '/vip/order/create',
    method: 'post',
    data
  })
}

/**
 * 支付VIP订单
 */
export function payVipOrder(data) {
  return webRequest({
    url: '/vip/order/pay',
    method: 'post',
    data
  })
}

/**
 * 获取VIP订单详情
 */
export function getVipOrderDetail(orderNo) {
  return webRequest({
    url: `/vip/order/${orderNo}`,
    method: 'get'
  })
}

/**
 * 获取VIP状态
 */
export function getVipStatus() {
  return webRequest({
    url: '/vip/status',
    method: 'get'
  })
}

/**
 * 获取VIP订单列表
 */
export function getVipOrders(pageNo = 1, pageSize = 10) {
  return webRequest({
    url: '/vip/orders',
    method: 'get',
    params: { pageNo, pageSize }
  })
}

