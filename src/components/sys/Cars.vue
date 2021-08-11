<template>
  <div class="container-cars">
    <el-card>
      <el-row>
        <el-col :span="5">
          <el-date-picker v-model="start" type="datetime" placeholder="查询日期起"></el-date-picker>
        </el-col>
        <el-col :span="5">
          <el-date-picker v-model="end" type="datetime" placeholder="查询日期止"></el-date-picker>
        </el-col>
        <el-col :span="4">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo"  class="el-input_query" />
        </el-col>
        <el-col :span="4">
          <el-select placeholder="区域信息" v-model="queryInfo.regionCode" style="width: 100%">
            <el-option
              v-for="item in regionList"
              :key="item.regionCode"
              :label="item.regionName"
              :value="item.regionCode">
            </el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="queryList">查&nbsp;&nbsp;询</el-button>
          <el-button type="danger" @click="clearDialogVisible=true">清&nbsp;&nbsp;空</el-button>
        </el-col>
      </el-row>

    <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="车牌号码" prop="carno"></el-table-column>
        <el-table-column label="驶入时间" prop="inTime"></el-table-column>
        <el-table-column label="出入口" prop="pointname"></el-table-column>
        <el-table-column label="区域" prop="regionName"></el-table-column>
        <el-table-column label="操作" width="250px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-picture" size="mini" @click="showImgDialogVisible(scope.row.inImage)">查看图片</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteInnerCar(scope.row.nid)">删 除</el-button>
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

    <el-dialog title="识别图片" :visible.sync="imgDialogVisible" width="40%" @close="imgDialogClose">
      <div class="demo-image__placeholder">
        <div class="block">
            <el-image :src=images.pic ></el-image>
          </div>
        </div>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="imgDialogClose">关 闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="场内车清空" :visible.sync="clearDialogVisible" width="50%" @close="clearDialogClose">
      <el-form :model="clearForm" ref="clearFormRef" label-width="150px">
        <el-form-item label="清空时间起" prop="start">
          <el-date-picker v-model="clearForm.start" type="datetime" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="清空时间止" prop="end">
          <el-date-picker v-model="clearForm.end" type="datetime" style="width: 100%"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearDialogClose">取 消</el-button>
        <el-button type="primary" @click="clearInnerCar">清 空</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
import { dateFormatYMDHMS, dealImageUrl } from '@/utils/utils'
export default {
  data () {
    return {
      clearDialogVisible: false,
      imgDialogVisible: false, // 控制图片窗口显示
      start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
      end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59),
      baseUrl: '',
      dataList: [],
      regionList: [],
      total: 0,
      queryInfo: {
        startDate: '',
        endDate: '',
        plateNo: '',
        direction: '',
        orderState: '',
        regionCode: '',
        pagenum: 1,
        pagesize: 10
      },
      images: {
        pic: ''
      },
      clearForm: {
        start: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0),
        end: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59)
      }
    }
  },
  created () {
    this.baseUrl = this.$store.state.baseUrl// 请求base地址
    // 进入页面查询出入记录
    this.queryList()
    this.getRegionDropData()
  },
  methods: {
    // 查询出入记录
    async queryList () {
      this.queryInfo.startDate = dateFormatYMDHMS(this.start)
      this.queryInfo.endDate = dateFormatYMDHMS(this.end)
      const { data: res } = await this.$http.get(this.baseUrl + 'queryInnerCarList', {
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

    // 关闭清空窗口
    clearDialogClose () {
      this.clearForm.start = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0)
      this.clearForm.end = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 23, 59, 59)
      this.clearDialogVisible = false
    },

    // 打开订单图片窗口
    showImgDialogVisible (pic) {
      pic = dealImageUrl(pic)
      // 设置入场出场图片
      this.images.pic = this.$store.state.baseImageUrl + pic
      this.imgDialogVisible = true
    },

    // 关闭订单图片窗口
    imgDialogClose () {
      this.images.pic = ''
      this.imgDialogVisible = false
    },

    // 场内车删除
    deleteInnerCar (orderNo) {
      this.$confirm('确定删除该场内车？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        const userid = window.sessionStorage.getItem('userid')
        const { data: res } = await this.$http.get(this.baseUrl + 'deleteInnerCar', {
          params: { orderNo: orderNo, userid: userid }
        })
        if (res.code === '0') {
          this.$message.success(res.message)
          this.queryList()
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },

    // 场内车清空
    clearInnerCar () {
      if (!this.clearForm.start) {
        return this.$message.error('清空日期起不能为空')
      }
      if (!this.clearForm.end) {
        return this.$message.error('清空日期止不能为空')
      }

      this.$confirm('确定清空场内车？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(async () => {
        const userid = window.sessionStorage.getItem('userid')
        const { data: res } = await this.$http.get(this.baseUrl + 'clearInnerCar', {
          params: { userid: userid, regionCode: this.queryInfo.regionCode, start: dateFormatYMDHMS(this.clearForm.start), end: dateFormatYMDHMS(this.clearForm.end) }
        })
        if (res.code === '0') {
          this.$message.success(res.message)
          this.queryList()
          this.clearDialogClose()
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },
    // 区域列表下拉
    getRegionDropData () {
      const tmp = [{ regionCode: '', regionName: '全部' }]
      this.regionList = tmp.concat(this.$store.state.parkConfig.regionList)
    }

  }
}
</script>

<style lang="less" scoped>
  .container-cars{
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
