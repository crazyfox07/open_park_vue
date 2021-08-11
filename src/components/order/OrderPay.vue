<template>
  <div class="container-detect">
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-date-picker v-model="start" type="datetime" placeholder="支付日期起"></el-date-picker>
        </el-col>
        <el-col :span="4">
          <el-date-picker v-model="end" type="datetime" placeholder="支付日期止"></el-date-picker>
        </el-col>
        <el-col :span="3">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo" />
        </el-col>
        <el-col :span="3">
            <el-select placeholder="支付类型" v-model="queryInfo.payType" style="width: 100%" @change="changePayType">
              <el-option label="全部" value=""></el-option>
              <el-option label="会员支付" value="1201"></el-option>
              <el-option label="支付宝" value="1202"></el-option>
              <el-option label="微信" value="1205"></el-option>
              <el-option label="现金支付" value="1206"></el-option>
              <el-option label="ETC支付" value="1229"></el-option>
            </el-select>
        </el-col>
        <el-col :span="3" v-if="isShowUserDrop">
          <el-select placeholder="请选择操作人" v-model="queryInfo.userid" style="width: 100%">
            <el-option
              v-for="item in userList"
              :key="item.userid"
              :label="item.userName"
              :value="item.userid">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="queryList">查&nbsp;&nbsp;询</el-button>
          <el-button type="primary" @click="exportList">导&nbsp;&nbsp;出</el-button>
        </el-col>
      </el-row>

    <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column width="100" label="车牌号码" prop="carno"></el-table-column>
        <el-table-column label="驶入时间" prop="collectiondate1"></el-table-column>
        <el-table-column label="驶离时间" prop="collectiondate2"></el-table-column>
        <el-table-column width="90" label="停车时长" prop="duration"></el-table-column>
        <el-table-column width="90" label="支付金额" prop="payFee"></el-table-column>
        <el-table-column label="支付时间" prop="payTime"></el-table-column>
        <el-table-column width="100" label="支付方式">
          <template slot-scope="scope">
            <span v-if="scope.row.payType === '1201'  ">帐户储值</span>
            <span v-else-if="scope.row.payType === '1202'  ">支付宝</span>
            <span v-else-if="scope.row.payType === '1203'  ">信用卡</span>
            <span v-else-if="scope.row.payType === '1204'  ">银行卡</span>
            <span v-else-if="scope.row.payType === '1205'  ">微信</span>
            <span v-else-if="scope.row.payType === '1206'  ">现金</span>
            <span v-else-if="scope.row.payType === '1211'  ">停车卡</span>
            <span v-else-if="scope.row.payType === '1212'  ">公众号支付</span>
            <span v-else-if="scope.row.payType === '1229'  ">ETC支付</span>
            <span v-else>
              其他
            </span>
          </template>
        </el-table-column>
        <el-table-column  width="180" label="操作人" prop="username"></el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>

    </el-card>

  </div>
</template>
<script>
import { dateFormatYMDHMS, getNumberOfDays } from '@/utils/utils'
export default {
  data () {
    return {
      isShowUserDrop: false,
      imgDialogVisible: false, // 控制图片窗口显示
      start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59),
      baseUrl: '',
      dataList: [],
      userList: [],
      total: 0,
      queryInfo: {
        startDate: '',
        endDate: '',
        plateNo: '',
        payType: '',
        userid: '',
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  created () {
    this.baseUrl = this.$store.state.baseUrl// 请求base地址
    // 进入页面查询出入记录
    this.queryList()
    this.queryUserList()
  },
  methods: {
    // 查询用户列表
    async queryUserList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryUserList', {

      })
      if (res.code === '0') {
        // 查询成功，设置数据
        const tmp = [{ userid: '', userName: '全部' }]
        this.userList = tmp.concat(res.data)
      } else {
        return this.$message.error(res.message)
      }
    },
    // 查询列表
    async queryList () {
      this.dealFormData()
      const { data: res } = await this.$http.get(this.baseUrl + 'queryPayList', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.code === '0') {
        // 查询成功，设置数据和总条数
        this.dataList = res.data
        this.total = res.total
      } else {
        return this.$message.error(res.message)
      }
    },
    // 处理查询条件
    dealFormData () {
      // 处理日期查询条件
      let startDateStr = null
      let endDateStr = null
      if (this.start !== null) {
        startDateStr = dateFormatYMDHMS(this.start)
      }
      if (this.end !== null) {
        endDateStr = dateFormatYMDHMS(this.end)
      }
      this.queryInfo.startDate = startDateStr
      this.queryInfo.endDate = endDateStr
    },

    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.queryList()
    },

    // 当前页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.queryList()
    },

    // 支付方式下拉改变
    changePayType () {
      if (this.queryInfo.payType === '1206') {
        this.isShowUserDrop = true
      } else {
        this.isShowUserDrop = false
        this.queryInfo.userid = ''
      }
    },

    // 导出支付列表
    exportList () {
      if (this.start === null && this.end === null && this.queryInfo.plateNo === '') {
        return this.$message.error('支付日期和车牌号码不能同时为空')
      }
      if (this.queryInfo.plateNo === '') {
        if (this.start === null || this.end === null) {
          return this.$message.error('车牌号码为空，支付日期起止不能为空')
        }
        const days = getNumberOfDays(this.start, this.end)
        console.log(days)
        if (days > 1) {
          return this.$message.error('支付日期起止时间差不能超过一天')
        }
      }
      this.dealFormData()
      // params格式化
      let params = ''
      for (var key in this.queryInfo) {
        // console.log(key + '====' + this.queryInfo[key])
        if (this.queryInfo[key] !== null && this.queryInfo[key] !== '') {
          params = params + '&' + key + '=' + this.queryInfo[key]
        }
      }
      params = params.substring(0, params.length - 1)
      // console.log(params)
      window.location.href = this.$store.state.baseUrl + 'exportOrderPayList?' + params
    }

  }
}
</script>

<style lang="less" scoped>
  .container-detect{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }

  .demo-image__placeholder{
    .block{
      padding:30px 0;
      text-align:center;
      border-right:1px solid #eff2f6;
      display:inline-block;
      box-sizing:border-box;
      vertical-align:top;
      width:100%;
      &:last-child{
        border-right:none
      }
    }
    .el-image{
      width:450px;
      height:300px
    }
    .demonstration{
      display:block;
      color:#8492a6;
      font-size:14px;
      margin-bottom:20px
    }

  }

</style>
