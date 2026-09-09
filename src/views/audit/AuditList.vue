<template>
  <el-card shadow="never">
    <el-alert
      title="仅展示待审批订单。通过后自动扣减对应商品库存；驳回必须填写原因。"
      type="info"
      show-icon
      :closable="false"
      class="mb12"
    />

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column prop="orderNumber" label="订单编号" min-width="180" />
      <el-table-column prop="customerName" label="客户" min-width="120">
        <template #default="{ row }">{{ row.customerName || row.customerId }}</template>
      </el-table-column>
      <el-table-column prop="productName" label="商品" min-width="120">
        <template #default="{ row }">{{ row.productName || row.productId }}</template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="amount" label="金额" width="110">
        <template #default="{ row }">{{ row.amount != null ? formatAmount(row.amount) : '-' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="提交时间" min-width="170">
        <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="$router.push(`/order/detail/${row.id}`)">详情</el-button>
          <el-button type="success" link @click="handlePass(row)">通过</el-button>
          <el-button type="danger" link @click="openReject(row)">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="fetchList"
        @current-change="fetchList"
      />
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
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { auditOrder, getOrderPage } from '@/api/order'
import { ORDER_STATUS } from '@/utils/constants'
import { fillOrderNames } from '@/utils/nameDict'
import { formatAmount, formatDateTime } from '@/utils/format'

const loading = ref(false)
const auditing = ref(false)
const tableData = ref([])
const total = ref(0)
const rejectVisible = ref(false)
const rejectReason = ref('')
const currentRow = ref(null)
const query = reactive({
  pageNum: 1,
  pageSize: 10
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getOrderPage({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      status: ORDER_STATUS.PENDING
    })
    const data = res.data || {}
    tableData.value = await fillOrderNames(data.records || [])
    total.value = Number(data.total || 0)
  } catch {
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function handlePass(row) {
  await auditOrder(row.id, { status: ORDER_STATUS.PASSED })
  ElMessage.success('审批通过，库存已扣减')
  fetchList()
}

function openReject(row) {
  currentRow.value = row
  rejectReason.value = ''
  rejectVisible.value = true
}

async function handleReject() {
  if (!rejectReason.value.trim()) {
    ElMessage.warning('请填写驳回原因')
    return
  }
  auditing.value = true
  try {
    await auditOrder(currentRow.value.id, {
      status: ORDER_STATUS.REJECTED,
      rejectReason: rejectReason.value
    })
    ElMessage.success('已驳回')
    rejectVisible.value = false
    fetchList()
  } finally {
    auditing.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.mb12 {
  margin-bottom: 12px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
