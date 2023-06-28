import api from '@/axios'

export const getUserInfo = () => api({
  url: '/userInfo',
  method: 'post'
})

export const getAllUserInfo = () => api({
  url: '/all/userInfo',
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

export const getUserEmoji = () => api({
  url: '/getUserEmoji',
  method: 'post',
})

export const collectEmoji = (data) => api({
  url: '/collectEmoji',
  method: 'post',
  data
})

export const deleteCollectEmoji = (data) => api({
  url: '/delete/collectEmoji',
  method: 'post',
  loading: true,
  data
})