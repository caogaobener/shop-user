// 导入依赖
const express = require('express')
const pool = require('../db/db')
const baseService = require('../service/service')
// 创建路由
const router = express.Router()
// 创建实例
const service = new baseService('history')
// 获取历史记录
router.get('/list', async (req, res) => {
  try{
    const rows = await service.findAll()
    res.json({
      code: 0,
      msg: '获取历史记录成功',
      data: rows//历史记录数据
    })
  }catch(err){
    console.error('❌ 接口执行失败，详细错误：', err)
    res.json({
      code:1,
      msg:'获取历史记录失败',
      data:null
    })
  }
})

// 新增历史记录
router.post('/add',async (req, res) =>{
  try{
    const result = await service.create({ value: req.body.value })
    res.json({
      code: 0,
      msg: '新增历史记录成功',
      data: result
    })
  }catch(error){
    res.json({
      code:1,
      msg:'新增历史记录失败',
      data:null
    })
  }
})


// 删除历史记录
router.delete('/delete',async (req, res) =>{
  try{
    await service.deleteAll()
    res.json({
      code:0,
      msg:'删除历史记录成功',
      data:[]
    })
  }catch(err){
    res.json({
      code:1,
      msg:'删除历史记录失败',
      data:null
    })
  }
})

// 导出路由
module.exports = router