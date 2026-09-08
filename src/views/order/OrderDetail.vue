<template>
  <el-card v-loading="loading" shadow="never">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="订单编号">{{ detail.orderNumber || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="ORDER_STATUS_TAG[detail.status] || 'info'">{{ detail.status || '-' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="客户">{{ detail.customerName || detail.customerId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="商品">{{ detail.productName || detail.productId || '-' }}</el-descriptions-item>
      <el-descriptions-item label="数量">{{ detail.quantity ?? '-' }}</el-descriptions-item>
      <el-descriptions-item label="金额">{{ detail.amount != null ? formatAmount(detail.amount) : '-' }}</el-descriptions-item>
      <el-descriptions-item label="合同">{{ detail.file || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDateTime(detail.createTime) }}</el-descriptions-item>
      <el-descriptions-item v-if="detail.rejectReason" label="驳回原因" :span="2">
        {{ detail.rejectReason }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="actions">
      <el-button
        v-if="detail.status === ORDER_STATUS.REJECTED"
        type="warning"
        @click="$router.push(`/order/edit/${detail.id}`)"
      >
        重新编辑提交
      </el-button>
      <template v-if="canAudit">
        <el-button type="success" @click="handlePass">通过</el-button>
        <el-button type="danger" @click="rejectVisible = true">驳回</el-button>
      </template>
      <el-button @click="$router.back()">返回</el-button>
    </div>

    <el-dialog v-model="rejectVisible" title="驳回订单" width="420px">
      <el-input v-model="rejectReason" type="textarea" :rows="4" placeholder="请填写驳回原因" />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" :loading="auditing" @click="handleReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { auditOrder, getOrderDetail } from '@/api/order'
import { ORDER_STATUS, ORDER_STATUS_TAG } from '@/utils/constants'
import { formatAmount, formatDateTime } from '@/utils/format'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const auditing = ref(false)
const rejectVisible = ref(false)
const rejectReason = ref('')
const detail = ref({})

const canAudit = computed(() => {
  const manager = !userStore.userInfo.roleId || userStore.isManager
  return manager && detail.value.status === ORDER_STATUS.PENDING
})

async function fetchDetail() {
  loading.value = true
  try {
    const res = await getOrderDetail(route.params.id)
    detail.value = res.data || {}
  } finally {
    loading.value = false
  }
}

async function handlePass() {
  auditing.value = true
  try {
    await auditOrder(detail.value.id, { status: ORDER_STATUS.PASSED })
    ElMessage.success('已通过，库存将自动扣减')
    fetchDetail()
  } finally {
    auditing.value = false
  }
}

async function handleReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  auditing.value = true
  try {
    await auditOrder(detail.value.id, {
      status: ORDER_STATUS.REJECTED,
      rejectReason: rejectReason.value
    })
    ElMessage.success('已驳回')
    rejectVisible.value = false
    fetchDetail()
  } finally {
    auditing.value = false
  }
}

onMounted(fetchDetail)
</script>

<style scoped>
.actions {
  margin-top: 20px;
}
</style>
