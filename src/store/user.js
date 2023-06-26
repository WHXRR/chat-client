import { defineStore } from 'pinia'
import { router } from '@/router'
import api from '@/api'
// import socket from "@/socket";
export const useStore = defineStore('user', {
  state: () => {
    return {
      user: {},
      token: localStorage.getItem('token') || '',
      onlineUsers: [],
      userEmojis: []
    }
  },
  actions: {
    clearToken() {
      // socket.disconnect();
      this.token = ''
      localStorage.removeItem("token");
      router.replace({
        name: "Login",
      });
    },
    getUserInfo() {
      api.getUserInfo().then(res => {
        this.user = { ...res.data }
      })
    },
    getUserEmoji() {
      api.getUserEmoji().then((res) => {
        if (res.status) {
          this.userEmojis = res.data;
        }
      });
    }
  }
})