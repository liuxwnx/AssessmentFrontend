import request from './request'

export function getCustomerPage(params) {
  return request({
    url: '/customer/list',
    method: 'get',
    params
  })
}

export function getCustomerDetail(id) {
  return request({
    url: `/customer/${id}`,
    method: 'get'
  })
}
