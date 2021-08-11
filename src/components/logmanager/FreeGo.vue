<template>
  <div class="container-freego">
    <el-card>
      <el-row>
        <el-col :span="5">
          <el-date-picker v-model="start" type="datetime" placeholder="操作日期起"></el-date-picker>
        </el-col>
        <el-col :span="5">
          <el-date-picker v-model="end" type="datetime" placeholder="操作日期止"></el-date-picker>
        </el-col>
        <el-col :span="4">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo" />
        </el-col>
        <el-col :span="4">
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
        <el-table-column label="车牌号码" prop="carno"></el-table-column>
        <el-table-column label="驶入时间" prop="inTime"></el-table-column>
        <el-table-column label="驶离时间" prop="outTime"></el-table-column>
        <el-table-column label="操作时间" prop="logTime"></el-table-column>
        <el-table-column label="区域" prop="regionName"></el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-picture" size="mini" @click="showImgDialogVisible(scope.row.inImg,scope.row.outImg)">查看图片</el-button>
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

    <el-dialog title="订单图片" :visible.sync="imgDialogVisible" width="80%" @close="imgDialogClose">
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
      baseUrl: '',
      dataList: [],
      userList: [],
      total: 0,
      queryInfo: {
        startDate: '',
        endDate: '',
        plateNo: '',
        userid: '',
        pagenum: 1,
        pagesize: 10
      },
      images: {
        inImg: '',
        outImg: ''
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

    // 查询免费放行记录
    async queryList () {
      this.dealFormData()
      const { data: res } = await this.$http.get(this.baseUrl + 'queryFreeGoList', {
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

    // 打开订单图片窗口
    showImgDialogVisible (inImg, outImg) {
      inImg = dealImageUrl(inImg)
      outImg = dealImageUrl(outImg)
      // 图片
      this.images.inImg = this.$store.state.baseImageUrl + inImg
      this.images.outImg = this.$store.state.baseImageUrl + outImg
      this.imgDialogVisible = true
    },

    // 关闭订单图片窗口
    imgDialogClose () {
      this.images.inImg = ''
      this.images.outImg = ''
      this.imgDialogVisible = false
    },

    // 导出列表
    exportList () {
      if (this.start === null || this.end === null) {
        return this.$message.error('操作日期起止不能为空')
      }
      const days = getNumberOfDays(this.start, this.end)
      console.log(days)
      if (days > 31) {
        return this.$message.error('操作日期起止时间差不能超过一个月')
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
      window.location.href = this.$store.state.baseUrl + 'exportFreeGoList?' + params
    }
  }
}
</script>

<style lang="less" scoped>
  .container-freego{
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
