/**
 * 头像配置文件
 * 提供默认头像和头像生成方法
 */

// 默认教师头像列表（使用UI Avatars生成）
export const defaultTeacherAvatars = [
  {
    name: '李明',
    avatar: 'https://ui-avatars.com/api/?name=李明&background=667eea&color=fff&size=200&rounded=true&bold=true'
  },
  {
    name: '王芳',
    avatar: 'https://ui-avatars.com/api/?name=王芳&background=764ba2&color=fff&size=200&rounded=true&bold=true'
  },
  {
    name: '张伟',
    avatar: 'https://ui-avatars.com/api/?name=张伟&background=f093fb&color=fff&size=200&rounded=true&bold=true'
  },
  {
    name: '刘娜',
    avatar: 'https://ui-avatars.com/api/?name=刘娜&background=4facfe&color=fff&size=200&rounded=true&bold=true'
  },
  {
    name: '陈强',
    avatar: 'https://ui-avatars.com/api/?name=陈强&background=43e97b&color=fff&size=200&rounded=true&bold=true'
  },
  {
    name: '杨静',
    avatar: 'https://ui-avatars.com/api/?name=杨静&background=fa709a&color=fff&size=200&rounded=true&bold=true'
  },
  {
    name: '赵勇',
    avatar: 'https://ui-avatars.com/api/?name=赵勇&background=fee140&color=333&size=200&rounded=true&bold=true'
  },
  {
    name: '周敏',
    avatar: 'https://ui-avatars.com/api/?name=周敏&background=30cfd0&color=fff&size=200&rounded=true&bold=true'
  }
]

// 使用 DiceBear 的卡通风格头像（适合年轻讲师）
export const cartoonAvatars = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher2&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher3&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher4&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher5&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher6&backgroundColor=a8e6cf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher7&backgroundColor=ffd3b6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher8&backgroundColor=ffaaa5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=student1&backgroundColor=667eea',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=student2&backgroundColor=764ba2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=student3&backgroundColor=f093fb',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=student4&backgroundColor=4facfe',
]

// 专业风格头像（使用 Personas 风格）
export const professionalAvatars = [
  'https://api.dicebear.com/7.x/personas/svg?seed=prof1&backgroundColor=667eea',
  'https://api.dicebear.com/7.x/personas/svg?seed=prof2&backgroundColor=764ba2',
  'https://api.dicebear.com/7.x/personas/svg?seed=prof3&backgroundColor=f093fb',
  'https://api.dicebear.com/7.x/personas/svg?seed=prof4&backgroundColor=4facfe',
  'https://api.dicebear.com/7.x/personas/svg?seed=prof5&backgroundColor=43e97b',
  'https://api.dicebear.com/7.x/personas/svg?seed=prof6&backgroundColor=fa709a',
  'https://api.dicebear.com/7.x/personas/svg?seed=prof7&backgroundColor=30cfd0',
  'https://api.dicebear.com/7.x/personas/svg?seed=prof8&backgroundColor=a8e6cf',
  'https://api.dicebear.com/7.x/personas/svg?seed=expert1&backgroundColor=ffd3b6',
  'https://api.dicebear.com/7.x/personas/svg?seed=expert2&backgroundColor=ffaaa5',
  'https://api.dicebear.com/7.x/personas/svg?seed=expert3&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/personas/svg?seed=expert4&backgroundColor=c0aede',
]

/**
 * 根据用户名生成头像URL
 * @param {string} name - 用户名
 * @param {object} options - 配置选项
 * @returns {string} 头像URL
 */
export function generateAvatar(name, options = {}) {
  const {
    background = '667eea',
    color = 'fff',
    size = 200,
    rounded = true,
    bold = true,
    fontSize = 0.5
  } = options

  const params = new URLSearchParams({
    name: name || '用户',
    background,
    color,
    size,
    rounded: rounded ? 'true' : 'false',
    bold: bold ? 'true' : 'false',
    'font-size': fontSize
  })

  return `https://ui-avatars.com/api/?${params.toString()}`
}

/**
 * 根据用户ID生成稳定的卡通头像
 * @param {number|string} userId - 用户ID
 * @param {string} style - 风格：avataaars, personas, micah, lorelei
 * @returns {string} 头像URL
 */
export function generateCartoonAvatar(userId, style = 'avataaars') {
  const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', 'a8e6cf', 'ffd3b6', 'ffaaa5']
  const colorIndex = userId % colors.length
  const backgroundColor = colors[colorIndex]
  
  return `https://api.dicebear.com/7.x/${style}/svg?seed=user${userId}&backgroundColor=${backgroundColor}`
}

/**
 * 获取随机头像
 * @param {string} type - 类型：text, cartoon, professional
 * @returns {string} 头像URL
 */
export function getRandomAvatar(type = 'text') {
  const randomIndex = Math.floor(Math.random() * 8)
  
  switch (type) {
    case 'cartoon':
      return cartoonAvatars[randomIndex % cartoonAvatars.length]
    case 'professional':
      return professionalAvatars[randomIndex % professionalAvatars.length]
    case 'text':
    default:
      return defaultTeacherAvatars[randomIndex].avatar
  }
}

// 默认头像（当用户没有上传头像时使用）
export const DEFAULT_AVATAR = generateAvatar('用户', { background: '667eea' })

// 默认教师头像
export const DEFAULT_TEACHER_AVATAR = generateAvatar('讲师', { background: '764ba2' })

