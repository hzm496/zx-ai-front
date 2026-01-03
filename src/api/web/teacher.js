import request from '@/utils/request'

/**
 * 获取讲师列表
 */
export function getTeacherList() {
  return request({
    url: '/teacher/list',
    method: 'get'
  })
}

/**
 * 分页查询讲师列表
 */
export function getTeacherListByPage(pageNo, pageSize) {
  return request({
    url: '/teacher/page',
    method: 'get',
    params: { pageNo, pageSize }
  })
}

