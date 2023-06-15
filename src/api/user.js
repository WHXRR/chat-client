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

export const grantPermissions = (data) => api({
  url: '/grantPermissions',
  method: 'post',
  data,
  loading: true,
  tips: true
})

export const clearMessages = () => api({
  url: '/clearMessages',
  method: 'post',
  loading: true,
  tips: true
})

export const getAllRegisterPeople = () => api({
  url: '/getAllRegisterPeople',
  method: 'post',
})