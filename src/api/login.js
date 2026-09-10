import request from './request'

/** 当前后端已实现：POST /login，body 为 SysUser */
export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}


// 退出登录接口logout
export function logout(data) {
  return request({
    url: '/logout',
    method: 'post',
    data
  })
}