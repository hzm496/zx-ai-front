<template>
  <div class="profile-page">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <div class="nav-content">
        <div class="logo" @click="$router.push('/web/home')">
          <span class="logo-icon">🎓</span>
          <span class="logo-text">智学AI在线教育平台</span>
        </div>
        <div class="nav-right">
          <el-button text @click="$router.push('/web/home')">
            <el-icon><HomeFilled /></el-icon>
            返回首页
          </el-button>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar 
                :size="32" 
                :src="userInfo.avatar" 
                :icon="User"
              />
              <span>{{ userInfo.nickname || userInfo.username || '用户' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="profile-container">
      <!-- 个人信息卡片 -->
      <el-card class="profile-header" shadow="hover">
        <div class="header-content">
          <div class="avatar-section">
            <div class="avatar-uploader" @click="showAvatarDialog = true">
              <el-avatar 
                :size="100" 
                :src="userInfo.avatar" 
                :icon="User"
                class="avatar-img" 
              />
              <div class="avatar-overlay">
                <el-icon><Camera /></el-icon>
                <span>更换头像</span>
              </div>
            </div>
          </div>
          <div class="user-basic-info">
            <h2>{{ userInfo.nickname || userInfo.username }}</h2>
            <div class="user-tags">
              <el-tag 
                :type="userStore.isAnnualVip ? 'danger' : (userInfo.isVip ? 'warning' : 'info')" 
                effect="dark"
                class="vip-tag-clickable"
                :class="{ 'svip-tag': userStore.isAnnualVip }"
                @click="$router.push('/web/vip/detail')"
              >
                <el-icon><Medal /></el-icon>
                {{ userStore.isAnnualVip ? '超级会员SVIP' : (userInfo.isVip ? 'VIP会员' : '普通会员') }}
              </el-tag>
              <el-tag type="success" effect="plain" v-if="userInfo.isVip">
                到期时间：{{ userInfo.vipExpireTime || '永久' }}
              </el-tag>
            </div>
            <p class="join-time">
              <el-icon><Clock /></el-icon>
              加入时间：{{ formatDate(userInfo.createTime) }}
            </p>
          </div>
        </div>
      </el-card>

      <el-row :gutter="20">
        <!-- 左侧菜单 -->
        <el-col :span="6">
          <el-card shadow="hover" class="menu-card">
            <el-menu :default-active="activeMenu" @select="handleMenuSelect">
              <el-menu-item index="info">
                <el-icon><User /></el-icon>
                <span>个人信息</span>
              </el-menu-item>
              <el-menu-item index="vip">
                <el-icon><Medal /></el-icon>
                <span>VIP会员</span>
              </el-menu-item>
              <el-menu-item index="wallet">
                <el-icon><Wallet /></el-icon>
                <span>我的钱包</span>
              </el-menu-item>
              <el-menu-item index="courses">
                <el-icon><Reading /></el-icon>
                <span>我的课程</span>
              </el-menu-item>
              <el-menu-item index="coupons">
                <el-icon><Ticket /></el-icon>
                <span>我的优惠券</span>
              </el-menu-item>
              <el-menu-item index="learning">
                <el-icon><Clock /></el-icon>
                <span>学习记录</span>
              </el-menu-item>
              <el-menu-item index="orders">
                <el-icon><Tickets /></el-icon>
                <span>我的订单</span>
              </el-menu-item>
              <el-menu-item index="password">
                <el-icon><Lock /></el-icon>
                <span>修改密码</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>

        <!-- 右侧内容 -->
        <el-col :span="18">
          <!-- 个人信息 -->
          <el-card shadow="hover" v-show="activeMenu === 'info'">
            <template #header>
              <div class="card-header">
                <span><el-icon><User /></el-icon> 个人信息</span>
                <el-button type="primary" :icon="Edit" size="small" @click="isEditing = true" v-if="!isEditing">
                  编辑资料
                </el-button>
              </div>
            </template>

            <el-form
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-width="100px"
              class="profile-form"
            >
              <el-form-item label="用户名">
                <el-input v-model="formData.username" disabled />
              </el-form-item>

              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="formData.nickname" :disabled="!isEditing" placeholder="请输入昵称" />
              </el-form-item>

              <el-form-item label="手机号" prop="phone">
                <el-input v-model="formData.phone" :disabled="!isEditing" placeholder="请输入手机号" />
              </el-form-item>

              <el-form-item label="邮箱" prop="email">
                <el-input v-model="formData.email" :disabled="!isEditing" placeholder="请输入邮箱" />
              </el-form-item>

              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="formData.gender" :disabled="!isEditing">
                  <el-radio :label="1">男</el-radio>
                  <el-radio :label="2">女</el-radio>
                  <el-radio :label="0">保密</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item v-if="isEditing">
                <el-button type="primary" @click="handleSave" :loading="loading">保存修改</el-button>
                <el-button @click="handleCancel">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>

          <!-- 我的优惠券 -->
          <el-card shadow="hover" v-show="activeMenu === 'coupons'">
            <template #header>
              <span><el-icon><Ticket /></el-icon> 我的优惠券</span>
            </template>

            <div class="coupons-content">
              <el-empty v-if="myCoupons.length === 0" description="暂无优惠券" />

              <div v-else>
                <div class="coupon-grid">
                  <div
                    v-for="coupon in displayedCoupons"
                    :key="coupon.userCouponId"
                    class="coupon-card"
                    :class="{ expired: isExpired(coupon.expireTime) }"
                  >
                  <div class="coupon-left-section">
                    <div class="coupon-value">
                      <span v-if="coupon.type === 1" class="value-amount">¥{{ coupon.discountAmount }}</span>
                      <span v-else class="value-discount">{{ (coupon.discountRate * 10).toFixed(1) }}折</span>
                    </div>
                    <div class="coupon-type-label">{{ coupon.typeName }}</div>
                  </div>

                  <div class="coupon-info-section">
                    <h4 class="coupon-name">{{ coupon.name }}</h4>
                    <p class="coupon-condition">
                      满¥{{ coupon.minAmount }}可用
                      <span v-if="coupon.type === 2 && coupon.maxDiscount">
                        （最多优惠¥{{ coupon.maxDiscount }}）
                      </span>
                    </p>
                    <p class="coupon-expire">
                      <el-icon><Clock /></el-icon>
                      {{ formatExpireTime(coupon.expireTime) }}
                    </p>
                    <div v-if="coupon.description" class="coupon-desc">
                      {{ coupon.description }}
                    </div>
                  </div>

                  <div v-if="isExpired(coupon.expireTime)" class="expired-mask">
                    已过期
                  </div>
                </div>
              </div>

              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="couponPage"
                  v-model:page-size="couponPageSize"
                  :total="myCoupons.length"
                  :page-sizes="[4, 8, 12]"
                  layout="total, sizes, prev, pager, next"
                  @current-change="handleCouponPageChange"
                  @size-change="handleCouponPageChange"
                />
              </div>
            </div>
            </div>
          </el-card>

          <!-- 我的课程 -->
          <el-card shadow="hover" v-show="activeMenu === 'courses'">
            <template #header>
              <span><el-icon><Reading /></el-icon> 我的课程</span>
            </template>
            
            <div v-loading="coursesLoading">
              <el-empty v-if="!coursesLoading && myCourses.length === 0" description="暂无课程，快去购买课程吧~">
                <el-button type="primary" @click="$router.push('/web/home')">去看看课程</el-button>
              </el-empty>
              
              <div v-else>
                <div class="courses-grid">
                  <div v-for="course in myCourses" :key="course.courseId" class="course-card">
                    <div class="course-cover" @click="$router.push(`/web/course/detail?id=${course.courseId}`)">
                      <el-image :src="course.cover" fit="cover" />
                      <div class="course-overlay">
                        <el-icon :size="40"><VideoPlay /></el-icon>
                      </div>
                    </div>
                    <div class="course-info">
                      <h4 @click="$router.push(`/web/course/${course.courseId}`)">{{ course.title }}</h4>
                      <div class="course-meta">
                        <span class="teacher">
                          <el-icon><User /></el-icon>
                          {{ course.teacherName }}
                        </span>
                        <el-tag :type="getDifficultyType(course.difficulty)" size="small">
                          {{ course.difficultyName }}
                        </el-tag>
                      </div>
                      <div class="course-source">
                        <el-tag type="success" size="small">{{ course.sourceTypeName }}</el-tag>
                        <span class="obtain-time">{{ formatDate(course.obtainTime) }}</span>
                      </div>
                      <el-button type="primary" size="small" @click="$router.push(`/web/course/detail?id=${course.courseId}`)">
                        开始学习
                      </el-button>
                    </div>
                  </div>
                </div>

                <!-- 分页 -->
                <div class="pagination-container" v-if="courseTotal > coursePageSize">
                  <el-pagination
                    v-model:current-page="coursePage"
                    :page-size="coursePageSize"
                    :total="courseTotal"
                    layout="prev, pager, next"
                    @current-change="loadMyCourses"
                  />
                </div>
              </div>
            </div>
          </el-card>

          <!-- 学习记录 -->
          <el-card shadow="hover" v-show="activeMenu === 'learning'">
            <template #header>
              <div class="card-header">
                <span><el-icon><Clock /></el-icon> 学习记录</span>
                <span class="header-subtitle">继续学习，成就更好的自己</span>
              </div>
            </template>
            
            <div v-loading="learningLoading">
              <el-empty v-if="!learningLoading && learningRecords.length === 0" description="暂无学习记录">
                <el-button type="primary" @click="$router.push('/web/home')">去学习</el-button>
              </el-empty>
              
              <div v-else>
                <div class="learning-records-list">
                  <div
                    v-for="record in learningRecords"
                    :key="record.id"
                    class="learning-record-item"
                    @click="$router.push(`/web/course/detail?id=${record.courseId}`)"
                  >
                    <div class="record-cover">
                      <el-image :src="record.courseCover" fit="cover" />
                      <div class="cover-overlay">
                        <el-icon :size="30"><VideoPlay /></el-icon>
                      </div>
                    </div>
                    
                    <div class="record-content">
                      <div class="record-header">
                        <h4 class="course-title">{{ record.courseTitle }}</h4>
                        <el-tag v-if="record.isFinished === 1" type="success" size="small">已完成</el-tag>
                        <el-tag v-else type="info" size="small">学习中</el-tag>
                      </div>
                      
                      <p class="chapter-info">
                        <el-icon><Document /></el-icon>
                        当前章节：{{ record.chapterTitle }}
                      </p>
                      
                      <div class="progress-section">
                        <el-progress
                          :percentage="record.progressPercent || 0"
                          :stroke-width="6"
                          :color="getProgressColor(record.progressPercent)"
                        />
                        <div class="progress-info">
                          <span class="progress-time">{{ formatTime(record.progress) }} / {{ formatTime(record.duration) }}</span>
                          <span class="last-time">
                            <el-icon><Clock /></el-icon>
                            {{ formatLearnTime(record.lastLearnTime) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 我的订单 -->
          <el-card shadow="hover" v-show="activeMenu === 'orders'">
            <template #header>
              <span><el-icon><Tickets /></el-icon> 我的订单</span>
            </template>
            
            <div v-loading="ordersLoading">
              <el-empty v-if="!ordersLoading && courseOrders.length === 0" description="暂无订单记录">
                <el-button type="primary" @click="$router.push('/web/home')">去购买课程</el-button>
              </el-empty>
              
              <div v-else>
                <el-table :data="courseOrders" stripe style="width: 100%">
                  <el-table-column label="课程信息" min-width="300">
                    <template #default="{ row }">
                      <div class="order-course-info">
                        <el-image 
                          :src="row.courseCover" 
                          fit="cover" 
                          style="width: 80px; height: 60px; border-radius: 4px; margin-right: 12px;"
                        />
                        <div>
                          <div class="course-title">{{ row.courseTitle }}</div>
                          <div class="order-no">订单号：{{ row.orderNo }}</div>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column prop="payAmount" label="金额" width="120">
                    <template #default="{ row }">
                      <span class="price">¥{{ row.payAmount }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="payTypeName" label="支付方式" width="120" />
                  <el-table-column prop="statusName" label="状态" width="100">
                    <template #default="{ row }">
                      <el-tag :type="getOrderStatusType(row.status)">
                        {{ row.statusName }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="createTime" label="下单时间" width="180" />
                  <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                      <!-- 待支付：显示去支付和取消订单按钮 -->
                      <div v-if="row.canPay" class="order-actions">
                        <el-button 
                          type="primary" 
                          size="small"
                          @click="handlePayOrder(row.orderNo)"
                        >
                          去支付
                        </el-button>
                        <el-button 
                          size="small"
                          @click="handleCancelOrder(row.orderNo)"
                        >
                          取消订单
                        </el-button>
                      </div>
                      <!-- 已支付：显示去学习按钮 -->
                      <el-button 
                        v-else-if="row.status === 1"
                        type="primary" 
                        link 
                        size="small"
                        @click="$router.push(`/web/course/detail?id=${row.courseId}`)"
                      >
                        去学习
                      </el-button>
                      <!-- 其他状态 -->
                      <span v-else class="text-muted">-</span>
                    </template>
                  </el-table-column>
                </el-table>

                <!-- 分页 -->
                <div class="pagination-container" v-if="orderTotal > orderPageSize">
                  <el-pagination
                    v-model:current-page="orderPage"
                    :page-size="orderPageSize"
                    :total="orderTotal"
                    layout="prev, pager, next"
                    @current-change="loadCourseOrders"
                  />
                </div>
              </div>
            </div>
          </el-card>

          <!-- VIP会员 -->
          <el-card shadow="hover" v-show="activeMenu === 'vip'">
            <template #header>
              <span><el-icon><Medal /></el-icon> VIP会员</span>
            </template>
            
            <div class="vip-section">
              <div class="vip-status-card" :class="{ 'is-vip': userInfo.isVip }">
                <div class="vip-clickable-area" @click="$router.push('/web/vip/detail')">
                  <div class="vip-icon">
                    <el-icon size="60"><Medal /></el-icon>
                  </div>
                  <div class="vip-info">
                    <h3>{{ userStore.isAnnualVip ? '超级会员SVIP' : (userInfo.isVip ? 'VIP会员' : '普通会员') }}</h3>
                    <p v-if="userInfo.isVip && userInfo.vipExpireTime">
                      到期时间：{{ formatDate(userInfo.vipExpireTime) }}
                    </p>
                    <p v-else-if="!userInfo.isVip">
                      开通VIP，畅享全站所有课程
                    </p>
                    <p class="view-detail">点击查看详情 →</p>
                  </div>
                </div>
                <div class="vip-action" @click.stop>
                  <el-button 
                    type="primary" 
                    size="large"
                    @click="$router.push('/web/vip')"
                  >
                    {{ userInfo.isVip ? '续费会员' : '开通会员' }}
                  </el-button>
                </div>
              </div>

              <el-divider />

              <div class="vip-benefits">
                <h4>会员特权</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <div class="benefit-item">
                      <el-icon color="#409eff"><VideoPlay /></el-icon>
                      <span>全站课程免费观看</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="benefit-item">
                      <el-icon color="#67c23a"><Download /></el-icon>
                      <span>支持课程离线下载</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="benefit-item">
                      <el-icon color="#e6a23c"><Service /></el-icon>
                      <span>专属客服优先响应</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="benefit-item">
                      <el-icon color="#f56c6c"><Trophy /></el-icon>
                      <span>尊贵VIP身份标识</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </el-card>

          <!-- 我的钱包 -->
          <el-card shadow="hover" v-show="activeMenu === 'wallet'" v-loading="walletLoading">
            <template #header>
              <span><el-icon><Wallet /></el-icon> 我的钱包</span>
            </template>
            
            <div class="wallet-section">
              <!-- 钱包未开通 -->
              <div v-if="!walletInfo || walletInfo.isActivated === 0" class="wallet-not-activated">
                <el-empty description="钱包未开通">
                  <el-button type="primary" @click="showActivateWalletDialog = true">
                    立即开通
                  </el-button>
                </el-empty>
              </div>

              <!-- 钱包已开通 -->
              <div v-else class="wallet-content">
                <!-- 余额卡片 -->
                <div class="wallet-balance-card">
                  <div class="balance-icon">
                    <el-icon size="50"><Wallet /></el-icon>
                  </div>
                  <div class="balance-info">
                    <div class="balance-label">账户余额</div>
                    <div class="balance-amount">¥{{ walletInfo.balance || 0 }}</div>
                  </div>
                  <div class="balance-action">
                  <el-button type="primary" @click="openRechargeDialog" :icon="Plus">
                    立即充值
                  </el-button>
                  <el-button type="success" @click="openWithdrawDialog" :icon="Wallet">
                    申请提现
                  </el-button>
                </div>
                </div>

                <el-divider />

                <!-- 记录tabs -->
                <el-tabs v-model="walletTab" @tab-click="handleWalletTabClick">
                  <!-- 交易记录 -->
                  <el-tab-pane label="交易记录" name="transactions">
                    <el-table :data="transactions" stripe style="width: 100%">
                      <el-table-column prop="transactionNo" label="交易流水号" width="200" show-overflow-tooltip />
                      <el-table-column prop="typeName" label="类型" width="100" />
                      <el-table-column label="金额" width="120">
                        <template #default="{ row }">
                          <span :class="row.type === 1 ? 'amount-income' : 'amount-expense'">
                            {{ row.type === 1 ? '+' : '-' }}¥{{ row.amount }}
                          </span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="remark" label="说明" show-overflow-tooltip />
                      <el-table-column prop="createTime" label="时间" width="180" />
                    </el-table>

                    <!-- 分页 -->
                    <div class="pagination-container" v-if="transactionTotal > transactionPageSize">
                      <el-pagination
                        v-model:current-page="transactionPage"
                        :page-size="transactionPageSize"
                        :total="transactionTotal"
                        layout="prev, pager, next"
                        @current-change="loadTransactions"
                      />
                    </div>

                    <el-empty v-if="transactions.length === 0" description="暂无交易记录" />
                  </el-tab-pane>

                  <!-- 提现记录 -->
                  <el-tab-pane label="提现记录" name="withdraws">
                    <el-table :data="withdrawRecords" v-loading="withdrawLoading" stripe style="width: 100%">
                      <el-table-column prop="withdrawNo" label="流水号" width="200" show-overflow-tooltip />
                      <el-table-column prop="amount" label="提现金额" width="120">
                        <template #default="{ row }">
                          <span class="amount-expense">¥{{ row.amount }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="actualAmount" label="实际到账" width="120">
                        <template #default="{ row }">
                          <span class="amount-income">¥{{ row.actualAmount }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="accountTypeName" label="提现方式" width="100" />
                      <el-table-column prop="status" label="状态" width="100">
                        <template #default="{ row }">
                          <el-tag v-if="row.status === 0" type="warning">待处理</el-tag>
                          <el-tag v-else-if="row.status === 1" type="success">已完成</el-tag>
                          <el-tag v-else-if="row.status === 2" type="danger">已拒绝</el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column prop="createTime" label="申请时间" width="180" />
                      <el-table-column label="原因" min-width="150" show-overflow-tooltip fixed="right">
                        <template #default="{ row }">
                          <span v-if="row.status === 2 && row.rejectReason" style="color: #F56C6C">
                            {{ row.rejectReason }}
                          </span>
                          <span v-else style="color: #909399">-</span>
                        </template>
                      </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <div class="pagination-container" v-if="withdrawTotal > withdrawPageSize">
                      <el-pagination
                        v-model:current-page="withdrawPage"
                        :page-size="withdrawPageSize"
                        :total="withdrawTotal"
                        layout="prev, pager, next"
                        @current-change="loadWithdrawRecords"
                      />
                    </div>

                    <el-empty v-if="withdrawRecords.length === 0 && !withdrawLoading" description="暂无提现记录" />
                  </el-tab-pane>
                </el-tabs>
              </div>
            </div>
          </el-card>

          <!-- 修改密码 -->
          <el-card shadow="hover" v-show="activeMenu === 'password'">
            <template #header>
              <span><el-icon><Lock /></el-icon> 修改密码</span>
            </template>

            <el-form
              ref="passwordFormRef"
              :model="passwordForm"
              :rules="passwordRules"
              label-width="100px"
              class="password-form"
              style="max-width: 500px"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input
                  v-model="passwordForm.oldPassword"
                  type="password"
                  placeholder="请输入原密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="handlePasswordChange" :loading="passwordLoading">
                  修改密码
                </el-button>
                <el-button @click="resetPasswordForm">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 头像选择对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="选择头像"
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="avatar-selector">
        <el-tabs v-model="avatarTab" class="avatar-tabs">
          <!-- 系统头像 -->
          <el-tab-pane label="🎨 系统头像" name="system">
            <div class="system-avatars">
              <div class="avatar-section">
                <h4 class="section-title">卡通风格</h4>
                <div class="avatar-grid">
                  <div 
                    v-for="(avatar, index) in cartoonAvatars" 
                    :key="'cartoon-' + index"
                    class="avatar-option"
                    :class="{ 'selected': selectedAvatar === avatar }"
                    @click="selectAvatar(avatar)"
                  >
                    <el-avatar :size="80" :src="avatar" />
                    <div class="check-mark" v-if="selectedAvatar === avatar">
                      <el-icon><Check /></el-icon>
                    </div>
                  </div>
                </div>
              </div>

              <el-divider />

              <div class="avatar-section">
                <h4 class="section-title">专业风格</h4>
                <div class="avatar-grid">
                  <div 
                    v-for="(avatar, index) in professionalAvatars" 
                    :key="'professional-' + index"
                    class="avatar-option"
                    :class="{ 'selected': selectedAvatar === avatar }"
                    @click="selectAvatar(avatar)"
                  >
                    <el-avatar :size="80" :src="avatar" />
                    <div class="check-mark" v-if="selectedAvatar === avatar">
                      <el-icon><Check /></el-icon>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 上传头像 -->
          <el-tab-pane label="📤 上传图片" name="upload">
            <div class="upload-area">
              <el-upload
                class="avatar-upload-box"
                drag
                action="#"
                :show-file-list="false"
                :before-upload="handleAvatarUpload"
                :http-request="handleCustomUpload"
              >
                <el-avatar 
                  v-if="uploadedAvatar" 
                  :size="150" 
                  :src="uploadedAvatar" 
                />
                <div v-else class="upload-placeholder">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  <div class="upload-text">
                    <p>点击或拖拽上传图片</p>
                    <p class="upload-hint">支持 jpg、png 格式，大小不超过 2MB</p>
                  </div>
                </div>
              </el-upload>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAvatarDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="confirmAvatarChange"
            :loading="avatarUploading"
            :disabled="!hasSelectedAvatar"
          >
            确认更换
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 开通钱包对话框 -->
    <ActivateWalletDialog
      v-if="showActivateWalletDialog"
      v-model="showActivateWalletDialog"
      @activate-success="handleWalletActivated"
    />

    <!-- 充值对话框 -->
    <RechargeDialog ref="rechargeDialogRef" @success="handleRechargeSuccess" />
    
    <!-- 提现对话框 -->
    <WithdrawDialog ref="withdrawDialogRef" @success="handleWithdrawSuccess" />

    <!-- 继续支付对话框 -->
    <el-dialog
      v-model="showPayDialog"
      title="购买课程"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="purchase-dialog-content" v-if="currentPayOrder">
        <div class="course-purchase-info">
          <div class="purchase-course-title">{{ currentPayOrder.courseTitle }}</div>
          <div class="purchase-price">
            <span class="price-label">课程原价：</span>
            <span class="original-price-text">¥{{ currentPayOrder.originalPrice }}</span>
          </div>
          <div v-if="currentPayOrder.originalPrice > currentPayOrder.payAmount" class="discount-info">
            <span class="price-label">优惠金额：</span>
            <span class="discount-amount">-¥{{ (currentPayOrder.originalPrice - currentPayOrder.payAmount).toFixed(2) }}</span>
          </div>
          <div class="purchase-price final-price-row">
            <span class="price-label">实付金额：</span>
            <span class="price-value">¥{{ currentPayOrder.payAmount }}</span>
          </div>
        </div>

        <el-divider />

        <el-form label-width="100px">
          <el-form-item label="订单号">
            <el-input :value="currentPayOrder.orderNo" disabled />
          </el-form-item>

          <el-form-item label="支付方式">
            <el-radio-group v-model="payForm.payType">
              <el-radio :label="1" border>
                <span style="display: flex; align-items: center; justify-content: space-between; width: 280px;">
                  <span>余额支付</span>
                  <span v-if="walletInfo" class="wallet-balance">
                    余额：¥{{ walletInfo.balance || 0 }}
                  </span>
                </span>
              </el-radio>
              <el-radio :label="2" border style="margin-top: 12px;">
                支付宝支付
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="支付密码" v-if="payForm.payType === 1">
            <el-input
              v-model="payForm.payPassword"
              type="password"
              placeholder="请输入支付密码"
              show-password
              clearable
            />
            <div class="form-tip">
              提示：余额支付需要输入支付密码
            </div>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showPayDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="payLoading"
          @click="handleContinuePay"
        >
          确认支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, Edit, Lock, Camera, HomeFilled, 
  Reading, Tickets, Clock, Medal, Check, Upload,
  VideoPlay, Download, Service, Trophy, Wallet, Plus, Document
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getUserInfo, logout as apiLogout, updateUserInfo, updatePassword as apiUpdatePassword, updateAvatar } from '@/api/web/user'
import { uploadImage } from '@/api/web/file'
import { cartoonAvatars, professionalAvatars } from '@/config/avatars'
import { getWalletInfo, getTransactions } from '@/api/web/wallet'
import { getWithdrawOrderList, cancelWithdrawOrder } from '@/api/web/withdraw'
import { getUserCoursesPage } from '@/api/web/userCourse'
import { getUserCourseOrdersPage, cancelCourseOrder, continuePayOrder, continueBalancePay } from '@/api/web/courseOrder'
import { getAvailableCoupons } from '@/api/web/coupon'
import { getLearningRecords } from '@/api/web/learningRecord'
import ActivateWalletDialog from '@/components/ActivateWalletDialog.vue'
import RechargeDialog from '@/components/RechargeDialog.vue'
import WithdrawDialog from '@/components/WithdrawDialog.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref(null)
const passwordFormRef = ref(null)

// 从 URL 参数读取菜单状态，默认为 'info'
const activeMenu = ref(route.query.tab || 'info')
const userInfo = ref({})
const isEditing = ref(false)
const loading = ref(false)
const passwordLoading = ref(false)

// 钱包相关
const walletInfo = ref(null)
const walletLoading = ref(false)
const walletTab = ref('transactions')
const transactions = ref([])
const transactionPage = ref(1)
const transactionPageSize = ref(10)
const transactionTotal = ref(0)
const withdrawRecords = ref([])
const withdrawLoading = ref(false)
const withdrawPage = ref(1)
const withdrawPageSize = ref(10)
const withdrawTotal = ref(0)
const showActivateWalletDialog = ref(false)
const rechargeDialogRef = ref(null)
const withdrawDialogRef = ref(null)

// 课程和订单相关
const myCourses = ref([])
const coursesLoading = ref(false)
const coursePage = ref(1)
const coursePageSize = ref(4)
const courseTotal = ref(0)
const courseOrders = ref([])
const myCoupons = ref([]) // 我的优惠券
const couponPage = ref(1) // 优惠券当前页
const couponPageSize = ref(4) // 优惠券每页数量
const ordersLoading = ref(false)
const orderPage = ref(1)
const orderPageSize = ref(4)
const orderTotal = ref(0)

// 学习记录相关
const learningRecords = ref([])
const learningLoading = ref(false)

// 继续支付相关
const showPayDialog = ref(false)
const currentPayOrder = ref(null)
const payLoading = ref(false)
const payForm = reactive({
  payType: 2, // 默认支付宝支付
  payPassword: ''
})

const formData = reactive({
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 0
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 头像选择相关
const showAvatarDialog = ref(false)
const avatarTab = ref('system')
const selectedAvatar = ref('')
const uploadedAvatar = ref('')
const avatarUploading = ref(false)

// 是否选择了头像
const hasSelectedAvatar = computed(() => {
  if (avatarTab.value === 'upload') {
    
    return !!uploadedAvatar.value
  } else if (avatarTab.value === 'system') {
    return !!selectedAvatar.value
  } else {
    return false
  }
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 菜单切换
const handleMenuSelect = (index) => {
  activeMenu.value = index
  
  // 更新 URL 参数，保持菜单状态
  router.push({ 
    path: '/profile', 
    query: { tab: index } 
  })
  
  // 如果选择钱包菜单，加载钱包信息
  if (index === 'wallet') {
    loadWalletInfo()
  } else if (index === 'courses') {
    loadMyCourses()
  } else if (index === 'coupons') {
    loadMyCoupons()
  } else if (index === 'orders') {
    loadCourseOrders()
  } else if (index === 'learning') {
    loadLearningRecords()
  }
}

// 顶部下拉菜单
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await apiLogout()
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/login')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出登录失败：', error)
      }
    }
  }
}
// 格式化日期为年月日
const formatDate = (dateTimeString) => {
  if (!dateTimeString) return ''
  // 如果日期时间字符串包含空格，取空格前的日期部分
  return dateTimeString.split(' ')[0]
}

// 获取难度类型
const getDifficultyType = (difficulty) => {
  const typeMap = {
    1: 'success', // 入门
    2: 'info',    // 初级
    3: 'warning', // 中级
    4: 'danger'   // 高级
  }
  return typeMap[difficulty] || 'info'
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const typeMap = {
    0: 'warning', // 待支付
    1: 'success', // 已支付
    2: 'info',    // 已取消
    3: 'danger'   // 已退款
  }
  return typeMap[status] || 'info'
}

// 检查VIP是否过期
const checkVipExpired = (vipExpireTime) => {
  if (!vipExpireTime) return false
  const expireDate = new Date(vipExpireTime)
  const now = new Date()
  return expireDate < now
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await getUserInfo()
    
    // 检查VIP是否过期
    if (response.isVip && checkVipExpired(response.vipExpireTime)) {
      console.log('⚠️ VIP会员已过期，更新状态')
      // 更新本地状态为非VIP
      response.isVip = 0
      response.vipExpireTime = null
      
      // 提示用户
      // ElMessage.info('您的VIP会员已过期，欢迎续费继续享受会员特权')
    }
    
    userInfo.value = response
    
    // 同步更新userStore
    userStore.setUserInfo(response)
    
    Object.assign(formData, {
      username: response.username,
      nickname: response.nickname,
      phone: response.phone,
      email: response.email,
      gender: response.gender || 0
    })
  } catch (error) {
    console.error('获取用户信息失败：', error)
  }
}

// 保存修改
const handleSave = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 使用正确的API方法
    await updateUserInfo({
      nickname: formData.nickname,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender
    })
    
    ElMessage.success('个人信息更新成功')
    isEditing.value = false
    await fetchUserInfo()
    // 更新用户store
    userStore.setUserInfo(userInfo.value)
  } catch (error) {
    if (error !== false) {
      console.error('更新个人信息失败：', error)
      ElMessage.error('更新失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  fetchUserInfo()
}

// 修改密码
const handlePasswordChange = async () => {
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true

    // 使用正确的API方法
    await apiUpdatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    ElMessage.success('密码修改成功，请重新登录')
    resetPasswordForm()
    
    // 延迟跳转到登录页
    setTimeout(() => {
      userStore.logout()
      router.push('/login')
    }, 1500)
  } catch (error) {
    if (error !== false) {
      console.error('修改密码失败：', error)
      ElMessage.error('密码修改失败，请检查原密码是否正确')
    }
  } finally {
    passwordLoading.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordFormRef.value?.clearValidate()
}

// 头像上传前验证
const handleAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  return true
}

// 选择预设头像
const selectAvatar = (avatar) => {
  selectedAvatar.value = avatar
  uploadedAvatar.value = ''
}

// 处理自定义上传
const handleCustomUpload = async ({ file }) => {
  try {
    // 创建本地预览URL
    const localUrl = URL.createObjectURL(file)
    uploadedAvatar.value = localUrl
    selectedAvatar.value = ''
    
    // 直接上传到MinIO
    const url = await uploadImage(file)
    // 保存上传后的MinIO URL
    uploadedAvatar.value = url
  } catch (error) {
    console.error('图片上传失败：', error)
    ElMessage.error('图片上传失败，请稍后重试')
  }
}

// 将URL转换为File对象（用于上传卡通头像到MinIO）
// 使用Canvas避免跨域问题
const urlToFile = async (url, filename = 'avatar.png') => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous' // 允许跨域
      
      img.onload = () => {
        try {
          // 创建canvas
          const canvas = document.createElement('canvas')
          canvas.width = img.width || 200
          canvas.height = img.height || 200
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          
          // 转换为blob
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], filename, { type: 'image/png' })
              resolve(file)
            } else {
              reject(new Error('Canvas转换失败'))
            }
          }, 'image/png', 0.95)
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = (error) => {
        console.error('图片加载失败：', error)
        reject(new Error('图片加载失败，请重试'))
      }
      
      // 添加时间戳避免缓存问题
      img.src = url.includes('?') ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`
    } catch (error) {
      console.error('图片转换失败：', error)
      reject(error)
    }
  })
}

// 确认更换头像
const confirmAvatarChange = async () => {
  try {
    avatarUploading.value = true
    let avatarUrl = ''

    if (avatarTab.value === 'upload') {
      // 用户自己上传的图片，已经在handleCustomUpload中上传到MinIO了
      avatarUrl = uploadedAvatar.value
      
      if (!avatarUrl) {
        ElMessage.warning('请先上传图片')
        return
      }
    } else if (avatarTab.value === 'system') {
      // 系统头像（卡通/专业风格），需要先转换为图片再上传到MinIO
      if (!selectedAvatar.value) {
        ElMessage.warning('请先选择头像')
        return
      }
      
      ElMessage.info('正在处理系统头像...')
      const file = await urlToFile(selectedAvatar.value, 'system-avatar.png')
      ElMessage.info('正在上传到服务器...')
      avatarUrl = await uploadImage(file)
    }

    // 使用API更新头像
    await updateAvatar(avatarUrl)
    
    ElMessage.success('头像更换成功！')
    await fetchUserInfo()
    userStore.setUserInfo(userInfo.value)
    
    // 关闭对话框并重置状态
    showAvatarDialog.value = false
    resetAvatarSelector()
  } catch (error) {
    console.error('头像更换失败：', error)
    const errorMsg = error.message || '头像更换失败，请稍后重试'
    ElMessage.error(errorMsg)
  } finally {
    avatarUploading.value = false
  }
}

// 重置头像选择器
const resetAvatarSelector = () => {
  selectedAvatar.value = ''
  uploadedAvatar.value = ''
  avatarTab.value = 'system'
}

// ========== 钱包相关方法 ==========
// 加载钱包信息
// 加载我的课程
const loadMyCourses = async () => {
  try {
    coursesLoading.value = true
    const response = await getUserCoursesPage(coursePage.value, coursePageSize.value)
    myCourses.value = response.data || []
    courseTotal.value = response.totalCount || 0
  } catch (error) {
    console.error('获取我的课程失败：', error)
    ElMessage.error('获取课程列表失败')
  } finally {
    coursesLoading.value = false
  }
}

// 加载我的优惠券
const loadMyCoupons = async () => {
  try {
    const result = await getAvailableCoupons(0, 0) // courseId和coursePrice传0表示查询所有优惠券
    myCoupons.value = result || []
  } catch (error) {
    console.error('获取优惠券失败：', error)
    ElMessage.error('获取优惠券失败')
  }
}

// 判断优惠券是否过期
const isExpired = (expireTime) => {
  if (!expireTime) return false
  return new Date(expireTime) < new Date()
}

// 格式化优惠券过期时间
const formatExpireTime = (expireTime) => {
  if (!expireTime) return ''
  const date = new Date(expireTime)
  const now = new Date()
  const diff = date - now
  
  if (diff < 0) return '已过期'
  if (diff < 86400000) return '即将过期'
  if (diff < 3 * 86400000) return `${Math.ceil(diff / 86400000)}天后过期`
  
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} 前有效`
}

// 当前页显示的优惠券（计算属性）
const displayedCoupons = computed(() => {
  const start = (couponPage.value - 1) * couponPageSize.value
  const end = start + couponPageSize.value
  return myCoupons.value.slice(start, end)
})

// 优惠券分页切换
const handleCouponPageChange = () => {
  // 分页变化时自动重新计算 displayedCoupons
}

// 加载课程订单
const loadCourseOrders = async () => {
  try {
    ordersLoading.value = true
    const response = await getUserCourseOrdersPage(orderPage.value, orderPageSize.value)
    courseOrders.value = response.data || []
    orderTotal.value = response.totalCount || 0
  } catch (error) {
    console.error('获取订单列表失败：', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    ordersLoading.value = false
  }
}

// 去支付订单 - 弹出支付对话框
const handlePayOrder = async (orderNo) => {
  try {
    // 调用继续支付接口获取订单信息
    const orderInfo = await continuePayOrder(orderNo)
    
    // 设置当前订单信息
    currentPayOrder.value = orderInfo
    
    // 重置支付表单
    payForm.payType = 2 // 默认支付宝
    payForm.payPassword = ''
    
    // 加载钱包信息（用于显示余额）
    try {
      walletInfo.value = await getWalletInfo()
    } catch (error) {
      console.error('获取钱包信息失败：', error)
    }
    
    // 显示支付对话框
    showPayDialog.value = true
  } catch (error) {
    console.error('获取订单信息失败：', error)
    ElMessage.error(error.message || '获取订单信息失败')
  }
}

// 确认继续支付
const handleContinuePay = async () => {
  try {
    // 余额支付需要验证支付密码
    if (payForm.payType === 1 && !payForm.payPassword) {
      ElMessage.warning('请输入支付密码')
      return
    }

    payLoading.value = true

    if (payForm.payType === 1) {
      // 余额支付 - 调用余额支付接口
      await continueBalancePay(currentPayOrder.value.orderNo, payForm.payPassword)
      
      ElMessage.success('支付成功！')
      
      // 关闭支付对话框
      showPayDialog.value = false
      
      // 刷新订单列表
      loadCourseOrders()
      
      // 刷新钱包信息
      if (activeMenu.value === 'wallet') {
        loadWalletInfo()
      }
    } else if (payForm.payType === 2) {
      // 支付宝支付 - 直接跳转到后端生成的支付页面
      // 关闭支付对话框
      showPayDialog.value = false

      // 直接跳转到支付宝支付接口（后端会生成HTML表单自动提交到支付宝）
      window.location.href = `/api/web/alipay/course/pay?orderNo=${currentPayOrder.value.orderNo}`
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败：', error)
      ElMessage.error(error.message || '支付失败')
    }
  } finally {
    payLoading.value = false
  }
}

// 取消订单
const handleCancelOrder = async (orderNo) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消该订单吗？取消后优惠券将自动释放。',
      '取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '我再想想',
        type: 'warning'
      }
    )

    await cancelCourseOrder(orderNo)
    ElMessage.success('订单已取消')
    // 刷新订单列表
    loadCourseOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败：', error)
      ElMessage.error(error.message || '取消订单失败，请稍后重试')
    }
  }
}

const loadWalletInfo = async () => {
  try {
    walletLoading.value = true
    const wallet = await getWalletInfo()  // request.js已经返回res.data
    walletInfo.value = wallet
    
    // 如果钱包已开通，加载交易记录
    if (wallet && wallet.isActivated === 1) {
      await loadTransactions()
    }
  } catch (error) {
    console.error('获取钱包信息失败：', error)
    // 钱包不存在时不显示错误，因为可能是未开通
  } finally {
    walletLoading.value = false
  }
}

// 加载交易记录
const loadTransactions = async () => {
  try {
    const response = await getTransactions({
      pageNo: transactionPage.value,
      pageSize: transactionPageSize.value
    })
    // response是分页数据，包含data和totalCount
    transactions.value = response.data || []
    transactionTotal.value = response.totalCount || 0
  } catch (error) {
    console.error('获取交易记录失败：', error)
    ElMessage.error('获取交易记录失败')
  }
}

// 打开充值对话框
const openRechargeDialog = () => {
  if (rechargeDialogRef.value) {
    rechargeDialogRef.value.open()
  }
}

// 充值成功回调
const handleRechargeSuccess = () => {
  console.log('充值成功，刷新钱包数据')
  // 延迟刷新，等待支付完成
  setTimeout(() => {
    loadWalletInfo()
  }, 2000)
}

// 钱包开通成功
const handleWalletActivated = () => {
  ElMessage.success('钱包开通成功')
  loadWalletInfo()
}

// 打开提现对话框
const openWithdrawDialog = () => {
  if (withdrawDialogRef.value) {
    withdrawDialogRef.value.open(
      walletInfo.value?.balance || 0,
      walletInfo.value?.alipayAccount || '',
      walletInfo.value?.alipayName || ''
    )
  }
}

// 提现成功回调
const handleWithdrawSuccess = () => {
  // ElMessage.success('提现申请已提交')
  // 刷新数据
  loadWalletInfo()
  loadWithdrawRecords()
}

// 加载提现记录
const loadWithdrawRecords = async () => {
  try {
    withdrawLoading.value = true
    const response = await getWithdrawOrderList(withdrawPage.value, withdrawPageSize.value, null)
    withdrawRecords.value = response.data || []
    withdrawTotal.value = response.totalCount || 0
  } catch (error) {
    console.error('获取提现记录失败：', error)
  } finally {
    withdrawLoading.value = false
  }
}

// 取消提现
const handleCancelWithdraw = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消该提现申请吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cancelWithdrawOrder(id)
    ElMessage.success('提现申请已取消')
    loadWalletInfo()
    loadWithdrawRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消提现失败：', error)
      ElMessage.error(error.message || '取消提现失败')
    }
  }
}

// 钱包tabs切换
const handleWalletTabClick = (tab) => {
  if (tab.props.name === 'withdraws') {
    loadWithdrawRecords()
  }
}

// ==================== 学习记录相关 ====================

// 加载学习记录
const loadLearningRecords = async () => {
  try {
    learningLoading.value = true
    learningRecords.value = await getLearningRecords()
  } catch (error) {
    console.error('加载学习记录失败：', error)
    ElMessage.error('加载学习记录失败')
  } finally {
    learningLoading.value = false
  }
}

// 格式化时间（秒转为时分秒）
const formatTime = (seconds) => {
  if (!seconds) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化学习时间
const formatLearnTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  // 1分钟内
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  
  // 1小时内
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return `${minutes}分钟前`
  }
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  }
  
  // 本年
  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
  
  // 往年
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 获取进度颜色
const getProgressColor = (percent) => {
  if (percent >= 90) return '#67c23a'
  if (percent >= 60) return '#409eff'
  if (percent >= 30) return '#e6a23c'
  return '#f56c6c'
}

onMounted(async () => {
  // 检查是否是支付回调
  const isPaymentCallback = route.query.paymentSuccess === 'true' || 
                            route.query.rechargeSuccess === 'true' || 
                            route.query.transferSuccess === 'true'
  
  // 如果是支付回调且未登录，显示提示并引导登录
  if (isPaymentCallback && !userStore.token) {
    ElMessageBox.alert(
      '支付成功！请登录后查看订单详情。',
      '支付成功',
      {
        confirmButtonText: '去登录',
        type: 'success',
        callback: () => {
          router.push({
            path: '/login',
            query: { redirect: route.fullPath }
          })
        }
      }
    )
    return
  }
  
  // 正常流程：先获取用户信息
  try {
    await fetchUserInfo()
  } catch (error) {
    console.error('获取用户信息失败：', error)
    // 如果是支付回调，引导登录
    if (isPaymentCallback) {
      ElMessageBox.alert(
        '您的登录已过期，请重新登录后查看订单详情。',
        '登录过期',
        {
          confirmButtonText: '去登录',
          type: 'warning',
          callback: () => {
            router.push({
              path: '/login',
              query: { redirect: route.fullPath }
            })
          }
        }
      )
      return
    }
  }
  
  // 根据当前激活的菜单加载对应的数据
  const currentTab = activeMenu.value
  if (currentTab === 'wallet') {
    loadWalletInfo()
  } else if (currentTab === 'courses') {
    loadMyCourses()
  } else if (currentTab === 'orders') {
    loadCourseOrders()
  } else if (currentTab === 'learning') {
    loadLearningRecords()
  }
  
  // 兼容旧的 menu 参数
  const menuParam = route.query.menu
  if (menuParam && menuParam !== currentTab) {
    activeMenu.value = menuParam
    if (menuParam === 'wallet') {
      loadWalletInfo()
    } else if (menuParam === 'courses') {
      loadMyCourses()
    } else if (menuParam === 'orders') {
      loadCourseOrders()
    }
  }
  
  // 检查充值成功提示
  const rechargeSuccess = route.query.rechargeSuccess
  if (rechargeSuccess === 'true') {
    ElMessage.success('充值成功！余额已到账')
  }
  
  // 检查支付成功提示
  const paymentSuccess = route.query.paymentSuccess
  if (paymentSuccess === 'true') {
    const orderNo = route.query.orderNo
    ElMessageBox.alert(
      `订单号：${orderNo}\n\n您可以在"我的订单"或"我的课程"中查看详情。`,
      '✅ 支付成功',
      {
        confirmButtonText: '好的',
        type: 'success',
        center: true
      }
    )
    // 如果在课程tab，重新加载课程列表
    if (activeMenu.value === 'courses') {
      loadMyCourses()
    }
    // 如果在订单tab，重新加载订单列表
    if (activeMenu.value === 'orders') {
      loadCourseOrders()
    }
  }
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* ========== 顶部导航 ========== */
.top-nav {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: white;
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-right .el-button {
  color: white;
  font-size: 15px;
}

.nav-right :deep(.el-dropdown) {
  outline: none;
}

.nav-right :deep(.el-dropdown__popper) {
  margin-top: 8px !important;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s;
  border: 2px solid transparent;
  outline: none;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

/* ========== 内容容器 ========== */
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* ========== 头部卡片 ========== */
.profile-header {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.avatar-section {
  position: relative;
}

.avatar-uploader {
  position: relative;
  cursor: pointer;
}

.avatar-img {
  border: 3px solid #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  font-size: 12px;
}

.avatar-uploader:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .el-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.user-basic-info h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.user-tags {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.user-tags .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.vip-tag-clickable {
  cursor: pointer;
  transition: all 0.3s;
}

.vip-tag-clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 162, 60, 0.4);
}

/* SVIP标签特殊样式 */
.svip-tag {
  background: linear-gradient(135deg, #9b59b6 0%, #e74c3c 50%, #f39c12 100%) !important;
  border: none !important;
  position: relative;
  overflow: hidden;
  animation: svip-glow 2s ease-in-out infinite;
}

.svip-tag::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: svip-shine 3s ease-in-out infinite;
}

@keyframes svip-glow {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(155, 89, 182, 0.5);
  }
  50% {
    box-shadow: 0 4px 12px rgba(155, 89, 182, 0.8), 0 0 20px rgba(231, 76, 60, 0.5);
  }
}

@keyframes svip-shine {
  0% {
    transform: translateX(-100%) translateY(-100%);
  }
  100% {
    transform: translateX(100%) translateY(100%);
  }
}

.svip-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(155, 89, 182, 0.8), 0 0 20px rgba(231, 76, 60, 0.5) !important;
}

.join-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 14px;
  margin: 0;
}

/* ========== 菜单卡片 ========== */
.menu-card {
  border-radius: 12px;
}

.menu-card :deep(.el-menu) {
  border-right: none;
}

.menu-card :deep(.el-menu-item) {
  border-radius: 8px;
  margin: 4px 8px;
}

.menu-card :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  font-weight: 600;
}

/* ========== 内容卡片 ========== */
.el-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-form,
.password-form {
  margin-top: 20px;
}

.profile-form :deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}

/* ========== 头像选择器 ========== */
.avatar-selector {
  min-height: 400px;
}

.avatar-tabs :deep(.el-tabs__content) {
  padding: 20px 0;
}

.system-avatars {
  max-height: 500px;
  overflow-y: auto;
  padding: 10px;
}

.system-avatars::-webkit-scrollbar {
  width: 8px;
}

.system-avatars::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.system-avatars::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
}

.system-avatars::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

.avatar-section {
  margin-bottom: 10px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 10px 0 15px 0;
  padding-left: 10px;
  border-left: 4px solid #667eea;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  padding: 10px;
}

.avatar-option {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border: 3px solid transparent;
  border-radius: 50%;
  transition: all 0.3s;
}

.avatar-option:hover {
  transform: scale(1.05);
  border-color: #e0e0e0;
}

.avatar-option.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.check-mark {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 上传区域 */
.upload-area {
  padding: 20px;
  display: flex;
  justify-content: center;
}

.avatar-upload-box {
  width: 100%;
}

.avatar-upload-box :deep(.el-upload) {
  width: 100%;
}

.avatar-upload-box :deep(.el-upload-dragger) {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  border: 2px dashed #d9d9d9;
  transition: all 0.3s;
}

.avatar-upload-box :deep(.el-upload-dragger:hover) {
  border-color: #667eea;
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  font-size: 60px;
  color: #c0c4cc;
  margin-bottom: 20px;
}

.upload-text p {
  margin: 8px 0;
  color: #606266;
}

.upload-text .upload-hint {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ========== VIP面板 ========== */
.vip-section {
  padding: 20px;
}

.vip-status-card {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 12px;
  transition: all 0.3s;
}

.vip-status-card.is-vip {
  background: linear-gradient(135deg, #2c1654 0%, #5b2c83 50%, #1a0e2e 100%);
  border: 2px solid rgba(218, 165, 32, 0.4);
  box-shadow: 0 8px 32px rgba(218, 165, 32, 0.25), 0 0 60px rgba(91, 44, 131, 0.3);
  position: relative;
  overflow: hidden;
}

.vip-status-card.is-vip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(218, 165, 32, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.vip-clickable-area {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 30px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  z-index: 1;
}

.vip-clickable-area:hover {
  transform: translateX(5px);
}

.vip-icon {
  color: #909399;
}

.vip-status-card.is-vip .vip-icon {
  color: #ffd700;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.8));
  }
}

.vip-info {
  flex: 1;
}

.vip-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.vip-status-card.is-vip .vip-info h3 {
  color: #ffd700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  font-weight: 700;
}

.vip-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.vip-info .view-detail {
  font-size: 12px;
  color: #909399;
  margin-top: 10px;
}

.vip-status-card.is-vip .vip-info p {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.vip-status-card.is-vip .vip-info .view-detail {
  color: rgba(255, 215, 0, 0.8);
}

.vip-action {
  position: relative;
  z-index: 1;
}

.vip-benefits {
  margin-top: 20px;
}

.vip-benefits h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: all 0.3s;
}

.benefit-item:hover {
  background: #ecf5ff;
  transform: translateX(5px);
}

.benefit-item span {
  color: #606266;
  font-size: 14px;
}

/* ========== 钱包面板 ========== */
.wallet-section {
  padding: 20px;
}

.wallet-not-activated {
  padding: 40px 20px;
}

.wallet-content {
  min-height: 400px;
}

.wallet-balance-card {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.balance-icon {
  font-size: 50px;
}

.balance-info {
  flex: 1;
}

.balance-label {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.balance-amount {
  font-size: 36px;
  font-weight: 700;
}

.transaction-section {
  margin-top: 20px;
}

.transaction-section h4 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.amount-income {
  color: #67c23a;
  font-weight: 600;
}

.amount-expense {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* ========== 我的课程 ========== */
.courses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.course-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  background: white;
}

.course-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.course-cover {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  cursor: pointer;
}

.course-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
}

.course-cover:hover .course-overlay {
  opacity: 1;
}

.course-info {
  padding: 15px;
}

.course-info h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #303133;
  cursor: pointer;
  transition: color 0.3s;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.course-info h4:hover {
  color: #409eff;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #909399;
}

.course-meta .teacher {
  display: flex;
  align-items: center;
  gap: 4px;
}

.course-source {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
}

.obtain-time {
  color: #909399;
}

.course-info .el-button {
  width: 100%;
}

/* ========== 我的订单 ========== */
.order-course-info {
  display: flex;
  align-items: center;
}

.course-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  font-weight: 500;
}

.order-no {
  font-size: 12px;
  color: #909399;
}

.price {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}

.order-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ========== 学习记录 ========== */
.learning-records-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.learning-record-item {
  display: flex;
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e4e7ed;
}

.learning-record-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.record-cover {
  position: relative;
  flex-shrink: 0;
  width: 200px;
  height: 120px;
  overflow: hidden;
  background: #000;
}

.record-cover .el-image {
  width: 100%;
  height: 100%;
}

.learning-record-item:hover .record-cover img {
  transform: scale(1.1);
}

.learning-record-item .cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.learning-record-item:hover .cover-overlay {
  opacity: 1;
}

.record-content {
  flex: 1;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.record-header .course-title {
  flex: 1;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.chapter-info .el-icon {
  color: #909399;
  font-size: 14px;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.progress-time {
  color: #606266;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.last-time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
}

.last-time .el-icon {
  font-size: 14px;
}

.header-subtitle {
  font-size: 13px;
  color: #909399;
  font-weight: normal;
  margin-left: 12px;
}

/* 优惠券样式 */
.coupons-content {
  min-height: 400px;
}

.coupon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.coupon-card {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
  position: relative;
}

.coupon-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.coupon-card.expired {
  background: linear-gradient(135deg, #909399 0%, #606266 100%);
  opacity: 0.6;
}

.coupon-left-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.15);
  min-width: 120px;
}

.coupon-value {
  margin-bottom: 6px;
}

.value-amount,
.value-discount {
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.coupon-type-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.coupon-info-section {
  flex: 1;
  padding: 20px;
  color: white;
}

.coupon-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.coupon-condition {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 6px 0;
}

.coupon-expire {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 8px 0;
}

.coupon-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
}

.expired-mask {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.5);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

/* ========== 继续支付对话框样式 ========== */
.purchase-dialog-content {
  padding: 10px;
}

.course-purchase-info {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.purchase-course-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: white;
}

.purchase-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.price-label {
  color: rgba(255, 255, 255, 0.9);
}

.original-price-text {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: line-through;
}

.discount-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.discount-amount {
  color: #ffd700;
  font-weight: 600;
}

.final-price-row {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #ffd700;
}

.wallet-balance {
  color: #67c23a;
  font-weight: 600;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 6px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .learning-record-item {
    flex-direction: column;
  }
  
  .record-cover {
    width: 100%;
    height: 150px;
  }
  
  .coupon-grid {
    grid-template-columns: 1fr;
  }
}
</style>

