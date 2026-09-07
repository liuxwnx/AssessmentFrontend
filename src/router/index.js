import { createRouter, createWebHistory } from 'vue-router'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/',
    component: () => import('@/layout/AppLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'order',
        name: 'OrderList',
        component: () => import('@/views/order/OrderList.vue'),
        meta: { title: '订单管理' }
      },
      {
        path: 'order/create',
        name: 'OrderCreate',
        component: () => import('@/views/order/OrderForm.vue'),
        meta: { title: '新建订单' }
      },
      {
        path: 'order/edit/:id',
        name: 'OrderEdit',
        component: () => import('@/views/order/OrderForm.vue'),
        meta: { title: '编辑订单' }
      },
      {
        path: 'order/detail/:id',
        name: 'OrderDetail',
        component: () => import('@/views/order/OrderDetail.vue'),
        meta: { title: '订单详情' }
      },
      {
        path: 'audit',
        name: 'AuditList',
        component: () => import('@/views/audit/AuditList.vue'),
        meta: { title: '订单审批', manager: true }
      },
      {
        path: 'customer',
        name: 'CustomerList',
        component: () => import('@/views/customer/CustomerList.vue'),
        meta: { title: '客户管理' }
      },
      {
        path: 'product',
        name: 'ProductList',
        component: () => import('@/views/product/ProductList.vue'),
        meta: { title: '商品信息' }
      },
      {
        path: 'excel',
        name: 'ExcelPage',
        component: () => import('@/views/excel/ExcelPage.vue'),
        meta: { title: '导入导出' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - 订单管理系统` : '订单管理系统'
  const token = getToken()
  if (to.meta.public) {
    if (token && to.path === '/login') {
      next('/')
      return
    }
    next()
    return
  }
  if (!token) {
    next('/login')
    return
  }
  const userStore = useUserStore()
  if (to.meta.manager && userStore.userInfo.roleId && !userStore.isManager) {
    next('/home')
    return
  }
  next()
})

export default router
