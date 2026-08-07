<template>
  <div class="order-page">
    <!-- 顶部搜索 -->
    <search-nav
    :isOrderPage="true"
    ></search-nav>
    <!-- 订单列表 -->
    <!-- :class="{active: showSearch}" -->
    <!-- 搜索页面 -->
    <search-page
      :class="{active: showSearch}"
      @close="close"
    ></search-page>

    <order-list>
    </order-list>
  </div>
</template>

<script setup>
import SearchPage from '@/components/searchPage.vue'
import { ref ,watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'  // 两个都导入
const route = useRoute()   // 用于读取当前路由信息
const router = useRouter() // 用于跳转
const showSearch = ref(false)
// 监听路由变化，判断是否显示搜索页面
watch(
  () => route.query.search,
  (newVal) => {
    showSearch.value = (newVal === '1')
  },
  { immediate: true }
)

const close = () => {
  showSearch.value = false
  router.push('/order/all')
  console.log('关闭搜索页面',showSearch.value)
}
</script>

<style lang="less" scoped>
  .order-page {
    background-color: rgb(245, 245, 245);
    min-height: 100vh;

  }
</style>