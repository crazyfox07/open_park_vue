<template>
  <div class="container-rule">
    <el-card>

      <!-- 主页面查询条件，操作栏 -->
      <el-row>
        <el-row :gutter="20">
          <el-col :span="4">
            <el-button type="primary" @click="showAddDialogVisible">添加规则</el-button>
          </el-col>
        </el-row>
      </el-row>

      <!-- 页面查询数据展示 -->
      <el-table border stripe :data="dataList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="规则名称" prop="policyName"></el-table-column>
        <el-table-column label="规则车型">
          <template slot-scope="scope">
            <span v-if="scope.row.plateType === '-1' ">全部车型</span>
            <span v-if="scope.row.plateType === '7201' ">小型车</span>
            <span v-if="scope.row.plateType === '7202' ">中型车</span>
            <span v-if="scope.row.plateType === '7203' ">大型车</span>
          </template>
        </el-table-column>
        <el-table-column label="参考价格概述" prop="referCost"></el-table-column>
        <el-table-column label="操作" width="220px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRule(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleRule(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

    </el-card>

    <!-- 添加弹出框 -->
    <el-dialog title="收费规则" :visible.sync="addDialogVisible" width="90%" @close="addDialogClose">
      <!-- 基本信息 -->
      <el-card>
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
          <el-row>
            <el-col :span="8">
              <el-form-item label="规则名称">
                <el-input v-model="addForm.policyName" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="参考价格">
                <el-input v-model="addForm.referCharge" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="收费限额">
                <el-input v-model="addForm.maxCharge" autocomplete="off"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="号牌类型">
                <el-select placeholder="请选择" v-model="addForm.plateType" style="width: 100%">
                  <el-option label="全部" value="-1"></el-option>
                  <el-option label="小型车" value="7201"></el-option>
                  <el-option label="中型车" value="7202"></el-option>
                  <el-option label="大型车" value="7203"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="计费方式">
                <el-select placeholder="请选择" v-model="addForm.dayNightConfig" style="width: 100%" @change="allDayChange">
                  <el-option label="全天" value="6501"></el-option>
                  <el-option label="白天/夜间" value="6502"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7" v-if="logic.isAllDay">
              <el-form-item label="白天时段">
                <el-col :span="9">
                  <el-form-item>
                    <el-time-picker v-model="addForm.dayStartMinute" style="width: 100%;" format="HH:mm"></el-time-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="1">-</el-col>
                <el-col :span="9">
                  <el-form-item>
                    <el-time-picker v-model="addForm.dayEndMinute" style="width: 100%;" format="HH:mm"></el-time-picker>
                  </el-form-item>
                </el-col>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="免费类型">
                <el-select placeholder="请选择" v-model="addForm.freeType" style="width: 100%"  @change="freeTypeonChange">
                  <el-option label="完全免费" value="4001"></el-option>
                  <el-option label="限时免费" value="4002"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" >
              <el-form-item label="免费时长">
                <el-input v-model="addForm.overTimeMinute" autocomplete="off" placeholder="分钟"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7" v-if="logic.isTimeLimit">
              <el-form-item label="时间限制">
                <el-input v-model="addForm.freeLimitTime" autocomplete="off" placeholder="分钟"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>
      <!-- 全天计费 -->
      <el-card style="margin-top: 10px;" v-if="!logic.isAllDay">
        <div slot="header">
          <span style="color: #409EFF; margin-right: 30px;">全天计费</span>
          <el-select placeholder="请选择" v-model="addForm.periodRuleAllDay" style="width: 10%" @change="periodChange('allday')">
            <el-option label="按时段" value="6301"></el-option>
            <el-option label="按时长" value="6302"></el-option>
          </el-select>
        </div>

        <el-form label-width="100px">
        <el-row>
          <el-col :span="3">
            <el-form-item label="计费补足">
              <template>
                <el-checkbox v-model="addForm.canBeTakenAllDay">启用</el-checkbox>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="天的定义" v-if="logic.isPeriodAllDay">
              <el-select placeholder="请选择" v-model="addForm.defineDay" style="width: 100%"  @change="defineDayChange">
                <el-option label="停车24小时" value="6101"></el-option>
                <el-option label="自定义时间" value="6102"></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="8" v-if="logic.isPeriodAllDay">
            <el-form-item label="自定义点">
              <template>
                <el-input v-model="addForm.defineDayOwn" autocomplete="off" placeholder="输入0到24之间的整数"></el-input>
              </template>
            </el-form-item>
          </el-col>

        </el-row>
        </el-form>

        <!-- 表格添加删除按钮 -->
        <vxe-toolbar style="align: right">
          <template v-slot:buttons>
            <vxe-button status="primary" @click="insertEventAllDayTable">新增</vxe-button>
          </template>
        </vxe-toolbar>

         <!-- 全天计费-按时长 -->
        <vxe-table
          border
          resizable
          ref="allDayTimeLongfRef" :data="allDaytableData"
          :edit-config="{trigger: 'click', mode: 'cell'}" v-if="logic.isPeriodAllDay">
          <vxe-table-column field="beginMinute" title="开始时间(小时)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
          <vxe-table-column field="endMinute" title="结束时间(小时)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
          <vxe-table-column field="unitMinute" title="单位时间(分钟)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
          <vxe-table-column field="unitPrice" title="单位费用" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>

          <vxe-table-column title="操作" width="80">
            <template v-slot="{ row }">
              <vxe-button @click="deleteEventAllDayTable(row)" status="danger">删除</vxe-button>
            </template>
          </vxe-table-column>

        </vxe-table>

        <!-- 全天计费按时段 -->
        <vxe-table
          border
          resizable
          ref="allDayTimePeriodfRef" :data="allDaytableDataPeriod"
          :edit-config="{trigger: 'click', mode: 'cell'}" v-if="!logic.isPeriodAllDay">
          <vxe-table-column field="beginMinute" title="开始时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
          <vxe-table-column field="endMinute" title="结束时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
          <vxe-table-column field="unitMinute" title="单位时间(分钟)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
          <vxe-table-column field="unitPrice" title="单位费用" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>

          <vxe-table-column title="操作" width="80">
            <template v-slot="{ row }">
              <vxe-button @click="deleteEventAllDayTable(row)" status="danger">删除</vxe-button>
            </template>
          </vxe-table-column>

        </vxe-table>

      </el-card>

      <!-- 白天夜间计费 -->
      <el-card style="margin-top: 10px;" v-if="logic.isAllDay">
        <div slot="header">
          <span style="color: #409EFF;">白天/夜间</span>
        </div>

        <el-form label-width="100px">
        <el-row>
          <el-col :span="5">
            <el-form-item label="免费有效">
              <template>
                <el-checkbox v-model="addForm.freeDay">白天</el-checkbox>
                <el-checkbox v-model="addForm.freeNight">夜间</el-checkbox>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="5">
            <el-form-item label="计费补足">
              <template>
                <el-checkbox v-model="addForm.canBeTakenDay">白天</el-checkbox>
                <el-checkbox v-model="addForm.canBeTakenNight">夜间</el-checkbox>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="补足上限">
              <el-input v-model="addForm.canBeTakenLimit" autocomplete="off" type="number"></el-input>
            </el-form-item>
          </el-col>

        </el-row>
        <el-row>
          <el-col :span="6">
            <el-form-item label="天的定义">
              <el-select placeholder="请选择" v-model="addForm.defineDay" style="width: 100%"  @change="defineDayChange">
                <el-option label="停车24小时" value="6101"></el-option>
                <el-option label="自定义时间" value="6102"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="自定义点">
              <template>
                <el-input v-model="addForm.defineDayOwn" autocomplete="off" placeholder="输入0到24之间的整数"></el-input>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
        </el-form>

        <!-- 白天计费 -->
        <el-card style="margin-top: 10px;">
          <div slot="header">
            <span style="color: #F56C6C; margin-right: 30px;">白天计费</span>
            <el-select placeholder="请选择" v-model="addForm.periodRuleDay" style="width: 10%"  @change="periodChange('day')">
              <el-option label="按时段" value="6301"></el-option>
              <el-option label="按时长" value="6302"></el-option>
            </el-select>
          </div>

          <!-- 表格添加删除按钮 -->
          <vxe-toolbar style="align: right">
            <template v-slot:buttons>
              <vxe-button status="primary" @click="insertEventDayTable">新增</vxe-button>
            </template>
          </vxe-toolbar>

          <!-- 白天计费-按时长 -->
          <vxe-table
            border
            resizable
            ref="btAshctableRef" :data="btAshctableData"
            :edit-config="{trigger: 'click', mode: 'cell'}" v-if="logic.isPeriodDay">
            <vxe-table-column field="beginMinute" title="开始时间(小时)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="endMinute" title="结束时间(小时)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="unitMinute" title="单位时间(分钟)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="unitPrice" title="单位费用" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>

            <vxe-table-column title="操作" width="80">
              <template v-slot="{ row }">
                <vxe-button @click="deleteEventDayTable(row)" status="danger">删除</vxe-button>
              </template>
            </vxe-table-column>

          </vxe-table>

          <!-- 白天计费--按时段 -->
          <vxe-table
            border
            resizable
            ref="btAshdtableRef" :data="btAshdtableData"
            :edit-config="{trigger: 'click', mode: 'cell'}" v-if="!logic.isPeriodDay">
            <vxe-table-column field="beginMinute" title="开始时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
            <vxe-table-column field="endMinute" title="结束时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
            <vxe-table-column field="unitMinute" title="单位时间(分钟)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="unitPrice" title="单位费用" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>

            <vxe-table-column title="操作" width="80">
              <template v-slot="{ row }">
                <vxe-button @click="deleteEventDayTable(row)" status="danger">删除</vxe-button>
              </template>
            </vxe-table-column>

          </vxe-table>

        </el-card>

        <!-- 夜间计费 -->
        <el-card style="margin-top: 10px;">
          <div slot="header">
            <span style="color: #F56C6C; margin-right: 30px;">夜间计费</span>
            <el-select placeholder="请选择" v-model="addForm.periodRuleNight" style="width: 10%" @change="periodChange('night')">
              <el-option label="按时段" value="6301"></el-option>
              <el-option label="按时长" value="6302"></el-option>
            </el-select>
          </div>

          <!-- 表格添加删除按钮 -->
          <vxe-toolbar style="align: right">
            <template v-slot:buttons>
              <vxe-button status="primary" @click="insertEventNightTable">新增</vxe-button>
              <vxe-button status="danger" @click="deleteEventNightTable">删除</vxe-button>
            </template>
          </vxe-toolbar>

           <!-- 夜间计费-按时长 -->
          <vxe-table
            border
            resizable
            ref="yjAshctableRef" :data="yjAshctableData"
            :edit-config="{trigger: 'click', mode: 'cell'}" v-if="logic.isPeriodNight">
            <vxe-table-column field="beginMinute" title="开始时间(小时)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="endMinute" title="结束时间(小时)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="unitMinute" title="单位时间(分钟)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="unitPrice" title="单位费用" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>

            <vxe-table-column title="操作" width="80">
              <template v-slot="{ row }">
                <vxe-button @click="deleteEventNightTable(row)" status="danger">删除</vxe-button>
              </template>
            </vxe-table-column>

          </vxe-table>

          <!-- 夜间计费--按时段 -->
          <vxe-table
            border
            resizable
            ref="yjAshdtableRef" :data="yjAshdtableData"
            :edit-config="{trigger: 'click', mode: 'cell'}" v-if="!logic.isPeriodNight">
            <vxe-table-column field="beginMinute" title="开始时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
            <vxe-table-column field="endMinute" title="结束时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
            <vxe-table-column field="unitMinute" title="单位时间(分钟)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
            <vxe-table-column field="unitPrice" title="单位费用" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>

            <vxe-table-column title="操作" width="80">
              <template v-slot="{ row }">
                <vxe-button @click="deleteEventNightTable(row)" status="danger">删除</vxe-button>
              </template>
            </vxe-table-column>

          </vxe-table>

        </el-card>
      </el-card>

      <!-- 免费时段 -->
      <el-card style="margin-top: 10px;">
        <div slot="header">
          <span style="color: #409EFF;">免费时段</span>
        </div>

        <!-- 免费时段表格操作工具栏 -->
        <vxe-toolbar style="align: right">
          <template v-slot:buttons>
            <vxe-button status="primary" @click="insertEventMfsdTable">新增</vxe-button>
          </template>
        </vxe-toolbar>

        <!-- 免费时段表格 -->
        <vxe-table
          border
          resizable
          ref="mfsdTableRef" :data="mfsdDataTable"
          :edit-config="{trigger: 'click', mode: 'cell'}">
          <vxe-table-column field="beginMinute" title="开始时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
          <vxe-table-column field="endMinute" title="结束时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>

          <vxe-table-column title="操作" width="80">
            <template v-slot="{ row }">
              <vxe-button @click="deleteEventMfsdTable(row)" status="danger">删除</vxe-button>
            </template>
          </vxe-table-column>

        </vxe-table>

      </el-card>

      <!-- 附加规则 -->
      <el-card style="margin-top: 10px;">
        <div slot="header">
          <span style="color: #409EFF;">附加规则</span>
        </div>

        <el-form label-width="150px">
        <el-row>
          <el-col :span="8">
            <el-form-item label="时段内有效分钟数">
              <el-input v-model="addForm.validParkMinutes" autocomplete="off" type="number"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="附加收费">
              <el-input v-model="addForm.attachMoney" autocomplete="off" type="number"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        </el-form>

        <!-- 附加规则表格操作工具栏 -->
        <vxe-toolbar style="align: right">
          <template v-slot:buttons>
            <vxe-button status="primary" @click="insertEventFjgzTable">新增</vxe-button>
          </template>
        </vxe-toolbar>

        <!-- 附加规则表格 -->
        <vxe-table
          border
          resizable
          ref="fjgzTableRef" :data="fjgzDataTable"
          :edit-config="{trigger: 'click', mode: 'cell'}">
          <vxe-table-column field="beginMinute" title="开始时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
          <vxe-table-column field="endMinute" title="结束时间" :edit-render="{name: '$input', props: {type: 'time',editable: false}}"></vxe-table-column>
          <vxe-table-column field="unitMinute" title="单位时间(分钟)" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>
          <vxe-table-column field="unitPrice" title="单位费用" :edit-render="{name: '$input', props: {type: 'number'}}"></vxe-table-column>

          <vxe-table-column title="操作" width="80">
            <template v-slot="{ row }">
              <vxe-button @click="deleteEventFjgzTable(row)" status="danger">删除</vxe-button>
            </template>
          </vxe-table-column>

        </vxe-table>

      </el-card>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRule">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { parseTimeToMinute, parseMinuteToTime } from '../../utils/utils'

export default {
  data () {
    return {
      logic: {
        isAllDay: false, // 全天/白天夜间切换逻辑控制
        isTimeLimit: false, // 免费类型下拉控制
        isPeriodAllDay: true, // 全天计费时，按时段、按市场切换控制
        is24hourDay: false// 自定义点控制
      },
      addDialogVisible: false, // 控制添加窗口显示
      dataList: [], // 查询数据
      // 查询条件
      queryInfo: {

      },
      addForm: {
        nid: '', // 编辑时的ID号
        policyName: '', // 规则名称
        referCharge: '', // 参考价格
        plateType: '-1', // 车牌类型
        dayNightConfig: '6501', // 计费方式
        freeType: '4001', // 免费类型
        overTimeMinute: '', // 免费时长
        freeLimitTime: '', // 时间限制
        maxCharge: '', // 收费限额
        dayStartMinute: new Date(new Date().setHours(7, 0, 0, 0)), // 白天开始
        dayEndMinute: new Date(new Date().setHours(19, 0, 0, 0)), // 白天结束
        validParkMinutes: 0, // 附加规则有效分钟数
        attachMoney: 0, // 附加费用
        freeDay: false, // 白天免费有效
        freeNight: false, // 夜间免费有效
        canBeTakenDay: false, // 白天计费补足
        canBeTakenNight: false, // 夜间计费补足
        canBeTakenAllDay: false, // 全天计费补足
        canBeTakenLimit: '', // 补足上线
        defineDay: '6101', // 天的定义
        defineDayOwn: '', // 自定义点
        // defineDayOwnDn: '', // 自定义点（白天夜间）
        periodRuleAllDay: '6302', // 按时段全天
        periodRuleDay: '6302', // 按时段白天
        periodRuleNight: '6302' // 按时段夜间
      },
      // 关闭的时候，初始化
      addForm1: {
        nid: '', // 编辑时的ID号
        policyName: '', // 规则名称
        referCharge: '', // 参考价格
        plateType: '-1', // 车牌类型
        dayNightConfig: '6501', // 计费方式
        freeType: '4001', // 免费类型
        overTimeMinute: '', // 免费时长
        freeLimitTime: '', // 时间限制
        maxCharge: '', // 收费限额
        dayStartMinute: new Date(new Date().setHours(7, 0, 0, 0)), // 白天开始
        dayEndMinute: new Date(new Date().setHours(19, 0, 0, 0)), // 白天结束
        validParkMinutes: 0, // 附加规则有效分钟数
        attachMoney: 0, // 附加费用
        freeDay: false, // 白天免费有效
        freeNight: false, // 夜间免费有效
        canBeTakenDay: false, // 白天计费补足
        canBeTakenNight: false, // 夜间计费补足
        canBeTakenAllDay: false, // 全天计费补足
        canBeTakenLimit: '', // 补足上线
        defineDay: '6101', // 天的定义
        defineDayOwn: '', // 自定义点
        // defineDayOwnDn: '', // 自定义点（白天夜间）
        periodRuleAllDay: '6302', // 按时段全天
        periodRuleDay: '6302', // 按时段白天
        periodRuleNight: '6302' // 按时段夜间
      },
      addFormRules: {
        // userid: [
        //   { required: true, message: '请输入登录账号', trigger: 'blur' },
        //   { min: 3, max: 18, message: '长度在 3 到 18 个字符', trigger: 'blur' }
        // ],
        // password: [
        //   { required: true, message: '请输入登录密码', trigger: 'blur' },
        //   { min: 3, max: 16, message: '长度在 1 到 16 个字符', trigger: 'blur' }
        // ],
        // username: [
        //   { required: true, message: '请输入用户名称', trigger: 'blur' },
        //   { min: 1, max: 10, message: '长度在 3 到 10 个汉字', trigger: 'blur' }
        // ],
        // description: [
        //   { min: 0, max: 10, message: '小于100字', trigger: 'blur' }
        // ]
      },
      item: {}, // 计费规则配置
      // 计费规则配置子信息
      config_template: {
        freeTimeSections: [],
        freeTimeConfig: null,
        borrowTimeConfig: {},
        dayNightConfig: {},
        loopConfig: null,
        limitCharge: 0,
        attachRule: null
      },
      // 全天计费按时长表格
      allDaytableData: [],
      // 全天计费按时段表格
      allDaytableDataPeriod: [],
      // 白天按时长表格
      btAshctableData: [],
      // 白天按时段
      btAshdtableData: [],
      // 夜间按时段表格
      yjAshctableData: [],
      // 夜间按时段
      yjAshdtableData: [],
      // 免费时段表格
      mfsdDataTable: [
        // { beginMinute: '00:00:00', endMinute: '01:00:00' },
        // { beginMinute: '10:00:00', endMinute: '11:00:00' }
      ],
      // 附加规则表格
      fjgzDataTable: []

    }
  },
  created () {
    // 进入页面数据查询
    this.queryRuleList()
  },
  methods: {
    // 控制添加窗口的显示与关闭
    showAddDialogVisible () {
      this.addDialogVisible = true
    },
    // 添加窗口关闭
    addDialogClose () {
      // 还原初始数据
      this.addForm = this.addForm1
      this.mfsdDataTable = []
      this.item = {}
      this.config_template = {
        freeTimeSections: [],
        freeTimeConfig: null,
        borrowTimeConfig: {},
        dayNightConfig: {},
        loopConfig: null,
        limitCharge: 0,
        attachRule: null
      }
      // 全天计费按时长表格
      this.allDaytableData = []
      // 全天计费按时段表格
      this.allDaytableDataPeriod = []
      // 白天按时长表格
      this.btAshctableData = []
      // 白天按时段
      this.btAshdtableData = []
      // 夜间按时段表格
      this.yjAshctableData = []
      // 夜间按时段
      this.yjAshdtableData = []
      // 免费时段表格
      this.mfsdDataTable = []
      // 附加规则表格
      this.fjgzDataTable = []
      this.addDialogVisible = false

      this.addForm.dayStartMinute = new Date(new Date().setHours(7, 0, 0, 0))
      this.addForm.dayEndMinute = new Date(new Date().setHours(19, 0, 0, 0))
    },
    // 计费规则列表
    async queryRuleList () {
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'queryRuleList', {

      })
      // console.log(res)
      if (res.code === '0') {
      // 查询成功，设置数据
        this.dataList = res.data
      } else {
        return this.$message.error(res.message)
      }
    },
    // 选择全天计费还是白天/夜间
    allDayChange () {
      if (this.addForm.dayNightConfig === '6501') { // 全天计费
        this.logic.isAllDay = false
      } else { // 白天/夜间计费
        this.logic.isAllDay = true
        this.periodChange('day')
        this.periodChange('night')
      }
    },
    // 免费类型切换
    freeTypeonChange () {
      if (this.addForm.freeType === '4001') {
        this.logic.isTimeLimit = false
      } else {
        this.logic.isTimeLimit = true
      }
    },
    // 时段时长切换
    periodChange (flag) {
      if (flag === 'allday') {
        if (this.addForm.periodRuleAllDay === '6301') {
          // this.allDytableData = []
          this.logic.isPeriodAllDay = false
        } else {
          //  this.allDytableData = []
          this.logic.isPeriodAllDay = true
        }
      }
      if (flag === 'day') {
        if (this.addForm.periodRuleDay === '6301') {
          this.logic.isPeriodDay = false
        } else {
          this.logic.isPeriodDay = true
        }
      }
      if (flag === 'night') {
        if (this.addForm.periodRuleNight === '6301') {
          this.logic.isPeriodNight = false
        } else {
          this.logic.isPeriodNight = true
        }
      }
    },

    // 全天计费，添加一行
    async insertEventAllDayTable () {
      const row = -1
      const record = {
        beginMinute: '', endMinute: '', unitMinute: '', unitPrice: ''
      }
      if (this.addForm.periodRuleAllDay === '6302') {
        const { row: newRow } = await this.$refs.allDayTimeLongfRef.insertAt(record, row)
        await this.$refs.allDayTimeLongfRef.setActiveCell(newRow, 'beginMinute')
        this.allDaytableData.push(record)
      } else {
        const { row: newRow } = await this.$refs.allDayTimePeriodfRef.insertAt(record, row)
        await this.$refs.allDayTimePeriodfRef.setActiveCell(newRow, 'beginMinute')
        this.allDaytableDataPeriod.push(record)
      }
    },
    // 全天计费删除选中行
    deleteEventAllDayTable (row) {
      if (this.addForm.periodRuleAllDay === '6302') {
        this.allDaytableData.splice(this.$refs.allDayTimeLongfRef.getRowIndex(row), 1)
        this.$refs.allDayTimeLongfRef.removeCheckboxRow()
      } else {
        this.allDaytableDataPeriod.splice(this.$refs.allDayTimePeriodfRef.getRowIndex(row), 1)
        this.$refs.allDayTimePeriodfRef.removeCheckboxRow()
      }
    },
    // 白天计费，添加一行
    async insertEventDayTable () {
      const row = -1
      const record = {
        beginMinute: '', endMinute: '', unitMinute: '', unitPrice: ''
      }
      if (this.addForm.periodRuleDay === '6302') {
        const { row: newRow } = await this.$refs.btAshctableRef.insertAt(record, row)
        await this.$refs.btAshctableRef.setActiveCell(newRow, 'beginMinute')
        this.btAshctableData.push(record)
      } else {
        const { row: newRow } = await this.$refs.btAshdtableRef.insertAt(record, row)
        await this.$refs.btAshdtableRef.setActiveCell(newRow, 'beginMinute')
        this.btAshdtableData.push(record)
      }
    },
    // 白天计费删除选中行
    deleteEventDayTable (row) {
      if (this.addForm.periodRuleDay === '6302') {
        this.btAshctableData.splice(this.$refs.btAshctableRef.getRowIndex(row), 1)
        this.$refs.btAshctableRef.removeCheckboxRow()
      } else {
        this.btAshdtableData.splice(this.$refs.btAshdtableRef.getRowIndex(row), 1)
        this.$refs.btAshdtableRef.removeCheckboxRow()
      }
    },
    // 夜间计费，添加一行
    async insertEventNightTable () {
      const row = -1
      const record = {
        beginMinute: '', endMinute: '', unitMinute: '', unitPrice: ''
      }
      if (this.addForm.periodRuleNight === '6302') {
        const { row: newRow } = await this.$refs.yjAshctableRef.insertAt(record, row)
        await this.$refs.yjAshctableRef.setActiveCell(newRow, 'beginMinute')
        this.yjAshctableData.push(record)
      } else {
        const { row: newRow } = await this.$refs.yjAshdtableRef.insertAt(record, row)
        await this.$refs.yjAshdtableRef.setActiveCell(newRow, 'beginMinute')
        this.yjAshdtableData.push(record)
      }
    },
    // 夜间计费删除选中行
    deleteEventNightTable (row) {
      if (this.addForm.periodRuleNight === '6302') {
        this.yjAshctableData.splice(this.$refs.yjAshctableRef.getRowIndex(row), 1)
        this.$refs.yjAshctableRef.removeCheckboxRow()
      } else {
        this.yjAshdtableData.splice(this.$refs.yjAshdtableRef.getRowIndex(row), 1)
        this.$refs.yjAshdtableRef.removeCheckboxRow()
      }
    },
    // 免费时段，添加一行
    async insertEventMfsdTable () {
      const row = -1
      const record = {
        beginMinute: '', endMinute: ''
      }
      const { row: newRow } = await this.$refs.mfsdTableRef.insertAt(record, row)
      await this.$refs.mfsdTableRef.setActiveCell(newRow, 'beginMinute')
      this.mfsdDataTable.push(record)
    },
    // 免费时段删除选中行
    deleteEventMfsdTable (row) {
      this.mfsdDataTable.splice(this.$refs.mfsdTableRef.getRowIndex(row), 1)
      this.$refs.mfsdTableRef.removeCurrentRow(row)
    },
    // 附加规则表格，添加一行
    async insertEventFjgzTable () {
      const row = -1
      const record = {
        beginMinute: '', endMinute: '', unitMinute: '', unitPrice: ''
      }
      const { row: newRow } = await this.$refs.fjgzTableRef.insertAt(record, row)
      await this.$refs.fjgzTableRef.setActiveCell(newRow, 'beginMinute')
      this.fjgzDataTable.push(record)
    },
    // 附加规则表格，删除选中行
    deleteEventFjgzTable (row) {
      this.fjgzDataTable.splice(this.$refs.fjgzTableRef.getRowIndex(row), 1)
      this.$refs.fjgzTableRef.removeCheckboxRow()
    },
    // 天的定义，下拉切换
    defineDayChange () {
      if (this.addForm.defineDay === '6101') {
        this.logic.is24hourDay = false
      } else {
        this.logic.is24hourDay = true
      }
    },

    // 保存规则
    async saveRule () {
      // 策略主键
      this.item.nid = this.addForm.nid
      // 策略名称
      if (this.addForm.policyName === '') {
        return this.$message.error('规则名称不能为空')
      }
      this.item.policyName = this.addForm.policyName

      // 参考价格
      this.item.referCost = this.addForm.referCharge
      // 车牌类型
      this.item.plateType = this.addForm.plateType
      // 具体配置信息
      this.item.configTemplate = this.config_template
      this.item.description = ''

      // 收费限额
      if (this.addForm.maxCharge === '') {
        return this.$message.error('收费限额不能为空')
      }
      this.item.configTemplate.limitCharge = parseFloat(this.addForm.maxCharge)

      // 免费时段
      if (this.mfsdDataTable.length > 0) {
        this.mfsdDataTable.map(obj => {
          if (obj.beginMinute !== '' && obj.endMinute !== '') {
            // console.log(JSON.stringify(obj))
            const freeSectionObj = {
              beginMinute: parseTimeToMinute(obj.beginMinute),
              endMinute: parseTimeToMinute(obj.endMinute)
            }
            this.item.configTemplate.freeTimeSections.push(freeSectionObj)
          }
        })
      }

      // 免费相关配置
      const overTimeMinute = this.addForm.overTimeMinute === '' ? 0 : this.addForm.overTimeMinute
      this.item.configTemplate.freeTimeConfig = {
        freeTime: parseInt(overTimeMinute),
        freeMode: this.addForm.freeType
      }
      if (this.addForm.freeType === '4002') { // 限时免费
        const freeLimitTime = this.addForm.freeLimitTime === '' ? 0 : this.addForm.freeLimitTime
        this.item.configTemplate.freeTimeConfig.freeLimitTime = freeLimitTime
      }

      if (this.addForm.dayNightConfig === '6501') { // 全天收费
        this.item.configTemplate.freeTimeConfig.allDayAvailable = true
      } else { // 白天夜间
        this.item.configTemplate.freeTimeConfig.dayAvailable = this.addForm.freeDay
        this.item.configTemplate.freeTimeConfig.nightAvailable = this.addForm.freeNight
      }

      // 借时间配置
      if (this.addForm.dayNightConfig === '6501') { // 全天收费
        this.item.configTemplate.borrowTimeConfig.allDayTimeCanBeTaken = this.addForm.canBeTakenAllDay
      } else { // 白天夜间
        const canBeTakenLimit = this.addForm.canBeTakenLimit === '' ? 0 : this.addForm.canBeTakenLimit
        this.item.configTemplate.borrowTimeConfig.timeLimit = parseInt(canBeTakenLimit)
        this.item.configTemplate.borrowTimeConfig.dayTimeCanBeTaken = this.addForm.canBeTakenDay
        this.item.configTemplate.borrowTimeConfig.nightTimeCanBeTaken = this.addForm.canBeTakenNight
      }

      // 全天，白天/夜间配置
      this.item.configTemplate.dayNightConfig = {
        type: this.addForm.dayNightConfig
      }
      // 全天计费
      if (this.addForm.dayNightConfig === '6501') {
        this.item.configTemplate.dayNightConfig.allDayChargeConfig = {}
        this.item.configTemplate.dayNightConfig.allDayChargeConfig.type = this.addForm.periodRuleAllDay// 计费方式是时长还是时段
        // 获取全天计费是按时段还是按时长
        if (this.addForm.periodRuleAllDay === '6301') {
          this.item.configTemplate.dayNightConfig.allDayChargeConfig.periodRule = this.dayNightDatagrid(this.addForm.periodRuleAllDay, 'allday')
        } else { // 按时长
          this.item.configTemplate.dayNightConfig.allDayChargeConfig.duractionRule = this.dayNightDatagrid(this.addForm.periodRuleAllDay, 'allday')
        }
      } else if (this.addForm.dayNightConfig === '6502') { // 白天/夜间计费方式
        // 添加白天时段
        this.item.configTemplate.dayNightConfig.dayInterval = {
          beginMinute: this.addForm.dayStartMinute.getHours() * 60 + this.addForm.dayStartMinute.getMinutes(),
          endMinute: this.addForm.dayEndMinute.getHours() * 60 + this.addForm.dayEndMinute.getMinutes()
        }
        // 白天计费
        this.item.configTemplate.dayNightConfig.dayChargeConfig = {}
        this.item.configTemplate.dayNightConfig.dayChargeConfig.type = this.addForm.periodRuleDay// 白天时段时长类型
        if (this.addForm.periodRuleDay === '6301') {
          this.item.configTemplate.dayNightConfig.dayChargeConfig.periodRule = this.dayNightDatagrid(this.addForm.periodRuleDay, 'day')
        } else {
          this.item.configTemplate.dayNightConfig.dayChargeConfig.duractionRule = this.dayNightDatagrid(this.addForm.periodRuleDay, 'day')
        }
        // 夜间计费
        this.item.configTemplate.dayNightConfig.nightChargeConfig = {}
        this.item.configTemplate.dayNightConfig.nightChargeConfig.type = this.addForm.periodRuleNight// 夜间时段时长类型
        if (this.addForm.periodRuleNight === '6301') {
          this.item.configTemplate.dayNightConfig.nightChargeConfig.periodRule = this.dayNightDatagrid(this.addForm.periodRuleNight, 'night')
        } else {
          this.item.configTemplate.dayNightConfig.nightChargeConfig.duractionRule = this.dayNightDatagrid(this.addForm.periodRuleNight, 'night')
        }
      }

      // 天的定义
      // if (this.addForm.dayNightConfig === '6501') {
      //   const loopType = this.addForm.defineDay
      //   this.item.configTemplate.loopConfig = { loopType: loopType }
      //   if (loopType === '6102') {
      //     this.item.configTemplate.loopConfig.customPoint = this.addForm.defineDayOwn === '' ? 0 : this.addForm.defineDayOwn
      //   }
      // } else {
      //   this.item.configTemplate.loopConfig = { loopType: '6102' }
      //   this.item.configTemplate.loopConfig.customPoint = this.addForm.defineDayOwnDn === '' ? 0 : this.addForm.defineDayOwnDn
      // }
      const loopType = this.addForm.defineDay
      this.item.configTemplate.loopConfig = { loopType: loopType }
      if (loopType === '6102') {
        this.item.configTemplate.loopConfig.customPoint = this.addForm.defineDayOwn === '' ? 0 : this.addForm.defineDayOwn
      } else {
        this.item.configTemplate.loopConfig.customPoint = 0
      }

      // 附加规则
      this.item.configTemplate.attachRule = {
        attachMoney: parseInt(this.addForm.attachMoney),
        attachPeriod: {
          validParkMinutes: this.addForm.validParkMinutes,
          periods: []
        }
      }
      // 添加特殊时段表格数据
      if (this.fjgzDataTable.length > 0) {
        this.fjgzDataTable.map(obj => {
          // 所有数据都不为空方可
          if (obj.beginMinute !== '' && obj.endMinute !== '' && obj.unitMinute !== '' && obj.unitPrice) {
            // console.log(JSON.stringify(obj))
            const feeSectionObj = {
              beginMinute: parseTimeToMinute(obj.beginMinute),
              endMinute: parseTimeToMinute(obj.endMinute),
              unitPrice: parseFloat(obj.unitPrice),
              unitMinute: parseInt(obj.unitMinute)
            }
            this.item.attachRule.attachPeriod.periods.push(feeSectionObj)
          }
        })
      }

      // console.log('计费规则：' + JSON.stringify(this.item))
      // 保存计费规则
      const { data: res } = await this.$http.post(this.$store.state.baseUrl + 'saveChargePolicy', this.item)
      // console.log(res)
      if (res.code === '0') {
        // 添加成功
        this.$message.success(res.message)
        this.addDialogClose()
        this.queryRuleList()
      } else {
        return this.$message.error(res.message)
      }
    },

    // 计费规则保存，时段时长解析工具函数
    dayNightDatagrid (type, flag) { // type，时段、时长 flag，全天、白天夜间
      let tabledata = []
      const tableConfig = []
      if (type === '6301') { // 按时段
        if (flag === 'allday') {
          tabledata = this.allDaytableDataPeriod// 全天计费按时段
        } else if (flag === 'day') { // 白天计费按时段
          tabledata = this.btAshdtableData
        } else if (flag === 'night') { // 夜间计费按时段
          tabledata = this.yjAshdtableData
        }
      } else { // 按时长
        if (flag === 'allday') {
          tabledata = this.allDaytableData// 全天计费按时长
        } else if (flag === 'day') { // 白天计费按时长
          tabledata = this.btAshctableData
        } else if (flag === 'night') { // 夜间计费按时长
          tabledata = this.yjAshctableData
        }
      }
      // 循环tabledata,放入配置
      if (tabledata.length > 0) {
        tabledata.map(obj => {
          // 所有数据都不为空方可
          if (obj.beginMinute !== '' && obj.endMinute !== '' && obj.unitMinute !== '' && obj.unitPrice) {
            // console.log(JSON.stringify(obj))
            const feeSectionObj = {
              beginMinute: parseTimeToMinute(obj.beginMinute),
              endMinute: parseTimeToMinute(obj.endMinute),
              unitPrice: parseFloat(obj.unitPrice),
              unitMinute: parseInt(obj.unitMinute)
            }
            tableConfig.push(feeSectionObj)
          }
        })
      }
      return tableConfig
    },

    // 计费规则编辑框
    async editRule (row) {
      this.addForm.nid = row.nid
      this.addForm.policyName = row.policyName
      this.addForm.plateType = row.plateType
      this.addForm.referCharge = row.referCost
      // 配置模板
      const tmplate = row.configTemplate
      // console.log('计费规则串：' + JSON.stringify(tmplate))
      this.addForm.maxCharge = tmplate.limitCharge

      // 计费方式
      const dayNightConfig = tmplate.dayNightConfig.type
      this.addForm.dayNightConfig = dayNightConfig
      this.allDayChange()// 下拉规则切换

      // 免费配置
      const freeType = tmplate.freeTimeConfig.freeMode
      this.addForm.freeType = freeType
      this.freeTypeonChange()// 下拉规则切换，免费类型下拉，切换规则
      this.addForm.overTimeMinute = tmplate.freeTimeConfig.freeTime// 免费时间
      if (freeType === '4002') {
        this.addForm.freeLimitTime = tmplate.freeTimeConfig.freeLimitTime// 时间限制
      }

      if (dayNightConfig === '6501') { // 全天计费
        // 是否可借
        this.addForm.canBeTakenAllDay = tmplate.borrowTimeConfig.allDayTimeCanBeTaken
        // 天的定义
        this.addForm.defineDay = tmplate.loopConfig.loopType
        this.defineDayChange()// 执行下拉切换规则
        // console.log('aaa:' + tmplate.loopConfig.loopType)
        // console.log('bbbb:' + tmplate.loopConfig.customPoint)
        if (tmplate.loopConfig.loopType === '6102') { // 自定义点
          this.addForm.defineDayOwn = tmplate.loopConfig.customPoint
        }
        // 区分全天是按时段还是按时长
        const shsdtype = tmplate.dayNightConfig.allDayChargeConfig.type
        this.addForm.periodRuleAllDay = shsdtype
        this.periodChange('allday')// 下拉切换
        if (shsdtype === '6302') { // 按时长
          tmplate.dayNightConfig.allDayChargeConfig.duractionRule.map(obj => {
            const obj1 = {
              beginMinute: obj.beginMinute / 60,
              endMinute: obj.endMinute / 60,
              unitMinute: obj.unitMinute,
              unitPrice: obj.unitPrice
            }
            this.allDaytableData.push(obj1)
          })
        } else { // 按时段
          tmplate.dayNightConfig.allDayChargeConfig.periodRule(obj => {
            const obj1 = {
              beginMinute: parseMinuteToTime(obj.beginMinute),
              endMinute: parseMinuteToTime(obj.endMinute),
              unitMinute: obj.unitMinute,
              unitPrice: obj.unitPrice
            }
            this.allDaytableData.push(obj1)
          })
        }
      } else { // 白天夜间
        // 白天夜间免费配置
        this.addForm.freeDay = tmplate.freeTimeConfig.dayAvailable
        this.addForm.freeNight = tmplate.freeTimeConfig.nightAvailable
        // 借时配置
        this.addForm.canBeTakenDay = tmplate.borrowTimeConfig.dayTimeCanBeTaken
        this.addForm.canBeTakenNight = tmplate.borrowTimeConfig.nightTimeCanBeTaken
        this.addForm.canBeTakenLimit = tmplate.borrowTimeConfig.timeLimit
        // this.addForm.defineDayOwnDn = tmplate.loopConfig.customPoint
        this.addForm.defineDay = tmplate.loopConfig.loopType
        this.addForm.defineDayOwn = tmplate.loopConfig.customPoint

        // 白天定义
        const dayHour = tmplate.dayNightConfig.dayInterval.beginMinute / 60
        const dayMinute = tmplate.dayNightConfig.dayInterval.beginMinute % 60
        const nightHour = tmplate.dayNightConfig.dayInterval.endMinute / 60
        const nightMinute = tmplate.dayNightConfig.dayInterval.endMinute % 60
        this.addForm.dayStartMinute = new Date(new Date().setHours(dayHour, dayMinute, 0, 0))
        this.addForm.dayEndMinute = new Date(new Date().setHours(nightHour, nightMinute, 0, 0))

        // 白天规则
        const btscsdType = tmplate.dayNightConfig.dayChargeConfig.type
        this.addForm.periodRuleDay = btscsdType
        this.periodChange('day')// 下拉切换
        if (btscsdType === '6302') { // 按时长
          tmplate.dayNightConfig.dayChargeConfig.duractionRule.map(obj => {
            const obj1 = {
              beginMinute: obj.beginMinute / 60,
              endMinute: obj.endMinute / 60,
              unitMinute: obj.unitMinute,
              unitPrice: obj.unitPrice
            }
            this.btAshctableData.push(obj1)
          })
        } else { // 按时段
          tmplate.dayNightConfig.dayChargeConfig.periodRule.map(obj => {
            const obj1 = {
              beginMinute: parseMinuteToTime(obj.beginMinute),
              endMinute: parseMinuteToTime(obj.endMinute),
              unitMinute: obj.unitMinute,
              unitPrice: obj.unitPrice
            }
            this.btAshdtableData.push(obj1)
          })
        }

        // 夜间规则
        const yjscsdType = tmplate.dayNightConfig.nightChargeConfig.type
        this.addForm.periodRuleNight = yjscsdType
        this.periodChange('night')// 下拉切换
        if (yjscsdType === '6302') { // 按时长
          tmplate.dayNightConfig.nightChargeConfig.duractionRule.map(obj => {
            const obj1 = {
              beginMinute: obj.beginMinute / 60,
              endMinute: obj.endMinute / 60,
              unitMinute: obj.unitMinute,
              unitPrice: obj.unitPrice
            }
            this.yjAshctableData.push(obj1)
          })
        } else { // 按时段
          tmplate.dayNightConfig.nightChargeConfig.periodRule.map(obj => {
            const obj1 = {
              beginMinute: parseMinuteToTime(obj.beginMinute),
              endMinute: parseMinuteToTime(obj.endMinute),
              unitMinute: obj.unitMinute,
              unitPrice: obj.unitPrice
            }
            this.yjAshdtableData.push(obj1)
          })
        }
      }

      // 免费时段
      if (tmplate.freeTimeSections.length > 0) {
        tmplate.freeTimeSections.map(obj => {
          const obj1 = {
            beginMinute: parseMinuteToTime(obj.beginMinute),
            endMinute: parseMinuteToTime(obj.endMinute)
          }
          this.mfsdDataTable.push(obj1)
        })
      }

      // 附加规则
      this.addForm.attachMoney = tmplate.attachRule.attachMoney
      this.addForm.validParkMinutes = tmplate.attachRule.attachPeriod.validParkMinutes
      if (tmplate.attachRule.attachPeriod.periods.length > 0) {
        tmplate.attachRule.attachPeriod.periods.map(obj => {
          const obj1 = {
            beginMinute: parseMinuteToTime(obj.beginMinute),
            endMinute: parseMinuteToTime(obj.endMinute),
            unitMinute: obj.unitMinute,
            unitPrice: obj.unitPrice
          }
          this.fjgzDataTable.push(obj1)
        })
      }

      // 显示添加、编辑窗口
      this.addDialogVisible = true
    },

    // 删除计费规则
    async deleRule (row) {
      const nid = row.nid
      this.$confirm('是否删除该收费规则？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'deleteChargePolicy', {
          params: { nid: nid }
        })
        // console.log(res)
        if (res.code === '0') {
          this.queryRuleList()
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

  .container-rule{
    background-color:#f7f7f7;
    position: relative;
  }

</style>
