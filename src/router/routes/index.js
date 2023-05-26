const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: '/home',
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import("@/views/home/Home.vue"),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import("@/views/login/Login.vue"),
  },
]

export default routes