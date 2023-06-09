
import pinia from '@/store'
import api from '@/api'
import { useStore } from "@/store/user";
import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes'
export const router = createRouter({
  history: createWebHistory(),
  // 应该添加到路由的初始路由列表。
  routes,
  // 是否应该禁止尾部斜杠。默认为假
  strict: true,
});

export function setupRouter(app) {
  app.use(router);
}

router.beforeEach(async (to, from, next) => {
  const store = useStore(pinia);
  if (!store.token && to.name !== 'Login') {
    next({ name: 'Login' })
  } else if (store.token && to.name === 'Login') {
    next({ name: 'Home' })
  } else if (store.token && to.name !== 'Login') {
    if (!store.user.id) {
      let res = await api.getUserInfo()
      store.user = { ...res.data }
    }
    let res1 = await api.getAllUserInfo()
    store.allUsers = { ...res1.data }
    next()
  } else {
    next()
  }
})
