<template>
  <div class="order-list">
    <!-- 骨架加载 -->
    <div v-if="!orderList.length && loading" >
      <div v-for="n in 3" :key="n" class="skeleton-item"></div>
    </div>

    <div 
    v-else-if="filteredOrder.length > 0"
    class="order"
    v-for="(item, index) in filteredOrder"
    :key="index"
    >
      <div class="head">
        <div class="title">
          {{ item.store_name }}
        </div>
        <div 
        class="status"
        >
          {{ item.status === 'pay' ? '待支付' :'交易成功'}}
        </div>
      </div>
      <div class="body">
        <div class="item_info">
          <div class="img">
            <img
              loading="lazy"
              :src="item.img || '/uploads/default.png' "
              @error="(e)=>{
                e.target.src = '/uploads/default.png'
              }"
              alt="商品图片"

            />
          </div>
          <div class="info">
            <div class="desc">
              <p>{{ item.desc }}</p>
              <span>￥{{ Number(item.price).toFixed(2) }}</span>
            </div>
            <div class="ordered_goods">
              <p>{{ item.order_item }}</p>
              <span>×{{ item.count }}</span>
            </div>
            <div class="service">
              <span>
                {{ item.service }}
              </span>

            </div>
          </div>
        </div>
        <div class="recieve"></div>
        <div class="price">
          <span>实付</span>
          <p>￥{{ (Number(item.price) * Number(item.count)).toFixed(2) || '0.00' }}</p>
        </div>
      </div>
      <div class="foot">
        <button 
        @click = 'goMap(item.id,item.status)'>{{ item.status === 'pay' ? '找朋友付' : '查看物流' }}</button>
        <button>{{ item.status === 'pay' ? '更多好物' : '评价' }}</button>
        <button>加入购物车</button>
        <button>{{item.status === 'pay' ? '去支付' : '确认收货'}}
        </button>
      </div>
    </div>
    <div
    class="none"
    v-else
    >
      <p>无相应订单！</p>
    </div>
  </div>  
</template>

<script setup>
import { onMounted,ref,computed } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import router from '@/router'
import { showToast  } from 'vant'

const loading = ref(true)
const route = useRoute()
const orderList = ref([])
// 获取订单列表
const getOrderList = async ()=>{
  try{
    const res = await request.get('/orders/list')
    console.log('订单',res)
    orderList.value = res
  }catch(error){
    showToast('获取订单列表失败!')
    console.error('获取订单列表失败:', error)
  }finally {
    loading.value = false // 不管成功失败，都结束加载状态
  }
}
// 订单筛选

const activeKey = computed(() => route.params.status || 'all')
const filteredOrder = computed(()=>{
  // 高亮筛选对应的订单
  if(activeKey.value !== 'all'){
    return orderList.value.filter(item => item.status === activeKey.value)
  }
  // 搜索筛选
  if(route.params.words && orderList.value){
    return orderList.value.filter(item => item.desc.toLowerCase().includes(route.params.words.toLowerCase()) || item.order_item.toLowerCase().includes(route.params.words.toLowerCase()))
  }
  return orderList.value
})
// 查看物流
const goMap = (id,status) => {
  if(status !== 'pay'){
    router.push(`/map/${id}`)
  }
}
onMounted(()=>{
  getOrderList()
})

</script>

<style lang="less" scoped>
.skeleton-item {
  height: 1.6rem; // 改成接近你真实卡片的高度
  margin-bottom: 0.05rem;
  border-radius: 0.1rem;
  // 加上我之前说的流动光效，视觉效果更明显
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
// 闪光动画关键帧
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
.order-list{
  margin: 0.05rem;
  .order{
    background-color: #fff;
    border-radius: 0.1rem;
    margin: 0.05rem 0;
    padding: 0.1rem;
    .head{
      font-size: 0.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.05rem;
      .status{
        color: #ff5000;
      }
    }
    .body{
      .item_info{
        padding: 0.05rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1rem;
        .img{
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 0.1rem;
          overflow: hidden;
          img{
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center center;
            display: block;
          }
        }
        .info{
          height: 0.75rem;
          display: flex;
          flex-direction: column;
          justify-content: start;
          .desc,
          .ordered_goods{
            display: flex;
            justify-content: space-between;
            align-items: center;

            font-size: 0.1rem;
            color: #333;
            margin-bottom: 0.08rem;
            p{
              font-weight: bold;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 1.95rem;
            }
          }
          .ordered_goods{
            color: gray;
            p{
              font-weight: normal;
            }
          }
          .service{
            margin-top: 0.03rem;
            font-size: 0.08rem;
            color: #ff5000;
            span{
              background-color: rgb(255, 230, 211);
              padding: 0.03rem;
              border-radius: 0.04rem;
            }
          }
        }
      }
      .price{
        font-size: 0.1rem;
        display: flex;
        justify-content: end;
        p{
          margin-left: 0.03rem;
        }
      }
    }
    .foot{
      padding: 0.05rem;
      padding-bottom: 0;
      display: flex;
      justify-content: space-between;
      button{
        width: 20%;
        font-size: 0.1rem;
        padding: 0.03rem 0.05rem;
        border-radius: 0.05rem;
        background-color: rgb(242, 242, 242);
        &:last-child{
          color: #ff5000;
          background-color: rgb(255, 230, 211);
        }
      }
    }
  }
  .none{
    background-color: rgb(245, 245, 245);
    p{
      font-size: 0.12rem;
      text-align: center;
      padding: 0.1rem;
      color: gray;
    }
  }
}
</style>