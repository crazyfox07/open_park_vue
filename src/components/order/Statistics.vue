<template>

  <div class="container-stat">
    <div style="padding: 10px;">
      <el-row>
        <el-col :span="5">
          <el-date-picker v-model="start" type="datetime" placeholder="支付日期起"></el-date-picker>
        </el-col>
        <el-col :span="5">
          <el-date-picker v-model="end" type="datetime" placeholder="支付日期止"></el-date-picker>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="parkStatistics">查&nbsp;&nbsp;询</el-button>
        </el-col>
      </el-row>
    </div>

    <div class="cameraWrapper">
      <el-card shadow="always" class="card">
        <chart ref="chart1" :options="option" :auto-resize="true" style="height:370px;"></chart>
      </el-card>
      <el-card shadow="always" class="card" style="margin-top: 15px;">
        <div slot="header" class="clearfix">
          <span style="font-weight: 600;">停车场订单统计数据</span>
        </div>
        <div style="font-weight: 300; padding: 10px; line-height: 30px;">
          {{startStr}} - {{endStr}}  期间订单数量统计：<br>
          订单总数：<span class="cnt">{{orderTotals}}</span> <br>
          0元订单：<span class="cnt">{{option.series[0].data[0]}}</span> <br>
          0~5元订单：<span class="cnt">{{option.series[0].data[1]}}</span> <br>
          5~10元订单：<span class="cnt">{{option.series[0].data[2]}}</span> <br>
          10~20元订单：<span class="cnt">{{option.series[0].data[3]}}</span><br>
          20~50元订单：<span class="cnt">{{option.series[0].data[4]}}</span><br>
          50元以上订单：<span class="cnt">{{option.series[0].data[5]}}</span><br>
        </div>
      </el-card>
    </div>
    <div class="cameraWrapper">
      <el-card shadow="always" class="card">
        <chart ref="chart2" :options="option1" :auto-resize="true" style="height:370px;"></chart>
      </el-card>
      <el-card shadow="always" class="card" style="margin-top: 15px;">
        <div slot="header" class="clearfix">
          <span style="font-weight: 600;">停车场收入统计数据（不含退款）</span>
        </div>
        <div style="font-weight: 300; padding: 10px; line-height: 30px;">
          {{startStr}} - {{endStr}} 期间订单收入统计（元）：<br>
          总收入金额：<span class="cnt">{{incomeTotals}}</span> <br>
          <!-- <div>现金收入：<span class="cnt">200.00</span></div>
          <div>微信收入：<span class="cnt">100</span></div>
          <div>支付宝收入：<span class="cnt">88</span></div>
          <div>ETC: <span class="cnt">911</span></div>
          <div>会员余额: <span class="cnt">33</span></div>
          <div>停车卡: <span class="cnt">556</span></div> -->
          <div v-for="item in this.option1.series[0].data" :key="item.name">
            {{item.name}}：<span class="cnt">{{item.value}}</span>
          </div>
        </div>
      </el-card>
    </div>
  </div>

</template>
<script>
import { dateFormatYMDHMS } from '../../utils/utils'
export default {
  data () {
    return {
      loading: true,
      start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 0, 0, 0),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 23, 59, 59),
      queryInfo: {
        start: '',
        end: ''
      },
      option: {
        title: {
          text: '停车场订单统计',
          x: 'center',
          y: 'top',
          textAlign: 'left'

        },
        legend: {},
        tooltip: {},
        xAxis: {
          type: 'category',
          data: ['0元', '0~5元', '5-10元', '10-20元', '20-50元', '50元以上']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [0, 0, 0, 0, 0, 0],
          type: 'bar'
        }]
      },

      option1: {
        title: {
          text: '停车场收入统计',
          x: 'center',
          y: 'top',
          textAlign: 'left'

        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: 10,
          data: []
        },
        series: [
          {
            name: '停车收入',
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [

            ]
          }
        ]
      }
    }
  },
  // 进入页面执行逻辑
  created () {
    this.parkStatistics()
  },
  mounted () {

  },
  // 页面离开关闭websocket
  beforeDestroy () {

  },
  methods: {
    async parkStatistics () {
      if (this.start == null) {
        return this.$message.error('统计时间起不能为空')
      }
      if (this.end == null) {
        return this.$message.error('统计时间止不能为空')
      }
      // 开启遮罩
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      // 处理日期查询条件
      let startDateStr = null
      let endDateStr = null
      if (this.start !== null) {
        startDateStr = dateFormatYMDHMS(this.start)
      }
      if (this.end !== null) {
        endDateStr = dateFormatYMDHMS(this.end)
      }
      this.queryInfo.start = startDateStr
      this.queryInfo.end = endDateStr
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'parkStatistics', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.code === '0') {
        this.option.series[0].data = res.data.ddtj
        this.option1.legend.data = res.data.incomeCate
        this.option1.series[0].data = res.data.incomeData
        loading.close()
      } else {
        loading.close()
        return this.$message.error(res.message)
      }
    }

  },
  computed: {
    startStr: function () {
      return dateFormatYMDHMS(this.start)
    },
    endStr: function () {
      return dateFormatYMDHMS(this.end)
    },
    orderTotals: function () {
      let orders = 0
      this.option.series[0].data.map(function (i) {
        orders = orders + i
      })
      return orders
    },
    incomeTotals: function () {
      let income = 0
      this.option1.series[0].data.map(function (i) {
        income = income + i.value
      })
      return income
    }
  }

}
</script>

<style lang="less" scoped>
  .container-stat{
    position: relative;
  }
  .cameraWrapper{
      width: 50%;
      float:left;
      padding: 10px;
      box-sizing: border-box;
      overflow-x: hidden;
  }

  .card{
    height: 370px;
  }

  .title{
    font-size: 20px;
    font-weight: bold;
  }

  .button-top{
    float: right;
    padding: 10px 5px
  }

  .contant1{
    font-size: 18px;
    font-weight: 600;
  }

  .contant2{
    font-size: 18px;
    font-weight: 600;
    color: #F56C6C;
  }

  .label-content{
    font-weight: bold;
    font-size: 16px;
    height: 28px;
    line-height: 28px;
  }

  .cnt{
    color:#F56C6C;
    font-weight: 500
  }

</style>
