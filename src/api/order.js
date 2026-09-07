import request from './request'

export function getOrderPage(params) {
  return request({
    url: '/order/list',
    method: 'get',
    params
  })
}

export function getOrderDetail(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  })
}

export function createOrder(data) {
  return request({
    url: '/order',
    method: 'post',
    data
  })
}

export function updateOrder(id, data) {
  return request({
    url: `/order/${id}`,
    method: 'put',
    data
  })
}

export function auditOrder(id, data) {
  return request({
    url: `/order/${id}/audit`,
    method: 'post',
    data
  })
}

export function downloadOrderTemplate() {
  return request({
    url: '/order/template',
    method: 'get',
    responseType: 'blob'
  })
}

export function importOrders(file) {
  const form = new FormData()
  form.append('file', file)
  return request({
    url: '/order/import',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function exportOrders(params) {
  return request({
    url: '/order/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
