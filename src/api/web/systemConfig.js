import { webRequest } from '@/utils/request'

/**
 * 查询所有公开的系统配置
 */
export function getPublicConfigs() {
  return webRequest({
    url: '/system-config/public',
    method: 'get'
  })
}

/**
 * 根据配置键查询配置值
 */
export function getConfigByKey(configKey) {
  return webRequest({
    url: '/system-config/get',
    method: 'get',
    params: { configKey }
  })
}


