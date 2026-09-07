import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { login as loginApi } from '@/api/login'
import { ROLE, ROLE_NAME } from '@/utils/constants'
import { clearAuth, getToken, getUser, setToken, setUser } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref(getToken())
  const userInfo = ref(getUser() || { username: '', roleId: null })

  const isLogin = computed(() => Boolean(token.value))
  const isManager = computed(() => Number(userInfo.value.roleId) === ROLE.MANAGER)
  const isSales = computed(() => Number(userInfo.value.roleId) === ROLE.SALES)
  const roleLabel = computed(() => ROLE_NAME[userInfo.value.roleId] || '未分配角色')

  async function login(form) {
    const res = await loginApi({
      username: form.username,
      password: form.password
    })
    const data = res.data || {}
    token.value = data.token
    userInfo.value = {
      username: data.username,
      roleId: data.roleId ?? null,
      roleName: data.roleName || ROLE_NAME[data.roleId]
    }
    setToken(data.token)
    setUser(userInfo.value)
    return data
  }

  function logout() {
    token.value = ''
    userInfo.value = { username: '', roleId: null }
    clearAuth()
  }

  return {
    token,
    userInfo,
    isLogin,
    isManager,
    isSales,
    roleLabel,
    login,
    logout
  }
})
