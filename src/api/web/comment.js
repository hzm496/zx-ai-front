import { webRequest } from '@/utils/request'

/**
 * 获取课程的一级评论列表（分页）
 * 每条一级评论包含：第一条回复 + 回复总数
 */
export function getFirstLevelComments(courseId, pageNo = 1, pageSize = 10) {
  return webRequest({
    url: `/comment/list/${courseId}`,
    method: 'get',
    params: { pageNo, pageSize }
  })
}

/**
 * 获取某评论的回复列表（分页）
 */
export function getRepliesByParentId(parentId, pageNo = 1, pageSize = 10) {
  return webRequest({
    url: `/comment/replies/${parentId}`,
    method: 'get',
    params: { pageNo, pageSize }
  })
}

/**
 * 创建评论（一级评论或回复）
 */
export function createComment(data) {
  return webRequest({
    url: '/comment/create',
    method: 'post',
    data
  })
}

/**
 * 删除评论
 */
export function deleteComment(commentId) {
  return webRequest({
    url: `/comment/${commentId}`,
    method: 'delete'
  })
}

/**
 * 点赞评论
 */
export function likeComment(commentId) {
  return webRequest({
    url: `/comment/like/${commentId}`,
    method: 'post'
  })
}

/**
 * 取消点赞评论
 */
export function unlikeComment(commentId) {
  return webRequest({
    url: `/comment/like/${commentId}`,
    method: 'delete'
  })
}

