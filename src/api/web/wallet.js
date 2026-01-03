import request from '@/utils/request'

/**
 * 获取用户钱包信息
 */
export function getWalletInfo() {
  return request({
    url: '/wallet/info',
    method: 'get'
  })
}

/**
 * 激活钱包（开通钱包，设置支付密码）
 */
export function activateWallet(data) {
  return request({
    url: '/wallet/activate',
    method: 'post',
    data
  })
}

/**
 * 获取钱包交易记录
 */
export function getTransactions(params) {
  return request({
    url: '/wallet/transactions',
    method: 'get',
    params
  })
}

