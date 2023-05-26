<script setup>
import ChatHeader from "@/views/header/ChatHeader.vue";
import ChatFooter from "@/views/footer/ChatFooter.vue";
import ChatMain from "@/views/main/ChatMain.vue";
import { ref, nextTick } from "vue";
import { useStore } from "@/store/user";
import socket from "@/utils/socket";
import { ElMessage } from "element-plus";

const store = useStore();
const message = ref("");

// 连接成功
socket.on("connect", () => {
  ElMessage({
    message: `欢迎${store.user.username}来到聊天室~`,
    type: "success",
  });
});

// 断开连接
socket.on("disconnect", () => {
  ElMessage({
    message: "退出成功",
    type: "success",
  });
});

// 处理服务器发送的消息
const allPeoples = ref(0);
socket.on("message", (data) => {
  if (!data.status) {
    store.clearToken();
    return ElMessage({
      message: data.data,
      type: "error",
    });
  }
  switch (data.type) {
    case "getChatPeople":
      allPeoples.value = data.data;
      break;
    case "getMessages":
      messageContent.value = data.data;
      nextTick(() => {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      });
      break;
  }
});

// 发送消息
const date = new Date();
const send = () => {
  socket.emit("send", {
    message: message.value,
    ...store.user,
    sender_id: store.user.id,
    create_time: date.toLocaleString(),
  });
  message.value = "";
};

// 接收消息
const messageContainer = ref(null);
const messageContent = ref([]);
socket.on("back", (msg) => {
  messageContent.value.push(msg);
  nextTick(() => {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  });
});
</script>
<template>
  <div class="chat-container">
    <ChatHeader :allPeoples="allPeoples" />
    <div class="main" ref="messageContainer">
      <ChatMain :messageContent="messageContent" />
    </div>
    <ChatFooter v-model="message" @send="send" />
  </div>
</template>
<style lang="scss" scoped>
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  color: #cfd3dc;
  background-color: #21252b;
  .main {
    flex: 1;
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
