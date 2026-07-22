// node-api/db/db.js — 新代码
require('dotenv').config()
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
})

// 检测数据库是否连接成功
async function testDb() {
  try{
    const [rows] = await pool.execute('SELECT 1');
    console.log('数据库连接成功！');
  }catch(err){
    console.error('数据库连接失败:', err);
  }
}

testDb();
// 导出连接池，供其他模块使用（比如 接口文件）
module.exports = pool;