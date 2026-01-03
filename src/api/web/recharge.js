/**
 * Web 用户端 - 充值 API
 * 
 * 说明：
 * - 该文件专门用于钱包充值相关的 API 调用
 * - 使用 webRequest 发送请求，自动添加 /api/web 前缀
 * - 请求会被代理到 http://localhost:8081（Web 后端服务）
 * 
 * @author AI Assistant
 * @date 2025-10-26
 */

import { webRequest } from '@/utils/request'

/**
 * ==================== 充值订单管理 ====================
 */

/**
 * 创建充值订单
 * @param {Object} data - 充值订单数据
 * @param {Number} data.amount - 充值金额
 * @param {Number} data.paymentMethod - 支付方式（1-支付宝）
 */
export const createRechargeOrder = (data) => {
  return webRequest({
    url: '/recharge/create',
    method: 'post',
    data
  })
}

/**
 * 获取充值订单列表（分页）
 * @param {Number} pageNo - 页码
 * @param {Number} pageSize - 每页数量
 */
export const getRechargeOrderList = (pageNo = 1, pageSize = 10) => {
  return webRequest({
    url: '/recharge/list',
    method: 'get',
    params: { pageNo, pageSize }
  })
}

/**
 * 根据订单号获取充值订单详情
 * @param {String} orderNo - 订单号
 */
export const getRechargeOrderDetail = (orderNo) => {
  return webRequest({
    url: `/recharge/detail/${orderNo}`,
    method: 'get'
  })
}

/**
 * ==================== 支付相关 ====================
 */

/**
 * 获取支付宝支付URL
 * @param {String} orderNo - 订单号
 */
export const getAlipayUrl = (orderNo) => {
  // 注意：通过Nginx代理访问后端支付接口
  return `/api/web/alipay/recharge/pay?orderNo=${orderNo}`
}

