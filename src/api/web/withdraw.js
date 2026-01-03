import { webRequest } from '@/utils/request'

/**
 * 创建提现申请
 */
export const createWithdrawOrder = (data) => {
  return webRequest({
    url: '/withdraw/create',
    method: 'post',
    data
  })
}

/**
 * 获取提现订单列表
 */
export const getWithdrawOrderList = (pageNo, pageSize, status) => {
  return webRequest({
    url: '/withdraw/list',
    method: 'get',
    params: {
      pageNo,
      pageSize,
      status
    }
  })
}

/**
 * 根据ID获取提现订单详情
 */
export const getWithdrawOrderDetail = (id) => {
  return webRequest({
    url: `/withdraw/detail/${id}`,
    method: 'get'
  })
}

/**
 * 取消提现申请
 */
export const cancelWithdrawOrder = (id) => {
  return webRequest({
    url: `/withdraw/cancel/${id}`,
    method: 'post'
  })
}

