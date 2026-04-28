// 导入依赖
const express = require('express')
const cors = require('cors')
// 导入测试
require("./db/db")
//导入路由
const historyRouter = require('./routes/history')
const orderRouter = require('./routes/orders')
// 创建根应用
const app = express();
// 给根应用添加中间件（额外的功能）
app.use(cors())
app.use(express.json())

// 注册路由规则
app.use('/api/history',historyRouter)
app.use('/api/orders',orderRouter)
// 监听端口请求
const PORT = 3000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`服务器已启动，监听端口 ${PORT}`)
});