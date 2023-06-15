import { defineStore } from 'pinia'
export const systemStore = defineStore('system', {
  state: () => {
    return {
      btnLoading: false,
      chatTheme: localStorage.getItem("chatTheme") || "dark"
    }
  }
})