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
  loading: true,
  tips: true
})

export const getUserInfo = () => api({
  url: '/userInfo',
  method: 'post'
})

export const updateUserInfo = (data) => api({
  url: '/update/userInfo',
  method: 'post',
  data,
  loading: true,
  tips: true
})