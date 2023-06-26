import api from '@/axios'

export const uploadFiles = (data, config) => api({
  url: '/files',
  method: 'post',
  data,
  loading: true,
  tips: true,
  cancelResponse: true,
  config
})

export const uploadEmoji = (data, config) => api({
  url: '/uploadEmoji',
  method: 'post',
  data,
  loading: true,
  cancelResponse: true,
  config
})

