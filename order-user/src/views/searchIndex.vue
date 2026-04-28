<template>
  <div class="search-index"> 
      <searchNav
    :isOrderPage="false"
    isSearchIndex
    />
    <orderList>
    </orderList>
  </div>
</template>

<script setup>

</script>

<style scoped lang="less">
.search-index {
  background-color: rgb(245, 245, 245);
  min-height: 100vh;
}
</style>