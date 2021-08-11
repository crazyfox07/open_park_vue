<template>
  <div class="container-aaa">
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo"  class="el-input_query"/>
        </el-col>
        <el-col :span="4">
          <el-input placeholder="异常订单次数大于" v-model="queryInfo.num" type="number" class="el-input_query"/>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="queryList">查&nbsp;&nbsp;询</el-button>
          <el-button type="primary"  @click="showxqDialogVisible">清&nbsp;&nbsp;空</el-button>
        </el-col>
      </el-row>

    <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="车牌号码" prop="plateNo"></el-table-column>
        <el-table-column label="车牌颜色">
          <template slot-scope="scope">
            <span v-if="scope.row.plateType === '0' ">未知</span>
            <span v-if="scope.row.plateType === '1' ">蓝牌</span>
            <span v-if="scope.row.plateType === '2' ">黄牌</span>
            <span v-if="scope.row.plateType === '3' ">白牌</span>
            <span v-if="scope.row.plateType === '4' ">黑牌</span>
            <span v-if="scope.row.plateType === '19' ">新能源</span>
          </template>
        </el-table-column>
        <el-table-column label="异常订单次数" prop="cumulNum"></el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-s-order" size="mini" @click="queryDetailList(scope.row.id)">详情</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAbnormal(scope.row.id)">删除</el-button>
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

    <el-dialog title="异常车辆清空" :visible.sync="xqDialogVisible" width="50%" @close="xqDialogClose">
      <el-form :model="xqForm" ref="xqFormRef" label-width="150px">
        <el-form-item label="异常次数及以下" prop="start">
          <el-input v-model="xqForm.num" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="xqDialogClose">取 消</el-button>
        <el-button type="primary" @click="clearAbnormal">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="异常车辆详情" :visible.sync="deDialogVisible" width="80%" @close="deDialogClose">
      <el-table border stripe :data="dataList1" style="width: 90%;margin-left: 5%">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="车牌号码" prop="plateNo"></el-table-column>
        <el-table-column label="车牌颜色">
          <template slot-scope="scope">
            <span v-if="scope.row.plateType === '0' ">未知</span>
            <span v-if="scope.row.plateType === '1' ">蓝牌</span>
            <span v-if="scope.row.plateType === '2' ">黄牌</span>
            <span v-if="scope.row.plateType === '3' ">白牌</span>
            <span v-if="scope.row.plateType === '4' ">黑牌</span>
            <span v-if="scope.row.plateType === '19' ">新能源</span>
          </template>
        </el-table-column>
        <el-table-column label="驶离时间" prop="outTimeStr"></el-table-column>
        <el-table-column label="操作" width="100px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-picture" size="mini" @click="showImgDialogVisible(scope.row.imgUrl)">图片</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="deDialogClose">关 闭</el-button>
      </div>
    </el-dialog>

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

  </div>
</template>
<script>

import { dealImageUrl } from '@/utils/utils'
export default {
  data () {
    return {
      imgDialogVisible: false, // 控制图片窗口显示
      deDialogVisible: false, // 详情窗口是否显示
      xqDialogVisible: false, // 清空窗口是否显示
      dataList: [],
      dataList1: [],
      total: 0,
      queryInfo: {
        plateNo: '',
        num: '',
        pagenum: 1,
        pagesize: 10
      },
      xqForm: {
        num: 1
      },
      images: {
        pic: ''
      }
    }
  },
  mounted () {
    this.queryList()
  },
  methods: {
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
    // 获取异常列表
    async queryList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryAbnormalkList', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.code === '0') {
      // 查询成功，设置数据
        this.dataList = res.data
        this.total = res.total
      } else {
        return this.$message.error(res.message)
      }
    },

    // 清空窗口是否显示
    showxqDialogVisible () {
      this.xqDialogVisible = true
    },
    xqDialogClose () {
      this.$refs.xqFormRef.resetFields()
      this.xqDialogVisible = false
    },

    // 删除异常信息
    async deleteAbnormal (id) {
      this.$confirm('是否删除异常订单车辆？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteAbnormal', {
          params: { id: id }
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryList()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },

    // 清空异常车辆
    clearAbnormal () {
      if (this.xqForm.num === '' || this.xqForm.num === null) {
        this.$message.error('请输入有效天数')
        return false
      }

      this.$confirm('确定清空异常订单车辆？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'clearAbnormal', {
          params: this.xqForm
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryList()
          this.xqDialogClose()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },

    // 详情窗口操作
    showdeDialogVisible () {
      this.deDialogVisible = true
    },
    deDialogClose () {
      this.dataList1 = []
      this.deDialogVisible = false
    },

    // 获取异常订单车辆详情列表
    async queryDetailList (aid) {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryDetailList', {
        params: { aid: aid }
      })
      // console.log(res)
      if (res.code === '0') {
      // 查询成功，设置数据
        this.dataList1 = res.data
        this.showdeDialogVisible()
      } else {
        return this.$message.error(res.message)
      }
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
    }

  }

}
</script>

<style lang="less" scoped>
  .container-aaa{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }
</style>
