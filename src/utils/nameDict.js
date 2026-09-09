import { getCustomerPage } from '@/api/customer'
import { getProductPage } from '@/api/product'

// 名称字典：后端订单接口只返回 customerId/productId，不含名称，
// 因此前端拉取客户和商品列表构建 id -> 名称 的映射（模块级缓存，全局只请求一次）。
const PAGE_SIZE = 200
let dictPromise = null

function fetchNameDict() {
  if (!dictPromise) {
    dictPromise = Promise.all([
      getCustomerPage({ pageNum: 1, pageSize: PAGE_SIZE }),
      getProductPage({ pageNum: 1, pageSize: PAGE_SIZE })
    ])
      .then(([customerRes, productRes]) => {
        const customerMap = new Map()
        const productMap = new Map()
        ;(customerRes.data?.records || []).forEach((c) => customerMap.set(String(c.id), c.customerName))
        ;(productRes.data?.records || []).forEach((p) => productMap.set(String(p.id), p.productName))
        return { customerMap, productMap }
      })
      .catch((err) => {
        // 加载失败时清空缓存，下次调用可重试
        dictPromise = null
        throw err
      })
  }
  return dictPromise
}

// 把订单记录中的 customerId/productId 补上 customerName/productName。
// 字典加载失败时不替换，保留原数据（页面仍会回退显示 id）。
export async function fillOrderNames(records) {
  if (!records?.length) return records
  try {
    const { customerMap, productMap } = await fetchNameDict()
    records.forEach((row) => {
      if (!row.customerName && row.customerId != null) {
        row.customerName = customerMap.get(String(row.customerId))
      }
      if (!row.productName && row.productId != null) {
        row.productName = productMap.get(String(row.productId))
      }
    })
  } catch {
    // 忽略字典加载失败
  }
  return records
}
