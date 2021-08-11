<template>
  <div class="container-park">
    <el-card>
      <el-form ref="form" :model="form" label-width="150px">
        <el-form-item label="停车场编号">
          <el-input disabled v-model="park.parkcode"></el-input>
        </el-form-item>
        <el-form-item label="停车场名称">
          <el-input v-model="park.parkname"></el-input>
        </el-form-item>
        <!-- <el-form-item label="剩余车位数">
          <el-input disabled v-model="park.remainBerthCount"></el-input>
        </el-form-item> -->
        <el-form-item label="停车场地址">
          <el-input v-model="park.address"></el-input>
        </el-form-item>
        <el-form-item label="联系人姓名">
          <el-input v-model="park.principal"></el-input>
        </el-form-item>
        <el-form-item label="联系人电话">
          <el-input v-model="park.phone"></el-input>
        </el-form-item>
         <el-form-item size="medium">
          <el-button type="primary" @click="updateParkInfo">更新停车场</el-button>
          <!-- <el-button type="warning" @click="berthDialogVisible">校正车位数</el-button> -->
          <el-button type="danger" v-if="userName === 'admin'" @click="parkcodeDialogVisible">重置停车场</el-button>
        </el-form-item>
      </el-form>
    </el-card>

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

    <el-dialog title="重置停车场" :visible.sync="parkcodeVisible" width="50%" @close="parkcodeDialogClose">
      <el-form :model="parkForm" ref="parkFormRef" label-width="150px">
        <el-form-item label="停车场编号：">
          <el-input v-model="parkForm.parkCode" autocomplete="off" type="number"></el-input>
        </el-form-item>
        <el-form-item label="停车场名称">
          <el-input v-model="parkForm.parkname"></el-input>
        </el-form-item>
        <el-form-item label="车位数">
          <el-input v-model="parkForm.berthcount"></el-input>
        </el-form-item>
        <el-form-item label="停车场地址">
          <el-input v-model="parkForm.address"></el-input>
        </el-form-item>
        <el-form-item label="联系人姓名">
          <el-input v-model="parkForm.principal"></el-input>
        </el-form-item>
        <el-form-item label="联系人电话">
          <el-input v-model="parkForm.phone"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="parkcodeDialogClose">取 消</el-button>
        <el-button type="primary" @click="updateParkCode">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>
export default {
  data () {
    return {
      userName: '',
      berthNumVisible: false,
      parkcodeVisible: false,
      baseUrl: '',
      park: {},
      berthForm: {
        berthNum: 0
      },
      parkForm: {
        parkCode: '',
        parkname: '',
        berthcount: '',
        address: '',
        principal: '',
        phone: ''
      },
      form: {
        isEtc: '0',
        keepOrderDays: '-1',
        islimitIn: 0
      }
    }
  },
  created () {
    this.userName = window.sessionStorage.getItem('userName')
    this.baseUrl = this.$store.state.baseUrl// 请求base地址
    this.getParkInfo()
  },
  methods: {
    // 获停车场信息
    async getParkInfo () {
      const { data: res } = await this.$http.get(this.baseUrl + 'getparkinfo', {

      })
      // console.log(res)
      if (res.code === '0') {
        this.park = res.park
      } else {
        return this.$message.error(res.message)
      }
    },
    // 打开校正车位数窗口
    berthDialogVisible (inImg, outImg) {
      this.berthNumVisible = true
    },

    // 关闭校正车位数窗口
    bertDialogClose () {
      this.$refs.berthFormRef.resetFields()
      this.berthNumVisible = false
    },

    // 打开更新停车场编号窗口
    parkcodeDialogVisible () {
      this.parkcodeVisible = true
    },

    // 关闭更新停车场编号窗口
    parkcodeDialogClose () {
      this.$refs.parkFormRef.resetFields()
      this.parkcodeVisible = false
    },

    // 更新停车场车位数
    async updateBerthNum () {
      if (this.berthForm.berthNum === 0) {
        return this.$message.error('车位调整数不能为0')
      }
      const { data: res } = await this.$http.get(this.baseUrl + 'updateParkBerth', {
        params: this.berthForm
      })
      // console.log(res)
      if (res.code === '0') {
        this.$message.success(res.message)
        // 重新获取停车场信息
        this.getParkInfo()
        // 关闭调整车位数对话框
        this.bertDialogClose()
      } else {
        return this.$message.error(res.message)
      }
    },

    // 重置停车场信息
    updateParkCode () {
      if (this.parkForm.parkCode === '') {
        return this.$message.error('停车场编号不能为空')
      }
      this.$confirm('更新停车场编号会重置停车场配置，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.baseUrl + 'updateParkCode', {
          params: this.parkForm
        })
        if (res.code === '0') {
          this.$message.success(res.message)
          // 重新获取停车场信息
          this.getParkInfo()
          // 关闭对话框
          this.parkcodeDialogClose()
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },

    // 更新停车场信息
    updateParkInfo () {
      this.$confirm('更新停车场信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.baseUrl + 'updateparkinfo', {
          params: this.park
        })
        if (res.code === '0') {
          this.getParkInfo()
          this.$message.success(res.message)
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
.container-park {
  background-color: #f7f7f7;
  position: relative;
}
</style>
