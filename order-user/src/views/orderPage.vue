<template>
  <div class="order-page">
    <!-- 顶部搜索 -->
    <search-nav
    :isOrderPage="true"
    @openSearch="showSearch = true"
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
import router from '@/router'
import { ref } from 'vue'
const showSearch = ref(false)
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