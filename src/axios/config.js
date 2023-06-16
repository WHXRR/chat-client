import axios from 'axios'
import baseURL from './base'
import pinia from '@/store'
import { useStore } from "@/store/user";
import { systemStore } from "@/store/system";
import { ElNotification } from 'element-plus'
const pendingMap = new Map()
function getPendingKey(config) {
  let { url, data, method, params } = config
  if (typeof data === 'string') data = JSON.parse(data)
  return [url, method, JSON.stringify(data), params].join('&')
}
function addPendingKey(config) {
  const pendingKey = getPendingKey(config);
  config.cancelToken = config.cancelToken || new axios.CancelToken((cancel) => {
    if (!pendingMap.has(pendingKey)) {
      pendingMap.set(pendingKey, cancel);
    }
  })
}
function removePendingKey(config) {
  const pendingKey = getPendingKey(config);
  if (pendingMap.has(pendingKey)) {
    const cancelToken = pendingMap.get(pendingKey);
    cancelToken(pendingKey);
    pendingMap.delete(pendingKey);
  }
}

function httpErrorStatusHandle(error, store) {
  if (axios.isCancel(error)) return
  let message = '';
  if (error && error.response) {
    switch (error.response.status) {
      case 302: message = '接口重定向了！'; break;
      case 400: message = '参数不正确！'; break;
      case 401:
        store.clearToken()
        message = '您未登录，或者登录已经超时，请先登录！';
        break;
      case 403: message = '您没有权限操作！'; break;
      case 404: message = `请求地址出错: ${error.response.config.url}`; break; // 在正确域名下
      case 408: message = '请求超时！'; break;
      case 409: message = '系统已存在相同数据！'; break;
      case 500:
        store.clearToken()
        message = '服务器内部错误！';
        break;
      case 501: message = '服务未实现！'; break;
      case 502: message = '网关错误！'; break;
      case 503: message = '服务不可用！'; break;
      case 504: message = '服务暂时无法访问，请稍后再试！'; break;
      case 505: message = 'HTTP版本不受支持！'; break;
      default: message = '异常问题，请联系管理员！'; break
    }
  }
  if (error.message.includes('timeout')) message = '网络请求超时！';
  if (error.message.includes('Network')) message = window.navigator.onLine ? '服务端异常！' : '您断网了！';
  ElNotification({
    title: 'Error',
    message: message,
    type: 'error',
  })
}

function myAxios(axiosConfig) {
  const store = useStore(pinia);
  const sysStore = systemStore();
  const service = axios.create({
    baseURL,
    timeout: 120000,
    headers: {
      Authorization: store.token || localStorage.getItem('token')
    },
    withCredentials: true,
    ...axiosConfig?.config
  })
  service.interceptors.request.use(
    config => {
      if (!axiosConfig.cancelResponse) {
        removePendingKey(config)
        addPendingKey(config)
      }
      if (axiosConfig?.loading) {
        sysStore.btnLoading = true
      }
      return config
    },
    err => {
      return Promise.reject(err)
    }
  )
  service.interceptors.response.use(
    response => {
      sysStore.btnLoading = false
      removePendingKey(response.config);
      if (!response.data.status) {
        if (axiosConfig?.tips) {
          ElNotification({
            title: 'Error',
            message: response.data.msg,
            type: 'error',
          })
        } else {
          return Promise.reject(response.data.msg)
        }
      } else {
        if (axiosConfig?.tips) {
          ElNotification({
            title: 'Success',
            message: response.data.msg,
            type: 'success',
          })
        }
      }
      return response.data;
    },
    err => {
      sysStore.btnLoading = false
      httpErrorStatusHandle(err, store);
      err.config && removePendingKey(err.config);
      return Promise.reject(err)
    }
  )
  return service(axiosConfig)
}

export default myAxios