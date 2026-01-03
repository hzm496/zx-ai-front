import { adminRequest } from '@/utils/request'

/**
 * 获取提现订单列表
 */
export const getWithdrawList = (data) => {
  return adminRequest({
    url: '/withdraw/list',
    method: 'post',
    data
  })
}

/**
 * 根据ID获取提现订单详情
 */
export const getWithdrawById = (id) => {
  return adminRequest({
    url: `/withdraw/getById/${id}`,
    method: 'get'
  })
}

/**
 * 处理提现申请（审核）
 */
export const processWithdraw = (data) => {
  return adminRequest({
    url: '/withdraw/process',
    method: 'post',
    data
  })
}

/**
 * 删除提现订单
 */
export const deleteWithdraw = (id) => {
  return adminRequest({
    url: `/withdraw/delete/${id}`,
    method: 'delete'
  })
}

