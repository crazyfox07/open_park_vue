<template>
  <div class="container-gate">
    <el-card>
      <el-row>
        <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialogVisible">添加出入口</el-button>
        </el-col>
      </el-row>
      </el-row>
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="出入口名称" prop="pointname"></el-table-column>
        <el-table-column label="区域名称" prop="regionName"></el-table-column>
         <el-table-column label="通行方式">
          <template slot-scope="scope">
            <span v-if="scope.row.pointFunc === '3' ">全部放行</span>
            <span v-if="scope.row.pointFunc === '1' ">白名单放行</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="failImports">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editGate(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGate(scope.row.pointcode)">删 除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="出入口" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="出入口名称：" prop="pointname">
          <el-input v-model="addForm.pointname" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="区域信息">
          <el-select
            placeholder="请选择"
            v-model="addForm.regioncode"
            style="width: 100%"
          >
            <el-option v-for="(item, i) in regionList " :key="i" :label="item.regionName" :value="item.regionCode"></el-option>
          </el-select>
        </el-form-item>
         <el-form-item label="通行方式">
          <el-select
            placeholder="请选择"
            v-model="addForm.pointFunc"
            style="width: 100%"
          >
            <el-option label="全部放行" value="3"></el-option>
            <el-option label="白名单放行" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addGateInfo">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>

export default {
  data () {
    return {
      baseUrl: '',
      addDialogVisible: false, // 控制添加窗口显示
      dataList: [], // 数据
      regionList: [], // 区域列表
      queryInfo: {

      },
      addForm: {
        pointcode: '',
        pointname: '',
        regioncode: '',
        pointFunc: '3'
      },
      addFormRules: {
        pointname: [
          { required: true, message: '请输入出入口名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.baseUrl = this.$store.state.baseUrl // 请求base地址
    this.regionList = this.$store.state.parkConfig.regionList// 区域列表
    this.getGateInfo()
  },
  methods: {
    // 查询所有出入口
    async getGateInfo () {
      const { data: res } = await this.$http.get(this.baseUrl + 'querygates', {

      })
      // console.log(res)
      if (res.code === '0') {
        // 查询成功，设置数据
        this.dataList = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 添加窗口是否显示
    showAddDialogVisible () {
      // 设置默认值
      if (this.regionList.length > 0) {
        this.addForm.regioncode = this.regionList[0].regionCode
      }
      this.addDialogVisible = true
    },
    editGate (row) {
      this.addForm.pointcode = row.pointcode
      this.addForm.pointname = row.pointname
      this.addForm.regioncode = row.regionCode
      this.addForm.pointFunc = row.pointFunc
      this.addDialogVisible = true
    },
    // 添加窗口关闭
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // 删除出入口信息
    deleteGate (pointcode) {
      this.$confirm('是否删除该出入口信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.baseUrl + 'deleteGate', {
          params: { pointcode: pointcode }
        })
        if (res.code === '0') {
          this.$message.success(res.message)
          this.initParkStore()
          // 重新获取出入口信息
          this.getGateInfo()
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },
    // 添加出入口信息
    addGateInfo () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        this.$confirm('确定添加该出入口？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.baseUrl + 'addGateInfo', {
            params: this.addForm
          })
          if (res.code === '0') {
            this.$message.success(res.message)
            this.addDialogClose()
            this.initParkStore()
            // 重新获取出入口信息信息
            this.getGateInfo()
          } else {
            return this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },

    // 获取停车场基本信息存储store
    async initParkStore () {
      const { data: res } = await this.$http.get(this.baseUrl + 'parkInfo4Clent', {

      })
      if (res.code === '0') {
        // console.log(res.parkConfig)
        this.$store.commit('initParkConfig', res.parkConfig)
      } else {
        return this.$message.error(res.message)
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .container-gate{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }
</style>
