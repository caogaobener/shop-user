// 导入依赖
const express = require('express')
const pool = require('../db/db')
const baseService = require('../service/service')
// 创建路由
const router = express.Router()
// 创建基础方法实例
const service = new baseService(`orders`) 
const computeEta = require('../service/eta')
// 利用id查询订单
router.get('/list/:id', async (req, res) => {
  try{
    const id = Number(req.params.id) 
    const order = await service.findById(id)

    if(!order){
      return res.json({
        code:1,
        msg:'订单不存在',
        data:null
      })
    }else{
      res.json({
        code:0,
        msg:'获取当前订单成功',
        data:order
      })
    }

  }catch(err){
    console.log('❌ 路线接口报错：', err)
    res.json({
      code:1,
      msg:'获取订单失败',
      data:null
    })
  }
})  
 
// 前端传递distance
router.post('/list/:id/distance', async (req, res) => {
    const { distance } = req.body
    const id = Number(req.params.id) 
    try {
      const order = await service.findById(id)
      // 更新 distance
      await pool.execute('UPDATE orders SET distance = ? WHERE id = ?', [distance, id])
  
      let etaTime = null;
      etaTime = computeEta(
        order.express_info.sender_address,
        order.user_info.address,
        distance,
        order.order_time
      )
      // 更新 eta_time
      await pool.execute('UPDATE orders SET eta_time = ? WHERE id = ?', [etaTime, id]);
  
      res.json({ 
        code: 0,
        msg: '距离和ETA时间更新成功',
        data: {
          distance,
          eta_time: etaTime  // 如果 shipped_at 为空，这里也是 null
        }
      })
  
    } catch (err) {
      console.error(err.message)
      res.json({ 
        code:1,
        msg:err.message,
        data:null
      })
    }
})

// 获取订单列表
router.get('/list', async (req, res) => {
  try{
    const rows = await service.findAll()
    res.json({
      code: 0,
      msg: '获取订单成功',
      data: rows//订单数据
    })
  }catch(err){
    console.log('❌ 订单接口报错：', err)
    res.json({
      code:1,
      msg:'获取订单失败',
      data:null
    })
  }
})

// 新增订单
// router.post('/add',async (req, res) =>{
//   try{
//     const [result] = await service.create({ value: req.body.value })
//     res.json({
//       code: 0,
//       msg: '新增订单成功',
//       data: result
//     })
//   }catch(error){
//     res.json({
//       code:1,
//       msg:'新增订单失败',
//       data:null
//     })
//   }
// })


// 删除订单
// router.delete('/delete',async (req, res) =>{
//   try{
//     await service.deleteAll()
//     res.json({
//       code:0,
//       msg:'删除订单成功',
//       data:[]
//     })
//   }catch(err){
//     res.json({
//       code:1,
//       msg:'删除订单失败',
//       data:null
//     })
//   }
// })

// 导出路由
module.exports = router