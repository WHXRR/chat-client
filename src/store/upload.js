import { defineStore } from 'pinia'

export const uploadStore = defineStore('upload', {
  state: () => {
    return {
      uploadObj: {},
    }
  },
  getters: {
    uploadArrs: state => Object.values(state.uploadObj)
  }
})