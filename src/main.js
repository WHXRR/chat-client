import App from './App.vue'
import pinia from '@/store'
import { useStore } from "@/store/user";
import { createApp } from 'vue'
import { setupRouter } from '@/router'
import '@/assets/css/element.scss'
// import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import "./assets/css/main.css"

const app = createApp(App)

// 注册store
app.use(pinia)

// 注册路由
setupRouter(app)

// 注册element组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus);

// 挂载
app.mount('#app')

// 注册自定义指令
app.directive('focus', {
  mounted: (el) => el.focus(),
})

// 刷新时重新获取个人信息
const store = useStore(pinia);
if (store.token) {
  store.getUserInfo()
}