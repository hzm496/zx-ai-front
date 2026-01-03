import {webRequest} from '@/utils/request'

/**
 * 保存学习记录
 * @param {Object} data - 学习记录数据
 * @param {number} data.courseId - 课程ID
 * @param {number} data.chapterId - 章节ID
 * @param {number} data.progress - 观看进度（秒）
 * @param {number} data.duration - 章节总时长（秒）
 */
export function saveLearningRecord(data) {
  return webRequest({
    url: '/learning/record/save',
    method: 'post',
    data
  })
}

/**
 * 获取用户的学习记录列表
 */
export function getLearningRecords() {
  return webRequest({
    url: '/learning/records',
    method: 'get'
  })
}

/**
 * 获取用户在某个课程的最新学习记录
 * @param {number} courseId - 课程ID
 */
export function getLearningRecordByCourse(courseId) {
  return webRequest({
    url: `/learning/record/course/${courseId}`,
    method: 'get'
  })
}

/**
 * 获取用户在某个章节的学习记录
 * @param {number} courseId - 课程ID
 * @param {number} chapterId - 章节ID
 */
export function getLearningRecordByChapter(courseId, chapterId) {
  return webRequest({
    url: '/learning/record/chapter',
    method: 'get',
    params: { courseId, chapterId }
  })
}

