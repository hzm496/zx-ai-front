<template>
  <div class="categories-page">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>分类管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>分类列表</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="handleAdd">添加分类</el-button>
            <el-button :icon="Refresh" circle @click="loadCategoryList" />
          </div>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="categoryList"
        border
        stripe
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="sort" label="排序" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success">正常</el-tag>
            <el-tag v-else type="danger">禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="230" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="warning" size="small" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除该分类吗？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" size="small" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      :title="formTitle"
      width="600px"
      @close="handleFormDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="父级分类">
          <el-select v-model="formData.parentId" placeholder="请选择父级分类（不选则为顶级分类）" clearable style="width: 100%">
            <el-option label="顶级分类" :value="0" />
            <el-option
              v-for="cat in topCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="formData.sort" :min="0" :max="9999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit" :loading="formLoading">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Delete, Plus, Refresh } from '@element-plus/icons-vue'
import * as categoryAPI from '@/api/admin/category'

const categoryList = ref([])
const loading = ref(false)
const formDialogVisible = ref(false)
const formRef = ref(null)
const formLoading = ref(false)
const formTitle = ref('添加分类')
const isEdit = ref(false)

const formData = reactive({
  id: null,
  name: '',
  parentId: 0,
  sort: 0,
  status: 1
})

const formRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

// 顶级分类列表（用于父级分类选择）
const topCategories = computed(() => {
  return categoryList.value.filter(cat => cat.parentId === 0 || !cat.parentId)
})

// 构建树形结构
const buildTree = (list) => {
  const map = {}
  const roots = []
  
  // 构建映射
  list.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })
  
  // 构建树
  list.forEach(item => {
    if (item.parentId && item.parentId !== 0) {
      if (map[item.parentId]) {
        map[item.parentId].children.push(map[item.id])
      }
    } else {
      roots.push(map[item.id])
    }
  })
  
  return roots
}

const loadCategoryList = async () => {
  try {
    loading.value = true
    const response = await categoryAPI.getCategoryList()
    if (response && Array.isArray(response)) {
      categoryList.value = buildTree(response)
    } else {
      categoryList.value = []
    }
  } catch (error) {
    console.error('获取分类列表失败：', error)
    ElMessage.error('获取分类列表失败')
    categoryList.value = []
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  formTitle.value = '添加分类'
  resetForm()
  formDialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  formTitle.value = '编辑分类'
  formData.id = row.id
  formData.name = row.name
  formData.parentId = row.parentId || 0
  formData.sort = row.sort || 0
  formData.status = row.status
  formDialogVisible.value = true
}

const handleFormSubmit = async () => {
  try {
    await formRef.value.validate()
    formLoading.value = true
    if (isEdit.value) {
      await categoryAPI.updateCategory(formData)
      ElMessage.success('分类更新成功')
    } else {
      const { id, ...addData } = formData
      await categoryAPI.addCategory(addData)
      ElMessage.success('分类添加成功')
    }
    formDialogVisible.value = false
    loadCategoryList()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('操作失败')
    }
  } finally {
    formLoading.value = false
  }
}

const handleDelete = async (id) => {
  try {
    await categoryAPI.deleteCategory(id)
    ElMessage.success('删除成功')
    loadCategoryList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    parentId: 0,
    sort: 0,
    status: 1
  })
}

const handleFormDialogClose = () => {
  formRef.value?.clearValidate()
  resetForm()
}

onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
.categories-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}
</style>

