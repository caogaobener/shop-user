const pool = require("../db/db")

class baseService{
  constructor(table){
    this.table = table
  }

  async findAll(){
    const [rows] = await pool.execute(`SELECT * FROM \`${this.table}\``)
    return rows
  }

  async findById(id){
    // 类型统一，防止匹配出错
    const numId = Number(id)
    
    const [rows] = await pool.execute(`SELECT * FROM \`${this.table}\` WHERE id = ?`, [numId])
    return rows[0]
  }

  async create(addData){
    // 键
    const keys = Object.keys(addData)
    // 值
    const values = Object.values(addData)
    // 占位
    const placeholders = values.map(()=>'?')

    const [result] = await pool.execute(`INSERT INTO \`${this.table}\` (${keys.join(',')}) VALUES (${placeholders.join(',')})`,values)
    return result
  }

  async deleteAll(){
    const [result] = await pool.execute(`DELETE FROM \`${this.table}\``)
    return result
  }

}

module.exports = baseService