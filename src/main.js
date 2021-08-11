import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

// 导入全局样式表
import './assets/css/global.css'
// 图标库
import './assets/iconfont/iconfont.css'

import './plugins/element.js'
import './plugins/echarts.js'
import 'element-ui/lib/theme-chalk/index.css'

// axios网络请求
import Axios from 'axios'

// 引入vuex
import store from './store'

// 引入vxetable
Vue.use(VXETable)
// 给 vue 实例挂载内部对象，例如：
Vue.prototype.$XModal = VXETable.modal
Vue.prototype.$XPrint = VXETable.print
Vue.prototype.$XSaveFile = VXETable.saveFile
Vue.prototype.$XReadFile = VXETable.readFile

// Axios.defaults.baseURL = '/api'
// 携带token
Axios.interceptors.request.use(config => {
  config.headers.token = window.sessionStorage.getItem('token')
  return config
})
Axios.interceptors.response.use(config => {
  return config
})
Vue.prototype.$http = Axios

Vue.config.productionTip = false

Vue.filter('dateFormat', function (orignVal) {
  const dt = new Date(orignVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.filter('dateFormatYMD', function (orignVal) {
  const dt = new Date(orignVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  return `${y}-${m}-${d}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
