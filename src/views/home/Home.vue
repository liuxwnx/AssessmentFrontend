<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="8">
        <el-card shadow="never">
          <div class="stat-label">当前账号</div>
          <div class="stat-value">{{ userStore.userInfo.username || '-' }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <div class="stat-label">角色</div>
          <div class="stat-value">{{ userStore.roleLabel }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <div class="stat-label">系统说明</div>
          <div class="stat-desc">销售员提交订单，销售经理审批并扣减库存</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mt16" shadow="never">
      <template #header>快捷入口</template>
      <el-space wrap>
        <el-button type="primary" @click="$router.push('/order')">订单管理</el-button>
        <el-button v-if="showAudit" type="warning" @click="$router.push('/audit')">订单审批</el-button>
        <el-button @click="$router.push('/customer')">客户管理</el-button>
        <el-button @click="$router.push('/product')">商品信息</el-button>
        <el-button @click="$router.push('/excel')">导入导出</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const showAudit = computed(() => {
  if (!userStore.userInfo.roleId) return true
  return userStore.isManager
})
</script>

<style scoped>
.stat-label {
  color: #909399;
  font-size: 13px;
}

.stat-value {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 600;
}

.stat-desc {
  margin-top: 8px;
  color: #606266;
  line-height: 1.5;
}

.mt16 {
  margin-top: 16px;
}
</style>
