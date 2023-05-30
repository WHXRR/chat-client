<script setup>
import ChatHeader from "@/views/header/ChatHeader.vue";
import ChatFooter from "@/views/footer/ChatFooter.vue";
import ChatMain from "@/views/main/ChatMain.vue";
import { ref, nextTick, provide } from "vue";
import { useStore } from "@/store/user";
import { io } from "socket.io-client";
import { ElNotification } from "element-plus";

const store = useStore();
const message = ref("");

const socket = io("ws://192.168.1.7:5432");
provide("socket", socket);
// 连接成功
socket.on("connect", () => {
  ElNotification({
    message: `欢迎${store.user.username}来到聊天室~`,
    type: "success",
  });
});

// 断开连接
socket.on("disconnect", () => {
  ElNotification({
    message: "退出成功",
    type: "success",
  });
});

// 处理服务器发送的消息
const allPeoples = ref(0);
socket.on("message", (data) => {
  if (!data.status) {
    store.clearToken();
    return ElNotification({
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
    type: 'text',
    ...store.user,
    sender_id: store.user.id,
    create_time: date.toLocaleString(),
  });
  message.value = "";
};

const sendImage = (data) => {
  socket.emit("send", {
    ...store.user,
    ...data,
    sender_id: store.user.id,
    create_time: date.toLocaleString(),
  });
};
const sendFile = (data) => {
  socket.emit("send", {
    ...store.user,
    ...data,
    sender_id: store.user.id,
    create_time: date.toLocaleString(),
  });
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
    <ChatFooter
      v-model="message"
      @send="send"
      @sendImage="sendImage"
      @sendFile="sendFile"
    />
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
