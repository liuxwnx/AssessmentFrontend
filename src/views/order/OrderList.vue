<template>
  <el-card shadow="never">
    <el-form :inline="true" :model="query" class="toolbar">
      <el-form-item label="订单状态">
        <el-select v-model="query.status" clearable placeholder="全部" style="width: 140px">
          <el-option :label="ORDER_STATUS.PENDING" :value="ORDER_STATUS.PENDING" />
          <el-option :label="ORDER_STATUS.PASSED" :value="ORDER_STATUS.PASSED" />
          <el-option :label="ORDER_STATUS.REJECTED" :value="ORDER_STATUS.REJECTED" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="query.timeRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="success" @click="$router.push('/order/create')">新建订单</el-button>
      </el-form-item>
    </el-form>

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
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="ORDER_STATUS_TAG[row.status] || 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="170">
        <template #default="{ row }">{{ formatDateTime(row.createTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="$router.push(`/order/detail/${row.id}`)">详情</el-button>
          <el-button
            v-if="row.status === ORDER_STATUS.REJECTED"
            type="warning"
            link
            @click="$router.push(`/order/edit/${row.id}`)"
          >
            重新提交
          </el-button>
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
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getOrderPage } from '@/api/order'
import { ORDER_STATUS, ORDER_STATUS_TAG } from '@/utils/constants'
import { fillOrderNames } from '@/utils/nameDict'
import { formatAmount, formatDateTime } from '@/utils/format'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  status: '',
  timeRange: []
})

function buildParams() {
  const [beginTime, endTime] = query.timeRange || []
  return {
    pageNum: query.pageNum,
    pageSize: query.pageSize,
    status: query.status || undefined,
    beginTime,
    endTime
  }
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getOrderPage(buildParams())
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

function handleSearch() {
  query.pageNum = 1
  fetchList()
}

function handleReset() {
  query.status = ''
  query.timeRange = []
  query.pageNum = 1
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
