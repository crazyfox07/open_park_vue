<template>
  <div class="container-leaguager">
    <el-card>
      <!-- 查询表单 -->
      <el-row>
        <el-col :span="4">
          <el-input placeholder="请输入手机号码" v-model="queryInfo.phoneNo"  class="el-input_query"/>
        </el-col>
        <el-col :span="4">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo"  class="el-input_query"/>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="queryLeaguerList">查&nbsp;&nbsp;询</el-button>
          <el-button type="primary"  @click="showAddDialogVisible">添&nbsp;&nbsp;加</el-button>
        </el-col>
      </el-row>
      <!-- 客户列表 -->
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="手机号码" prop="leaguerPhone"></el-table-column>
        <el-table-column label="姓名" prop="leaguerName"></el-table-column>
        <el-table-column label="有效期起" width="220px">
          <template slot-scope="scope">{{scope.row.startDate | dateFormatYMD}}</template>
        </el-table-column>
          <el-table-column label="有效期止" width="220px">
            <template slot-scope="scope">{{scope.row.endDate | dateFormatYMD}}</template>
        </el-table-column>
        <el-table-column label="操作" prop="failImports" width="250px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-s-tools" size="mini" @click="showxqDialogVisible(scope.row.leaguerId)">车辆管理</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteLeaguer(scope.row.leaguerId)">删除</el-button>
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

    <!-- 添加会员 -->
    <el-dialog title="添加会员" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="addForm.phone" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" autocomplete="off"></el-input>
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
        <el-button type="primary" @click="addLeaguerInfo">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 添加车辆 -->
    <el-dialog title="添加车辆" :visible.sync="leaguerCarvisible" width="50%" @close="leaguerCarClose">
      <el-form :model="leaguerCarForm" :rules="leaguerCarFormRules" ref="leaguerCarFormRef" label-width="150px">
        <el-form-item label="车牌号码：" prop="carno">
          <el-input v-model="leaguerCarForm.carno" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="车牌颜色">
          <el-select
            placeholder="请选择"
            v-model="leaguerCarForm.licenceType"
            style="width: 100%"
          >
            <el-option label="蓝牌" value="1"></el-option>
            <el-option label="新能源" value="19"></el-option>
            <el-option label="黄牌" value="3"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="leaguerCarClose">取 消</el-button>
        <el-button type="primary" @click="leaguerCarAdd">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 车辆管理 -->
    <el-dialog title="车辆管理" :visible.sync="xqDialogVisible" width="70%" @close="xqDialogClose">
      <el-table border stripe :data="leaguer.dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="车牌号码" prop="plateNo"></el-table-column>
        <el-table-column label="车牌颜色">
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
        <el-table-column label="操作" prop="failImports" width="100px">
          <template slot-scope="scope">
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="leaguerCarDelete(scope.row.nid)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showLeaguerCarDialogVisible">添 加</el-button>
        <el-button @click="xqDialogClose">关 闭</el-button>
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
      leaguerCarvisible: false, // 添加车辆窗口是否显示
      dataList: [],
      total: 0,
      // 查询信息
      queryInfo: {
        plateNo: '',
        phoneNo: '',
        pagenum: 1,
        pagesize: 10
      },
      // 添加会员信息有效期起止
      start: new Date(),
      end: new Date((new Date()).getFullYear(), (new Date()).getMonth() + 1, (new Date()).getDate(), 12),
      // 客户添加表单
      addForm: {
        phone: '',
        name: '',
        validBegintime: '',
        expiryDate: ''
      },
      // 客户添加表单校验
      addFormRules: {
        name: [
          { required: true, message: '请输入会员名字', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入会员电话', trigger: 'blur' }
        ]
      },
      // ==== 车辆管理 ======
      leaguerCarForm: { // 车辆添加表单
        carno: '',
        licenceType: ''
      },
      leaguerCarFormRules: { // 车辆添加表单校验
        carno: [
          { required: true, message: '请输入车牌号码', trigger: 'blur' }
        ]
      },
      // 车辆管理客户信息
      leaguer: {
        leaguerId: '',
        dataList: []
      }
      // ==== 车辆管理 ======
    }
  },
  created () {
    this.queryLeaguerList()// 查询接口
  },
  methods: {
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.queryLeaguerList()
    },
    // 当前页码改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.queryLeaguerList()
    },
    // 添加窗口显示关闭
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },

    // 获取会员列表
    async queryLeaguerList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryParkLeaguerList', {
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

    // 添加客户信息
    addLeaguerInfo () {
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
        this.$confirm('确定添加该客户信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'addLeaguerInfo4Client', {
            params: this.addForm
          })
          if (res.code === '0') {
            this.$message.success(res.message)
            this.addDialogClose()
            this.queryLeaguerList()
          } else {
            return this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },

    // 删除会员信息
    async deleteLeaguer (leaguerId) {
      this.$confirm('将删除客户信息与客户车辆信息，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteLeaguer4Client', {
          params: { leaguerId: leaguerId }
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryLeaguerList()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },

    // ======================车辆管理=================================

    // 车辆管理窗口
    async showxqDialogVisible (vipId) {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryParkLeaguerCars', {
        params: { vipId: vipId }
      })
      if (res.code === '0') {
        this.leaguer.leaguerId = vipId
        this.leaguer.dataList = res.data
      }
      this.xqDialogVisible = true
    },
    xqDialogClose () {
      this.xqDialogVisible = false
    },

    // 关闭添加车辆窗口
    showLeaguerCarDialogVisible () {
      this.leaguerCarvisible = true
    },
    leaguerCarClose () {
      this.$refs.leaguerCarFormRef.resetFields()
      this.leaguerCarForm.licenceType = ''
      this.leaguerCarvisible = false
    },

    // 添加用户车辆
    async leaguerCarAdd () {
      if (this.leaguerCarForm.licenceType === '' || this.leaguerCarForm.licenceType == null) {
        return this.$message.error('车辆类型不能为空')
      }
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'leaguerCarAdd', {
        params: { leaguerId: this.leaguer.leaguerId, plateNo: this.leaguerCarForm.carno, plateType: this.leaguerCarForm.licenceType }
      })
      if (res.code === '0') {
        this.$message.success(res.message)
        this.showxqDialogVisible(this.leaguer.leaguerId)
        this.leaguerCarClose()
      } else {
        return this.$message.error(res.message)
      }
    },
    // 删除车辆
    async leaguerCarDelete (nid) {
      this.$confirm('确定删除该车辆信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'leaguerCarDelete', {
          params: { nid: nid }
        })
        if (res.code === '0') { // 删除成功
          this.$message.success(res.message)
          this.showxqDialogVisible(this.leaguer.leaguerId)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    }

    // ======================车辆管理=================================

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
