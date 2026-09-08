<template>
  <el-card shadow="never">
    <el-form :inline="true" :model="query">
      <el-form-item label="商品名称">
        <el-input v-model="query.productName" clearable placeholder="请输入商品名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="tableData" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="productName" label="商品名称" min-width="160" />
      <el-table-column prop="currentInventory" label="当前库存" width="120" />
      <el-table-column prop="unitPrice" label="单价" width="120">
        <template #default="{ row }">{{ row.unitPrice != null ? formatAmount(row.unitPrice) : '-' }}</template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="170" />
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
import { getProductPage } from '@/api/product'
import { formatAmount } from '@/utils/format'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: ''
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getProductPage({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      productName: query.productName || undefined
    })
    const data = res.data || {}
    tableData.value = data.records || []
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
  query.productName = ''
  query.pageNum = 1
  fetchList()
}

onMounted(fetchList)
</script>

<style scoped>
.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
