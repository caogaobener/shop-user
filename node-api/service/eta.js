// 计算ETA

// 获取省
function getProvince(address) {
  if(!address) return ''
  const province = address.match(/^(.+?(省|市|自治区))/)
  return province ? province[1] : ''
}

// 同省/跨省
/**
  @param{string} senderAddress 发件人地址
  @param {string} receiverAddress 收件人地址
  @param {number} distance 距离（公里）
  @param {number} shipTime 发货时间（小时）
  @returns {string} ETA（小时）
*/
function computeETA(senderAddress, receiverAddress, distance,shipTime){
  const totaltime = shipTime ? new Date(shipTime) : new Date()
  const distanceKm = distance / 1000

  // 同省判断
  const senderProvince = getProvince(senderAddress)
  const receiverProvince = getProvince(receiverAddress)
  const isSameProvince = senderProvince && receiverProvince && senderProvince === receiverProvince

  // 计算运输基础时间
  let hours = 0
  if (isSameProvince) {
    if(distanceKm <= 100) {
      hours = 20
    }else { 
      hours = 48
    }
  }else {
    if(distanceKm <= 500) {
      hours = 48
    } else if (distanceKm < 1000) hours = 52
    else if (distanceKm < 1500) hours = 72;
    else hours = 96;
  }
  hours += 12 // 处理时间
  totaltime.setHours(totaltime.getHours() + hours )
  if(totaltime.getHours() <8 ){
    totaltime.setHours(10, 0, 0, 0)
  }

  return totaltime
}
module.exports = computeETA