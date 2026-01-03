import { adminRequest } from '@/utils/request'

/**
 * 获取VIP订单列表
 */
export const getVipOrderList = (params) => {
  return adminRequest({
    url: '/vip-order/list',
    method: 'post',
    data: params
  })
}

/**
 * 根据ID获取VIP订单详情
 */
export const getVipOrderById = (id) => {
  return adminRequest({
    url: `/vip-order/getById/${id}`,
    method: 'get'
  })
}

/**
 * 删除VIP订单
 */
export const deleteVipOrder = (id) => {
  return adminRequest({
    url: `/vip-order/delete/${id}`,
    method: 'delete'
  })
}

