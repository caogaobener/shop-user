<template>
  <div>
    <!-- 地图 -->
    <section >
      <div class="map">
      <!-- 顶部悬浮样式 -->
      <div class="map-header">
        <div class="left">
          <button>
            <span class="iconfont icon-back"></span>
          </button>
        </div>
        <div class="right">
          <button class="long">
            <span class="iconfont icon-kefu"></span>
            客服
          </button>
          <button class="long">
            <span class="iconfont icon-baoguo_o"></span>
            包裹
          </button>
          <button>
            <span class="iconfont icon-more-fill"></span>
          </button>
        </div>
      </div>

      <div 
      ref="mapContainer" 
      style="width: 100%; height: 53vh;"
      ></div>

      <!-- 右下卡片 -->
      <div class="card">
        <div class="status">运输中</div>
          <div class="position">山东省济南市 附近</div>
          <div class="time">预计送达时间：11月21日</div>
      </div>
      </div>
    </section>

    <!-- 物流信息 -->
    <section>
      <div class="progress">
        <div class="text">
          <div class="sender">
            <p>发货地</p>
            <span>沈阳</span>
          </div>
          <div class="passed">
            <p style="font-weight: bold; font-size: 0.12rem;">
              已走
              <span>20%</span>
            </p>
            <p>预计送达</p>
          </div>
          <div class="receiver">
            <p>收货地</p>
            <span>北京</span>
          </div>
        </div>
        <div class="line">
          <div class="active" style="width: 20%;">
            <span
            class="iconfont icon-wuliuxiaocheche"
            ></span>
          </div>
        </div>
      </div>
      <div class="express">
        <div class="delivery">
          <span class="icon">{{express[0] ? express[0] : '韵'}}</span>
          <p>{{express ? express : '韵达快递'}}</p>
          <i>{{express_no ? express_no : '订单号'}}</i>
        </div>
        <div class="text">            
          <button>复制</button>
          <span></span>
          <button>打电话</button>
        </div>
      </div>
      <div class="info">
        <div class="route">
          <div class="dot"></div>
          <div class="right">
            <div class="title">
              <p>运输中</p>
              <span>11-18</span>
            </div>
            <p>快件已离开【沈阳】,下一站【北京】</p>
          </div>      
        </div>
        <div class="more">
            <div class="dot"></div>
            <p>查看更多物流明细</p>
          </div>
        <div class="user">
          <div class="dot"></div>
          <div class="right">
            <p class="end">送至 长宁区</p>
            <div class="desc">
              {{ receiver }}  {{ phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") }}
              <div class="protect">
                号码保护中
              </div>
            </div>
            <span>上海市长宁区某某小区</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup >
import { onMounted,ref,onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
import request from '@/utils/request'
import mapService from '@/utils/map'

const phone = ref('')
const receiver = ref('')
const express = ref('')
const express_no = ref('')

const mapContainer = ref(null)
const service = new mapService()

const currentIndex = ref(0)
const totalPath = ref([])
const totalDistance = ref(0)
const fullLine = ref(null)

const passedPath = ref([])
const passedDistance = ref(0)
const passedLine = ref(null)

const progress = ref(0)

const animationId = ref(null)

const carMarker = ref(null)

// 节流
const frame = ref(0)

// 封装当前订单数据
const orderData = async () =>{
  try{
    const res = await request.get(`/orders/list/${route.params.id}`)
    return res
  }catch(error){
    console.error('获取起点终点出错',error,route.params.id)
    alert('获取起点终点出错!')
  }
}
// 获得运输信息
const getExpressInfo = async () => {
  try{
    const res = await orderData() 

    express_no.value = res.express_info.express_no
    express.value = res.express_info.express_company
    phone.value = res.user_info.phone
    receiver.value = res.user_info.username
    return {
      express,
      phone,
      receiver
    }
  }catch(error){
    console.error('获取运输信息出错',error,route.params.id)
    alert('获取运输信息出错!')
  }
}

// 获得起点和终点坐标
 const getRoutePoints = async () => {
  try{
    const res = await orderData() 
    // 描绘坐标点(对象形式)
    const start = await service.geocode(res.express_info.sender_address)
    const end = await service.geocode(res.user_info.address)
    console.log('起点坐标',start,'终点坐标',end)
    // 获得路径点数组（有效数据形式）
    const startArr = [start.lng,start.lat]
    const endArr = [end.lng,end.lat]
    // 返回起点和终点坐标
    return {
      start:startArr,
      end:endArr
    }
  }catch(error){
    console.error('获取起点终点出错',error,route.params.id)
    alert('获取起点终点出错!')
  }

}

// 小车移动动画
const moveCar =() => {
  frame.value++
  // 每5帧移动一次，控制小车移动速度
  if(frame.value % 5 !== 0) {
    animationId.value = requestAnimationFrame(moveCar)
    return
  }

  // 移动步长
  const step = 1
  currentIndex.value += step

  // 走到终点
  if(currentIndex.value >= totalPath.value.length) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
    progress.value = 100
    passedDistance.value = totalDistance.value
    return
  }
  const currentPos = totalPath.value[currentIndex.value]
  // 更新小车位置
  carMarker.value.setPosition(currentPos)

  passedPath.value = totalPath.value.slice(0,currentIndex.value + 1)
  passedLine.value.setPath(passedPath.value)
  passedDistance.value =  service.AMap.GeometryUtil.distanceOfLine(passedPath.value)
  // 进度条
  progress.value = (passedDistance.value / totalDistance.value * 100).toFixed(2)

  animationId.value = requestAnimationFrame(moveCar)
}

onMounted(async () => {
  await getExpressInfo()
  // 加载地图
  await service.loadMap(mapContainer.value)

  // 获得起点和终点坐标
  const {start,end} = await getRoutePoints()
  // 获得路径点数组以及总距离
  const{path,distance} = await service.drivingRoutes(start,end)
  totalPath.value = path
  totalDistance.value = distance
  // 拿到小车
  carMarker.value = service.createIcon(path[0])
  // 经过的路线
  const {full, passed} = await service.drawRoutes(start ,end )
  fullLine.value = full
  passedLine.value = passed

  moveCar()

})

onUnmounted(() => {
  service.destroy()
  cancelAnimationFrame(animationId.value)
})
</script>

<style lang="less" scoped>
.map {
  position: relative;
  .map-header {
    position: absolute;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 1000;
    width: 100%;
    padding: 0.1rem;

    .right{
      width: 45%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    button {
      padding: 0.03rem;
      height: 0.26rem;
      width: 0.26rem;
      background-color: rgb(255,255,255);
      font-size: 0.12rem;
      border-radius: 50%;
      display: flex;
      align-items: center;

      &.long{
        width: 0.55rem;
        border-radius: 0.14rem;
        justify-content: center;
      }
      .iconfont {
        font-size: 0.12rem;
      }
    }
  }

  .card{
    position: absolute;
    bottom: 0.1rem;
    right: 0.1rem;
    width: 38%;
    background-color: #fff;
    border-radius: 0.1rem;
    padding: 0.1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .status{
      font-weight: bold;
      font-size: 0.12rem;
      color: #ff5000;
      margin-bottom: 0.05rem;
    }
    .position,
    .time{
      font-size: 0.1rem;
      color: #666;
      margin-bottom: 0.03rem;
    }
  }
}
.progress {
  border-radius: 0.2rem;
  box-shadow:0 0 0.05rem rgba(0, 0, 0, 0.06);
  padding: 0.15rem;
  padding-bottom: 0.12rem;
  margin: 0.05rem 0.1rem;
  .text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .sender,
    .passed,
    .receiver {
      display: flex;
      flex-direction: column;
      p {
        font-size: 0.1rem;
        color: #888;
        margin-bottom: 0.02rem;
      }
      span {
        font-size: 0.12rem;
        font-weight: bold;
        color: #ff5000;
      }
    }
    .passed{
      text-align: center;
    }
    .receiver{
      text-align: right;
    }
  }
  .line {
    margin-top: 0.1rem;
    width: 100%;
    height: 0.02rem;
    background-color: rgb(255, 233, 211);

    .active {
      background-color: #ff5000;
      height: 100%;
      position: relative;
      .iconfont {
        position: absolute;
        right: -0.12rem;
        top: -0.02rem;
        font-size: 0.1rem;
        color: #ff5000;
        z-index: 10000;
      }
    }

  }
} 
.express {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.1rem;
  margin: 0.05rem 0.1rem;
  border-bottom: 1px solid rgba(200,200,200,0.5);

  .delivery {
    display: flex;
    align-items: center;
    .icon {
      text-align: center;
      line-height: 0.3rem;
      font-size: 0.15rem;
      font-weight: bold;
      color: white;
      width: 0.3rem;
      height: 0.3rem;
      background-color: rgb(255, 184, 0);
      border-radius: 50%;
      margin-right: 0.1rem;
    }
    p {
      font-size: 0.12rem;
      font-weight: bold;
    }
    i {
      font-style: normal;
      font-size: 0.1rem;
      color: #888;
      margin-left: 0.1rem;
    }
  }
  
  .text {
    display: flex;
    align-items: center;

    button {
      padding: 0.03rem;
      font-size: 0.12rem;
      color:rgb(104, 178, 255) ;
    }
    
    span {
      width: 0.01rem;
      height: 0.16rem;
      background-color: rgb(200,200,200);
      margin: 0 0.05rem;
    } 
  }
}
.info {
  padding: 0.1rem;
  margin: 0.05rem 0.1rem;   
  margin-bottom: 0;
  .dot {
      width: 0.1rem;
      height: 0.1rem;
      background-color: #ff5000;
      border-radius: 50%;
      margin-right: 0.1rem;
      margin-top: 0.04rem;
      align-self: flex-start;
    }
  .route,
  .more,
  .user {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.1rem;
    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
  .route {
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.05rem;
      p {
        font-weight: bold;
        font-size: 0.12rem;
        color: #ff5000;
      }
      span {
        font-size: 0.12rem;
        color: #888;
      }
    }
    p {
      font-size: 0.12rem;
      font-weight: normal;
    }
  }
  .more {
    display: flex;
    align-items: center;
    justify-content: start;
    p {
      font-size: 0.12rem;
    }
    .dot {
      width: 0.08rem;
      height: 0.08rem;
      background: white;
      border: 1px solid rgb(200,200,200);
    }
  }
  .user {
    .dot {
      width: 0.12rem;
      height: 0.12rem;
      background-color: rgb(255, 238, 240);
    }
    .end {
      font-weight: bold;
      font-size: 0.15rem;
      margin-bottom: 0.05rem;
    }
    .desc {
      font-size: 0.12rem;
      color: #888;
      margin-bottom: 0.03rem;
      display: flex;
      align-items: center;

      .protect {
        padding: 0.03rem;
        margin-left: 0.1rem;
        border-radius: 0.13rem;
        // line-height: 0.2rem;
        font-size: 0.1rem;
        background-color: rgb(249, 249, 249);
        border: 1px solid rgb(200,200,200);
      }
    }
    span {
      font-size: 0.12rem;
      color: #888;
    }
  }
} 
</style>