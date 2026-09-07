import request from './request'

export function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)
  return request({
    url: '/file/upload',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
