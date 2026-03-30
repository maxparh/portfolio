import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('@/pages/Blog.vue') // Ленивая загрузка
    },
    { path: '/contacts', 
      name: 'contacts', 
      component: () => import('@/pages/Contacts.vue') 
    },
    { path: '/projects', 
      name: 'projects', 
      component: () => import('@/pages/Projects.vue') 
    },
  ],
})

export default router