<template>
  <div class="container-sss">
    <el-card>
      <el-row>
        <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialogVisible">添加角色</el-button>
        </el-col>
      </el-row>
      </el-row>
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleContent"></el-table-column>
        <el-table-column label="操作" prop="failImports" width="220px">
          <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-s-check" size="mini" @click="showModDialogVisible(scope.row.id,scope.row.roleMenu)">角色授权</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoleInfo(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleContent">
          <el-input v-model="addForm.roleContent" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoleInfo">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="角色授权" :visible.sync="modDialogVisible" width="50%" @close="modDialogClose">
      <el-tree
      :data="treeData"
      show-checkbox
      node-key="id"
      ref="tree"
      :props="defaultProps"
      :default-checked-keys='modForm.resourceCheckedKey'>
      </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="modDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleMenu">保 存</el-button>
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
      dataList: [], // 数据
      // 树形菜单树数据
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      queryInfo: {

      },
      addForm: {
        roleName: '',
        roleContent: ''
      },
      modForm: {
        id: '',
        resourceCheckedKey: []
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.queryList()
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
    // 控制角色授权接口的显示与关闭
    showModDialogVisible (id, roleMenu) {
      this.modForm.id = id
      this.getMenuData()
      if (roleMenu) {
        this.modForm.resourceCheckedKey = roleMenu.split(',')
      }
      this.modDialogVisible = true
    },
    modDialogClose () {
      this.modForm.id = ''
      this.modForm.resourceCheckedKey = []
      this.modDialogVisible = false
    },
    // 查询角色列表
    async queryList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryRoleList', {

      })
      // console.log(res)
      if (res.code === '0') {
        // 查询成功，设置数据
        this.dataList = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 角色添加
    addRoleInfo () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return false
        this.$confirm('确定添加该角色信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'addRoleInfo', {
            params: this.addForm
          })
          if (res.code === '0') {
            this.$message.success(res.message)
            this.addDialogClose()
            this.queryList()
          } else {
            return this.$message.error(res.message)
          }
        }).catch(() => {

        })
      })
    },
    // 角色信息删除
    async deleteRoleInfo (id) {
      this.$confirm('是否删除该角色信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteRoleInfo', {
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
    // 获取菜单树数据
    async getMenuData () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'getMenuTreeData', {

      })
      if (res.code === '0') {
        // console.log(res.data)
        this.treeData = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 保存授权数据
    async saveRoleMenu () {
      let roleMenu = this.$refs.tree.getCheckedKeys()
      const roleMenu1 = this.$refs.tree.getHalfCheckedKeys()
      // console.log('获取选中数据：' + roleMenu)
      // console.log('获取选中数据1：' + roleMenu1)
      roleMenu = roleMenu.concat(roleMenu1)
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'saveRoleMenu', {
        params: { id: this.modForm.id, roleMenu: roleMenu.toString() }
      })
      if (res.code === '0') {
        // console.log(res.data)
        this.$message.success(res.message)
        this.queryList()
        this.modDialogClose()
      } else {
        return this.$message.error(res.message)
      }
    }

  }
}
</script>

<style lang="less" scoped>
  .container-sss{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }
</style>
