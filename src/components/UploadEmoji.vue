<script setup>
import api from "@/api";
import useClickArea from "@/hooks/useClickArea";
import { ElNotification } from "element-plus";
import { useStore } from "@/store/user";
import { systemStore } from "@/store/system";
import { ref } from "vue";

const store = useStore();
const sysStore = systemStore();
store.getUserEmoji();
const emit = defineEmits(["sendEmoji"]);

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

const uploadFile = (file) => {
  // 设置文件对象
  const formData = new FormData();
  formData.append("image", file.file);
  api
    .uploadEmoji(formData)
    .then((res) => {
      handleSuccess(res);
    })
    .catch((err) => {
      handleError(err, file);
    });
};

const handleSuccess = (res) => {
  if (res.status) {
    store.getUserEmoji();
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

const sendEmoji = (data) => {
  emojiVisible.value = false;
  emit("sendEmoji", data);
};

const deleteEmoji = (data) => {
  api.deleteCollectEmoji({ emoji_path: data.emoji_path }).then((res) => {
    if (res.status) {
      store.getUserEmoji();
    }
  });
};

const emojiVisible = ref(false);
window.addEventListener("click", (e) => {
  const clickArea = useClickArea("custom-emoji-container", e.target);
  const iconArea = useClickArea("emoji-icon2", e.target);
  if (iconArea) return;
  if (!clickArea) {
    emojiVisible.value = false;
  }
});
</script>
<template>
  <div class="tool-item">
    <el-popover
      popper-class="custom-emoji-container"
      placement="top"
      width="auto"
      trigger="click"
      :hide-after="0"
      :visible="emojiVisible"
    >
      <template #reference>
        <el-icon class="emoji-icon2" :size="20" @click="emojiVisible = !emojiVisible">
          <Star />
        </el-icon>
      </template>
      <div class="emoticon-pack-container">
        <div
          class="emoticon-pack-item"
          v-for="item in store.userEmojis"
          :key="item.id"
          @click="sendEmoji(item)"
        >
          <img :src="item.emoji_path" :alt="item.emoji_name" />
          <el-icon
            class="delete-icon"
            :size="18"
            @click.stop="deleteEmoji(item)"
            ><CircleCloseFilled
          /></el-icon>
        </div>
        <el-upload
          class="emoticon-pack-item upload-emoticon-pack"
          name="image"
          v-loading="sysStore.btnLoading"
          :before-upload="beforeFileUpload"
          :show-file-list="false"
          :http-request="uploadFile"
          :headers="{
            Authorization: store.token,
          }"
        >
          <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </div>
    </el-popover>
  </div>
</template>
<style lang="scss" scoped>
.tool-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}
</style>
