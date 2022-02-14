<template>
  <div class="container">
    <div class="login_box">
      <div class="avatar_title">
          <span>蓝能停车场管理软件</span>
      </div>
      <!-- 表单 -->
      <el-form ref="loginFromRef" :model="loginForm" :rules="lofinFormRules" label-width="0px" class="login_form">
          <!-- 用户名 -->
          <el-form-item prop="userName">
              <el-input v-model="loginForm.userName" placeholder="请输入用户名" prefix-icon="iconfont iconuser"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="passWord">
              <el-input v-model="loginForm.passWord" placeholder="请输入密码" prefix-icon="iconfont iconpassword" type="password" @keyup.enter.native="login"></el-input>
          </el-form-item>
          <el-form-item @keyup.enter.native="login">
              <el-checkbox v-model="remember.username">记住用户名</el-checkbox>
              <el-checkbox v-model="remember.password">记住密码</el-checkbox>
          </el-form-item>
          <!-- 按钮 -->
          <el-form-item class="btns">
              <el-button type="primary" @click="login">登 录</el-button>
          </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>

export default {
  mounted () {
    /// //////////////////windows、linux平台/////////////////////////////

    // this.initClientParams()
    /// //////////////////windows、linux平台/////////////////////////////

    /// //////////////////网页版本/////////////////////////////

    this.initWebParams()

    /// //////////////////网页版本/////////////////////////////

    // 读取缓存
    this.getLocalStorage()
  },
  data () {
    return {
      configData: {},
      remember: {
        username: false,
        password: false
      },
      baseUrl: '',
      // 登录表单数据对象
      loginForm: {
        userName: '',
        passWord: ''
      },

      // 登录表单验证规则
      lofinFormRules: {
        userName: [
          { required: true, message: '用户名不能为空', trigger: 'blur' }
        ],
        passWord: [
          { required: true, message: '密码不能为空', trigger: 'blur' }]
      }

    }
  },
  methods: {
    // 登录方法
    login () {
      // console.log(this.baseUrl)
      this.$refs.loginFromRef.validate(async valid => {
        if (!valid) return false
        const { data: res } = await this.$http.get(this.baseUrl + 'login?', {
          params: { userName: this.loginForm.userName, passWord: this.loginForm.passWord }
        })
        if (res.code === '0') {
          this.$message.success(res.message)
          window.sessionStorage.setItem('token', res.token)// 将token保存到sessionStorage中
          window.sessionStorage.setItem('userid', res.userid)// userid
          window.sessionStorage.setItem('userName', this.loginForm.userName)// 登录名存session
          // 将用户名密码存localstorage
          if (this.remember.username) {
            window.localStorage.setItem('LOGIN_USERNAME', this.loginForm.userName)
          } else {
            if (window.localStorage.getItem('LOGIN_USERNAME') !== null) {
              window.localStorage.removeItem('LOGIN_USERNAME')
            }
          }
          if (this.remember.password) {
            window.localStorage.setItem('LOGIN_PASSWORD', this.loginForm.passWord)
          } else {
            if (window.localStorage.getItem('LOGIN_PASSWORD') !== null) {
              window.localStorage.removeItem('LOGIN_PASSWORD')
            }
          }
          this.init()
        } else {
          return this.$message.error(res.message)
        }
      })
    },
    // 页面初始化方法
    // 获取停车场基本信息，存储store
    async init () {
      const { data: res } = await this.$http.get(this.baseUrl + 'parkInfo4Clent', {

      })
      if (res.code === '0') {
        // console.log(res.parkConfig)
        this.$store.commit('initParkConfig', res.parkConfig)
        this.$router.push('/home')// 跳转主页
      } else {
        this.$message.error(res.message)
        this.$router.push('/home')// 跳转主页
      }
    },
    // 网页端初始化参数加载
    async initWebParams () {
      const { data: res } = await this.$http.get('../../config.json')
      // console.log(res)
      this.configData = res
      this.initParams()
    },
    // 客户端初始化参数加载
    initClientParams () {
      const path = require('path')
      const fs = window.require('fs')
      // 获取配置信息
      let configFilePath = ''
      if (__dirname.indexOf('node_modules') > 0) {
        configFilePath = __dirname.substring(0, __dirname.indexOf('node_modules'))
      } else {
        configFilePath = __dirname.substring(0, __dirname.indexOf('resources'))
      }
      configFilePath = path.join(configFilePath, 'config.json')
      const that = this
      fs.readFile(configFilePath, 'utf-8', function (err, data) {
        if (err) {
            console.log(err)// eslint-disable-line
        } else {
          that.configData = JSON.parse(data)
          that.initParams()
        }
      })
    },
    // 参数初始化
    initParams () {
      var that = this
      const url = 'http://' + that.configData.net.ip + ':' + that.configData.net.port + '/api/client/'
      const wsurl = 'ws://' + that.configData.net.ip + ':' + that.configData.net.port + '/parksocket'
      const baseImageUrl = 'http://' + that.configData.net.ip + ':' + that.configData.net.imgPort
      const sysConfig = that.configData.sysConfig
      that.$store.commit('intNetworkUrl', { url, wsurl, baseImageUrl })// 客户端后台信息
      that.$store.commit('initSysConfig', sysConfig)// 客户端配置信息
      // that.$store.commit('initMenu', that.configData.menu)// 菜单
      that.baseUrl = url
    },
    // 进入页面读取缓存
    getLocalStorage () {
      // 记住用户名密码逻辑
      const usernameLocal = window.localStorage.getItem('LOGIN_USERNAME')
      const passwordLocal = window.localStorage.getItem('LOGIN_PASSWORD')
      if (usernameLocal !== null) {
        this.loginForm.userName = usernameLocal
        this.remember.username = true
      }
      if (passwordLocal !== null) {
        this.loginForm.passWord = passwordLocal
        this.remember.password = true
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .container{
    background-color:#f7f7f7;
    height: 100%;
  }
  .login_box{
    width: 600px;
    height: 350px;
    background-color:#fff;
    position:absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    border: 1px solid #dcdcdc;
    box-shadow: 10px 10px 5px #dcdcdc;
    .avatar_title{
      width: 300px;
      height: 50px;
      line-height: 50px;;
      margin-top: 10px;
      position: absolute;
      left: 50%;
      margin-left: -150px;
      text-align:center;
      color: #409EFF;
      font-family: "微软雅黑", "Helvetica";
      font-size: 24px;
      font-weight: 600;
    }
  }

.login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns{
    display: flex;
    justify-content: flex-end
}
</style>
