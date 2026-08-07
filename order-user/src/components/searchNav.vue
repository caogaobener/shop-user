<template>
  <header>
   <!-- 搜索栏 -->
    <div 
    class="search-box"
    ref="searchRef"
    >
      <!-- 返回上一页 -->
      <div>
        <button @click="goBack">
          <span class="iconfont icon-back"></span>
        </button>   
      </div>
      <!-- 搜索框 -->
      <div class="search-wrap" @click.stop="openSearch">
        <span class="iconfont icon-sousuo"></span>
        <input 
        type="text" 
        placeholder="搜索订单"
        v-model="searchValue"
        @keyup.enter="search"
        >
        <button 
        v-if="!isOrderPage"
        @click.stop="search"
        >搜索</button>
      </div>
      
      <!-- 详情字体图标 -->
      <div v-if="isOrderPage">
        <button>
          <span class="iconfont icon-more-fill"></span>
        </button> 
      </div>
    </div>
  </header>

  <nav >
    <!-- 订单筛选 -->
    <div 
    v-if="isOrderPage "
    class="order">
      <div 
    class="fixed" 
    :class="{active: activeKey === 'all'}"
    @click="tabChange('all')"
    >全部订单</div>
    <div class="scroll__list">
      <div
        :class="{active: activeKey === 'pay'}"
        @click="tabChange('pay')"
      >待付款</div>
      <div
        :class="{active: activeKey === 'ship'}"
        @click="tabChange('ship')"
      >待发货</div>
      <div
        :class="{active: activeKey === 'receive'}"
        @click="tabChange('receive')"
      >待收货</div>
      <div
        :class="{active: activeKey === 'refund'}"
        @click="tabChange('refund')"
      >退款/售后</div>
    </div>
    </div>

    <!-- 历史记录 -->
    <div 
    class="history"
    v-if ="isSearchPage && historyList.length > 0"
    >
      <div class="title">
        <p>历史搜索</p>
        <span 
        class="iconfont icon-shanchu"
        @click="popUp"
        ></span>
      </div>
      <div class="list">
        <div 
        class="item"
        v-for="(item,index) in historyList"
        :key="index"
        @click="clickEcho(item)"
        >{{ item }}</div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import {ref,onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '../utils/request'

import 'vant/lib/index.css'; 
import { showConfirmDialog , showToast  } from 'vant'
const route = useRoute()
const router = useRouter()

const props = defineProps({
  isOrderPage: {
    type: Boolean,
    default: true
  },
  isSearchPage: {
    type: Boolean,
    default: false
  },
  isSearchIndex: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['openSearch','closeSearch'])

const searchRef = ref(null)

const searchValue = ref(route.params.words || '')

const activeKey = computed(() => route.params.status || 'all')
// 跳转传参+滚动条位置更新
const tabChange = (newVal) => {
 router.push(`/order/${newVal}`)  
 window.scrollTo(0,0)
}
// 打开搜索页面
const openSearch = () => {
  router.push('/order/all?search=1') 
}
const goSearch = (words)=>{
  router.push(`/searchIndex/${words}`)
}

const isSearching = ref(false)

// 点击搜索或回车搜索
const search = ()=>{
  if(isSearching.value) return // 防止重复点击
  console.log('搜索关键词',searchValue.value)
  if (!searchValue.value.trim()) {
    // 空搜索提示
    showToast('请输入搜索关键词')
    return
  }
  isSearching.value = true
  goSearch(searchValue.value)
  addHistory(searchValue.value)
  setTimeout(() => {
    isSearching.value = false
  }, 500)
}

// 回退
const goBack = () => {
  if(props.isSearchPage) {
    // 在搜索页面，回退则关闭搜索页面
    emit('closeSearch',111)
    console.log('关闭搜索页面')
    // 0.3s后，input清空
    setTimeout(() => {
      searchValue.value = ''
    }, 300)
    router.push('/order/all')
  }else{
    router.back()
  } 
}

// 获取历史记录
const historyList = ref([])
const getHistory = async () => {
  try{
    const res = await request.get('/history/list')
    historyList.value = res.map(item => item.value).reverse()// 反转数组，最新的记录在最前面
  }catch(error){
    console.error('获取历史记录失败:', error);
  }
}

// 新增历史记录+跳转搜索？
const addHistory = async (searchValue)=>{
  try{
    // 非空搜索+判断历史记录是否重复
    if(!searchValue.trim() || historyList.value.includes(searchValue.trim())) return
    // 乐观更新UI，再请求接口添加到数据库
    historyList.value = [searchValue.trim(), ...historyList.value]// 添加到数组首位
    await request.post('/history/add',{value: searchValue.trim()})
  }catch(error){
    console.error('新增历史记录失败:', error)
  }
}
// 历史记录回显
const clickEcho = (item) => {
  goSearch(item.trim())
}

// 弹窗+删除历史记录
const popUp = () => {
  showConfirmDialog({
    title:'提示',
    message:"确定删除所有历史记录吗？",
    showCancelButton:true,
    confirmButtonColor:"#ff5000",
    beforeClose: async (action)=>{
      if(action === 'confirm'){
        const back = [...historyList.value]
        try{
          historyList.value = []// 清空数组
          await request.delete('/history/delete')
          showToast('删除成功')
          return true// 关闭弹窗
        }catch(error){
          historyList.value = back// 失败回滚
          showToast('删除失败，请检查网络后重试')
          console.error('删除历史记录失败:', error)
          return false//关闭弹窗出错
        }
      }else{
        return true
      }
    }
  })
}

onMounted(() => {
  getHistory()
})


</script>

<style lang="less" scoped>
header {
  // position: sticky;
  // top: 0;
  z-index: 1;
  margin: 0 0.05rem 0.05rem 0.05rem;
}
.search-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;

  .icon-back {
    font-size: 0.2rem;
    color: #333;
    margin-left:0.2rem;
  }

  .icon-more-fill {
    font-size: 0.2rem;
    color: #333;
    margin-right:0.2rem;
  }
  .search-wrap {
    flex: 1;
    position: relative;
    margin: 0.1rem 0.1rem;
    display: flex;
    align-items: center;
    // background-color: hsl(0, 0%, 96%);
    border-radius: 0.4rem;
    .icon-sousuo {
      position: absolute;
      left: -0.2rem;
      font-size: 0.2rem;
      color: #999;
      transform: translate(0.3rem);
    }
    input {
      flex: 1;
      padding: 0.15rem 0.35rem;
      border: 1px solid #eee;
      background-color: hsl(0, 0%, 96%);
      border-radius: 0.4rem;
      font-size: 0.14rem;
      color: #333;
      // border-color: #ff5000;
      &::placeholder {
        color: #999;
      }
   }
   button {
    position: absolute;
    right: 0.1rem;
     margin-left: 0.1rem;
     padding: 0.05rem 0.1rem;
     background-color: #ff5000;
     color: #fff;
     border: none;
     border-radius: 0.4rem;
     font-size: 0.14rem;
   }
  }

} 
nav{
  position: sticky;
  top: 0;
  background-color: #fff;
  margin: 0 0.05rem 0.05rem 0.05rem;

  .order{
    display: flex;
    align-items: center;
    font-size: 0.12rem;
    padding: 0.1rem 0.2rem;
    z-index: 1;
    .fixed {
      margin-right: 0.1rem;
      color: #333;
      padding: 0.1rem;
      white-space: nowrap;
      background-color: hsl(0, 0%, 96%);
      border-radius: 15%;
    }
    .scroll__list {
      display: flex;
      align-items: center;
      // 滚动条隐藏
      overflow-x: auto;
      scrollbar-width: none;
      -ms-overflow-style: none;
      &::-webkit-scrollbar { 
        display: none; 
      }
      div {
        color: #333;
        padding: 0.1rem;
        margin-right: 0.1rem;
        white-space: nowrap;
        background-color: hsl(0, 0%, 96%);
        border-radius: 15%;
      }
    }
    div.active {
    background-color: #fbd4c28e;
    color: #ff5000;
   }
  }
  .history {
    margin: 0 0.05rem;
    background-color: #fff;
    padding: 0.1rem 0.2rem;
    .title{
      display: flex;
      align-items: center;
      justify-content: space-between;
      // padding: 0.1rem;
      font-size: 0.12rem;
    }
    .list {
      margin-top: 0.1rem;
      // 控制子元素排列样式
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      column-gap: 0.1rem;
      .item {
        padding: 0.05rem 0.1rem;
        margin-bottom: 0.1rem;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 1rem;
        font-size: 0.1rem;
        background-color: rgb(245, 245, 245);
        border-radius: 0.2rem;
        span {
          color: #999;
        }
      }
    }
  }
}

</style>