import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import TicketPage from '../views/TicketPage.vue'
import { getCurrentUser } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/tickets',
      name: 'tickets',
      component: TicketPage,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  const currentUser = getCurrentUser()

  if (to.meta.requiresAuth && !currentUser) {
    return { name: 'login' }
  }

  if (to.name === 'login' && currentUser) {
    return { name: 'tickets' }
  }

  return true
})

export default router
