<template>
  <div class="container-gate">
    <el-card>
      <el-row>
        <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialogVisible">添加区域</el-button>
        </el-col>
      </el-row>
      </el-row>
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="区域名称" prop="regionName"></el-table-column>
        <el-table-column label="计费方案" prop="chargeSchemeNid"></el-table-column>
        <el-table-column label="车位数" prop="berthCount"></el-table-column>
        <el-table-column label="剩余车位数" prop="regionRectifyCount"></el-table-column>
        <el-table-column label="区域类型">
          <template slot-scope="scope">
            <span v-if="scope.row.regionType === ''  ">独立区域</span>
            <span v-if="scope.row.regionType === '0'  ">独立区域</span>
            <span v-if="scope.row.regionType === '1'  ">嵌套区域</span>
          </template>
        </el-table-column>
        <el-table-column label="上级区域" prop="parentRegionName"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-setting" size="mini" @click="berthDialogVisible(scope.row)">车位数</el-button>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRegion(scope.row)">编 辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRegion(scope.row.regionCode)">删 除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="添加区域" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="区域名称：" prop="regionName">
          <el-input v-model="addForm.regionName" autocomplete="off"></el-input>
        </el-form-item>
         <el-form-item label="车位数：" prop="berthCount">
          <el-input v-model="addForm.berthCount" autocomplete="off" type="number"></el-input>
        </el-form-item>

        <el-form-item label="区域类型">
          <el-select
            placeholder="请选择"
            v-model="addForm.regionType"
            @change="changeRegionType"
            style="width: 100%"
          >
            <!-- 嵌套管控只管控车位数（能实现市医院需求） -->
            <!-- 后期可以根据需求扩展嵌套单独计费 -->
            <!-- 单独计费，又涉及嵌套区域和上级区域是不是一家管理的，不是一家的，需要上传两个订单，上级区域出口即嵌套区域入口 -->
            <!-- 如果是一家管理，可以做嵌套订单，嵌套订单，单独计费，然后把嵌套订单的费用加到上级区域订单费用上 -->
            <!-- 嵌套区域设计上，还分是不是完全嵌套和嵌套区域在边界，可以从嵌套区域直接离场的情况 -->
            <!-- 情况太多了，只能根据需求再去设计了，很难做一套全面的方案 -->
            <el-option label="独立区域" value="0"></el-option>
            <el-option label="嵌套管控" value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="上级区域" v-show="parentRegionVisible">
          <el-select
            placeholder="请选择"
            v-model="addForm.parentRegion"
            style="width: 100%"
          >
            <el-option v-for="(item, i) in regionList " :key="i" :label="item.regionName" :value="item.regionCode"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="车辆进入限制">
          <el-select
            placeholder="请选择"
            v-model="addForm.restrictedAccess"
            @change="changeRestrictedAccess"
            style="width: 100%"
          >
            <el-option label="不限制" value="0"></el-option>
            <el-option label="限制" value="1"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="白名单特权" v-show="restrictedAccessVisible">
          <el-select
            placeholder="请选择"
            v-model="addForm.whitelistPrivileges"
            style="width: 100%"
          >
            <el-option label="关闭" value="0"></el-option>
            <el-option label="开启" value="1"></el-option>
          </el-select>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRegionInfo">确 定</el-button>
      </div>
    </el-dialog>

     <el-dialog title="校正车位数" :visible.sync="berthNumVisible" width="50%" @close="bertDialogClose">
      <el-form :model="berthForm" ref="berthFormRef" label-width="150px">
        <el-form-item label="车位数（正负）：" prop="berthNum">
          <el-input v-model="berthForm.berthNum" autocomplete="off" type="number"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="bertDialogClose">取 消</el-button>
        <el-button type="primary" @click="updateBerthNum">确 定</el-button>
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
      berthNumVisible: false, // 控制校正车位数窗口显示
      parentRegionVisible: false, //  添加窗口，上级区域是否显示
      restrictedAccessVisible: false, // 添加窗口，显示白名单特权
      dataList: [], // 数据
      regionList: [], // 区域列表
      queryInfo: {

      },
      // 添加form
      addForm: {
        regionCode: '',
        regionName: '',
        berthCount: '',
        regionType: '0',
        parentRegion: '',
        restrictedAccess: '0',
        whitelistPrivileges: '1'
      },
      addFormRules: {
        regionName: [
          { required: true, message: '请输入区域名称', trigger: 'blur' }
        ],
        berthCount: [
          { required: true, message: '请输入车位数', trigger: 'blur' }
        ]
      },
      berthForm: {
        regionCode: '',
        berthNum: 0
      }
    }
  },
  created () {
    this.baseUrl = this.$store.state.baseUrl // 请求base地址
    this.regionList = this.$store.state.parkConfig.regionList// 区域列表
    this.getListInfo()
  },
  methods: {
    // 查询所有区域信息
    async getListInfo () {
      const { data: res } = await this.$http.get(this.baseUrl + 'queryrRegions', {

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
      this.addDialogVisible = true
      this.changeRegionType()
      this.changeRestrictedAccess()
    },
    // 添加窗口关闭
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.addForm.regionType = '0'
      this.addForm.parentRegion = ''
      this.addForm.restrictedAccess = '0'
      this.addForm.whitelistPrivileges = '1'
      this.addDialogVisible = false
    },

    // 编辑区域信息
    editRegion (row) {
      // console.log(row)
      this.addForm.regionCode = row.regionCode
      this.addForm.regionName = row.regionName
      this.addForm.berthCount = row.berthCount
      this.addForm.regionType = row.regionType
      this.addForm.parentRegion = row.parentRegion
      this.addForm.restrictedAccess = row.restrictedAccess
      this.addForm.restrictedAccessVisible = row.restrictedAccessVisible
      this.changeRegionType()
      this.changeRestrictedAccess()
      this.addDialogVisible = true
    },

    // 删除区域信息
    deleteRegion (regionCode) {
      this.$confirm('是否删除该区域信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.baseUrl + 'deleteRegion', {
          params: { regionCode: regionCode }
        })
        if (res.code === '0') {
          this.$message.success(res.message)
          this.initParkStore()
          // 重新获取区域信息
          this.getListInfo()
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },
    // 添加区域信息
    addRegionInfo () {
      if (this.addForm.regionType === '1') { // 嵌套区域
        if (this.addForm.parentRegion === '') {
          return this.$message.error('请选择上级区域')
        }
      }
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        let msg = '确定添加该区域？'
        if (this.addForm.regionCode !== '') {
          msg = '确定保存该区域？'
        }
        this.$confirm(msg, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.baseUrl + 'addRegionInfo', {
            params: this.addForm
          })
          if (res.code === '0') {
            this.$message.success(res.message)
            this.addDialogClose()
            this.initParkStore()
            // 重新获区域信息
            this.getListInfo()
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
    },

    // 打开校正车位数窗口
    berthDialogVisible (row) {
      this.berthForm.regionCode = row.regionCode
      this.berthNumVisible = true
    },

    // 关闭校正车位数窗口
    bertDialogClose () {
      this.$refs.berthFormRef.resetFields()
      this.berthNumVisible = false
    },
    // 更新区域车位数
    async updateBerthNum () {
      if (this.berthForm.berthNum === 0) {
        return this.$message.error('车位调整数不能为0')
      }
      const { data: res } = await this.$http.get(this.baseUrl + 'updateRegionBerth', {
        params: this.berthForm
      })
      // console.log(res)
      if (res.code === '0') {
        this.$message.success(res.message)
        // 重新获取区域信息
        this.getListInfo()
        // 关闭调整车位数对话框
        this.bertDialogClose()
      } else {
        return this.$message.error(res.message)
      }
    },
    // 切换区域类型
    changeRegionType () {
      if (this.addForm.regionType === '0' || this.addForm.regionType === '') {
        this.parentRegionVisible = false
      } else {
        this.parentRegionVisible = true
      }
    },
    // 切换限制进入
    changeRestrictedAccess () {
      if (this.addForm.restrictedAccess === '0' || this.addForm.restrictedAccess === '') {
        this.restrictedAccessVisible = false
      } else {
        this.restrictedAccessVisible = true
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
