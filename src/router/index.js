import { createRouter, createWebHistory } from 'vue-router'
import chat from '../views/chat.vue'
import PendingUsers from "../views/pending.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'chat',
      component: chat
    },
    {
      path: "/pending",
      name: "pending",
      component: PendingUsers,
    }
  ]
})

export default router
