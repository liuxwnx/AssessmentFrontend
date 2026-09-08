<template>
  <el-card shadow="never">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 640px">
      <el-form-item label="客户" prop="customerId">
        <el-select v-model="form.customerId" filterable placeholder="请选择客户" style="width: 100%">
          <el-option
            v-for="item in customers"
            :key="item.id"
            :label="item.customerName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品" prop="productId">
        <el-select v-model="form.productId" filterable placeholder="请选择商品" style="width: 100%" @change="onProductChange">
          <el-option
            v-for="item in products"
            :key="item.id"
            :label="`${item.productName}（库存 ${item.currentInventory}）`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数量" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" :max="99999" @change="calcAmount" />
      </el-form-item>
      <el-form-item label="单价(元)">
        <el-input :model-value="unitPrice ? formatAmount(unitPrice) : ''" disabled />
      </el-form-item>
      <el-form-item label="金额(元)" prop="amount">
        <el-input-number v-model="form.amount" :precision="2" :min="0" :step="1" />
      </el-form-item>
      <el-form-item label="合同文件">
        <el-upload :show-file-list="true" :limit="1" :http-request="handleUpload">
          <el-button>上传合同</el-button>
        </el-upload>
        <div v-if="form.file" class="file-tip">已上传：{{ form.file }}</div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交审批</el-button>
        <el-button @click="$router.back()">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { createOrder, getOrderDetail, updateOrder } from '@/api/order'
import { getCustomerPage } from '@/api/customer'
import { getProductPage } from '@/api/product'
import { uploadFile } from '@/api/file'
import { formatAmount } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const formRef = ref()
const submitting = ref(false)
const customers = ref([])
const products = ref([])
const unitPrice = ref('')
const isEdit = Boolean(route.params.id)

const form = reactive({
  customerId: null,
  productId: null,
  quantity: 1,
  amount: 0,
  file: ''
})

const rules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }]
}

function onProductChange(id) {
  const product = products.value.find((p) => p.id === id)
  unitPrice.value = product?.unitPrice ?? ''
  calcAmount()
}

function calcAmount() {
  // 单价在数据库以分存储，表单按元计算展示
  const priceYuan = Number(unitPrice.value || 0) / 100
  form.amount = Number((priceYuan * Number(form.quantity || 0)).toFixed(2))
}

async function handleUpload({ file }) {
  const res = await uploadFile(file)
  form.file = res.data || res.msg || file.name
  ElMessage.success('合同上传成功')
}

async function loadOptions() {
  try {
    const [customerRes, productRes] = await Promise.all([
      getCustomerPage({ pageNum: 1, pageSize: 200 }),
      getProductPage({ pageNum: 1, pageSize: 200 })
    ])
    customers.value = customerRes.data?.records || []
    products.value = productRes.data?.records || []
  } catch {
    customers.value = []
    products.value = []
  }
}

async function loadDetail() {
  if (!isEdit) return
  const res = await getOrderDetail(route.params.id)
  const data = res.data || {}
  form.customerId = data.customerId
  form.productId = data.productId
  form.quantity = data.quantity || 1
  // 后端返回的金额单位是分，转为元回显
  form.amount = data.amount != null ? Number((Number(data.amount) / 100).toFixed(2)) : 0
  form.file = data.file || ''
  onProductChange(form.productId)
}

async function handleSubmit() {
  await formRef.value.validate()
  submitting.value = true
  try {
    // 提交时金额转回分，与后端约定保持一致
    const payload = { ...form, amount: Math.round(Number(form.amount) * 100) }
    if (isEdit) {
      await updateOrder(route.params.id, payload)
      ElMessage.success('已重新提交')
    } else {
      await createOrder(payload)
      ElMessage.success('已提交，等待审批')
    }
    router.push('/order')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadOptions()
  await loadDetail()
})
</script>

<style scoped>
.file-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
</style>
