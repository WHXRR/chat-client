import { defineStore } from 'pinia'
// import { router } from '@/router'
import api from '@/api'
export const useStore = defineStore('user', {
  state: () => {
    return {
      user: {},
      token: localStorage.getItem('token') || ''
    }
  },
  actions: {
    clearToken() {
      // this.token = ''
      // localStorage.removeItem("token");
      // router.replace({
      //   name: "Login",
      // });
    },
    getUserInfo() {
      api.getUserInfo().then(res => {
        this.user = { ...res.data }
      })
    }
  }
})