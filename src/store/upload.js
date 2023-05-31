import { defineStore } from 'pinia'

export const uploadStore = defineStore('upload', {
  state: () => {
    return {
      uploadObj: {},
      cancelTokens: {},
    }
  },
  getters: {
    uploadArrs: state => Object.values(state.uploadObj)
  },
  actions: {
    cancelRequest(id) {
      if (this.cancelTokens[id]) {
        this.cancelTokens[id].abort(`取消上传 ${id}`)
        // this.cancelTokens[id](`取消上传 ${id}`);
        // delete this.cancelTokens[id];
      }
    }
  }
})