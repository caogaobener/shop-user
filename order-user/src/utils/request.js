import axios from 'axios'
// 创建axios实例化对象
const request = axios.create({
  // 请求基础路径
  baseURL: 'http://localhost:3000/api',
  // 设置超时时间
  timeout:5000,
  // 请求头格式
  headers:{
    'Content-Type': 'application/json;charset=utf-8'
  }
})

// 发送请求后处理返回数据(响应拦截器)
request.interceptors.response.use(
  // 成功回调
  (response) =>{
    console.log('响应拦截器',response)
    // 请求成功，判断数据是否正确
    if(response.data.code !== 0){
      console.log('后端数据出错',response.data.code)
      return Promise.reject('后端数据出错')
    }
    return response.data.data
  },
  // 失败回调
  (error) =>{
    //请求失败，判断错误类型
    console.log('响应失败',error)
    return Promise.reject(error)
  }
)

// 导出请求对象
export default request