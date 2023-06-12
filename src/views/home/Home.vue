<script setup>
import ChatHeader from "@/views/header/ChatHeader.vue";
import ChatFooter from "@/views/footer/ChatFooter.vue";
import ChatMain from "@/views/main/ChatMain.vue";
import { ref, nextTick, provide } from "vue";
import { useStore } from "@/store/user";
import { io } from "socket.io-client";
import { ElNotification } from "element-plus";
import { socketURL } from "@/axios/base";

const store = useStore();
const message = ref("");

const socket = io(socketURL);
provide("socket", socket);
// 连接成功
socket.on("connect", () => {
  // 更新在线人数
  socket.emit("sendOnlinePeople", {
    number: +1,
    id: store.user.id
  });

  ElNotification({
    message: `欢迎${store.user.username}来到聊天室~`,
    type: "success",
  });
});

socket.on("multipleLogins", () => {
  socket.disconnect();
  store.clearToken()
  ElNotification({
    message: `账号在别处登录，你被挤啦`,
    type: "warning",
  });
});

const allPeoples = ref(0);
socket.on("backOnlinePeople", (data) => {
  allPeoples.value = data;
});

// 断开连接
socket.on("disconnect", () => {
  ElNotification({
    message: "退出成功",
    type: "success",
  });
});

// 处理服务器发送的消息
socket.on("message", (data) => {
  if (!data.status) {
    store.clearToken();
    return ElNotification({
      message: data.data,
      type: "error",
    });
  }
  switch (data.type) {
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
    type: "text",
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
  if ("Notification" in window) {
    const notification = new Notification("新消息", {
      body: "你有一条新消息",
    });
    if (Notification.permission === "granted") {
      return notification;
    } else if (Notification.permission !== "denied") {
      // 请求用户授权
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          return notification;
        }
      });
    }
  }
  nextTick(() => {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  });
});

// 最后一张图懒加载时，将滚动条滚至最底部
const loadedImg = (id) => {
  const imgMessages = messageContent.value.filter(
    (item) => item.type === "image"
  );
  if (id === imgMessages[imgMessages.length - 1].id) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};
</script>
<template>
  <div class="chat-container">
    <ChatHeader :allPeoples="allPeoples" />
    <div class="main" ref="messageContainer">
      <ChatMain :messageContent="messageContent" @loadedImg="loadedImg" />
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
