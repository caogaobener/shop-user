<template>
  <div class="search-page"
  >
    <search-nav
    :isOrderPage="false"
    isSearchPage
    @closeSearch="$emit('close')"
    ></search-nav> 
  </div>
</template>

<script setup>
defineEmits(['close'])
</script>

<style lang="less" scoped>
.search-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(245, 245, 245);
  transform: translate(100%);
  transition: all 0.3s ease;
  z-index: 999;
}
.active {
  transform: translateX(0);
}
</style>