import { webRequest } from '@/utils/request'

/**
 * 查询用户可用于指定课程的优惠券
 */
export function getAvailableCoupons(courseId, coursePrice) {
  return webRequest({
    url: '/coupon/available',
    method: 'get',
    params: {
      courseId,
      coursePrice
    }
  })
}

/**
 * 计算使用优惠券后的价格
 */
export function calculateDiscountedPrice(coursePrice, userCouponId) {
  return webRequest({
    url: '/coupon/calculate',
    method: 'get',
    params: {
      coursePrice,
      userCouponId
    }
  })
}

