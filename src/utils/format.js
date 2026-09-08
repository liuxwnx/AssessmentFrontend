import dayjs from 'dayjs'

const pad = (n) => String(n).padStart(2, '0')

/**
 * 时间格式化为 yyyy-MM-dd HH:mm:ss
 * 兼容后端 LocalDateTime 序列化为 [年,月,日,时,分,秒] 数组或 "2026,9,8,10,30,0" 逗号串的情况，
 * 已是目标格式的字符串原样返回，无法解析的原样返回
 */
export function formatDateTime(value) {
  if (!value) return '-'
  const str = String(value)
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) return str

  let date
  if (Array.isArray(value) || /^\d{4},\d{1,2},\d{1,2}/.test(str)) {
    // Jackson WRITE_DATES_AS_TIMESTAMPS 时 LocalDateTime 序列化为 [2026,9,8,10,30,0]
    const [y, m, d, h = 0, mi = 0, s = 0] = (Array.isArray(value) ? value : str.split(',').map(Number))
    date = dayjs(new Date(y, m - 1, d, h, mi, s))
  } else {
    date = dayjs(str)
  }
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : str
}

/** 金额：数据库以分为单位存储，展示时转为元并保留两位小数 */
export function formatAmount(cents) {
  const num = Number(cents)
  if (Number.isNaN(num)) return cents
  return (num / 100).toFixed(2)
}
