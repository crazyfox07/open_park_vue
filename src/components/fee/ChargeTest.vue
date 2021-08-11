<template>
  <div class="container-test">
    <el-card>
      <el-row>
        <el-col :span="5">
          <el-date-picker
            v-model="timeIn1"
            type="datetime"
            placeholder="驶入时间">
          </el-date-picker>
        </el-col>
        <el-col :span="5">
          <el-date-picker
            v-model="timeOut1"
            type="datetime"
            placeholder="驶离时间">
          </el-date-picker>
        </el-col>
        <el-col :span="5">
          <el-select placeholder="请选择计费规则" v-model="queryForm.policyId" style="width: 100%">
            <el-option
              v-for="item in dataList"
              :key="item.nid"
              :label="item.policyName"
              :value="item.nid">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="calcParkFee">费用计算</el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-card style="margin-top: 20px;">
      <div>
        <span style="font-size: 16px; font-weight: 600; margin-right: 20px;">驶入时间：</span><span style="font-size: 16px; font-weight: 600; color: #F56C6C;">{{queryForm.timeIn}}</span>
      </div>
      <div style="margin-top: 15px;">
        <span style="font-size: 16px; font-weight: 600; margin-right: 20px;" >驶离时间：</span><span style="font-size: 16px; font-weight: 600; color: #F56C6C;">{{queryForm.timeOut}}</span>
      </div>
      <div style="margin-top: 15px;">
        <span style="font-size: 16px; font-weight: 600; margin-right: 8px;">时长(分钟)：</span><span style="font-size: 16px; font-weight: 600; color: #F56C6C;">{{parkLength}}</span>
      </div>
      <div style="margin-top: 15px;">
        <span style="font-size: 16px; font-weight: 600; margin-right: 23px;">费用(元)：</span><span style="font-size: 16px; font-weight: 600; color: #F56C6C;">{{cost}}</span>
      </div>
    </el-card>
  </div>
</template>
<script>

import { dateFormatYMDHMS } from '../../utils/utils'

export default {
  data () {
    return {
      timeIn1: '',
      timeOut1: '',
      queryForm: {
        timeIn: '',
        timeOut: '',
        policyId: ''
      },
      parkLength: '',
      cost: '',
      dataList: []
    }
  },
  created () {
    this.queryRuleList()
  },
  methods: {
    // 计费规则列表
    async queryRuleList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryRuleList', {

      })
      // console.log(res)
      if (res.code === '0') {
      // 查询成功，设置数据
        this.dataList = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 计算停车费用
    async calcParkFee () {
      if (this.queryForm.policyId === '') {
        return this.$message.error('计费规则不能为空')
      }
      if (this.timeIn1 !== '') {
        this.queryForm.timeIn = dateFormatYMDHMS(this.timeIn1)
      } else {
        return this.$message.error('驶入时间不能为空')
      }
      if (this.timeOut1 !== '') {
        this.queryForm.timeOut = dateFormatYMDHMS(this.timeOut1)
      } else {
        return this.$message.error('驶离时间不能为空')
      }

      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'calcParkfee', {
        params: this.queryForm
      })
      if (res.code === '0') {
        this.parkLength = res.parkLength
        this.cost = res.cost
      } else {
        return this.$message.error(res.message)
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .container-test{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }
</style>
