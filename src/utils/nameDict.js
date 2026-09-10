import { getCustomerPage } from '@/api/customer'
import { getProductPage } from '@/api/product'

// 名称字典：后端订单接口只返回 customerId/productId，不含名称，
// 因此前端拉取客户和商品列表构建 id -> 名称 的映射（模块级缓存，全局只请求一次）。
const PAGE_SIZE = 200
const MAX_PAGES = 50 // 安全上限：最多拉取 50 页（共 1 万条），防止异常情况下无限循环
let dictPromise = null

// 循环分页拉取列表接口的全部记录，不受单页 200 条限制
export async function fetchAllPages(fetchFn) {
  const records = []
  for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
    const res = await fetchFn({ pageNum, pageSize: PAGE_SIZE })
    const data = res.data || {}
    const list = data.records || []
    records.push(...list)
    // 当前页为空，或累计条数已到 total，说明已取完
    if (!list.length || records.length >= Number(data.total || 0)) break
  }
  return records
}

function fetchNameDict() {
  if (!dictPromise) {
    dictPromise = Promise.all([fetchAllPages(getCustomerPage), fetchAllPages(getProductPage)])
      .then(([customers, products]) => {
        const customerMap = new Map()
        const productMap = new Map()
        customers.forEach((c) => customerMap.set(String(c.id), c.customerName))
        products.forEach((p) => productMap.set(String(p.id), p.productName))
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
// 名称查不到（如客户/商品已不存在）时保留原数据，页面仍会回退显示 id。
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
