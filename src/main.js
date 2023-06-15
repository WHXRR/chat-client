import App from './App.vue'
import pinia from '@/store'
import { useStore } from "@/store/user";
import { systemStore } from "@/store/system";
import { createApp } from 'vue'
import { setupRouter } from '@/router'
import { setCssVar } from "@/hooks/useSwitchTheme";
// import '@/assets/css/element.scss'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@/styles/var.css'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import "./styles/main.css"

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

const store = useStore();
app.directive('permission', {
  mounted: (el, binding) => {
    const userPermission = store.user.identity
    if (binding.value.includes(userPermission)) {
      el.style.display = 'block'
    } else {
      el.parentNode.removeChild(el);
    }
  }
})
const sysStore = systemStore()
setCssVar(sysStore.chatTheme);