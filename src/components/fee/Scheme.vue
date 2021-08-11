<template>
  <div class="container-scheme">
      <el-card>
      <el-row>
        <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialogVisible">添加方案</el-button>
        </el-col>
      </el-row>
      </el-row>
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="方案名称" prop="planName"></el-table-column>
        <el-table-column label="计费规则">
          <template slot-scope="scope">{{getChargePolicyName(scope.row.chargePolicyId)}}</template>
        </el-table-column>
        <el-table-column label="开始时间">
          <template slot-scope="scope">{{scope.row.beginDate | dateFormatYMD}}</template>
        </el-table-column>
        <el-table-column label="结束时间">
           <template slot-scope="scope">{{scope.row.endDate | dateFormatYMD}}</template>
        </el-table-column>
        <el-table-column label="优先级" prop="policyPriority"></el-table-column>
        <el-table-column label="操作" prop="failImports" width="220px">
          <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="editScheme(scope.row)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="delScheme(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog title="计费方案" :visible.sync="addDialogVisible" width="90%" @close="addDialogClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="150px">
        <el-form-item label="方案名称">
          <el-input v-model="addForm.planName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="车牌类型">
          <el-checkbox-group v-model="checkboxGroup1" size="small">
            <el-checkbox v-for="item in chargePlanCarType" :key="item.id" :label="item.id" border>{{item.label}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="区域信息">
          <el-checkbox-group v-model="checkboxGroup2" size="small">
            <el-checkbox v-for="item in regionList" :key="item.regionCode" :label="item.regionCode" border>{{item.regionName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="计费规则">
          <el-select placeholder="请选择计费规则" v-model="addForm.chargePolicyId" style="width: 100%">
            <el-option
              v-for="item in dataListRule"
              :key="item.nid"
              :label="item.policyName"
              :value="item.nid">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
           <el-date-picker v-model="beginDate1" type="date" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="endDate1" type="date" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="方案优先级">
          <el-input v-model="addForm.policyPriority" autocomplete="off" type="number"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveChargePlan">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { dateFormat } from '../../utils/utils'

export default {
  data () {
    return {
      chargePlanCarType: [
        { id: 0, label: '未知车牌' },
        { id: 1, label: '蓝牌小汽车' },
        { id: 2, label: '黑牌小汽车' },
        { id: 3, label: '单排黄牌' },
        { id: 4, label: '双排黄牌' },
        { id: 5, label: '警车车牌' },
        { id: 6, label: '武警车牌' },
        { id: 7, label: '个性化车牌' },
        { id: 8, label: '单排军车牌' },
        { id: 9, label: '双排军车牌' },
        { id: 10, label: '使馆车牌' },
        { id: 11, label: '香港车牌' },
        { id: 12, label: '农用车' },
        { id: 13, label: '教练车' },
        { id: 14, label: '澳门车牌' },
        { id: 15, label: '双层武警车牌' },
        { id: 16, label: '武警总队车牌' },
        { id: 17, label: '双层武警总队车牌' },
        { id: 18, label: '民航车牌' },
        { id: 19, label: '新能源车牌' }
      ],
      checkboxGroup1: [],
      checkboxGroup2: [],
      addDialogVisible: false, // 控制添加窗口显示
      dataList: [], // 数据
      dataListRule: [], // 收费规则列表
      regionList: [],
      queryInfo: {

      },
      beginDate1: '',
      endDate1: '',
      addForm: {
        nid: '',
        planName: '',
        chargePolicyId: '',
        beginDate: '',
        endDate: '',
        policyPriority: 0
      },
      addFormRules: {

      }
    }
  },
  created () {
    this.querySchmeneList()
    this.queryRuleList()
    this.regionList = this.$store.state.parkConfig.regionList// 区域信息
  },
  methods: {
    // 控制添加窗口的显示与关闭
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    addDialogClose () {
      this.addForm.nid = ''
      this.addForm.planName = ''
      this.addForm.chargePolicyId = ''
      this.checkboxGroup1 = []
      this.checkboxGroup2 = []
      this.addForm.beginDate = ''
      this.addForm.endDate = ''
      this.addForm.policyPriority = 0
      this.$refs.addFormRef.resetFields()
      this.addDialogVisible = false
    },
    // 计费规则列表
    async querySchmeneList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'querySchmeneList', {

      })
      // console.log(res)
      if (res.code === '0') {
      // 查询成功，设置数据
        this.dataList = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 查询计费规则列表
    async queryRuleList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryRuleList', {

      })
      // console.log(res)
      if (res.code === '0') {
      // 查询成功，设置数据
        this.dataListRule = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 保存计费方案
    async saveChargePlan () {
      // 检查数据
      if (this.addForm.planName === '') {
        return this.$message.error('请输入方案名称')
      }
      if (this.checkboxGroup1.length === 0) {
        return this.$message.error('请选择车牌类型')
      }
      if (this.addForm.chargePolicyId === '') {
        return this.$message.error('请选择计费规则')
      }
      if (this.beginDate1 === '') {
        return this.$message.error('请选择开始时间')
      }
      if (this.endDate1 === '') {
        return this.$message.error('请选择结束时间')
      }
      if (this.checkboxGroup2.length === 0) {
        return this.$message.error('请选择区域信息')
      }
      // 填充数据
      this.addForm.beginDate = dateFormat(this.beginDate1) + ' 00:00:00'
      this.addForm.endDate = dateFormat(this.endDate1) + ' 23:59:59'
      // 组装车牌类型
      let carTypes = ''
      this.checkboxGroup1.map(item => {
        carTypes = carTypes + item + ';'
      })
      carTypes = carTypes.substring(0, carTypes.length - 1)
      // console.log(carTypes)
      this.addForm.carTypes = carTypes
      // 组装区域信息
      let regions = ''
      this.checkboxGroup2.map(item => {
        if (item !== '') {
          regions = regions + item + ';'
        }
      })
      regions = regions.substring(0, regions.length - 1)
      this.addForm.regions = regions
      // 后台请求
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'saveChargePlan', {
        params: this.addForm
      })
      if (res.code === '0') {
        this.$message.success(res.message)
        this.addDialogClose()
        this.querySchmeneList()
      } else {
        return this.$message.error(res.message)
      }
    },
    // 编辑方案
    editScheme (row) {
      // 基本信息
      this.addForm.nid = row.nid
      this.addForm.planName = row.planName
      this.addForm.chargePolicyId = row.chargePolicyId
      this.beginDate1 = dateFormat(row.beginDate)
      this.endDate1 = dateFormat(row.endDate)
      this.addForm.policyPriority = row.policyPriority
      // 车辆类型
      row.carTypes.split(';').map(item => {
        this.checkboxGroup1.push(parseInt(item))
      })
      // console.log(this.checkboxGroup1)
      // 区域信息
      row.regions.split(';').map(item => {
        this.checkboxGroup2.push(item)
      })
      this.addDialogVisible = true
    },
    // 删除方案
    delScheme (row) {
      this.$confirm('是否删除该方案？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteChargePlan', {
          params: { nid: row.nid }
        })
        // console.log(res)
        if (res.code === '0') {
          this.querySchmeneList()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },

    // 获取计费规则名称，（数据量较小，所以这样写，实在不想再改查询方法了）
    getChargePolicyName (chargePolicyId) {
      let policyName = ''
      this.dataListRule.map(item => {
        if (item.nid === chargePolicyId) {
          policyName = item.policyName
        }
      })
      if (policyName === '') {
        return chargePolicyId
      } else {
        return policyName
      }
    }

  }
}
</script>

<style lang="less" scoped>
  .container-scheme{
    background-color:#f7f7f7;
    position: relative;
  }
  .el-col {
    margin: 7px 7px 7px 7px;
  }
</style>
