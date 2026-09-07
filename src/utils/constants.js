/**
 * 与后端 JwtUtils.SECRET_KEY 保持一致：拦截器从该请求头读取 token
 * request.getHeader(JwtUtils.SECRET_KEY)
 */
export const TOKEN_HEADER = 'bGl1eGlud2Vp'

export const TOKEN_KEY = 'assessment_token'
export const USER_KEY = 'assessment_user'

/** 与 sys_role 约定：1 销售员，2 销售经理（后端补齐登录返回 roleId 后生效） */
export const ROLE = {
  SALES: 1,
  MANAGER: 2
}

export const ROLE_NAME = {
  [ROLE.SALES]: '销售员',
  [ROLE.MANAGER]: '销售经理'
}

export const ORDER_STATUS = {
  PENDING: '待审批',
  PASSED: '已通过',
  REJECTED: '已拒绝'
}

export const ORDER_STATUS_TAG = {
  [ORDER_STATUS.PENDING]: 'warning',
  [ORDER_STATUS.PASSED]: 'success',
  [ORDER_STATUS.REJECTED]: 'danger'
}
