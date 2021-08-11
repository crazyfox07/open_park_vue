<template>
  <div class="container-sys">
    <el-card>
      <el-form ref="form" :model="form" label-width="150px">
        <el-form-item label="智慧停车ID">
          <el-input v-model="sysconfig.domain_id"></el-input>
        </el-form-item>
        <el-form-item label="智慧停车KEY">
          <el-input v-model="sysconfig.domain_key"></el-input>
        </el-form-item>
        <el-form-item label="智慧停车云地址">
          <el-input v-model="sysconfig.open_epark_url"></el-input>
        </el-form-item>
        <el-form-item label="本地停车服务地址">
          <el-input v-model="sysconfig.serv_url"></el-input>
        </el-form-item>
        <el-form-item label="是否开启ETC">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.is_etc"
            style="width: 100%"
          >
            <el-option label="开启" value="1"></el-option>
            <el-option label="关闭" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="ETC地址">
          <el-input v-model="sysconfig.etc_url"></el-input>
        </el-form-item>
        <!-- <el-form-item label="车辆限制进入">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.cars_limit"
            style="width: 100%"
          >
            <el-option label="不限制" value="0"></el-option>
            <el-option label="限制" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="白名单特权">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.cars_limit_white"
            style="width: 100%"
          >
            <el-option label="开启" value="1"></el-option>
            <el-option label="关闭" value="0"></el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="订单保存天数">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.park_data_exp_days"
            style="width: 100%"
          >
            <el-option label="永久保存" value="-1"></el-option>
            <el-option label="30天" value="30"></el-option>
            <el-option label="60天" value="60"></el-option>
            <el-option label="90天" value="90"></el-option>
            <el-option label="120天" value="120"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="识别图片上传路径">
          <el-input v-model="sysconfig.file_upload_root"></el-input>
        </el-form-item>
        <el-form-item label="是否开启桌面程序">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.is_desk"
            style="width: 100%"
          >
            <el-option label="开启" value="1"></el-option>
            <el-option label="关闭" value="0"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item size="medium">
          <el-button type="primary" @click="updateParkConfig">保存配置</el-button>
          <el-button type="primary" @click="parkVerify">服务验证</el-button>
          <el-button type="primary" @click="bindPark">停车场域绑定</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      baseUrl: '',
      sysconfig: {

      },
      form: {
        keepOrderDays: '-1',
        islimitIn: 0
      }
    }
  },
  created () {
    this.baseUrl = this.$store.state.baseUrl // 请求base地址
    this.getSysConfig()
  },
  methods: {
    // 获取停车场配置信息
    async getSysConfig () {
      const { data: res } = await this.$http.get(this.baseUrl + 'getSysConfig', {

      })
      // console.log(res)
      if (res.code === '0') {
        this.sysconfig = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 更新停车场配置信息
    async updateParkConfig () {
      const { data: res } = await this.$http.get(this.baseUrl + 'updateParkConfig', {
        params: this.sysconfig
      })
      // console.log(res)
      if (res.code === '0') {
        this.$message.success(res.message)
        this.getSysConfig()
      } else {
        return this.$message.error(res.message)
      }
    },

    // 智慧停车服务验证
    async parkVerify () {
      const url = this.baseUrl.replace('api/client', 'park')
      const { data: res } = await this.$http.get(url + 'parkVerify', {

      })
      // console.log(res)
      if (res.result === 'success') {
        this.$message.success(res.msg)
      } else {
        return this.$message.error(res.msg)
      }
    },

    // 停车场域绑定
    async bindPark () {
      const url = this.baseUrl.replace('api/client', 'park')
      const { data: res } = await this.$http.get(url + 'bindPark', {

      })
      // console.log(res)
      if (res.result === 'success') {
        this.$message.success(res.msg)
      } else {
        return this.$message.error(res.msg)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.container-sys {
  background-color: #f7f7f7;
  position: relative;
}
</style>
