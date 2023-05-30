import api from '@/axios'

export const uploadFiles = (data, config) => api({
  url: '/files',
  method: 'post',
  data,
  loading: true,
  tips: true,
  config
})
