import AMapLoader from '@amap/amap-jsapi-loader' 
import { showToast  } from 'vant'

// 唯一保留的安全配置
window._AMapSecurityConfig = {
  securityJsCode: "c5bf882a9d0aeddf9c096fa24ae12125"
}

class mapService {
  constructor(){
    // 工具箱
    this.AMap = null
    // 地图容器
    this.map = null,
    this.version = '2.0'
    this.key = '349ca9dae320fbae98f6c408631b7553'

    this.fullPath = []
    this.fullLine = null
    this.passedLine = null 
    this.carMarker = null
  }

  // 加载地图
  async loadMap(container){
   try{
    this.AMap = await AMapLoader.load({
      key: this.key,
      version: this.version,
      plugins: ['AMap.Geocoder','AMap.Driving','AMap.GeometryUtil']
    })
    this.map = new this.AMap.Map(container, {
      zoom:13,
      center: [116.405, 39.915],
      resizeEnable: true,
      doubleClickZoom: false,
      rotateEnable: false,
    })
   }catch(err){
    console.log('❌ 地图加载失败：', err)
    showToast('地图加载失败，请稍后再试')
   }
  }

  // 地理编码
  geocode(address){
    return new Promise((resolve, reject) => {
      const geocoder = new this.AMap.Geocoder({
        city: '全国'
      })
      geocoder.getLocation(address,(status,result)=>{
        if(status === 'complete' && result?.geocodes?.length > 0){
          const { lng, lat } = result.geocodes[0].location
          resolve({ lng , lat })
        }else{
            reject(new Error('地址解析失败！'))
            console.error('地址解析失败：', status, result)
          }
        })
    })
  }

  // 逆编码
  reverseGeocode(location){
    return new Promise((resolve, reject) => {
      const geocoder = new this.AMap.Geocoder({
        city: '全国'
      })
      geocoder.getAddress([location.lng, location.lat], (status, result) => {
        if(status === 'complete' && result?.regeocode){
          const address = result.regeocode.formattedAddress.match(/.+?(省|市|自治区)/)?.[0]
          resolve(address)
        }else{
          reject(new Error('逆地址解析失败！'))
          console.error('逆地址解析失败：', status, result)
        }
      })
    })
  }

  //驾车路径规划
  async drivingRoutes(start,end){
    // 创建实例对象
    const driving = new this.AMap.Driving()
    // 用search方法获得路径
    return new Promise((resolve,reject) => {
      driving.search(start,end,(status,result)=>{
        if(status === 'complete' && result.info === 'OK'){
          // 路径点
          const path = result.routes[0].steps.map(item=>item.path).flat()
          // 途经城市
          const cities = new Set(result.routes[0].steps.map(item=>item.cities).flat().map(city=>city?.name))
          cities.delete(undefined)
          const filteredCities  = this.extractTransition(Array.from(cities))
          resolve({
            path:path,
            distance: result.routes[0].distance,
            duration: result.routes[0].time,
            cities:filteredCities
            })
        }else{
            const errMsg = result?.info || '未知错误'
            reject(new Error(`规划失败: ${errMsg}`))
            console.error('路径规划失败：', status, result)
          }
        })
    })
  }

  // 伪中转站
  extractTransition(cities){
    // 核心中转站
    const cityset = new Set([
      '北京市', '上海市', '广州市', '武汉市', '成都市', '西安市', '郑州市', '南京市', '杭州市',
      '济南市', '沈阳市', '重庆市', '天津市', '苏州市', '长沙市', '合肥市', '福州市', '石家庄市', '昆明市',
      '长春市', '南昌市', '太原市', '贵阳市', '南宁市', '兰州市', '呼和浩特市', '乌鲁木齐市', '哈尔滨市',
      '深圳市', '东莞市', '宁波市', '青岛市', '大连市', '厦门市', '无锡市', '温州市', '泉州市',
      '烟台市', '徐州市', '洛阳市', '襄阳市', '衡阳市', '柳州市', '绵阳市', '宜宾市', '榆林市',
      '包头市', '喀什市', '海口市','银川市', '西宁市', '拉萨市', '义乌市', '佛山市', '惠州市', '中山市', '临沂市', '潍坊市',
      '芜湖市', '赣州市', '宜昌市', '株洲市', '南阳市', '鄂尔多斯市', '吉林市', '鞍山市', '营口市',
      '齐齐哈尔市', '大庆市', '遵义市', '曲靖市', '库尔勒市', '伊宁市', '常州市', '南通市', '嘉兴市',
      '绍兴市', '金华市', '莆田市', '龙岩市', '九江市', '东营市', '济宁市', '泰安市', '安阳市',
      '新乡市', '荆州市', '常德市', '韶关市', '汕头市', '茂名市', '玉林市', '三亚市', '自贡市',
      '泸州市', '德阳市', '宝鸡市', '天水市', '张掖市', '酒泉市', '满洲里市', '二连浩特市', '瑞丽市',
      '凭祥市', '霍尔果斯市'
    ])
    // 先去除起点和终点城市，再筛选核心中转站，最后控制中转站数量不超过3个
    if(cities.length <= 3) return cities 
    let transitionCities = cities.slice(1,-1).filter(city => cityset.has(city))
    if(transitionCities.length > 3)transitionCities = transitionCities.slice(0,3)
    return [cities[0], ...transitionCities, cities[cities.length - 1]]
  }

  // 绘制路线
  async drawRoutes(path ){
    if(!path || path.length === 0) return

    this.fullPath = path
    // 完整路线
    this.fullLine = new this.AMap.Polyline({
      path:path,
      strokeColor: "#FFD591",
      strokeWeight: 6,
      strokeOpacity: 1,
      zIndex: 100
    })
    this.passedLine = new this.AMap.Polyline({
      path:[],
      strokeColor: "#FF4D4F",
      strokeWeight: 6,
      strokeOpacity: 1,
      zIndex: 101
    })
    this.carMarker = this.createIcon(path[0])

    this.map.add([this.fullLine, this.passedLine , this.carMarker])
    this.map.setFitView([this.fullLine, this.passedLine])
  }

  // 计算进度
  updateProgress(ratio){
    if(!this.fullPath || ratio < 0 || ratio > 1) return
    const maxIndex = this.fullPath.length - 1
    const index = Math.floor(ratio * maxIndex)

    const currentPos = this.fullPath[index]

    // 定位小车图标
    if(this.carMarker && currentPos){
      this.carMarker.setPosition(currentPos)
    }
    // 更新已行驶路线
    const passedPath = this.fullPath.slice(0, index + 1)
    if(this.passedLine){
      this.passedLine.setPath(passedPath)
    }
  }

  // 小车图标
   createIcon(position){
    const truck = '/truck.png'
    const marker = new this.AMap.Marker({
      position: position,
      content:
      `<div style="
      width: 28px; 
      height: 28px; 
      transform: translate(-60%, -50%);
      ">
      <img 
        src='${truck}'
        style="
          width: 100%; 
          height: 100%; 
          display: block;
        "
      >
      </div>
      `,
    })
    return marker
   }

  //  销毁实例
  destroy(){
    if (this.map) {
      // 移除地图实例
      if (this.fullLine) this.map.remove([this.fullLine])
      if (this.passedLine) this.map.remove([this.passedLine])
      if (this.carMarker) this.map.remove([this.carMarker])

      // 销毁地图实例
      this.map.destroy()

      this.map = null
      this.AMap = null

      // 清除内部变量
      this.fullPath = []
      this.fullLine = null
      this.passedLine = null 
      this.carMarker = null
    }

  }
}

export default mapService