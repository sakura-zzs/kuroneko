import axios from 'axios'

class KuronekoRequest {
  constructor(config) {
    this.instance = axios.create(config)

    // 添加全局拦截器
    this.setupInterceptors()

    // 添加实例特定拦截器
    if (config.interceptors) {
      this.setupInstanceInterceptors(config.interceptors)
    }
  }

  // 设置全局拦截器
  setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 可以添加loading等全局逻辑
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        // 统一处理响应数据
        return response
      },
      (error) => {
        // 统一错误处理
        const { response } = error
        if (response) {
          // 根据状态码处理不同错误
          switch (response.status) {
            case 401:
              // 处理未授权
              break
            case 403:
              // 处理禁止访问
              break
            case 404:
              // 处理资源不存在
              break
            default:
            // 处理其他错误
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // 设置实例特定拦截器
  setupInstanceInterceptors(interceptors) {
    if (interceptors.requestInterceptor) {
      this.instance.interceptors.request.use(interceptors.requestInterceptor)
    }
    if (interceptors.responseInterceptor) {
      this.instance.interceptors.response.use(interceptors.responseInterceptor)
    }
  }
  request(config) {
    return new Promise((resolve, reject) => {
      this.instance
        .request(config)
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }
  get(config) {
    return this.request({ ...config, method: 'GET' })
  }
  post(config) {
    return this.request({ ...config, method: 'POST' })
  }
  patch(config) {
    return this.request({ ...config, method: 'PATCH' })
  }
  delete(config) {
    return this.request({ ...config, method: 'DELETE' })
  }
}

export default KuronekoRequest
