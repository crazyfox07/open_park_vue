<template>
  <div class="container-sys">
    <el-card>
      <el-form ref="form" :model="form" label-width="180px">
        <el-form-item label="是否开启场内付">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.inner_pay"
            style="width: 100%" @change="changInnerPay"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="场内付免费时长" v-if="showInnerPayFreeTime">
          <el-input v-model="sysconfig.inner_pay_free_time" type="number"></el-input>
        </el-form-item>
        <el-form-item label="只首次免费时长">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.first_free"
            style="width: 100%"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="首次免费时长">
          <el-input v-model="sysconfig.first_free_time" type="number"></el-input>
        </el-form-item> -->
        <el-form-item label="只白名单车进入">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.is_only_white_in"
            style="width: 100%"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台会员扣费">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.is_leaguer_fee"
            style="width: 100%"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台停车卡（优惠券）">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.is_park_card"
            style="width: 100%"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="平台故障免费放行">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.playform_failure"
            style="width: 100%"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="无驶入驶离不放行">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.noin_noout"
            style="width: 100%"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>

         <el-form-item label="异常驶离控制" >
          <el-select
            placeholder="请选择"
            v-model="sysconfig.abnormal_out"
            style="width: 100%" @change="changAbnormalOut"
          >
            <el-option label="否" value="0"></el-option>
            <el-option label="是" value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="异常驶离控制阈值" v-if="showAbnormalOut">
          <el-input v-model="sysconfig.abnormal_num" type="number"></el-input>
        </el-form-item>

        <el-form-item label="白名单类型">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.white_list_type"
            style="width: 100%" @change="changeWhiteListType"
          >
            <el-option label="普通白名单" value="1"></el-option>
            <el-option label="客户白名单" value="2"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="免费车辆数" v-if="showWhiteLlistSize">
          <el-select
            placeholder="请选择"
            v-model="sysconfig.white_list_size"
            style="width: 100%"
          >
            <el-option label="全部免费" value="0"></el-option>
            <el-option label="1辆免费" value="1"></el-option>
            <el-option label="2辆免费" value="2"></el-option>
            <el-option label="3辆免费" value="3"></el-option>
            <el-option label="4辆免费" value="4"></el-option>
            <el-option label="5辆免费" value="5"></el-option>
            <el-option label="6辆免费" value="6"></el-option>
            <el-option label="7辆免费" value="7"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item size="medium">
          <el-button type="primary" @click="updateParkConfig">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      showWhiteLlistSize: false,
      showInnerPayFreeTime: false,
      showAbnormalOut: false,
      baseUrl: '',
      sysconfig: {

      },
      form: {

      }
    }
  },
  mounted () {
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
        // ===== 初始化 =====
        // 场内付时长
        this.changInnerPay()
        // 异常驶离
        this.changAbnormalOut()
        // 白名单方式
        this.changeWhiteListType()
        // ===== 初始化 =====
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

    // 白名单类型
    changeWhiteListType () {
      if (this.sysconfig.white_list_type === '1') { // 普通白名单
        this.showWhiteLlistSize = false
      } else {
        this.showWhiteLlistSize = true
      }
    },

    // 场内付
    changInnerPay () {
      if (this.sysconfig.inner_pay === '0') {
        this.showInnerPayFreeTime = false
      } else {
        this.showInnerPayFreeTime = true
      }
    },

    // 异常驶离
    changAbnormalOut () {
      if (this.sysconfig.abnormal_out === '0') {
        this.showAbnormalOut = false
      } else {
        this.showAbnormalOut = true
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
