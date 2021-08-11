<template>
  <div class="container-gate">
    <el-card>
      <el-row>
        <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialogVisible">添加用户</el-button>
        </el-col>
      </el-row>
      </el-row>
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="登录账号" prop="userid"></el-table-column>
        <el-table-column label="用户姓名" prop="username"></el-table-column>
        <el-table-column label="手机号码" prop="phone"></el-table-column>
        <el-table-column label="备注信息" prop="description"></el-table-column>
        <el-table-column label="操作" prop="failImports" width="320px">
          <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showModDialogVisible(scope.row.userid)">修改密码</el-button>
              <el-button type="primary" v-if=" scope.row.userid !== 'admin' " icon="el-icon-s-check" size="mini" @click="showAuthDialogVisible(scope.row.userid,scope.row.userRole)">用户授权</el-button>
              <el-button type="danger" v-if=" scope.row.userid !== 'admin' " icon="el-icon-delete" size="mini" @click="deleteUserInfo(scope.row.userid)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="登录账号" prop="userid">
          <el-input v-model="addForm.userid" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="addForm.password" autocomplete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password1">
          <el-input v-model="addForm.password1" autocomplete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item label="用户名称：" prop="username">
          <el-input v-model="addForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="用户手机：" prop="phone">
          <el-input v-model="addForm.phone" autocomplete="off"></el-input>
        </el-form-item>
         <el-form-item label="备注信息" prop="description">
          <el-input v-model="addForm.description" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserInfo">确 定</el-button>
      </div>
    </el-dialog>

     <el-dialog title="修改密码" :visible.sync="modDialogVisible" width="50%" @close="modDialogClose">
      <el-form :model="modForm" ref="modFormRef" label-width="150px">
        <el-form-item label="登录密码" prop="password">
          <el-input v-model="modForm.password" autocomplete="off" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="password1">
          <el-input v-model="modForm.password1" autocomplete="off" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="modDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeUserPassword">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="用户授权" :visible.sync="authDialogVisible" width="50%" @close="authDialogClose">
      <el-transfer v-model="transForm.transValue" :data="transForm.transData" :titles="['未授权', '待授权']"></el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authDialogClose">取 消</el-button>
        <el-button type="primary" @click="saveUserRoleData">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>
<script>

export default {
  data () {
    return {
      addDialogVisible: false, // 控制添加窗口显示
      modDialogVisible: false, // 控制修改密码窗口显示
      authDialogVisible: false, // 授权接口的窗口显示
      dataList: [], // 数据
      queryInfo: {

      },
      addForm: {
        userid: '',
        password: '',
        password1: '',
        username: '',
        phone: '',
        description: ''
      },
      modForm: {
        userid: '',
        password: '',
        password1: ''
      },
      transForm: {
        userid: '',
        transData: [],
        transValue: []
      },
      addFormRules: {
        userid: [
          { required: true, message: '请输入登录账号', trigger: 'blur' },
          { min: 3, max: 18, message: '长度在 3 到 18 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 3, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur' }
        ],
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 3 到 10 个汉字', trigger: 'blur' }
        ],
        description: [
          { min: 0, max: 10, message: '小于100字', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.queryUserList()
    // this.getRoleTransData()
  },
  methods: {
    // 控制添加窗口的显示与关闭
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    addDialogClose () {
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // 控制修改密码窗口的显示与关闭
    showModDialogVisible (userid) {
      this.modForm.userid = userid
      this.modDialogVisible = true
    },
    modDialogClose () {
      this.$refs.modFormRef.resetFields()
      this.modDialogVisible = false
    },
    // 控制用户授权窗口的显示与关闭
    showAuthDialogVisible (userid, userRole) {
      this.transForm.userid = userid
      if (userRole) {
        this.transForm.transValue = userRole.split(',')
      }
      this.getRoleTransData()
      this.authDialogVisible = true
    },
    authDialogClose () {
      this.transForm.userid = ''
      this.transForm.transData = []
      this.transForm.transValue = []
      this.authDialogVisible = false
    },
    // 查询用户列表
    async queryUserList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryUserList', {

      })
      // console.log(res)
      if (res.code === '0') {
      // 查询成功，设置数据
        this.dataList = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 用户添加
    addUserInfo () {
      if (this.addForm.password !== this.addForm.password1) {
        this.$message.error('两次输入密码不一致')
        return false
      }
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        this.$confirm('确定添加该用户信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'addUserInfo', {
            params: this.addForm
          })
          if (res.code === '0') {
            this.$message.success(res.message)
            this.addDialogClose()
            this.queryUserList()
          } else {
            return this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 用户信息删除
    async deleteUserInfo (userid) {
      this.$confirm('是否删除该用户信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteUserInfo', {
          params: { userid: userid }
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryUserList()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },
    // 密码修改
    async changeUserPassword () {
      this.$confirm('是否修改该用户密码？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'changeUserPassword', {
          params: this.modForm
        })
        // console.log(res)
        if (res.code === '0') {
          this.$message.success(res.message)
          if (this.addForm.username === 'admin') {
            window.sessionStorage.clear()
            this.$router.push('/login')
          } else {
            this.modDialogClose()
          }
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },
    // 获取穿梭框角色数据
    async getRoleTransData () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryRoleList', {

      })
      // console.log(res)
      if (res.code === '0') {
        res.data.map(item => {
          this.transForm.transData.push({
            key: item.id,
            label: item.roleName
          })
        })
      } else {
        return this.$message.error(res.message)
      }
    },
    // 保存用户角色信息
    async saveUserRoleData () {
      console.log(this.transForm.transValue.toString())
      if (this.transForm.transValue.length <= 0) {
        this.$message.error('待授权角色为空！')
        return false
      }
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'saveUserRoleData', {
        params: { userid: this.transForm.userid, transValue: this.transForm.transValue.toString() }
      })
      if (res.code === '0') {
        this.$message.success(res.message)
        this.authDialogClose()
        this.queryUserList()
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
