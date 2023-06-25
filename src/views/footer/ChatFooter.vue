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

const fileList = ref([]);
const send = () => {
  if (store.user.identity === "tourist" && message.value.length > 50) {
    return ElNotification({
      message: "充值成为会员后可解锁发消息无长度限制功能噢~",
      type: "warning",
    });
  }
  if (fileList.value.length) {
    uploadFile({ file: fileList.value[0] });
  }
  if (!message.value) return;
  emit("send");
};
let warningNum = 0;
const throttleSend = throttle(send, 2000, () => {
  ElNotification({
    message: "再刷屏就把你封了",
    type: "error",
  });
  warningNum++;
  if (warningNum >= 6) {
    warningNum = 0;
    store.clearToken();
  }
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
  if (!res.status) return;
  if (file.file.type.includes("image/")) {
    fileList.value = [];
    pasteImg.value = [];
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

const pasteRef = ref(null);
const pasteImg = ref([]);
const handlePaste = (e) => {
  if (store.user.identity === "tourist") return;
  const txt = e.clipboardData.getData("Text");
  if (typeof txt == "string" && txt !== "") return;
  let file = null;
  const items = (e.clipboardData || window.clipboardData).items;
  if (items && items.length) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        // 如果是image类型存为file
        file = items[i].getAsFile();
        break;
      }
    }
  }
  if (file) {
    fileList.value.push(file);
    let reader = new FileReader();
    reader.onload = (event) => {
      pasteImg.value = [{ src: event.target.result }];
    };
    reader.readAsDataURL(file);
  }
};

const deletePasteImg = () => {
  fileList.value = [];
  pasteImg.value = [];
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
        v-if="['root', 'admin'].includes(store.user.identity)"
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
      @paste="handlePaste"
    ></textarea>
    <div class="send-container">
      <div class="paste-container" ref="pasteRef">
        <div class="paste-img-container" v-for="(item, index) in pasteImg">
          <img class="paste-img" :key="index" :src="item.src" />
          <el-icon color="#ee3131" class="close-icon" @click="deletePasteImg">
            <CircleCloseFilled />
          </el-icon>
        </div>
      </div>
      <button class="send-btn" @click="throttleSend">发送</button>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.chat-footer {
  position: relative;
  user-select: none;
  padding: 10px;
  border-top: 1px solid var(--border-color);
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
    color: var(--font-color);
    font-size: 14px;
    box-sizing: border-box;
    background-color: var(--background-color);
  }
  .send-container {
    display: flex;
    align-items: end;
    justify-content: space-between;
    .paste-container {
      flex: 1;
      .paste-img-container {
        position: relative;
        max-width: 20%;
        .paste-img {
          width: 100%;
          max-height: 100px;
          object-fit: contain;
        }
        .close-icon {
          cursor: pointer;
          position: absolute;
          top: 5px;
          right: 5px;
        }
      }
    }
    .send-btn {
      float: right;
      cursor: pointer;
      font-size: 14px;
      padding: 5px 20px;
      background-color: var(--send-btn-background-color);
      border: 2px solid var(--send-btn-border-color);
      border-radius: 1em;
      color: var(--send-btn-color);
      font-weight: bolder;
      transition: cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s;
      box-shadow: -3px 3px 0px 0px var(--send-btn-shadow-color);
    }
    .send-btn:hover {
      transform: translate(5px, -5px);
    }
  }
}
</style>
