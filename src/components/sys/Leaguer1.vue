<template>
  <div class="container-leaguager">
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-input placeholder="请输入车牌号码" v-model="queryInfo.plateNo"  class="el-input_query"/>
        </el-col>
        <el-col :span="4">
          <el-input placeholder="请输入手机号码" v-model="queryInfo.phoneNo"  class="el-input_query"/>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="queryLeaguerList">查&nbsp;&nbsp;询</el-button>
          <el-button type="primary"  @click="showAddDialogVisible">添&nbsp;&nbsp;加</el-button>
          <el-button type="primary"  @click="exportExcel">导&nbsp;&nbsp;出</el-button>
          <el-button type="primary"  @click="impDialogVisible = true">导&nbsp;&nbsp;入</el-button>
        </el-col>
      </el-row>

    <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="车牌号码" prop="carno"></el-table-column>
        <el-table-column label="车牌颜色">
          <template slot-scope="scope">
            <span v-if="scope.row.licenceType === '0' ">未知</span>
            <span v-else-if="scope.row.licenceType === '1' ">蓝牌</span>
            <span v-else-if="scope.row.licenceType === '3' ">黄牌</span>
            <span v-else-if="scope.row.licenceType === '19' ">新能源</span>
            <span v-else>
              其他
            </span>
          </template>
        </el-table-column>
        <el-table-column label="手机号码" prop="phone"></el-table-column>
        <el-table-column label="姓名" prop="name"></el-table-column>
        <el-table-column label="有效期起" width="120px">
          <template slot-scope="scope">{{scope.row.validBegintime | dateFormatYMD}}</template>
        </el-table-column>
         <el-table-column label="有效期止" width="120px">
           <template slot-scope="scope">{{scope.row.expiryDate | dateFormatYMD}}</template>
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

    <el-dialog title="添加会员" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
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
            <!-- <el-option label="白牌" value="3"></el-option>
            <el-option label="黑牌" value="4"></el-option> -->
          </el-select>
        </el-form-item>
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

    <el-dialog title="会员调整" :visible.sync="xqDialogVisible" width="50%" @close="xqDialogClose">
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
        <el-button type="primary" @click="xqLeaguer">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 导入月租车 -->
    <el-dialog title="导入月租车" :visible.sync="impDialogVisible" width="50%" @close="impialogClose">
      <el-form :model="impForm" ref="impFormRef" label-width="80px">
        <el-upload
          style="margin-top: 10px;"
          ref="uploadRef"
          action
          multiple
          :limit="1"
          :file-list="fileList"
          :auto-upload="false"
          :on-change="handleChange"
          :on-remove="handleRemove"
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        >
          <el-button size="small" type="warning">选择文件</el-button>
        </el-upload>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="impialogClose">取 消</el-button>
        <el-button type="primary" @click="impParkCard">导 入</el-button>
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
      impDialogVisible: false,
      dataList: [],
      fileTemp: null, // 导入的文件
      fileList: [],
      impForm: {
        impData: [] // 导入的数据格式
      },
      total: 0,
      queryInfo: {
        plateNo: '',
        phoneNo: '',
        // valState: '1',
        pagenum: 1,
        pagesize: 10
      },
      start: new Date(),
      end: new Date((new Date()).getFullYear(), (new Date()).getMonth() + 1, (new Date()).getDate(), 12),
      start1: '',
      end1: '',
      addForm: {
        carno: '',
        licenceType: '1',
        phone: '',
        name: '',
        validBegintime: '',
        expiryDate: ''
      },
      xqForm: {
        vipId: '',
        validBegintime: '',
        expiryDate: ''
      },
      addFormRules: {
        carno: [
          { required: true, message: '请输入车牌号码', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入会员名字', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入会员电话', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.queryLeaguerList()
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
    // 续期窗口显示关闭
    showxqDialogVisible (vipId, validBegintime, expiryDate) {
      this.xqForm.vipId = vipId
      this.start1 = validBegintime
      this.end1 = expiryDate
      this.xqDialogVisible = true
    },
    xqDialogClose () {
      this.$refs.xqFormRef.resetFields()
      this.xqDialogVisible = false
    },
    // 获取会员列表
    async queryLeaguerList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryLeaguerList', {
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
    // 添加会员信息
    addLeaguerInfo () {
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
        this.$confirm('确定添加该会员信息？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(async () => {
          const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'addLeaguerInfo1', {
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
    async deleteLeaguer (vipId) {
      this.$confirm('是否删除该会员信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteLeaguer', {
          params: { vipId: vipId }
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
    // 会员续期
    xqLeaguer () {
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

      this.$confirm('确定调整该会员信息？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'xqLeaguer', {
          params: this.xqForm
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryLeaguerList()
          this.xqDialogClose()
          return this.$message.success(res.message)
        } else {
          return this.$message.error(res.message)
        }
      }).catch(() => {

      })
    },
    // 导出会员信息
    exportExcel () {
      window.location.href = this.$store.state.baseUrl + 'exportVipList'
    },

    // 导入对话框关闭
    impialogClose () {
      this.$refs.impFormRef.resetFields()
      this.$refs.uploadRef.clearFiles()
      this.fileList = []
      this.fileTemp = null
      this.impDialogVisible = false
    },
    // 导入文件变化函数
    handleChange (file, fileList) {
      this.fileTemp = file.raw
    },
    // 导入文件删除
    handleRemove (file, fileList) {
      this.fileTemp = null
    },
    // 保存导入
    impParkCard () {
      this.$refs.impFormRef.validate(async valid => {
        if (!valid) return false
      })
      if (this.fileTemp) {
        if (
          this.fileTemp.type ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          this.fileTemp.type === 'application/vnd.ms-excel'
        ) {
          this.impExcel(this.fileTemp)
        } else {
          return this.$message.error('请选择excel类型文件')
        }
      } else {
        return this.$message.error('请选择需要导入的excel文件')
      }
    },
    // 解析excel文件
    impExcel (obj) {
      var _this = this
      // 通过DOM取文件数据
      this.file = obj
      var rABS = false // 是否将文件读取为二进制字符串
      var f = this.file
      var reader = new FileReader()
      FileReader.prototype.readAsBinaryString = function (f) {
        var binary = ''
        var rABS = false // 是否将文件读取为二进制字符串
        var wb // 读取完成的数据
        var outdata
        var reader = new FileReader()
        reader.onload = function (e) {
          var bytes = new Uint8Array(reader.result)
          var length = bytes.byteLength
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          var XLSX = require('xlsx')
          if (rABS) {
            // eslint-disable-next-line no-undef
            wb = XLSX.read(btoa(fixdata(binary)), {
              // 手动转化
              type: 'base64'
            })
          } else {
            wb = XLSX.read(binary, {
              type: 'binary'
            })
          }
          outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]) // outdata就是你想要的东西
          this.exceldata = [...outdata]
          _this.alertData = []// 清空表单数据
          _this.impForm.impData = []// 清空上传数据格式
          // 检查导入的数据格式
          let errmsg = ''// 错误信息
          this.exceldata.map((v, i) => {
            const rowNum = i + 1 // 行号
            if (undefined !== v.车牌号码) {
              const carno = v.车牌号码
              const licenceType = v.车牌颜色
              const phone = v.手机号码
              const name = v.姓名
              const validBegintime = v.有效期起
              const expiryDate = v.有效期止
              var validBegintimeTmp = ''
              var expiryDateTmp = ''
              if (undefined === validBegintime) {
                errmsg = errmsg + '第【' + rowNum + '】行有效期起不能为空；\r\n'
              } else {
                if (isNaN(validBegintime)) {
                  errmsg = errmsg + '第【' + rowNum + '】行有效期起格式不正确；\r\n'
                } else {
                  validBegintimeTmp = _this.transDataDate(validBegintime)
                  if (validBegintimeTmp === '' || validBegintimeTmp.indexOf('-') === -1) {
                    errmsg = errmsg + '第【' + rowNum + '】行有效期起转换日期失败；\r\n'
                  }
                }
              }
              if (undefined === expiryDate) {
                errmsg = errmsg + '第【' + rowNum + '】行有效期起不能为空；\r\n'
              } else {
                if (isNaN(expiryDate)) {
                  errmsg = errmsg + '第【' + rowNum + '】行有效期起格式不正确；\r\n'
                } else {
                  expiryDateTmp = _this.transDataDate(expiryDate)
                  if (expiryDateTmp === '' || expiryDateTmp.indexOf('-') === -1) {
                    errmsg = errmsg + '第【' + rowNum + '】行有效期起转换日期失败；\r\n'
                  }
                }
              }
              // 拼装需要保存的数据
              _this.impForm.impData.push({
                carno: carno,
                licenceType: licenceType,
                phone: phone,
                name: name,
                validBegintime: validBegintimeTmp + ' 00:00:00',
                expiryDate: expiryDateTmp + ' 23:59:59',
                rowNum: rowNum
              })
            }
          })
          if (errmsg.length > 0) {
            _this.$confirm(errmsg, '导入错误', {
              type: 'error',
              showConfirmButton: false
            }).then(() => {

            }).catch(() => {

            })
          } else {
            _this.saveImport()
          }
        }
        reader.readAsArrayBuffer(f)
      }
      if (rABS) {
        reader.readAsArrayBuffer(f)
      } else {
        reader.readAsBinaryString(f)
      }
    },

    async saveImport () {
      const { data: res } = await this.$http.post(this.$store.state.baseUrl + 'saveImportVipInfo', 'jsonData=' + JSON.stringify(this.impForm.impData))
      if (res.code === '0') {
        this.$message.success(res.message)
        this.impialogClose()
        this.queryLeaguerList()
      } else {
        return this.$message.error(res.message)
      }
    },

    // 数字表示的日期，转成2020-06-28格式的日期
    transDataDate (val) {
      const time = new Date((val - 1) * 24 * 3600000 + 1)
      time.setYear(time.getFullYear() - 70)
      const year = time.getFullYear() + ''
      const month = time.getMonth() + 1 + ''
      const date = time.getDate() - 1 + ''
      if (val && val.length === 1) {
        return year + val + month + val + date
      }
      const dateTmp = year + '-' + (month < 10 ? '0' + month : month) + '-' + (date < 10 ? '0' + date : date)
      return dateTmp
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
