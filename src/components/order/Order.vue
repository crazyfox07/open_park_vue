<template>
  <div class="container-order">
    <el-card>
      <el-row>
        <el-col :span="5">
          <el-date-picker v-model="start" type="datetime" placeholder="驶入日期起" ></el-date-picker>
        </el-col>
        <el-col :span="5">
          <el-date-picker v-model="end" type="datetime" placeholder="驶入日期止" ></el-date-picker>
        </el-col>
        <el-col :span="4">
            <el-select placeholder="订单状态" v-model="queryInfo.orderState" style="width: 100%">
              <el-option label="全部" value=""></el-option>
              <el-option label="场内" value="-1"></el-option>
              <el-option label="自动放行" value="1"></el-option>
              <el-option label="免费放行" value="4"></el-option>
              <el-option label="人工放行" value="2"></el-option>
              <el-option label="软件结束" value="6"></el-option>
              <el-option label="后台放行" value="8"></el-option>
              <el-option label="人工删除" value="9"></el-option>
            </el-select>
        </el-col>
         <el-col :span="4">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo" />
        </el-col>
      </el-row>

      <el-row>
         <el-col :span="5">
          <el-date-picker v-model="start1" type="datetime" placeholder="驶离日期起" ></el-date-picker>
        </el-col>
        <el-col :span="5">
          <el-date-picker v-model="end1" type="datetime" placeholder="驶离日期止" ></el-date-picker>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="queryOrders">查&nbsp;&nbsp;询</el-button>
          <el-button type="primary" @click="exportOrders">导&nbsp;&nbsp;出</el-button>
        </el-col>
      </el-row>

    <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="车牌号码" prop="plateNo"></el-table-column>
        <el-table-column label="驶入时间" prop="timeIn" width="180px"></el-table-column>
        <el-table-column label="驶离时间" prop="timeOut" width="180px"></el-table-column>
        <el-table-column label="时长（分钟）" prop="parkDuration"></el-table-column>
        <el-table-column label="订单状态">
          <template slot-scope="scope">
            <span v-if="scope.row.orderStatus === '7'  ">场内</span>
            <span v-if="scope.row.orderStatus === '0'  ">场内</span>
            <span v-if="scope.row.orderStatus === '1' ">自动放行</span>
            <span v-if="scope.row.orderStatus === '2' ">人工放行</span>
            <span v-if="scope.row.orderStatus === '4' ">免费放行</span>
            <span v-if="scope.row.orderStatus === '6' ">软件结束</span>
            <span v-if="scope.row.orderStatus === '8' ">后台放行</span>
            <span v-if="scope.row.orderStatus === '9' ">人工删除</span>
          </template>
        </el-table-column>
        <el-table-column label="订单金额" prop="orderFee"></el-table-column>
        <el-table-column label="支付金额" prop="payFee"></el-table-column>
        <el-table-column label="车牌类型">
          <template slot-scope="scope">
            <span v-if="scope.row.plateType === '0' ">未知</span>
            <span v-else-if="scope.row.plateType === '1' ">蓝牌</span>
            <span v-else-if="scope.row.plateType === '3' ">黄牌</span>
            <span v-else-if="scope.row.plateType === '19' ">新能源</span>
            <span v-else>
              其他
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-more" size="mini" @click="showImgDialogVisible(scope.row.inImg,scope.row.outImg,scope.row.orderNo,scope.row.orderFee)">更多</el-button>
          </template>
        </el-table-column>
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

    <el-dialog title="订单详情" :visible.sync="imgDialogVisible" width="80%" @close="imgDialogClose">
      <div class="demo-image__placeholder">
        <div class="block">
          <span class="demonstration">入场</span>
          <el-image :src=images.inImg ></el-image>
        </div>
        <div class="block">
          <span class="demonstration">出场</span>
          <el-image :src=images.outImg ></el-image>
        </div>
      </div>

      <el-table border stripe :data="dataList1" style="width: 90%;margin-left: 5%">
        <el-table-column type="index"></el-table-column>
        <!-- <el-table-column label="车牌号码" prop="carno"></el-table-column> -->
        <el-table-column label="支付金额" prop="payFee"></el-table-column>
        <el-table-column label="支付时间" prop="payTime"></el-table-column>
        <el-table-column label="支付方式">
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
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="imgDialogClose">关 闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import { dateFormatYMDHMS, getNumberOfDays, dealImageUrl } from '@/utils/utils'
export default {
  data () {
    return {
      imgDialogVisible: false, // 控制图片窗口显示
      start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59),
      start1: null,
      end1: null,
      baseUrl: '',
      baseImageUrl: '',
      dataList: [],
      dataList1: [],
      total: 0,
      queryInfo: {
        startDate: '',
        endDate: '',
        startDate1: '',
        endDate1: '',
        plateNo: '',
        orderState: '',
        // payType: '',
        pagenum: 1,
        pagesize: 10
      },
      images: {
        inImg: '',
        outImg: ''
      }
    }
  },
  mounted () {
    this.baseUrl = this.$store.state.baseUrl// 请求base地址
    this.baseImageUrl = this.$store.state.baseImageUrl// 图片请求base地址
    // 进入页面查询订单信息
    this.queryOrders()
  },
  methods: {
    // 订单信息查询
    async queryOrders () {
      this.dealFormData()
      const { data: res } = await this.$http.get(this.baseUrl + 'queryorders', {
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
    // 查询条件处理
    dealFormData () {
      // 处理日期查询条件
      let startDateStr = null
      let endDateStr = null
      let startDateStr1 = null
      let endDateStr1 = null
      if (this.start !== null) {
        startDateStr = dateFormatYMDHMS(this.start)
      }
      if (this.end !== null) {
        endDateStr = dateFormatYMDHMS(this.end)
      }
      if (this.start1 !== null) {
        startDateStr1 = dateFormatYMDHMS(this.start1)
      }
      if (this.end1 !== null) {
        endDateStr1 = dateFormatYMDHMS(this.end1)
      }
      this.queryInfo.startDate = startDateStr
      this.queryInfo.endDate = endDateStr
      this.queryInfo.startDate1 = startDateStr1
      this.queryInfo.endDate1 = endDateStr1
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.queryOrders()
    },

    // 当前页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.queryOrders()
    },

    // 打开订单图片窗口
    async showImgDialogVisible (inImg, outImg, nid, orderFee) {
      inImg = dealImageUrl(inImg)
      outImg = dealImageUrl(outImg)
      // 设置入场出场图片
      this.images.inImg = this.baseImageUrl + inImg
      this.images.outImg = this.baseImageUrl + outImg
      if (orderFee > 0) {
        const { data: res } = await this.$http.get(this.baseUrl + 'queryOrderPay', {
          params: { nid: nid }
        })
        if (res.code === '0') {
          this.dataList1 = res.data
        }
      }
      this.imgDialogVisible = true
    },

    // 关闭订单图片窗口
    imgDialogClose () {
      this.images.inImg = ''
      this.images.outImg = ''
      this.dataList1 = []
      this.imgDialogVisible = false
    },

    // 导出订单到excel
    exportOrders () {
      // 判断条件
      if (this.start === null && this.end === null && this.queryInfo.plateNo === '') {
        return this.$message.error('驶入日期和车牌号码不能同时为空')
      }
      if (this.queryInfo.plateNo === '') {
        if (this.start === null || this.end === null) {
          return this.$message.error('车牌号码为空，驶入日期起止不能为空')
        }
        const days = getNumberOfDays(this.start, this.end)
        // console.log(days)
        const intervalDays = this.$store.state.sysConfig.intervalDays
        if (days > intervalDays) {
          return this.$message.error('驶入日期起止时间差不能超过' + intervalDays + '天')
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
      window.location.href = this.$store.state.baseUrl + 'exportOrderList?' + params
    }

  }
}
</script>

<style lang="less" scoped>
  .container-order{
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
      width:49%;
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
