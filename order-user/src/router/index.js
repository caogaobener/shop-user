import { createRouter, createWebHashHistory  } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory (),
  // 路由懒加载
  routes: [
    {path: '/',redirect: '/order'},
    {path: '/order/:status?', name: 'order', component: () => import('@/views/orderPage.vue')},
    {path: '/map/:id?', name: 'map', component: () => import('@/views/mapPage.vue')},
    {path: '/searchIndex/:words?', name: 'searchIndex', component: () => import('@/views/searchIndex.vue')},
  ],
})

export default router
