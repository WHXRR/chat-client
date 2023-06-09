<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { useStore } from "@/store/user";
import { ElNotification } from "element-plus";
import { uploadStore } from "@/store/upload";
import { throttle } from "@/utils/help";
import useClickArea from "@/hooks/useClickArea";
import Emoji from "@/components/Emoji.vue";
import api from "@/api";

const store = useStore();
const useUploadStore = uploadStore();
const props = defineProps({
  modelValue: String,
});
const emit = defineEmits(["send", "update:modelValue", "sendImage"]);
const send = () => {
  if (!message.value) return;
  if (message.value.length > 20) {
    return ElNotification({
      message: "充值成为会员后可解锁发消息无长度限制功能噢~",
      type: "warning",
    });
  }
  emit("send");
};
const throttleSend = throttle(send, 2000, () => {
  ElNotification({
    message: "再刷屏就把你封了",
    type: "error",
  });
});
const message = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
  },
});

const showEmoji = ref(false);
const messageInputRef = ref(null);
const handleEmojiClick = (emoji) => {
  showEmoji.value = false;
  const start = messageInputRef.value.selectionStart;
  const end = messageInputRef.value.selectionEnd;
  message.value =
    message.value.substring(0, start) + emoji + message.value.substring(end);
  const cursorPos = start + emoji.length;
  nextTick(() => {
    messageInputRef.value.focus();
    messageInputRef.value.setSelectionRange(cursorPos, cursorPos);
  });
};
// 修改输入框的enter事件
onMounted(() => {
  messageInputRef.value.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // 阻止默认的换行行为
      throttleSend();
    }
  });
});

window.addEventListener("click", (e) => {
  const clickArea = useClickArea("emoji-container", e.target);
  const iconArea = useClickArea("emoji-icon", e.target);
  if (iconArea) return;
  if (!clickArea) {
    showEmoji.value = false;
  }
});

const uploadFile = (file) => {
  const name = file.file.name;
  const type = file.file.type.includes("image") ? "image" : "file";
  // 设置取消请求
  const controller = new AbortController();
  useUploadStore.cancelTokens[name] = controller;
  // const cancelToken = new axios.CancelToken((cancel) => {
  //   useUploadStore.cancelTokens[name] = cancel;
  // });
  // 设置文件对象
  const formData = new FormData();
  formData.append("file", file.file);
  api
    .uploadFiles(formData, {
      // cancelToken,
      signal: controller.signal,
      onUploadProgress: (progressEvent) => {
        const percentage = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        useUploadStore.uploadObj[name] = {
          type,
          percentage,
          name,
        };
      },
    })
    .then((res) => {
      delete useUploadStore.uploadObj[name];
      handleSuccess(res, file);
    })
    .catch((err) => {
      delete useUploadStore.uploadObj[name];
      handleError(err, file);
    });
};
const beforeFileUpload = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElNotification({
      title: "Warning",
      message: "上传的内容不能超过2MB!",
      type: "warning",
    });
    return false;
  }
  return true;
};
const handleSuccess = (res, file) => {
  if (file.file.type.includes("image/")) {
    return emit("sendImage", {
      fileName: file.file.name,
      message: res.data.url,
      type: "image",
    });
  } else {
    return emit("sendFile", {
      fileName: file.file.name,
      message: res.data.url,
      type: "file",
    });
  }
};
const handleError = (error, file) => {
  const message =
    error.name === "CanceledError" ? `取消上传 ${file.file.name}` : error;
  ElNotification({
    title: "Error",
    message,
    type: "error",
  });
};
</script>
<template>
  <div class="chat-footer">
    <div class="emoji-container">
      <Emoji @emojiClick="handleEmojiClick" v-show="showEmoji" />
    </div>
    <div class="tools">
      <el-icon
        class="tool-item emoji-icon"
        :size="20"
        @click="showEmoji = !showEmoji"
      >
        <Star />
      </el-icon>
      <el-upload
        class="upload-file"
        name="file"
        v-permission="store.user.identity"
        :on-success="handleSuccess"
        :on-error="handleError"
        :before-upload="beforeFileUpload"
        :show-file-list="false"
        :http-request="uploadFile"
        :headers="{
          Authorization: store.token,
        }"
      >
        <el-icon class="tool-item emoji-icon" :size="20"><Folder /></el-icon>
      </el-upload>
    </div>
    <textarea
      v-focus
      ref="messageInputRef"
      class="send-ipt"
      placeholder="请输入..."
      v-model.trim="message"
    ></textarea>
    <button class="send-btn" @click="throttleSend">发送</button>
  </div>
</template>
<style lang="scss" scoped>
.chat-footer {
  position: relative;
  user-select: none;
  padding: 10px;
  border-top: 1px solid #3e4452;
  .emoji-container {
    position: absolute;
    top: -10px;
    transform: translateY(-100%);
  }
  .tools {
    display: flex;
    margin-bottom: 10px;
    .tool-item {
      cursor: pointer;
      margin-right: 10px;
    }
  }
  .send-ipt {
    height: 100px;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    color: #cfd3dc;
    font-size: 14px;
    box-sizing: border-box;
    background-color: #21252b;
  }
  .send-btn {
    float: right;
    cursor: pointer;
    font-size: 14px;
    padding: 5px 20px;
    background-color: #21252b;
    border: 2px solid #323842;
    border-radius: 1em;
    color: #cfd3dc;
    font-weight: bolder;
    transition: cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s;
    box-shadow: -3px 3px 0px 0px #323842;
  }
  .send-btn:hover {
    transform: translate(5px, -5px);
  }
}
</style>
