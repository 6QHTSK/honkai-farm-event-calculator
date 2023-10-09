import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/theme-chalk/index.css'
import '@element-plus/icons-vue'
import ElementPlus from "element-plus";

const app = createApp(App)
app.use(ElementPlus)
app.mount("#app")
