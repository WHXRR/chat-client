import api from '@/axios'

export const login = (data) => api({
  url: '/api/login',
  method: 'post',
  data,
  loading: true,
  tips: true
})

export const register = (data) => api({
  url: '/api/register',
  method: 'post',
  data,
  loading: true
})

export const getCaptcha = () => api({
  url: '/api/captcha',
  method: 'post',
  loading: true
})