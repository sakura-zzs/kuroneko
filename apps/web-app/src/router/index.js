import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: () => import('@/views/Home/Home.vue')
  },
  {
    path: '/publish',
    component: () => import('@/views/Publish/Publish.vue'),
    preFetch: true
  },
  {
    path: '/article/:id',
    component: () => import('@/views/Article/Article.vue'),
    preFetch: true
  },
  {
    path: '/user/:id',
    component: () => import('@/views/User/User.vue'),
    preFetch: true
  },
  {
    path: '/map',
    component: () => import('@/views/Map/Map.vue'),
    preFetch: true
  },
  {
    path: '/:pathMatch(.*)',
    component: () => import('@/views/NotFound/NotFound.vue'),
    preFetch: true
  }
]
const router = createRouter({
  routes,
  history: createWebHistory()
})

export default router
