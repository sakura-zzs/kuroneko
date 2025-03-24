import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: () => import('@/views/Home/Home.vue')
  },
  {
    path: '/publish',
    component: () => import('@/views/Publish/Publish.vue')
  },
  {
    path: '/article/:id',
    component: () => import('@/views/Article/Article.vue')
  },
  {
    path: '/user/:id',
    component: () => import('@/views/User/User.vue')
  },
  {
    path: '/map',
    component: () => import('@/views/Map/Map.vue')
  },
  {
    path: '/:pathMatch(.*)',
    component: () => import('@/views/NotFound/NotFound.vue')
  }
]
const router = createRouter({
  routes,
  history: createWebHistory()
})

export default router
