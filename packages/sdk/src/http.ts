import axios from 'axios';

// 配置接口
interface HttpConfig {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
}

// 默认配置
const defaultConfig: HttpConfig = {
  baseURL: 'http://localhost:4000/v1',
  withCredentials: true,
  timeout: 10000,
};

// 创建axios实例
export const http = axios.create(defaultConfig);

// 配置更新函数
export const configureHttp = (config: HttpConfig) => {
  Object.assign(http.defaults, config);
};

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证token等
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // TODO: 调用 /auth/refresh 刷新token
      // try {
      //   await refreshToken();
      //   return http.request(error.config);
      // } catch (refreshError) {
      //   // 跳转到登录页
      //   window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  }
);

export default http;
