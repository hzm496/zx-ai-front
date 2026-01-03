<template>
  <div class="settings-page">
    <div class="page-header">
      <h2>系统设置</h2>
      <p class="subtitle">管理网站基本信息和系统参数</p>
    </div>

    <el-card shadow="hover" v-loading="loading">
      <el-tabs v-model="activeTab">
        <!-- 网站配置 -->
        <el-tab-pane label="网站配置" name="WEBSITE">
          <el-form :model="websiteForm" label-width="120px" class="config-form">
            <el-form-item 
              v-for="config in websiteConfigs" 
              :key="config.configKey"
              :label="config.configLabel"
            >
              <template v-if="config.configType === 'STRING'">
                <el-input 
                  v-model="websiteForm[config.configKey]" 
                  :placeholder="config.configDesc"
                  clearable
                />
              </template>
              <template v-else-if="config.configType === 'BOOLEAN'">
                <el-switch 
                  v-model="websiteForm[config.configKey]"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </template>
              <div class="config-desc">{{ config.configDesc }}</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 维护配置 -->
        <el-tab-pane label="维护模式" name="MAINTENANCE">
          <el-alert
            title="维护模式说明"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 20px;"
          >
            <template #default>
              <p style="margin: 0 0 8px 0;">开启维护模式后，前台用户将无法访问网站，只显示维护提示页面。管理后台不受影响。</p>
              <p style="margin: 0; font-size: 12px; color: #E6A23C;">
                ⚡ 配置更新延迟：维护状态变更后，前台会在 <strong>5-15秒</strong> 内生效（受缓存机制影响）。
              </p>
            </template>
          </el-alert>

          <el-form :model="maintenanceForm" label-width="140px" class="config-form">
            <el-form-item 
              v-for="config in maintenanceConfigs" 
              :key="config.configKey"
              :label="config.configLabel"
            >
              <template v-if="config.configType === 'BOOLEAN'">
                <el-switch 
                  v-model="maintenanceForm[config.configKey]"
                  active-text="开启"
                  inactive-text="关闭"
                  :active-value="true"
                  :inactive-value="false"
                />
              </template>
              <template v-else-if="config.configType === 'STRING'">
                <!-- 维护提示 - 多行文本框 -->
                <el-input 
                  v-if="config.configKey === 'maintenance.message'"
                  v-model="maintenanceForm[config.configKey]" 
                  type="textarea"
                  :rows="3"
                  :placeholder="config.configDesc"
                />
                <!-- 预计恢复时间 - 日期时间选择器 -->
                <el-date-picker
                  v-else-if="config.configKey === 'maintenance.end_time'"
                  v-model="maintenanceForm[config.configKey]"
                  type="datetime"
                  placeholder="选择预计恢复时间"
                  format="YYYY-MM-DD HH:mm"
                  value-format="YYYY-MM-DD HH:mm"
                  :clearable="true"
                  style="width: 100%"
                />
                <!-- 其他字符串类型 - 普通文本框 -->
                <el-input 
                  v-else
                  v-model="maintenanceForm[config.configKey]" 
                  :placeholder="config.configDesc"
                  clearable
                />
              </template>
              <div class="config-desc">{{ config.configDesc }}</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 系统配置 -->
        <el-tab-pane label="系统配置" name="SYSTEM">
          <el-form :model="systemForm" label-width="160px" class="config-form">
            <el-form-item 
              v-for="config in systemConfigs" 
              :key="config.configKey"
              :label="config.configLabel"
            >
              <template v-if="config.configType === 'BOOLEAN'">
                <el-switch 
                  v-model="systemForm[config.configKey]"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </template>
              <template v-else-if="config.configType === 'NUMBER'">
                <el-input-number 
                  v-model="systemForm[config.configKey]"
                  :min="1"
                  :max="1000"
                />
              </template>
              <template v-else>
                <el-input 
                  v-model="systemForm[config.configKey]" 
                  :placeholder="config.configDesc"
                />
              </template>
              <div class="config-desc">{{ config.configDesc }}</div>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <div class="form-footer">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">
          保存设置
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllConfigs, batchUpdateConfigs } from '@/api/admin/systemConfig'

const activeTab = ref('WEBSITE')
const loading = ref(false)
const saving = ref(false)

// 原始配置数据
const allConfigs = ref({
  WEBSITE: [],
  MAINTENANCE: [],
  SYSTEM: [],
  PAYMENT: []
})

// 表单数据
const websiteForm = reactive({})
const maintenanceForm = reactive({})
const systemForm = reactive({})

// 计算属性：各分组的配置
const websiteConfigs = computed(() => allConfigs.value.WEBSITE || [])
const maintenanceConfigs = computed(() => allConfigs.value.MAINTENANCE || [])
const systemConfigs = computed(() => allConfigs.value.SYSTEM || [])

// 加载配置
const loadConfigs = async () => {
  try {
    loading.value = true
    const result = await getAllConfigs()
    allConfigs.value = result
    
    // 初始化表单数据
    initFormData()
  } catch (error) {
    console.error('加载配置失败：', error)
    ElMessage.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// 初始化表单数据
const initFormData = () => {
  // 网站配置
  allConfigs.value.WEBSITE.forEach(config => {
    websiteForm[config.configKey] = parseConfigValue(config.configValue, config.configType)
  })
  
  // 维护配置
  allConfigs.value.MAINTENANCE.forEach(config => {
    maintenanceForm[config.configKey] = parseConfigValue(config.configValue, config.configType)
  })
  
  // 系统配置
  allConfigs.value.SYSTEM.forEach(config => {
    systemForm[config.configKey] = parseConfigValue(config.configValue, config.configType)
  })
}

// 解析配置值
const parseConfigValue = (value, type) => {
  if (type === 'BOOLEAN') {
    return value === 'true'
  } else if (type === 'NUMBER') {
    return parseInt(value) || 0
  }
  return value || ''
}

// 格式化配置值（用于保存）
const formatConfigValue = (value, type) => {
  if (type === 'BOOLEAN') {
    return value ? 'true' : 'false'
  } else if (type === 'NUMBER') {
    return String(value)
  }
  return String(value)
}

// 保存设置
const handleSave = async () => {
  try {
    await ElMessageBox.confirm('确定要保存这些配置吗？', '确认保存', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    saving.value = true
    
    // 收集所有配置
    const updates = []
    
    // 网站配置
    allConfigs.value.WEBSITE.forEach(config => {
      updates.push({
        configKey: config.configKey,
        configValue: formatConfigValue(websiteForm[config.configKey], config.configType)
      })
    })
    
    // 维护配置
    allConfigs.value.MAINTENANCE.forEach(config => {
      updates.push({
        configKey: config.configKey,
        configValue: formatConfigValue(maintenanceForm[config.configKey], config.configType)
      })
    })
    
    // 系统配置
    allConfigs.value.SYSTEM.forEach(config => {
      updates.push({
        configKey: config.configKey,
        configValue: formatConfigValue(systemForm[config.configKey], config.configType)
      })
    })
    
    // 批量更新
    await batchUpdateConfigs(updates)
    
    ElMessage.success({
      message: '保存成功！配置将在 5-15 秒内生效。',
      duration: 3000
    })
    
    // 重新加载配置
    await loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存失败：', error)
      ElMessage.error('保存失败')
    }
  } finally {
    saving.value = false
  }
}

// 重置
const handleReset = () => {
  initFormData()
  ElMessage.info('已重置')
}

onMounted(() => {
  loadConfigs()
})
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #303133;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

.config-form {
  max-width: 800px;
}

.config-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  text-align: right;
}
</style>

