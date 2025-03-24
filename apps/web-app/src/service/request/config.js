// 环境变量配置
export const API_CONFIG = {
  development: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    TIME_OUT: import.meta.env.VITE_API_TIMEOUT
  },
  production: {
    BASE_URL: import.meta.env.VITE_API_BASE_URL,
    TIME_OUT: import.meta.env.VITE_API_TIMEOUT
  }
}

// 当前环境配置
const ENV = import.meta.env.MODE
export const { BASE_URL, TIME_OUT } = API_CONFIG[ENV]
