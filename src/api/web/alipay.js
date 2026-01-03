import { webRequest } from '@/utils/request'

/**
 * 创建支付宝支付订单（返回支付表单HTML）
 */
export function createAlipayOrder(orderNo) {
  // 注意：这个接口返回HTML，不经过JSON处理
  return `/api/web/alipay/pay?orderNo=${orderNo}`
}

/**
 * 查询订单支付状态
 */
export function queryOrderStatus(orderNo) {
  return webRequest({
    url: `/alipay/query/${orderNo}`,
    method: 'get'
  })
}

