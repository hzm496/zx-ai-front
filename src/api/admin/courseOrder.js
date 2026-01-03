import { adminRequest } from '@/utils/request'

/**
 * 分页查询课程订单列表
 */
export const getCourseOrderList = (data) => {
  return adminRequest({
    url: '/course/order/list',
    method: 'post',
    data
  })
}

