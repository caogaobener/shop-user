import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'vant/lib/index.css'; 

import App from './App.vue'
import router from './router'

import './assets/iconfont/iconfont.css'
import './assets/styles/base.less';

import SearchNav from '@/components/searchNav.vue';
import orderList from '@/components/orderList.vue';

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.component('SearchNav', SearchNav)
app.component('orderList', orderList)

app.mount('#app')
