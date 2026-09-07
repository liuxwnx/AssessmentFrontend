<template>
  <el-card shadow="never">
    <el-alert
      title="导入仅保存校验通过的行（商品需存在、数量为正整数）。导出支持按时间和订单状态过滤。"
      type="info"
      show-icon
      :closable="false"
      class="mb16"
    />

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>模板与导入</template>
          <el-space wrap>
            <el-button type="primary" @click="handleTemplate">下载导入模板</el-button>
            <el-upload :show-file-list="false" accept=".xls,.xlsx" :http-request="handleImport">
              <el-button type="success">上传 Excel 导入</el-button>
            </el-upload>
          </el-space>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>订单导出</template>
          <el-form :model="query" label-width="90px">
            <el-form-item label="订单状态">
              <el-select v-model="query.status" clearable placeholder="全部" style="width: 100%">
                <el-option :label="ORDER_STATUS.PENDING" :value="ORDER_STATUS.PENDING" />
                <el-option :label="ORDER_STATUS.PASSED" :value="ORDER_STATUS.PASSED" />
                <el-option :label="ORDER_STATUS.REJECTED" :value="ORDER_STATUS.REJECTED" />
              </el-select>
            </el-form-item>
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="query.timeRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="warning" @click="handleExport">导出 Excel</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { downloadOrderTemplate, exportOrders, importOrders } from '@/api/order'
import { ORDER_STATUS } from '@/utils/constants'
import { saveBlob } from '@/utils/download'

const query = reactive({
  status: '',
  timeRange: []
})

async function handleTemplate() {
  const res = await downloadOrderTemplate()
  saveBlob(res.data, '订单导入模板.xlsx')
  ElMessage.success('模板已开始下载')
}

async function handleImport({ file }) {
  await importOrders(file)
  ElMessage.success('导入完成（仅保存合法数据）')
}

async function handleExport() {
  const [beginTime, endTime] = query.timeRange || []
  const res = await exportOrders({
    status: query.status || undefined,
    beginTime,
    endTime
  })
  saveBlob(res.data, '订单数据.xlsx')
  ElMessage.success('导出成功')
}
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}
</style>
