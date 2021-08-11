<template>
  <div class="container-main">
    <div class="cameraWrapper">
      <img
        :src="images.imageIn"
        class="video"
      />
      <el-card
        shadow="always"
        class="card"
      >
        <div slot="header">
          <el-select
            placeholder="请选择入口设备"
            v-model="equip.equipIn"
            @change="cameraChange('9')"
          >
            <el-option
              v-for="item in equip.equipInList"
              :key="item.devicecode"
              :label="item.devicename"
              :value="item.devicecode"
            >
            </el-option>
          </el-select>
          <el-button
            class="button-top"
            type="primary"
            @click="openGate('9')"
          >入口抬杆</el-button>
          <!-- <el-button style="float: right; padding: 10px 0; margin-right: 10px;" type="primary">刷新相机</el-button> -->
        </div>
        <el-form
          ref="form"
          label-width="100px"
          size="mini"
        >
          <el-form-item label="车牌号码：">
            <el-tag
              type="danger"
              class="label-content"
              effect="dark"
            >{{inOrder.plateNo}}</el-tag>
          </el-form-item>
          <el-form-item label="入场时间：">
            <el-tag
              type="danger"
              class="label-content"
              effect="dark"
            >{{inOrder.timeIn}}</el-tag>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    <div class="cameraWrapper">
      <img
        :src="images.imageOut"
        class="video"
      />
      <el-card
        shadow="always"
        class="card"
      >
        <div slot="header">
          <el-select
            placeholder="请选择出口设备"
            v-model="equip.equipOut"
            @change="cameraChange('10')"
          >
            <el-option
              v-for="item in equip.equipOutList"
              :key="item.devicecode"
              :label="item.devicename"
              :value="item.devicecode"
            >
            </el-option>
          </el-select>

          <el-button
            class="button-top"
            type="primary"
            @click="openGate('10')"
          >出口抬杆</el-button>
          <!-- <el-button style="float: right; padding: 10px 0; margin-right: 10px;" type="primary">刷新相机</el-button> -->
        </div>
        <el-form
          ref="form"
          label-width="100px"
          size="mini"
        >
          <el-form-item label="车牌信息：">
            <el-tag
              type="danger"
              class="label-content"
              style="margin-right: 20px;"
              effect="dark"
            >{{outOrder.plateNo}}</el-tag>
            <el-tag
              type="danger"
              class="label-content"
              effect="dark"
            >{{outOrder.plateType}}</el-tag>
          </el-form-item>
          <el-form-item label="出入时间：">
            <el-tag
              type="danger"
              class="label-content "
              style="margin-right: 20px;"
              effect="dark"
            >{{outOrder.timeIn}}</el-tag>
            <el-tag
              type="danger"
              class="label-content"
              style="margin-right: 20px;"
              effect="dark"
            >{{outOrder.timeOut}}</el-tag>
          </el-form-item>
          <el-form-item label="停车时长：">
            <el-tag
              type="danger"
              class="label-content"
              effect="dark"
            >{{outOrder.duration}}</el-tag>
          </el-form-item>
          <el-form-item label="停车费用：">
            <el-tag
              type="danger"
              class="label-content"
              style="margin-right: 20px;"
              effect="dark"
            >{{outOrder.payFee}}</el-tag>
          </el-form-item>
          <el-form-item label="支付方式：">
            <el-tag
              type="danger"
              class="label-content"
              effect="dark"
              style="margin-right: 30px;"
            >{{outOrder.payType}}</el-tag>
            <span v-if="this.$store.state.sysConfig.isShowSmFree">
              <el-checkbox
                v-model="checked1"
                :disabled="checked1Disable"
                label="免除第一天"
                border
                size="medium"
                @change="orderDiscount('first')"
              ></el-checkbox>
              <el-checkbox
                v-model="checked2"
                :disabled="checked2Disable"
                label="免除最后一天"
                border
                size="medium"
                @change="orderDiscount('last')"
              ></el-checkbox>
            </span>
          </el-form-item>
          <el-form-item size="medium">
            <el-button
              type="danger"
              :disabled="outOrder.btnClick"
              @click="endOrder('1')"
            >现金放行</el-button>
            <el-button
              type="danger"
              :disabled="outOrder.btnClick"
              @click="endOrder('0')"
            >免费放行</el-button>
            <el-button
              type="danger"
              @click="manaulRecognize()"
            >手动放行</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <el-dialog
      title="人工识别"
      :visible.sync="rgsbDialogVisible"
      width="40%"
      @close="rgsbDialogClose"
    >
      <div
        class="demo-image__placeholder"
        v-loading="loading"
      >
        <!-- <div class="block">
          <el-image :src=images.pic></el-image>
        </div> -->
        <el-form
          :model="rgForm"
          ref="rgFormRef"
          label-width="90px"
        >
          <el-form-item label="车牌号码：">
            <el-input
              v-model="rgForm.plateNo"
              autocomplete="off"
              style="width: 340px;"
            ></el-input>
          </el-form-item>
          <el-form-item label="车牌颜色：">
            <el-select
              placeholder="请选择"
              v-model="rgForm.licenceType"
              style="width: 340px;"
            >
              <el-option label="蓝牌" value="1"></el-option>
              <el-option label="新能源" value="19"></el-option>
              <el-option label="黄牌" value="3"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div class="plate-select-div">
          <div>
            <el-tag
            v-for="item in provicesItems"
            :key="item.label"
            :type="item.type"
            effect="dark" class="plate-select" @click=labelClick(item.label)>
              {{ item.label }}
            </el-tag>
          </div>
          <div>
            <el-tag
            v-for="item in letterItem"
            :key="item.label"
            :type="item.type"
            effect="dark" class="plate-select" @click=labelClick(item.label)>
              {{ item.label }}
            </el-tag>
          </div>
          <div>
            <el-tag
            v-for="item in numberItem"
            :key="item.label"
            :type="item.type"
            effect="dark" class="plate-select" @click=labelClick(item.label)>
              {{ item.label }}
            </el-tag>
          </div>
        </div>
      </div>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          type="default"
          @click="rgsbDialogClose"
        >取 消</el-button>
        <el-button
          type="warning"
          @click="deletePlateLetter('1')"
        >退 格</el-button>
        <el-button
          type="danger"
          @click="deletePlateLetter('2')"
        >清 空</el-button>
        <el-button
          type="primary"
          @click="rgsbUp"
        >确 定</el-button>
      </div>
    </el-dialog>

  </div>

</template>
<script>
import defaultImg from '@/assets/images/video.jpg'
import { getNumberOfDays, debounce } from '@/utils/utils'
export default {
  data () {
    return {
      provicesItems: [
        { type: '', label: '鲁' },
        { type: '', label: '京' },
        { type: '', label: '津' },
        { type: '', label: '沪' },
        { type: '', label: '渝' },
        { type: '', label: '冀' },
        { type: '', label: '豫' },
        { type: '', label: '云' },
        { type: '', label: '辽' },
        { type: '', label: '黑' },
        { type: '', label: '湘' },
        { type: '', label: '皖' },
        { type: '', label: '新' },
        { type: '', label: '苏' },
        { type: '', label: '浙' },
        { type: '', label: '赣' },
        { type: '', label: '鄂' },
        { type: '', label: '桂' },
        { type: '', label: '甘' },
        { type: '', label: '晋' },
        { type: '', label: '蒙' },
        { type: '', label: '陕' },
        { type: '', label: '吉' },
        { type: '', label: '闽' },
        { type: '', label: '贵' },
        { type: '', label: '粤' },
        { type: '', label: '青' },
        { type: '', label: '藏' },
        { type: '', label: '川' },
        { type: '', label: '宁' },
        { type: '', label: '琼' },
        { type: '', label: '警' }
      ],
      letterItem: [
        { type: '', label: 'L' },
        { type: '', label: 'A' },
        { type: '', label: 'B' },
        { type: '', label: 'C' },
        { type: '', label: 'D' },
        { type: '', label: 'E' },
        { type: '', label: 'F' },
        { type: '', label: 'G' },
        { type: '', label: 'H' },
        { type: '', label: 'I' },
        { type: '', label: 'J' },
        { type: '', label: 'K' },
        { type: '', label: 'M' },
        { type: '', label: 'N' },
        { type: '', label: 'O' },
        { type: '', label: 'P' },
        { type: '', label: 'Q' },
        { type: '', label: 'R' },
        { type: '', label: 'S' },
        { type: '', label: 'T' },
        { type: '', label: 'U' },
        { type: '', label: 'V' },
        { type: '', label: 'W' },
        { type: '', label: 'X' },
        { type: '', label: 'Y' },
        { type: '', label: 'Z' }
      ],
      numberItem: [
        { type: '', label: '0' },
        { type: '', label: '1' },
        { type: '', label: '2' },
        { type: '', label: '3' },
        { type: '', label: '4' },
        { type: '', label: '5' },
        { type: '', label: '6' },
        { type: '', label: '7' },
        { type: '', label: '8' },
        { type: '', label: '9' }
      ],
      myTimer: null, // 后台websocket连接心跳定时器
      isconnect: false, // 控制重连开关
      baseUrl: '',
      wsUrl: '',
      loading: false,
      rgsbDialogVisible: false,
      checked1: false,
      checked2: false,
      checked1Disable: true,
      checked2Disable: true,
      parkinggDays: 0,
      rgForm: {
        plateNo: '',
        licenceType: '1'
      },
      // 相机列表和当前打开的相机
      equip: {
        equipInList: [],
        equipOutList: [],
        equipIn: '',
        equipOut: ''
      },
      // 停车场websocket
      wsPark: null,
      // 相机websocket
      wsvideo: {
        wsIn: null,
        wsOut: null
      },
      // 相机默认背景图
      images: {
        imageIn: defaultImg,
        imageOut: defaultImg,
        pic: ''
      },
      // 入场订单
      inOrder: {
        orderNo: '',
        plateNo: '暂无数据',
        timeIn: '暂无数据'
      },
      // 离场订单
      outOrder: {
        btnClick: true,
        orderNo: '',
        plateNo: '暂无数据',
        timeIn: '暂无数据',
        timeOut: '暂无数据',
        payFee: '暂无数据',
        payFeeN: '',
        payType: '暂无数据',
        duration: '暂无数据',
        plateType: '暂无数据'
      }
    }
  },
  // 进入页面执行逻辑
  mounted () {
    this.baseUrl = this.$store.state.baseUrl // 请求base地址
    this.wsUrl = this.$store.state.wsUrl // 后台websocket地址
    // 数据初始化
    this.wsvideo.wsIn = null
    this.wsvideo.wsOut = null
    this.images.imageIn = defaultImg
    this.images.imageOut = defaultImg
    // 初始化相机
    this.initCamera()
    // 初始化停车场websocket
    this.createWebSocket()
    // 获取当前正要离场的订单，有可能获取不到
    this.getCurrentOrder()
  },
  // 页面离开关闭websocket
  beforeDestroy () {
    if (this.wsvideo.wsIn !== null) {
      this.wsvideo.wsIn.close()
    }
    if (this.wsvideo.wsOut !== null) {
      this.wsvideo.wsOut.close()
    }
    if (this.wsPark !== null) {
      this.wsPark.close()
    }
    this.destroyTimer()
  },
  methods: {
    // 页面进入初始化相机
    initCamera () {
      // 获取相机列表，读取vuex中的数据
      const equipList = this.$store.state.parkConfig.equipList
      // 相机按出、入口分类存入data
      equipList.map((item, index) => {
        if (item.videofunc === '9') {
          this.equip.equipInList.push(item)
        } else {
          this.equip.equipOutList.push(item)
        }
      })
      // 打开默认相机
      this.opneDefaultVedio()
    },

    // 现金抬杆或者免费放行
    // 添加防抖函数10s, 防止多次点击 mod by sq 20210630
    endOrder: debounce(async function (moneyFlag) {
      let money = 0
      let isFree = true
      if (moneyFlag === '1') {
        money = this.outOrder.payFeeN
        isFree = false
      }
      const userid = window.sessionStorage.getItem('userid')
      const { data: res } = await this.$http.get(
        this.baseUrl + 'opengatebyfee',
        {
          params: {
            fee: money,
            orderNo: this.outOrder.orderNo,
            isFree: isFree,
            userid: userid
          }
        }
      )
      if (res.code === '0') {
        this.$message.success(res.message)
        this.outOrder.btnClick = true
        if (this.$store.state.sysConfig.isShowSmFree) {
          this.checked1Disable = true
          this.checked2Disable = true
        }
      } else {
        return this.$message.error(res.message)
      }
    }, 10000),

    // 打开默认相机逻辑
    opneDefaultVedio () {
      let deviceCodeIn // 要打开的入口设备编号
      let deviceCodeOut // 要打开的出口设备编号
      // 先从localStorage中读取
      deviceCodeIn = window.localStorage.getItem('AUTO_OPEN_CAMERA_IN')
      deviceCodeOut = window.localStorage.getItem('AUTO_OPEN_CAMERA_OUT')
      // console.log('localStorage读取入口相机：' + deviceCodeIn)
      // console.log('localStorage读取出口相机：' + deviceCodeOut)
      // 没有本地缓存，默认打开第一个入口相机
      if (!deviceCodeIn) {
        if (this.equip.equipInList.length > 0) {
          deviceCodeIn = this.equip.equipInList[0].devicecode
        }
      }
      // 没有本地缓存，默认打开第一个出口相机
      if (!deviceCodeOut) {
        if (this.equip.equipOutList.length > 0) {
          deviceCodeOut = this.equip.equipOutList[0].devicecode
        }
      }
      // 入口相机默认打开逻辑
      if (deviceCodeIn) {
        // 获取相机ip
        let inIp = this.getEquipIp(deviceCodeIn, '9')
        // 没有获取到，说明设备不存在了，和现有设备不匹配，默认获取第一个设备IP
        if (inIp === '') {
          if (this.equip.equipInList.length > 0) {
            deviceCodeIn = this.equip.equipInList[0].devicecode
            inIp = this.getEquipIp(deviceCodeIn, '9')
            if (inIp !== '') {
              // 获取到IP打开相机，设置下拉
              this.equip.equipIn = deviceCodeIn
              this.opneVideo(deviceCodeIn, inIp + ':9080', '9')
            }
          }
        } else {
          // 获取到IP打开相机，设置下拉
          this.equip.equipIn = deviceCodeIn
          this.opneVideo(deviceCodeIn, inIp + ':9080', '9')
        }
      }
      // 出口相机默认打开逻辑
      if (deviceCodeOut) {
        // 获取相机ip
        let inIp = this.getEquipIp(deviceCodeOut, '10')
        // 没有获取到，说明设备不存在了，和现有设备不匹配，默认获取第一个设备IP
        if (inIp === '') {
          if (this.equip.equipOutList.length > 0) {
            deviceCodeOut = this.equip.equipOutList[0].devicecode
            inIp = this.getEquipIp(deviceCodeOut, '10')
            if (inIp !== '') {
              // 获取到IP打开相机，设置下拉
              this.equip.equipOut = deviceCodeOut
              this.opneVideo(deviceCodeOut, inIp + ':9080', '10')
            }
          }
        } else {
          // 获取到IP打开相机，设置下拉
          this.equip.equipOut = deviceCodeOut
          this.opneVideo(deviceCodeOut, inIp + ':9080', '10')
        }
      }
    },
    // 相机下拉变化
    cameraChange (direction) {
      let devicecode = ''
      if (direction === '9') {
        devicecode = this.equip.equipIn
      } else {
        devicecode = this.equip.equipOut
      }
      // console.log('设备编号：' + devicecode)
      const ip = this.getEquipIp(devicecode, direction)
      // console.log('设备IP：' + ip)
      if (ip !== '') {
        this.opneVideo(devicecode, ip + ':9080', direction)
      }
    },
    // 获取相机IP
    getEquipIp (devicecode, direction) {
      let ip = ''
      let deviceList = []
      if (direction === '9') {
        deviceList = this.equip.equipInList
      } else {
        deviceList = this.equip.equipOutList
      }
      deviceList.map((item, index) => {
        if (item.devicecode === devicecode) {
          ip = item.ip
        }
      })
      return ip
    },
    // 打开视频流
    opneVideo (devicecode, ipAddress, direction) {
      if (direction === '9') {
        if (this.wsvideo.wsIn !== null) {
          this.wsvideo.wsIn.close()
        }
        this.wsvideo.wsIn = new WebSocket('ws://' + ipAddress + '/ws')
        this.wsvideo.wsIn.onopen = function (event) {
          // 成功打开之后，存储localStorge
          window.localStorage.setItem('AUTO_OPEN_CAMERA_IN', devicecode)
        }
        const that = this
        that.wsvideo.wsIn.onmessage = function (event) {
          var reader = new FileReader()
          reader.onload = function (eve) {
            if (eve.target.readyState === FileReader.DONE) {
              that.images.imageIn = this.result
            }
          }
          reader.readAsDataURL(event.data)
        }
      } else {
        if (this.wsvideo.wsOut !== null) {
          this.wsvideo.wsOut.close()
        }
        this.wsvideo.wsOut = new WebSocket('ws://' + ipAddress + '/ws')
        this.wsvideo.wsOut.onopen = function (event) {
          // 成功打开之后，存储localStorge
          window.localStorage.setItem('AUTO_OPEN_CAMERA_OUT', devicecode)
        }
        const that = this
        that.wsvideo.wsOut.onmessage = function (event) {
          var reader = new FileReader()
          reader.onload = function (eve) {
            if (eve.target.readyState === FileReader.DONE) {
              that.images.imageOut = this.result
            }
          }
          reader.readAsDataURL(event.data)
        }
      }
    },
    // 打开websockt之后创建监听，接收消息推送
    initParkWs () {
      const that = this
      that.wsPark.onmessage = function (event) {
        // console.log(event.data)
        const res = JSON.parse(event.data)
        const messageType = res.messageType
        if (messageType === 'IN_MESSAGE') {
          // 驶入订单推送接收
          if (that.equip.equipIn === res.deviceCode) {
            // 判断是否是当前打开的入口摄像头
            that.inOrder.orderNo = res.orderNo
            that.inOrder.plateNo = res.plateNo
            that.inOrder.timeIn = res.timeIn
          }
        } else if (messageType === 'OUT_MESSAGE') {
          // 驶离订单推送接收
          if (that.equip.equipOut === res.deviceCode) {
            // 判断是否是当前打开的出口摄像头
            that.outOrder.orderNo = res.orderNo
            that.outOrder.plateNo = res.plateNo
            that.outOrder.timeIn = res.timeIn
            that.outOrder.timeOut = res.timeOut
            that.outOrder.payFee = res.payFee + ' 元'
            that.outOrder.payFeeN = res.payFee
            that.outOrder.payType = res.payType
            that.outOrder.plateType = res.plateType
            that.outOrder.duration = res.duration + ' 分钟'
            if (res.payFee > 0) {
              that.outOrder.btnClick = false
            }
            // 打折信息
            // console.log('=====' + that.$store.state.sysConfig.isShowSmFree)
            if (that.$store.state.sysConfig.isShowSmFree) {
              that.checked1Disable = true
              that.checked2Disable = true
              that.checked1 = false
              that.checked2 = false
              const days = getNumberOfDays(res.timeIn, res.timeOut)
              if (days === 1) {
                that.checked1Disable = false
                that.checked2Disable = false
                that.parkinggDays = 2
              } else if (days >= 2) {
                that.checked1Disable = false
                that.checked2Disable = false
                that.parkinggDays = 3
              }
              // console.log('inDay: ' + inDay + ' outDay: ' + outDay)
            }
          }
        } else if (messageType === 'PAY_MESSAGE') {
          // 支付订单推送接收
          if (that.equip.equipOut === res.deviceCode) {
            // 判断是否是当前打开的出口摄像头
            that.outOrder.orderNo = res.orderNo
            that.outOrder.plateNo = res.plateNo
            that.outOrder.timeIn = res.timeIn
            that.outOrder.timeOut = res.timeOut
            that.outOrder.payFee = res.payFee + ' 元'
            that.outOrder.payFeeN = res.payFee
            that.outOrder.payType = res.payType
            that.outOrder.plateType = res.plateType
            that.outOrder.duration = res.duration + ' 分钟'
            that.outOrder.btnClick = true
            if (that.$store.state.sysConfig.isShowSmFree) {
              that.checked1Disable = true
              that.checked2Disable = true
            }
          }
        }
      }
      that.wsPark.onclose = function (event) {
        // 监听到关闭之后，需要重连机制，没3秒重连一次，直至连上
        that.reconnectWs()
      }
    },
    // 创建websocket
    createWebSocket () {
      const that = this
      try {
        that.wsPark = new WebSocket(this.wsUrl)
        that.destroyTimer()
        that.initParkWs()
      } catch (e) {
        console.log('catch')
        that.reconnectWs()
      }
    },
    // ws重连机制
    reconnectWs () {
      var that = this
      if (that.isconnect) {
        return
      }
      that.isconnect = true
      this.myTimer = setInterval(function () {
        that.createWebSocket()
        that.isconnect = false
      }, 3000)
    },
    // 销毁定时器
    destroyTimer () {
      if (this.myTimer != null) {
        window.clearInterval(this.myTimer) // 出错删除定时器
      }
    },
    // 抬杆接口
    async openGate (direction) {
      let devicecode = ''
      if (direction === '9') {
        devicecode = this.equip.equipIn
      } else {
        devicecode = this.equip.equipOut
      }
      // console.log(devicecode)
      if (devicecode === '') return
      const userid = window.sessionStorage.getItem('userid')
      const { data: res } = await this.$http.get(this.baseUrl + 'controlgate', {
        params: { deviceNo: devicecode, userid: userid }
      })
      if (res.code === '0') {
        this.$message.success(res.message)
      } else {
        return this.$message.error(res.message)
      }
    },

    // 手动获取离场订单信息
    async getCurrentOrder () {
      const that = this
      // console.log(this.equip.equipOut)
      const { data: res } = await this.$http.get(
        this.baseUrl + 'getCurrentOrder',
        {
          params: { deviceNo: this.equip.equipOut }
        }
      )
      if (res.code === '0') {
        that.outOrder.orderNo = res.orderNo
        that.outOrder.plateNo = res.plateNo
        that.outOrder.timeIn = res.timeIn
        that.outOrder.timeOut = res.timeOut
        that.outOrder.payFee = res.payFee + ' 元'
        that.outOrder.payFeeN = res.payFee
        that.outOrder.payType = res.payType
        that.outOrder.plateType = res.plateType
        that.outOrder.duration = res.duration + ' 分钟'
        if (res.payFee > 0) {
          that.outOrder.btnClick = false
        }
        that.checked1Disable = true
        that.checked2Disable = true
        that.checked1 = false
        that.checked2 = false
        const days = getNumberOfDays(res.timeIn, res.timeOut)
        if (days === 1) {
          that.checked1Disable = false
          that.checked2Disable = false
          that.parkinggDays = 2
        } else if (days >= 2) {
          that.checked1Disable = false
          that.checked2Disable = false
          that.parkinggDays = 3
        }
      }
    },
    // 人工识别方法
    // 解决商场、其他地库出入口比较陡峭的通道，在车流量较大的时候，出口车辆未识别
    // 又无法倒车的情况下，需要岗亭工作人员，手动识别车辆信息，放行
    manaulRecognize () {
      // this.images.pic = 'http://' + pic
      this.rgForm.plateNo = ''
      this.rgsbDialogVisible = true
    },
    // 关闭订单图片窗口
    rgsbDialogClose () {
      this.images.pic = ''
      this.$refs.rgFormRef.resetFields()
      this.rgsbDialogVisible = false
    },
    // 更新费用打折信息
    async orderDiscount (day) {
      let flag = '0'
      if (day === 'first') {
        if (this.checked1) {
          flag = '1'
        }
        // 如果是停车两天，需要特殊处理
        if (this.parkinggDays === 2) {
          if (this.checked1) {
            // 选中
            this.checked2 = false
            this.checked2Disable = true
          } else {
            // 取消选中
            this.checked2 = false
            this.checked2Disable = false
          }
        }
      } else {
        if (this.checked2) {
          flag = '1'
        }
        // 如果是停车两天，需要特殊处理
        if (this.parkinggDays === 2) {
          if (this.checked2) {
            // 选中
            this.checked1 = false
            this.checked1Disable = true
          } else {
            // 取消选中
            this.checked1 = false
            this.checked1Disable = false
          }
        }
      }
      // console.log(day + '=====' + flag)
      const { data: res } = await this.$http.get(
        this.baseUrl + 'parkFeeDiscount',
        {
          params: { day: day, flag: flag, orderNo: this.outOrder.orderNo }
        }
      )
      if (res.code === '0') {
      }
    },

    // 输入车牌退格或者清空
    deletePlateLetter (flag) {
      if (flag === '1') {
        if (this.rgForm.plateNo.length > 0) {
          this.rgForm.plateNo = this.rgForm.plateNo.substring(0, this.rgForm.plateNo.length - 1)
        }
      } else {
        this.rgForm.plateNo = ''
      }
    },
    // 车牌选择标签点击
    labelClick (labelContent) {
      if (this.rgForm.plateNo.length <= 7) { // 控制车牌长度在8以内
        this.rgForm.plateNo = this.rgForm.plateNo + labelContent
      }
    },
    // 人工识别出场请求
    async rgsbUp () {
      // 获取当前设备编号
      this.rgForm.deviceNo = this.equip.equipOut
      this.rgForm.userId = window.sessionStorage.getItem('userid')
      const { data: res } = await this.$http.get(this.$store.state.baseUrl + 'manaulDriveOut', {
        params: this.rgForm
      })
      // console.log(res)
      if (res.code === '0') {
        // 成功之后关闭页面
        this.rgsbDialogClose()
      } else {
        return this.$message.error(res.message)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.container-main {
  position: relative;
}
.cameraWrapper {
  width: 50%;
  float: left;
  padding: 10px;
  box-sizing: border-box;
  overflow-x: hidden;
}
.video {
  width: 100%;
  height: 400px;
  border-radius: 8px;
}

.card {
  height: 390px;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.button-top {
  float: right;
  padding: 10px 5px;
}

.label-content {
  font-weight: bold;
  font-size: 16px;
  height: 28px;
  line-height: 28px;
}

.demo-image__placeholder {
  .block {
    padding: 30px 0;
    text-align: center;
    border-right: 1px solid #eff2f6;
    display: inline-block;
    box-sizing: border-box;
    vertical-align: top;
    width: 100%;
    border-right: none;
  }
  .el-image {
    width: 450px;
    height: 300px;
  }
  .demonstration {
    display: block;
    color: #8492a6;
    font-size: 14px;
    margin-bottom: 20px;
  }
}

.el-checkbox.is-bordered.el-checkbox--mini .el-checkbox__label {
  line-height: 30px !important;
  font-size: 30px !important;
}

.plate-select-div{
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;

}

.plate-select{
  font-size: 18px;
  margin-right: 5px;
  margin-top: 5px;
  &:hover{
      background-color: #4a86e8;
      cursor: pointer;
    }
}

</style>
