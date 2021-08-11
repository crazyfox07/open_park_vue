<template>
  <el-container class="container">
    <el-aside :width="'200px'">
      <el-menu default-active="/home" :collapse = false :router="true">

          <!-- 循环一级菜单 -->
          <div v-for="(item,index) in this.menu" :key="index">
              <div v-if="item.type==='menuItem'">
                <el-menu-item :index="item.index"><i :class="item.mcss"></i>{{item.name}}</el-menu-item>
              </div>
              <div v-else>
                <el-submenu :index="item.index">
                  <template slot="title"><i :class="item.mcss"></i>{{item.name}}</template>
                  <!-- 循环二级菜单 -->
                  <div v-for="(subItem,index) in item.children" :key="index">
                    <el-menu-item :index="subItem.index"><i :class="subItem.mcss"></i>{{subItem.name}}</el-menu-item>
                  </div>
                </el-submenu>
              </div>
          </div>

      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div style="float: left; font-size: 12px; color: #F56C6C;">
          版本号：{{version_id}}
        </div>
        <div style="float: right;">
          <el-dropdown >
            <i class="el-icon-setting icon-set"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="loginOut">退 出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span class="name">{{parkName}}，{{userName}}</span>
        </div>

      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
export default {
  mounted () {
    this.version_id = this.$store.state.version.version_id
    this.baseUrl = this.$store.state.baseUrl
    // console.log(this.$store.state.parkConfig)
    this.parkName = this.$store.state.parkConfig.parkInfo.parkname
    this.userName = window.sessionStorage.getItem('userName')
    // 查询菜单信息
    this.getMenu()
  },
  data () {
    return {
      version_id: '',
      parkName: '',
      userName: '',
      menu: []
    }
  },
  methods: {
    // 退出
    loginOut () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenu () {
      const { data: res } = await this.$http.get(this.baseUrl + 'getMenu', {
        params: { userId: window.sessionStorage.getItem('userid') }
      })
      if (res.code === '0') {
        // console.log(res.data)
        this.menu = res.data
      } else {
        return this.$message.error(res.message)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.container{
  height: 100%;
  padding: 10px 5px
}

.el-header {
  background-color:#E5E5E5;
  color: #333;
  line-height: 60px;
  // text-align: right;
  font-size: 14px;
}

.el-aside {
  background-color: #E5E5E5;
  color: #333;
}

.iconfont1{
  font-size: 18px;
  margin-right: 5px;;
}

.iconfont2{
  font-size: 22px;
  margin-right: 5px;;
}

.iconfont3{
  font-size: 24px;
  margin-right: 5px;;
}

.icon-set{
  margin-right: 15px;
  color:#409EFF;
}

.name{
  color: #409EFF;
}

.el-main{
  height: 90%;
}

</style>
