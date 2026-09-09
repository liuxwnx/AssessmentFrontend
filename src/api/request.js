import axios from 'axios'
import { ElMessage } from 'element-plus'
import { TOKEN_HEADER } from '@/utils/constants'
import { getToken, clearAuth } from '@/utils/auth'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000
})

request.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers[TOKEN_HEADER] = token
    }
    return config
  },
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (response.config.responseType === 'blob') {
      return response
    }
    // 部分接口（如文件上传）直接返回字符串，不包裹 code/msg/data
    if (typeof res === 'string') {
      return res
    }
    if (res && res.code !== 1) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(res)
    }
    return res
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      clearAuth()
      ElMessage.error('登录已过期，请重新登录')
      window.location.href = '/login'
    } else {
      ElMessage.error(error.message || '网络异常')
    }
    return Promise.reject(error)
  }
)

export default request
