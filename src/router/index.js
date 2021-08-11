import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from '../components/Home'
import Video from '../components/video/Video'
import Order from '../components/order/Order'
import Sysconfig from '../components/sys/Sysconfig'
import Park from '../components/sys/Park'
import Gate from '../components/sys/Gate'
import Equip from '../components/sys/Equip'
import Leaguer from '../components/sys/Leaguer'
import Leaguer1 from '../components/sys/Leaguer1'
import Leaguer2 from '../components/sys/Leaguer2'
import User from '../components/sys/User'
import Rule from '../components/fee/Rule'
import Scheme from '../components/fee/Scheme'
import ChargeTest from '../components/fee/ChargeTest'
import FeatureConf from '../components/sys/FeatureConf'
import Detect from '../components/order/Detect'
import Statistics from '../components/order/Statistics'
import Manaul from '../components/logmanager/Manaul'
import Region from '../components/sys/Region'
import OrderPay from '../components/order/OrderPay'
import Cars from '../components/sys/Cars'
import Carsdel from '../components/logmanager/Carsdel'
import FreeGo from '../components/logmanager/FreeGo'
import Blacklist from '../components/sys/BlackList'
import Abnormal from '../components/sys/AbnormalCar'
import Role from '../components/sys/Role'
import Carno from '../components/logmanager/Carno'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/video',
    // redirect: '/order',
    children: [
      { path: '/video', component: Video },
      { path: '/order', component: Order },
      { path: '/sysconfig', component: Sysconfig },
      { path: '/featureconf', component: FeatureConf },
      { path: '/park', component: Park },
      { path: '/gate', component: Gate },
      { path: '/equip', component: Equip },
      { path: '/leaguer', component: Leaguer },
      { path: '/leaguer1', component: Leaguer1 },
      { path: '/leaguer2', component: Leaguer2 },
      { path: '/black', component: Blacklist },
      { path: '/abnormal', component: Abnormal },
      { path: '/user', component: User },
      { path: '/rule', component: Rule },
      { path: '/scheme', component: Scheme },
      { path: '/chargetest', component: ChargeTest },
      { path: '/detect', component: Detect },
      { path: '/statistics', component: Statistics },
      { path: '/manaul', component: Manaul },
      { path: '/region', component: Region },
      { path: '/orderpay', component: OrderPay },
      { path: '/cars', component: Cars },
      { path: '/carsdel', component: Carsdel },
      { path: '/freego', component: FreeGo },
      { path: '/role', component: Role },
      { path: '/carno', component: Carno }
    ]
  }
]

const router = new VueRouter({
  // mode: 'history',
  // base: '/', // 生产环境打包使用
  routes
})

// 挂载路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  } else {
    // 获取token
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
  }
})

export default router
