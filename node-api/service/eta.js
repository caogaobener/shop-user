function getProvince(address) {
  if(!address) return ''
  const province = address.match(/^(.+?(省|市|自治区))/)
  return province ? province[1] : ''
}

/**
  @param{string} senderAddress 发件人地址
  @param {string} receiverAddress 收件人地址
  @param {number} distance 距离（公里）
  @param {number} orderTime 发货时间（小时）
  @param {number} duration 驾车时长
  @returns {string} ETA
*/
function computeEta(senderAddress, receiverAddress, distance, orderTime, duration){
  // 初始化时间
  const totaltime = orderTime ? new Date(orderTime) : new Date()

  let transportHours = 0
  
  // 如果拿到了高德地图时间，优先使用高德地图时间
  if (duration && duration > 0) {
    // 秒转小时
    duration /= 3600
    
    // 【核心微调】物流系数：建议 1.5 - 2.0，根据实际情况调整
    const logisticsFactor = 1.8 

    transportHours = duration * logisticsFactor
  } else {
    // 降级逻辑：如果没拿到高德时间，兜底计算eta
    const distanceKm = distance / 1000
    const senderProvince = getProvince(senderAddress)
    const receiverProvince = getProvince(receiverAddress)
    const isSameProvince = senderProvince && receiverProvince && senderProvince === receiverProvince
    
    if (isSameProvince) {
      transportHours = distanceKm <= 100 ? 20 : 48
    } else {
      if(distanceKm <= 500) transportHours = 48
      else if (distanceKm < 1000) transportHours = 52
      else if (distanceKm < 1500) transportHours = 72
      else transportHours = 96
    }
  }
  // 打包时间
  transportHours += 4
  totaltime.setHours(totaltime.getHours() + transportHours)

  // 如果预计时间早于8点，调整到当天10点发出
  if(totaltime.getHours() < 8 ){
    totaltime.setHours(10, 0, 0, 0)
  }

  return totaltime
}
module.exports = computeEta