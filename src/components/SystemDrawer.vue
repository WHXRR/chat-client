<script setup>
import baseURL from "@/axios/base";
import api from "@/api";
import socket from "@/socket";
import WebsiteNavigation from "@/components/WebsiteNavigation.vue";
import { computed, ref } from "vue";
import { useStore } from "@/store/user";
import { systemStore } from "@/store/system";
import { storeToRefs } from "pinia";
import { ElNotification } from "element-plus";
import { setCssVar } from "@/hooks/useSwitchTheme";
import { Sunny, Moon } from "@element-plus/icons-vue";
import Clip from "@/components/Clip.vue";
import ClipVueCropper from "@/components/VueCropper.vue";
import VideoFrame from "@/components/VideoFrame.vue";

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
  if (res.status) {
    store.user.avatar = res.data.url;
  } else {
    ElNotification({
      message: res.msg,
      type: "error",
    });
  }
};

const beforeAvatarUpload = (rawFile) => {
  if (!["image/jpeg", "image/png", "image/jpg"].includes(rawFile.type)) {
    ElNotification({
      message: "图片必须为jpeg、png、jpeg格式",
      type: "error",
    });
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElNotification({
      message: "上传的图片不能超过2MB",
      type: "error",
    });
    return false;
  }
  return true;
};

const saveInfo = () => {
  if (!store.user.username) return;
  api
    .updateUserInfo({
      username: store.user.username,
      avatar: store.user.avatar,
    })
    .then((res) => {
      if (res.status) {
        socket.emit("updateUserInfo", {
          id: store.user.id,
        });
      }
    });
};

const changeTheme = (e) => {
  setCssVar(e);
};

const clearMessages = () => {
  api.clearMessages();
};

const exit = () => {
  socket.disconnect();
  store.clearToken();
  // 主动断开连接时需向服务端发送消息，将该用户对应的socket对象设为null
  socket.emit("disconnectChat", { id: store.user.id });
};

const showWebNav = ref(false);

const token = store.token.split(" ")[1];
const clipVisible = ref(false);
const clipVisible2 = ref(false);
const videoVisible = ref(false);
</script>
<template>
  <div>
    <el-drawer
      class="system-drawer"
      v-model="visible"
      title="设置"
      direction="rtl"
    >
      <div class="info">
        <el-upload
          v-if="['root', 'admin'].includes(store.user.identity)"
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
          <el-image class="img-content" :src="user.avatar" fit="contain">
            <template #error>
              <div class="image-slot">
                <el-icon :size="80"><Pear /></el-icon>
              </div>
            </template>
          </el-image>
        </el-upload>
        <el-image
          v-else="user.avatar"
          class="avatar-content"
          :src="user.avatar"
          fit="contain"
        >
          <template #error>
            <div class="image-slot">
              <el-icon :size="80"><Pear /></el-icon>
            </div>
          </template>
        </el-image>
        <input class="username-ipt" type="text" v-model.trim="user.username" />
        <el-button @click="saveInfo" :loading="sysStore.btnLoading"
          >保存</el-button
        >
      </div>
      <div class="menu">
        <a
          href="https://github.com/WHXRR/chat-client"
          target="_black"
          class="menu-item"
        >
          <div>前端git地址</div>
          <el-icon :size="20"><Link /></el-icon>
        </a>
        <div class="menu-item" @click="showWebNav = true">
          <div>好东西</div>
          <el-icon :size="20"><View /></el-icon>
        </div>
        <div class="menu-item">
          <div>主题切换</div>
          <div>
            <el-switch
              @change="changeTheme"
              v-model="sysStore.chatTheme"
              inline-prompt
              :active-icon="Moon"
              :inactive-icon="Sunny"
              active-value="dark"
              inactive-value="light"
            />
          </div>
        </div>
        <div v-permission="['root']">
          <div class="menu-item" @click="clearMessages">
            <div>清空聊天记录</div>
            <el-icon :size="20"><Delete /></el-icon>
          </div>
        </div>
        <div v-permission="['root']">
          <a
            :href="`http://47.97.159.103:3336?token=${token}`"
            target="_black"
            class="menu-item"
          >
            <div>app版本管理系统</div>
            <el-icon :size="20"><SetUp /></el-icon>
          </a>
        </div>
        <div class="menu-item" @click="clipVisible = true" v-permission="['root']">
          <div>前端裁剪</div>
          <el-icon :size="20"><Scissor /></el-icon>
        </div>
        <div class="menu-item" @click="clipVisible2 = true" v-permission="['root']">
          <div>前端裁剪 vue-cropper</div>
          <el-icon :size="20"><Scissor /></el-icon>
        </div>
        <div class="menu-item" @click="videoVisible = true" v-permission="['root']">
          <div>前端视频帧提取</div>
          <el-icon :size="20"><Scissor /></el-icon>
        </div>
        <div class="menu-item" @click="exit">
          <div>退出</div>
          <el-icon :size="20"><SwitchButton /></el-icon>
        </div>
      </div>
    </el-drawer>
    <WebsiteNavigation v-model="showWebNav" />
    <Clip v-model="clipVisible" />
    <ClipVueCropper v-model="clipVisible2" />
    <VideoFrame v-model="videoVisible" />
  </div>
</template>
<style lang="scss" scoped>
@media (max-width: 1024px) {
  :deep(.system-drawer) {
    width: 60% !important;
  }
}
@media (max-width: 767px) {
  :deep(.system-drawer) {
    width: 80% !important;
  }
}
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  user-select: none;
  .avatar-uploader {
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
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
.avatar-content {
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.menu-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  font-size: 14px;
  border-radius: 5px;
  user-select: none;
  transition: all 0.3s;
  &:hover {
    transform: scale(1.01);
    background-color: #909399;
  }
}
</style>
