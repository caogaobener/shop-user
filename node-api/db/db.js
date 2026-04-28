const mysql = require('mysql2/promise'); 
// 创建 MySQL 连接池，方便后续执行 SQL 查询
const pool = mysql.createPool({
  host: '8.138.235.214', 
  port: 3306,
  user: 'lce',           // MySQL 用户名（XAMPP 默认是 root）
  password: 'lce1234056+-',           // MySQL 密码（XAMPP 默认是空，直接留空）
  database: 'lce',    // 你创建的数据库名（必须和 phpMyAdmin 里的一致）
  connectionLimit: 10,    // 最大连接数（新手默认 10 即可）
  charset: 'utf8mb4'      // 支持中文/Emoji，避免乱码
});
// const pool = mysql.createPool({
//   host: 'localhost',      // MySQL 地址（XAMPP 装的本地数据库，固定填这个）
//   user: 'root',           // MySQL 用户名（XAMPP 默认是 root）
//   password: '',           // MySQL 密码（XAMPP 默认是空，直接留空）
//   database: 'shop_user',    // 你创建的数据库名（必须和 phpMyAdmin 里的一致）
//   connectionLimit: 10,    // 最大连接数（新手默认 10 即可）
//   charset: 'utf8mb4'      // 支持中文/Emoji，避免乱码
// });
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