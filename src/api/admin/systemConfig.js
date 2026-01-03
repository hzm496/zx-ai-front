import { adminRequest } from '@/utils/request'

/**
 * 查询所有系统配置
 */
export function getAllConfigs() {
  return adminRequest({
    url: '/system-config/all',
    method: 'get'
  })
}

/**
 * 根据配置键查询配置值
 */
export function getConfigByKey(configKey) {
  return adminRequest({
    url: '/system-config/get',
    method: 'get',
    params: { configKey }
  })
}

/**
 * 批量更新配置
 */
export function batchUpdateConfigs(configs) {
  return adminRequest({
    url: '/system-config/batch-update',
    method: 'post',
    data: configs
  })
}

/**
 * 更新单个配置
 */
export function updateConfig(config) {
  return adminRequest({
    url: '/system-config/update',
    method: 'post',
    data: config
  })
}

