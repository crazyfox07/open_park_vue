
/**
 * 时间格式化函数
 * @param {原始时间} orignVal
 */
export function dateFormat (orignVal) {
  const dt = new Date(orignVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  return `${y}-${m}-${d}`
}

export function dateFormatYMDHMS (orignVal) {
  const dt = new Date(orignVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

export function getMonthStart () {
  var now = new Date() // 当前日期
  var nowMonth = now.getMonth() // 当前月
  var nowYear = now.getFullYear() // 当前年
  return new Date(nowYear, nowMonth, 1)// 本月的开始时间
}

export function getMonthEnd () {
  var now = new Date() // 当前日期
  var nowMonth = now.getMonth() // 当前月
  var nowYear = now.getFullYear() // 当前年
  return new Date(nowYear, nowMonth + 1, 0)// 本月的结束时间
}

// 将时间转换为整数，忽略秒数
export function parseTimeToMinute (timeStr) {
  const timeArr = (timeStr + '').split(':')
  var result = '0'
  if (timeArr.length >= 2) {
    result = parseInt(timeArr[0]) * 60 + parseInt(timeArr[1])
  } else {
    result = parseInt(timeArr[0]) * 60
  }
  return result
}

// 将分钟数转换为时间
export function parseMinuteToTime (timeStr) {
  let result = ''
  if ((timeStr / 60) > 9) {
    if (timeStr % 60 === 0) {
      result = timeStr / 60 + ':' + '00'
    } else {
      result = timeStr / 60 + ':' + timeStr % 60
    }
  } else {
    if (timeStr % 60 === 0) {
      result = '0' + timeStr / 60 + ':' + '00'
    } else {
      result = '0' + timeStr / 60 + ':' + timeStr % 60
    }
  }
  return result + ':00'
}

// 获取两个时间的时间差
export function getNumberOfDays (date1, date2) {
  // 获得天数
  // date1：开始日期，date2结束日期
  var a1 = Date.parse(new Date(date1))
  var a2 = Date.parse(new Date(date2))
  var day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24)) // 核心：时间戳相减，然后除以天数
  day = Math.abs(day)// 取绝对值
  return day + 1
}

// 处理以前版本软件，图片路径携带“127.0.0.1：8080”
export function dealImageUrl (url) {
  if (url.indexOf('127.0.0.1:8080') >= 0) {
    url = url.substring(14, url.length)
  }
  return url
}

// 防抖函数
export const debounce = (fn, t) => {
  const delay = t || 500
  let timer
  return function () {
    const args = arguments
    if (timer) {
      clearTimeout(timer)
    }

    const callNow = !timer

    timer = setTimeout(() => {
      timer = null
    }, delay)

    if (callNow) fn.apply(this, args)
  }
}
