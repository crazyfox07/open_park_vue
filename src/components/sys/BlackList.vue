<template>
  <div class="container-leaguager">
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo"  class="el-input_query"/>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="queryBlackList">查&nbsp;&nbsp;询</el-button>
          <el-button type="primary"  @click="showAddDialogVisible">添&nbsp;&nbsp;加</el-button>
        </el-col>
      </el-row>

    <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="车牌号码" prop="carno"></el-table-column>
        <el-table-column label="车牌颜色">
          <template slot-scope="scope">
            <span v-if="scope.row.carnoType === '0' ">未知</span>
            <span v-if="scope.row.carnoType === '1' ">蓝牌</span>
            <span v-if="scope.row.carnoType === '2' ">黄牌</span>
            <span v-if="scope.row.carnoType === '3' ">白牌</span>
            <span v-if="scope.row.carnoType === '4' ">黑牌</span>
            <span v-if="scope.row.carnoType === '19' ">新能源</span>
          </template>
        </el-table-column>
        <el-table-column label="有效期起" width="120px">
          <template slot-scope="scope">{{scope.row.validBegintime | dateFormatYMD}}</template>
        </el-table-column>
         <el-table-column label="有效期止" width="120px">
           <template slot-scope="scope">{{scope.row.expiryDate | dateFormatYMD}}</template>
        </el-table-column>
        <el-table-column label="操作" prop="failImports" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-s-tools" size="mini" @click="showxqDialogVisible(scope.row.blackId,scope.row.validBegintime,scope.row.expiryDate)">调整</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteBlack(scope.row.blackId)">删除</el-button>
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

    <el-dialog title="添加黑名单" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="车牌号码：" prop="carno">
          <el-input v-model="addForm.carno" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="车牌颜色">
          <el-select
            placeholder="请选择"
            v-model="addForm.licenceType"
            style="width: 100%"
          >
            <el-option label="蓝牌" value="1"></el-option>
            <el-option label="新能源" value="19"></el-option>
            <el-option label="黄牌" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="有效期起" prop="start">
          <el-date-picker v-model="start" type="date" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="有效期起" prop="end">
          <el-date-picker v-model="end" type="date" style="width: 100%"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addBlackInfo">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="黑名单调整" :visible.sync="xqDialogVisible" width="50%" @close="xqDialogClose">
      <el-form :model="xqForm" ref="xqFormRef" label-width="150px">
        <el-form-item label="有效期起" prop="start">
          <el-date-picker v-model="start1" type="date" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="有效期起" prop="end">
          <el-date-picker v-model="end1" type="date" style="width: 100%"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="xqDialogClose">取 消</el-button>
        <el-button type="primary" @click="xqBlack">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>

import { dateFormat } from '../../utils/utils'
export default {
  data () {
    return {
      addDialogVisible: false, // 控制添加窗口显示
      xqDialogVisible: false, // 续期窗口是否显示
      dataList: [],
      total: 0,
      queryInfo: {
        plateNo: '',
        pagenum: 1,
        pagesize: 10
      },
      start: new Date(),
      end: new Date((new Date()).getFullYear(), (new Date()).getMonth() + 12, (new Date()).getDate(), 12),
      start1: '',
      end1: '',
      addForm: {
        carno: '',
        licenceType: '1',
        validBegintime: '',
        expiryDate: ''
      },
      xqForm: {
        blackId: '',
        validBegintime: '',
        expiryDate: ''
      },
      addFormRules: {
        carno: [
          { required: true, message: '请输入车牌号码', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.queryBlackList()
  },
  methods: {
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.queryBlackList()
    },
    // 当前页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.queryBlackList()
    },
    // 添加窗口显示关闭
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // 续期窗口显示关闭
    showxqDialogVisible (blackId, validBegintime, expiryDate) {
      this.xqForm.blackId = blackId
      this.start1 = validBegintime
      this.end1 = expiryDate
      this.xqDialogVisible = true
    },
    xqDialogClose () {
      this.$refs.xqFormRef.resetFields()
      this.xqDialogVisible = false
    },

    // 获取黑名单列表
    async queryBlackList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryBlackList', {
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

    // 添加黑名单信息
    addBlackInfo () {
      if (this.addForm.licenceType === '' || this.addForm.licenceType === null) {
        this.$message.error('请选择车牌颜色')
        return false
      }
      if (this.start === '' || this.start === null) {
        this.$message.error('请选择有效期起')
        return false
      }
      if (this.end === '' || this.end === null) {
        this.$message.error('请选择有效期止')
        return false
      }

      this.addForm.validBegintime = dateFormat(this.start) + ' 00:00:00'
      this.addForm.expiryDate = dateFormat(this.end) + ' 23:59:59'

      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        this.$confirm('确定添加该黑名单信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'addBlackInfo', {
            params: this.addForm
          })
          if (res.code === '0') {
            this.$message.success(res.message)
            this.addDialogClose()
            this.queryBlackList()
          } else {
            return this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },

    // 删除会员信息
    async deleteBlack (blackId) {
      this.$confirm('是否删除该黑名单信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteBlack', {
          params: { blackId: blackId }
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryBlackList()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },

    // 黑名单续期
    xqBlack () {
      if (this.star1t === '' || this.start1 === null) {
        this.$message.error('请选择有效期起')
        return false
      }
      if (this.end1 === '' || this.end1 === null) {
        this.$message.error('请选择有效期止')
        return false
      }

      this.xqForm.validBegintime = dateFormat(this.start1) + ' 00:00:00'
      this.xqForm.expiryDate = dateFormat(this.end1) + ' 23:59:59'

      this.$confirm('确定调整该黑名单数据？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'xqBlack', {
          params: this.xqForm
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryBlackList()
          this.xqDialogClose()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    }

  }

}
</script>

<style lang="less" scoped>
  .container-leaguager{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }
</style>
