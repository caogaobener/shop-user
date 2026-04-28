import AMapLoader from '@amap/amap-jsapi-loader' 

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
    console.log('地图加载成功', this.map)
   }catch(err){
    console.log('❌ 地图加载失败：', err)
    alert('地图加载失败，请稍后再试')
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

  //驾车路径规划
  async drivingRoutes(start,end){
    // 创建实例对象
    const driving = new this.AMap.Driving()
    // 用search方法获得路径
    return new Promise((resolve,reject) => {
      driving.search(start,end,(status,result)=>{
        if(status === 'complete' && result.info === 'OK'){
          const path = result.routes[0].steps.map(item=>item.path).flat()
          console.log('路径规划成功',  result.routes[0])
          resolve({
            path:path,
            distance: result.routes[0].distance
            })
        }else{
            const errMsg = result?.info || '未知错误'
            reject(new Error(`规划失败: ${errMsg}`))
            console.error('路径规划失败：', status, result)
          }
        })
    })
  }

  // 绘制路线
  async drawRoutes(start ,end ){
    console.log('开始绘制路线')
    const {path} = await this.drivingRoutes(start,end)
    // 完整路线
    const fullLine = new this.AMap.Polyline({
      path:path,
      strokeColor: "#FFD591",
      strokeWeight: 6,
      strokeOpacity: 1,
      zIndex: 100
    })
    const passedLine = new this.AMap.Polyline({
      path:[],
      strokeColor: "#FF4D4F",
      strokeWeight: 6,
      strokeOpacity: 1,
      zIndex: 101
    })

    this.map.add([fullLine, passedLine])
    this.map.setFitView([fullLine, passedLine])
    return {
      full: fullLine,
      passed: passedLine
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
    this.map.add(marker)
    // this.map.setFitView(marker)
    return marker
   }

  //  视野自适应
  setFitView(layer){
    this.map.setFitView(layer)
  }

  //  销毁实例
  destroy(){
    if (this.map) {
      this.map.destroy()
      this.map = null
      this.AMap = null
    }
  }
}

export default mapService