<script setup>
import baseURL from "@/axios/base";
import api from "@/api";
import { computed, inject } from "vue";
import { useStore } from "@/store/user";
import { systemStore } from "@/store/system";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";

const socket = inject("socket");
const store = useStore();
const sysStore = systemStore();
const { user } = storeToRefs(store);
const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleAvatarSuccess = (res) => {
  store.user.avatar = res.data.url;
};

const beforeAvatarUpload = (rawFile) => {
  if (!["image/jpeg", "image/png", "image/jpg"].includes(rawFile.type)) {
    ElMessage.error("图片必须为JPG格式");
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error("上传的图片不能超过2MB");
    return false;
  }
  return true;
};

const saveInfo = () => {
  api
    .updateUserInfo({
      username: store.user.username,
      avatar: store.user.avatar,
    })
    .then((res) => {
      if (res.status) {
        store.getUserInfo();
      }
    });
};

const exit = () => {
  socket.disconnect();
  store.clearToken();
};
</script>
<template>
  <div>
    <el-drawer v-model="visible" title="设置" direction="rtl">
      <div class="info">
        <el-upload
          class="avatar-uploader"
          name="avatar"
          :action="`${baseURL}img`"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
          :headers="{
            Authorization: store.token,
          }"
        >
          <img v-if="user.avatar" :src="user.avatar" class="avatar" />
        </el-upload>
        <input class="username-ipt" type="text" v-model="user.username" />
        <el-button type="info" @click="saveInfo" :loading="sysStore.btnLoading"
          >保存</el-button
        >
      </div>
      <div class="menu">
        <div class="menu-item" @click="exit">
          <div>退出</div>
          <el-icon :size="20"><SwitchButton /></el-icon>
        </div>
      </div>
    </el-drawer>
  </div>
</template>
<style lang="scss" scoped>
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  .avatar-uploader {
    width: 140px;
    height: 140px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 50%;
    box-sizing: border-box;
    border: 1px dashed transparent;
    transition: all 0.3s;
    img {
      width: 100%;
    }
    &:hover {
      border: 1px dashed #cfd3dc;
    }
  }
  .username-ipt {
    display: block;
    margin: 10px auto;
    padding: 10px;
    color: #cfd3dc;
    font-size: 16px;
    text-align: center;
    border: none;
    outline: none;
    background-color: transparent;
  }
}
.menu-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  font-size: 14px;
  border-radius: 5px;
  transition: all 0.3s;
  &:hover {
    transform: scale(1.01);
    background-color: #909399;
  }
}
</style>
