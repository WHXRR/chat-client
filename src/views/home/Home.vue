<script setup>
import ChatHeader from "@/views/header/ChatHeader.vue";
import ChatFooter from "@/views/footer/ChatFooter.vue";
import ChatMain from "@/views/main/ChatMain.vue";
import { ref, nextTick, provide } from "vue";
import { useStore } from "@/store/user";
import { io } from "socket.io-client";
import { ElNotification } from "element-plus";
import { socketURL } from "@/axios/base";
import { debounce } from "@/utils/help";

const store = useStore();
const message = ref("");

const socket = io(socketURL);
provide("socket", socket);
// 连接成功
socket.on("connect", () => {
  // 通知服务器更新在线人数
  socket.emit("sendOnlinePeople", {
    number: +1,
    id: store.user.id,
  });

  ElNotification({
    message: `欢迎${store.user.username}来到聊天室~`,
    type: "success",
  });
});

// 更新客户端在线人数
const allPeoples = ref(0);
socket.on("backOnlinePeople", (data) => {
  allPeoples.value = data;
});

// 账号在别处登录
socket.on("multipleLogins", () => {
  socket.disconnect();
  store.clearToken();
  ElNotification({
    message: `账号在别处登录`,
    type: "warning",
  });
});

// 处理服务器发送的历史聊天记录
const messagesTotal = ref(0);
socket.on("message", ({ type, status, data }) => {
  if (!status) {
    store.clearToken();
    return ElNotification({
      message: data,
      type: "error",
    });
  }
  switch (type) {
    case "getFirstMessages":
      const messages1 = data.results.reverse();
      messagesTotal.value = data.total;
      messageContent.value = [...messages1, ...messageContent.value];
      nextTick(() => {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      });
      break;
    case "getMoreMessages":
      const messages2 = data.results.reverse();
      const oldScrollTop = messageContainer.value.scrollHeight;
      messageContent.value = [...messages2, ...messageContent.value];
      nextTick(() => {
        const newScrollTop = messageContainer.value.scrollHeight;
        messageContainer.value.scrollTop = newScrollTop - oldScrollTop;
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
const messageContainer = ref({});
const messageContent = ref([]);
socket.on("back", ({ message, total }) => {
  messageContent.value.push(message);
  messagesTotal.value = total;
  // 如果10秒内没消息，之后有消息就发送浏览器通知
  debounce(browserNotification, 10000);
  // 当滚动条不是在最底部时，有新消息不滚动到最底部
  if (
    messageContainer.value.scrollTop + messageContainer.value.clientHeight <
    messageContainer.value.scrollHeight - 100
  )
    return;
  nextTick(() => {
    messageContainer.value.scrollTop =
      messageContainer.value.scrollHeight - messageContainer.value.clientHeight;
  });
});

// 被踢出群聊
socket.on("kickOut", ({ username }) => {
  socket.disconnect();
  store.clearToken();
  ElNotification({
    message: `你已被管理员${username}踢出群聊`,
    type: "warning",
  });
});

// 断开连接
socket.on("disconnect", () => {
  ElNotification({
    message: "退出成功",
    type: "success",
  });
});

// 添加浏览器通知
const browserNotification = () => {
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
};

// 最后一张图懒加载时，将滚动条滚至最底部
const loadedImg = (id) => {
  const imgMessages = messageContent.value.filter(
    (item) => item.type === "image"
  );
  if (id === imgMessages[imgMessages.length - 1].id) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

const currentPage = ref(1);
const scrollToTop = (e) => {
  if (
    e.target.scrollTop === 0 &&
    messageContent.value.length !== messagesTotal.value
  ) {
    currentPage.value = currentPage.value + 1;
    socket.emit("loadMessage", {
      currentPage: currentPage.value,
    });
  }
};

const cuePeople = (name) => {
  message.value = message.value + `@${name} `;
};

const kickOutGroupChat = (id) => {
  socket.emit("kickOutGroupChat", { id, username: store.user.username });
};
</script>
<template>
  <div class="chat-container">
    <ChatHeader :allPeoples="allPeoples" />
    <div class="main" ref="messageContainer" @scroll="scrollToTop">
      <ChatMain
        :messageContent="messageContent"
        @loadedImg="loadedImg"
        @cuePeople="cuePeople"
        @kickOutGroupChat="kickOutGroupChat"
      />
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
