<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import CustomerServiceChat from '@/components/CustomerServiceChat.vue'
import { getPublicConfigs } from '@/api/web/systemConfig'

const route = useRoute()
const customerServiceEnabled = ref(true) // 客服功能是否启用

// 加载系统配置
const loadSystemConfig = async () => {
  try {
    const configs = await getPublicConfigs()
    customerServiceEnabled.value = configs['system.customer_service_enabled'] !== 'false'
  } catch (error) {
    console.error('获取系统配置失败：', error)
    // 出错时默认显示客服
    customerServiceEnabled.value = true
  }
}

// 判断是否显示客服组件（管理端不显示 + 检查系统配置）
const showCustomerService = computed(() => {
  return !route.path.startsWith('/admin') && customerServiceEnabled.value
})

onMounted(() => {
  loadSystemConfig()
})
</script>

<template>
  <RouterView />
  <!-- 客服组件（右下角，根据系统配置和页面位置显示） -->
  <CustomerServiceChat v-if="showCustomerService" />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
}
</style>
