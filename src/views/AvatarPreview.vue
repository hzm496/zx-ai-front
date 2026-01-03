<template>
  <div class="avatar-preview-page">
    <AppHeader />
    
    <div class="container">
      <div class="page-header">
        <h1>头像预览</h1>
        <p>为你的项目选择合适的头像风格</p>
      </div>

      <!-- 文字头像 -->
      <el-card class="avatar-section">
        <template #header>
          <div class="section-header">
            <h2>💬 文字头像（UI Avatars）</h2>
            <p>根据姓名自动生成，支持中文，加载速度快</p>
          </div>
        </template>
        <div class="avatar-grid">
          <div 
            v-for="(item, index) in defaultTeacherAvatars" 
            :key="index"
            class="avatar-item"
          >
            <el-avatar :size="100" :src="item.avatar" />
            <p class="avatar-name">{{ item.name }}</p>
            <el-button 
              size="small" 
              @click="copyUrl(item.avatar)"
            >
              复制链接
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 卡通风格 -->
      <el-card class="avatar-section">
        <template #header>
          <div class="section-header">
            <h2>🎨 卡通风格（DiceBear Avataaars）</h2>
            <p>可爱的卡通形象，适合年轻讲师</p>
          </div>
        </template>
        <div class="avatar-grid">
          <div 
            v-for="(avatar, index) in cartoonAvatars" 
            :key="index"
            class="avatar-item"
          >
            <el-avatar :size="100" :src="avatar" />
            <p class="avatar-name">卡通 {{ index + 1 }}</p>
            <el-button 
              size="small" 
              @click="copyUrl(avatar)"
            >
              复制链接
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 专业风格 -->
      <el-card class="avatar-section">
        <template #header>
          <div class="section-header">
            <h2>👔 专业风格（DiceBear Personas）</h2>
            <p>简约专业，适合资深讲师</p>
          </div>
        </template>
        <div class="avatar-grid">
          <div 
            v-for="(avatar, index) in professionalAvatars" 
            :key="index"
            class="avatar-item"
          >
            <el-avatar :size="100" :src="avatar" />
            <p class="avatar-name">专业 {{ index + 1 }}</p>
            <el-button 
              size="small" 
              @click="copyUrl(avatar)"
            >
              复制链接
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 自定义生成 -->
      <el-card class="avatar-section">
        <template #header>
          <div class="section-header">
            <h2>🎯 自定义生成</h2>
            <p>输入姓名，即时生成专属头像</p>
          </div>
        </template>
        
        <div class="custom-generator">
          <el-form :model="customForm" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="姓名">
                  <el-input 
                    v-model="customForm.name" 
                    placeholder="请输入姓名"
                    @input="updateCustomAvatar"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="背景色">
                  <el-color-picker 
                    v-model="customForm.background"
                    @change="updateCustomAvatar"
                  />
                  <el-input 
                    v-model="customForm.background" 
                    placeholder="颜色代码"
                    style="width: 120px; margin-left: 10px;"
                    @input="updateCustomAvatar"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="文字颜色">
                  <el-color-picker 
                    v-model="customForm.color"
                    @change="updateCustomAvatar"
                  />
                  <el-input 
                    v-model="customForm.color" 
                    placeholder="颜色代码"
                    style="width: 120px; margin-left: 10px;"
                    @input="updateCustomAvatar"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="尺寸">
                  <el-slider 
                    v-model="customForm.size" 
                    :min="100" 
                    :max="400"
                    @change="updateCustomAvatar"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <div class="preview-section">
            <div class="preview-result">
              <h3>预览效果</h3>
              <el-avatar :size="150" :src="customAvatarUrl" />
              <div class="preview-actions">
                <el-button type="primary" @click="copyUrl(customAvatarUrl)">
                  <el-icon><CopyDocument /></el-icon>
                  复制链接
                </el-button>
              </div>
            </div>
            
            <div class="url-display">
              <h3>生成的URL</h3>
              <el-input 
                v-model="customAvatarUrl" 
                type="textarea" 
                :rows="3"
                readonly
              />
            </div>
          </div>
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-card class="avatar-section">
        <template #header>
          <h2>📖 使用说明</h2>
        </template>
        <div class="usage-guide">
          <h3>1. 在组件中使用</h3>
          <pre><code>import { generateAvatar, DEFAULT_TEACHER_AVATAR } from '@/config/avatars'

// 使用默认头像
&lt;el-avatar :src="DEFAULT_TEACHER_AVATAR" /&gt;

// 根据姓名生成
&lt;el-avatar :src="generateAvatar('张老师')" /&gt;

// 自定义配置
&lt;el-avatar :src="generateAvatar('李老师', { background: '667eea', size: 200 })" /&gt;</code></pre>

          <h3>2. 优势</h3>
          <ul>
            <li>✅ 无需上传，即时生成</li>
            <li>✅ 国内访问速度快</li>
            <li>✅ 支持中文姓名</li>
            <li>✅ 免费无限制使用</li>
            <li>✅ 自动适配用户名</li>
          </ul>

          <h3>3. API 文档</h3>
          <ul>
            <li><strong>UI Avatars:</strong> <a href="https://ui-avatars.com/" target="_blank">https://ui-avatars.com/</a></li>
            <li><strong>DiceBear:</strong> <a href="https://www.dicebear.com/" target="_blank">https://www.dicebear.com/</a></li>
          </ul>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import AppHeader from '@/components/AppHeader.vue'
import { 
  defaultTeacherAvatars, 
  cartoonAvatars, 
  professionalAvatars,
  generateAvatar 
} from '@/config/avatars'

// 自定义表单
const customForm = ref({
  name: '张老师',
  background: '#667eea',
  color: '#ffffff',
  size: 200
})

// 生成的自定义头像URL
const customAvatarUrl = computed(() => {
  const bg = customForm.value.background.replace('#', '')
  const color = customForm.value.color.replace('#', '')
  return generateAvatar(customForm.value.name, {
    background: bg,
    color: color,
    size: customForm.value.size
  })
})

// 更新自定义头像
const updateCustomAvatar = () => {
  // 触发计算属性重新计算
}

// 复制URL到剪贴板
const copyUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    ElMessage.success('链接已复制到剪贴板')
  }
}
</script>

<style scoped>
.avatar-preview-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 18px;
  opacity: 0.9;
}

.avatar-section {
  margin-bottom: 30px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 5px;
}

.section-header p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 30px;
  padding: 20px;
}

.avatar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-name {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.custom-generator {
  padding: 20px;
}

.preview-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-top: 30px;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.preview-result h3 {
  font-size: 16px;
  margin: 0;
}

.preview-actions {
  width: 100%;
}

.url-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.url-display h3 {
  font-size: 16px;
  margin: 0;
}

.usage-guide {
  padding: 20px;
}

.usage-guide h3 {
  font-size: 18px;
  color: #333;
  margin: 20px 0 10px 0;
}

.usage-guide pre {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
}

.usage-guide code {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.usage-guide ul {
  list-style: none;
  padding: 0;
}

.usage-guide ul li {
  padding: 8px 0;
  font-size: 15px;
  color: #666;
}

.usage-guide a {
  color: #667eea;
  text-decoration: none;
}

.usage-guide a:hover {
  text-decoration: underline;
}
</style>

