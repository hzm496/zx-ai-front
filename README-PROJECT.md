# ZX AI Learning Platform - 前端项目

## 🚀 项目启动

### 安装依赖

```bash
npm install
```

### 开发环境运行

```bash
npm run dev
```

访问：http://localhost:5173

### 生产环境打包

```bash
npm run build
```

---

## 📁 项目结构

```
zx-ai-front/
├── src/
│   ├── api/                    # API 接口
│   │   ├── user.js            # 用户相关接口
│   │   └── file.js            # 文件上传接口
│   ├── assets/                # 静态资源
│   ├── components/            # 公共组件
│   ├── router/                # 路由配置
│   │   └── index.js          # 路由定义和权限控制
│   ├── stores/                # 状态管理
│   │   └── user.js           # 用户状态
│   ├── utils/                 # 工具函数
│   │   └── request.js        # axios 封装
│   ├── views/                 # 页面组件
│   │   ├── Login.vue         # 登录/注册页
│   │   ├── Home.vue          # 前台首页
│   │   ├── NotFound.vue      # 404 页面
│   │   └── admin/            # 后台管理
│   │       ├── Layout.vue    # 后台布局
│   │       ├── Dashboard.vue # 仪表盘
│   │       ├── Users.vue     # 用户管理
│   │       └── Courses.vue   # 课程管理
│   ├── App.vue               # 根组件
│   └── main.js               # 入口文件
├── vite.config.js            # Vite 配置（跨域代理）
└── package.json              # 项目依赖
```

---

## 🔐 权限系统

### 角色类型

1. **common_user** - 普通用户
   - 访问前台首页
   - 浏览课程
   - 学习课程

2. **admin** - 管理员
   - 访问后台管理系统
   - 用户管理
   - 课程管理
   - 数据统计

### 路由权限

路由通过 `meta.role` 和 `meta.requireAuth` 控制访问权限：

```javascript
{
  path: '/home',
  meta: { 
    requireAuth: true,  // 需要登录
    role: 'common_user' // 需要普通用户角色
  }
}
```

---

## 🌐 跨域配置

### 后端服务端口

- **Web 服务**: http://localhost:8081
- **Admin 服务**: http://localhost:8082

### Vite 代理配置

```javascript
proxy: {
  '/api/web': {
    target: 'http://localhost:8081',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/web/, '/web')
  },
  '/api/admin': {
    target: 'http://localhost:8082',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api\/admin/, '/admin')
  }
}
```

### 请求示例

```javascript
// Web 端请求
webRequest.get('/user/getUserInfo')  // 实际请求: http://localhost:8081/web/user/getUserInfo

// Admin 端请求
adminRequest.get('/users')  // 实际请求: http://localhost:8082/admin/users
```

---

## 🔄 登录流程

1. 用户访问 `/login` 页面
2. 输入用户名、密码和角色（admin 或 common_user）
3. 点击登录，调用后端 API
4. 后端返回用户信息和 token
5. 前端保存 token 到 localStorage 和 Pinia Store
6. 根据角色跳转：
   - `admin` → `/admin` (后台管理系统)
   - `common_user` → `/home` (前台首页)

---

## 📝 测试账号

### 管理员账号

```
用户名: admin
密码: 123456
角色: admin
```

### 普通用户账号

```
用户名: testuser
密码: 123456
角色: common_user
```

---

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI 库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **HTTP 客户端**: Axios
- **图标**: @element-plus/icons-vue

---

## 📦 核心依赖

```json
{
  "vue": "^3.x",
  "vue-router": "^4.x",
  "pinia": "^2.x",
  "element-plus": "^2.x",
  "@element-plus/icons-vue": "^2.x",
  "axios": "^1.x"
}
```

---

## 🎨 页面预览

### 登录页面
- `/login`
- 支持登录和注册切换
- 登录时需选择角色

### 前台首页（普通用户）
- `/home`
- 展示课程列表
- 学习数据统计
- 个人中心

### 后台管理（管理员）
- `/admin`
- 左侧菜单导航
- 仪表盘数据展示
- 用户管理
- 课程管理

---

## ⚠️ 注意事项

1. **确保后端服务已启动**
   - Web 服务: 8081 端口
   - Admin 服务: 8082 端口（如果有）

2. **Token 存储**
   - Token 存储在 localStorage
   - 刷新页面后自动恢复登录状态

3. **路由守卫**
   - 未登录访问需要认证的页面会跳转到登录页
   - 角色不匹配时会提示无权限并跳转

4. **开发建议**
   - 使用 Chrome 开发者工具
   - 安装 Vue DevTools 扩展
   - 查看 Network 面板检查请求

---

## 🐛 常见问题

### 1. 跨域问题

**问题**: 请求后端接口出现 CORS 错误

**解决方案**:
- 检查 `vite.config.js` 代理配置
- 确保后端已配置 CORS
- 检查后端服务是否正常运行

### 2. 路由跳转失败

**问题**: 登录后没有跳转

**解决方案**:
- 检查后端返回的 role 字段
- 查看浏览器控制台错误信息
- 确认路由配置正确

### 3. Element Plus 样式异常

**问题**: 组件样式不显示

**解决方案**:
- 确认 `main.js` 中已引入 `element-plus/dist/index.css`
- 清除浏览器缓存
- 重新安装依赖

---

## 📞 联系方式

如有问题，请联系开发团队。

**Happy Coding! 🎉**

