<template>
  <div class="container-equip">
    <el-card>
      <el-row>
        <el-row :gutter="20">
        <el-col :span="2">
          <el-button type="primary" @click="showAddDialogVisible">添加相机</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="uploadDevice">设备信息上传</el-button>
        </el-col>
      </el-row>
      </el-row>
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="相机名称" prop="devicename"></el-table-column>
        <el-table-column label="出入口名称" prop="pointname"></el-table-column>
        <el-table-column label="出入口">
           <template slot-scope="scope">
            <span v-if="scope.row.videofunc === '9' ">入口</span>
            <span v-if="scope.row.videofunc === '10' ">出口</span>
          </template>
        </el-table-column>
        <el-table-column label="IP地址" prop="ip"></el-table-column>
        <el-table-column label="操作" prop="failImports">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editEquip(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteEquip(scope.row.devicecode)">删 除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="添加相机" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="相机序列号" prop="devicecode">
          <el-input v-model="addForm.devicecode" autocomplete="off" :disabled="isCodeEdit"></el-input>
        </el-form-item>
        <el-form-item label="相机名称" prop="devicename">
          <el-input v-model="addForm.devicename" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="相机方向">
          <el-select
            placeholder="请选择"
            v-model="addForm.videofunc"
            style="width: 100%"
          >
            <el-option label="入口相机" value="9"></el-option>
            <el-option label="出口相机" value="10"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="出入口信息">
          <el-select
            placeholder="请选择"
            v-model="addForm.pointcode"
            style="width: 100%"
          >
            <el-option v-for="(item, i) in gateList " :key="i" :label="item.pointname" :value="item.pointcode"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="相机IP" prop="devicename">
          <el-input v-model="addForm.ip" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="语音/屏显接口">
          <el-select
            placeholder="请选择"
            v-model="addForm.voiceChannel"
            style="width: 100%"
          >
            <el-option label="接口1" value="0"></el-option>
            <el-option label="接口2" value="1"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogClose">取 消</el-button>
        <el-button type="primary" @click="addEquipInfo">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>

export default {
  data () {
    return {
      isCodeEdit: false, // 相机序列号是否可以编辑
      baseUrl: '',
      addDialogVisible: false, // 控制添加窗口显示
      dataList: [], // 数据
      gateList: [],
      queryInfo: {

      },
      addForm: {
        devicecode: '',
        devicename: '',
        pointcode: '',
        ip: '',
        videofunc: '9',
        voiceChannel: '1'
      },
      addFormRules: {
        devicename: [
          { required: true, message: '请输入相机名称', trigger: 'blur' }
        ],
        ip: [
          { required: true, message: '请输入相机IP', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.baseUrl = this.$store.state.baseUrl // 请求base地址
    this.gateList = this.$store.state.parkConfig.gateList// 出入口列表
    this.queryEquipInfo()
  },
  methods: {
    // 查询相机列表
    async queryEquipInfo () {
      const { data: res } = await this.$http.get(this.baseUrl + 'queryEquipInfo', {

      })
      // console.log(res)
      if (res.code === '0') {
        // 查询成功，设置数据
        this.dataList = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 删除相机信息
    async deleteEquip (devicecode) {
      this.$confirm('是否删除该相机信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.baseUrl + 'deleteEquipInfo', {
          params: { devicecode: devicecode }
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryEquipInfo()
          this.initParkStore()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },
    // 保存添加
    addEquipInfo () {
      if (this.addForm.devicecode === '') {
        return this.$message.error('相机序列号不能为空')
      }
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        this.$confirm('确定添加该相机？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.baseUrl + 'addEquipInfo', {
            params: this.addForm
          })
          if (res.code === 0) {
            this.$message.success(res.message)
            this.addDialogClose()
            this.initParkStore()
            // 重新获取出入口信息信息
            this.queryEquipInfo()
          } else {
            return this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 编辑相机信息
    editEquip (row) {
      this.addForm.devicecode = row.devicecode
      this.addForm.devicename = row.devicename
      this.addForm.videofunc = row.videofunc
      this.addForm.pointcode = row.pointcode
      this.addForm.ip = row.ip
      this.addForm.voiceChannel = row.voiceChannel + ''
      this.isCodeEdit = true
      this.addDialogVisible = true
    },
    // 控制添加窗口的显示
    showAddDialogVisible () {
      this.isCodeEdit = false
      if (this.gateList.length > 0) {
        this.addForm.pointcode = this.gateList[0].pointcode
      }
      this.addDialogVisible = true
    },
    // 控制添加窗口的关闭
    addDialogClose () {
      // this.$refs.addFormRef.resetFields()
      this.addForm.devicecode = ''
      this.addForm.devicename = ''
      this.addForm.videofunc = '9'
      this.addForm.pointcode = ''
      this.addForm.ip = ''
      this.addForm.voiceChannel = '1'
      this.addDialogVisible = false
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

    // 设备信息上传
    async uploadDevice () {
      const url = this.baseUrl.replace('api/client', 'park')
      const { data: res } = await this.$http.get(url + 'uploadDeviceInfo', {

      })
      if (res.indexOf('success=true') >= 0) {
        this.$message.success('相机信息上传成功')
      } else {
        return this.$message.error('相机信息上传失败')
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .container-equip{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }
</style>
