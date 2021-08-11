import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    sysConfig: { // 客户端配置

    },
    version: {
      version_id: '2.2.0', // release
      version_info_20210406: '20210406版本:黑名单，逃单管理，用户角色权限，订单查询订单详情，场内车清空时间条件，查询条件优化',
      version_info_20210415: '订单详情BUG修改；现金支付添加按用户查询；场内车删除、清空上传驶离',
      version_info_20210608: '抬杆操作截图；手动输入车号放行记录操作日志，并停供查询功能；万达白名单需求',
      version_info_20210630: '增加无驶入订单,驶离不抬杆配置；增加查询功能导出excel功能；增加客户黑名单功能，并停供配置，提供转换方式',
      version_info_20210730: '20210630现金放行按钮，添加10S防抖；',
      version_info: '图片路径，对外接口'
    },
    // 请求前缀
    baseUrl: 'http://127.0.0.1:9000/api/client/',
    wsUrl: 'ws://127.0.0.1:9000/parksocket',
    baseImageUrl: 'http://127.0.0.1:8080/',
    // 停车场配置信息
    parkConfig: {
      parkInfo: {},
      regionList: [],
      gateList: [],
      equipList: []
    }
  },
  mutations: {
    // 停车场配置信息
    initParkConfig (state, data) {
      state.parkConfig = data
    },
    // 客户端后台网络配置信息
    intNetworkUrl (state, data) {
      state.baseUrl = data.url
      state.wsUrl = data.wsurl
      state.baseImageUrl = data.baseImageUrl
    },
    // 客户端配置
    initSysConfig (state, data) {
      state.sysConfig = data
    }
  },
  actions: {
  },
  modules: {
  }
})
