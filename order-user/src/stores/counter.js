import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

// 订单状态管理
export const useOrderStore = defineStore('order', () => {
  // 订单状态
  const orderStatus = ref([
    { label: '全部', value: 'all' },
    { label: '待付款', value: 'pending' },
    { label: '已付款', value: 'paid' },
    { label: '已发货', value: 'shipped' },
    { label: '已完成', value: 'completed' },
    { label: '已取消', value: 'cancelled' }
  ])

  // 当前选中的状态
  const currentStatus = ref('all')

  // 搜索关键词
  const searchKeyword = ref('')

  // 模拟订单数据
  const orders = ref([
    {
      id: '001',
      orderNumber: 'ORD20240311001',
      status: 'pending',
      totalAmount: 299.00,
      createTime: '2024-03-11 10:30:00',
      items: [
        { name: '商品A', price: 99.00, quantity: 1 },
        { name: '商品B', price: 200.00, quantity: 1 }
      ]
    },
    {
      id: '002',
      orderNumber: 'ORD20240311002',
      status: 'paid',
      totalAmount: 159.00,
      createTime: '2024-03-11 09:15:00',
      items: [
        { name: '商品C', price: 159.00, quantity: 1 }
      ]
    },
    {
      id: '003',
      orderNumber: 'ORD20240311003',
      status: 'shipped',
      totalAmount: 499.00,
      createTime: '2024-03-10 16:45:00',
      items: [
        { name: '商品D', price: 499.00, quantity: 1 }
      ]
    }
  ])

  // 过滤后的订单列表
  const filteredOrders = computed(() => {
    let filtered = orders.value

    // 状态筛选
    if (currentStatus.value !== 'all') {
      filtered = filtered.filter(order => order.status === currentStatus.value)
    }

    // 关键词搜索
    if (searchKeyword.value.trim()) {
      const keyword = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(keyword) ||
        order.items.some(item => item.name.toLowerCase().includes(keyword))
      )
    }

    return filtered
  })

  // 设置当前状态
  function setCurrentStatus(status) {
    currentStatus.value = status
  }

  // 设置搜索关键词
  function setSearchKeyword(keyword) {
    searchKeyword.value = keyword
  }

  // 获取状态标签
  function getStatusLabel(status) {
    const statusItem = orderStatus.value.find(item => item.value === status)
    return statusItem ? statusItem.label : status
  }

  return {
    orderStatus,
    currentStatus,
    searchKeyword,
    orders,
    filteredOrders,
    setCurrentStatus,
    setSearchKeyword,
    getStatusLabel
  }
})
