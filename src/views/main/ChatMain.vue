<script setup>
import { useStore } from "@/store/user";
import { uploadStore } from "@/store/upload";
import UploadLoading from "@/components/UploadLoading.vue";
import api from "@/api";

const emit = defineEmits(["loadedImg", "cuePeople"]);
const date = new Date();
const store = useStore();
const useUploadStore = uploadStore();
const props = defineProps({
  messageContent: Array,
});

const downLoadFile = (url) => {
  window.open(url, "_black");
};

const handleLoadImg = (id) => {
  emit("loadedImg", id);
};

const clickName = (name) => {
  emit("cuePeople", name);
  document.querySelector(".send-ipt").focus();
};

const rootPermission = (id) => {
  api.grantPermissions({ id }).then((res) => {
    console.log(res);
  });
};
</script>
<template>
  <div class="chat-main">
    <!-- 展示消息 -->
    <TransitionGroup name="list" tag="div">
      <div
        :class="`msg-item ${item.sender_id === store.user.id ? 'my' : ''}`"
        v-for="(item, index) in messageContent"
        :key="index"
      >
        <el-popover
          placement="right"
          trigger="click"
          popper-class="menu-popper"
        >
          <template #reference>
            <el-avatar class="avatar" :src="item.avatar">
              <el-icon :size="30"><Pear /></el-icon>
            </el-avatar>
          </template>
          <div class="user-menu">
            <div
              class="user-menu-item"
              v-permission="store.user.identity"
              @click="rootPermission(item.sender_id)"
            >
              赋予root权限
            </div>
            <div class="user-menu-item">暂未开放</div>
            <div class="user-menu-item">暂未开放</div>
          </div>
        </el-popover>
        <div class="msg-right">
          <div class="user-name" @click="clickName(item.username)">
            <span>{{ item.username }}</span>
            <span class="time">{{ item.create_time }}</span>
          </div>
          <div v-if="item.type === 'text'" class="msg-content">
            {{ item.message }}
          </div>
          <div v-else-if="item.type === 'image'" style="margin-top: 5px">
            <el-image
              class="img-content"
              :src="item.message"
              :preview-src-list="[item.message]"
              @load="handleLoadImg(item.id)"
              fit="contain"
              lazy
              hide-on-click-modal
            >
              <template #placeholder>
                <div>
                  {{ item.fileName }}
                </div>
              </template>
              <template #error>
                <div class="image-slot">
                  <el-icon :size="50"><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <div v-else class="file-content" @click="downLoadFile(item.message)">
            <div style="margin-right: 20px">{{ item.fileName }}</div>
            <el-icon color="#ffffff" :size="50"><Folder /></el-icon>
          </div>
        </div>
      </div>
    </TransitionGroup>
    <!-- 展示上传文件的loading -->
    <TransitionGroup name="list" tag="div">
      <div
        class="msg-item my upload-item"
        v-for="(item, index) in useUploadStore.uploadArrs"
        :key="index"
      >
        <el-avatar class="avatar" :src="store.user.avatar" />
        <div class="msg-right">
          <div class="user-name">
            <span>{{ store.user.username }}</span>
            <span class="time">{{ date.toLocaleString() }}</span>
          </div>
          <div>
            <UploadLoading
              :type="item.type"
              :percentage="item.percentage"
              :file="item"
            />
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
<style lang="scss" scoped>
.chat-main {
  padding: 20px;
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }

  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }
  .list-leave-active {
    position: absolute;
  }
  .msg-item {
    display: flex;
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
    .avatar {
      flex-shrink: 0;
      background-color: transparent;
      cursor: pointer;
    }
    .msg-right {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding-left: 5px;
    }
    .user-name {
      display: flex;
      font-size: 15px;
      cursor: pointer;
    }
    .time {
      color: #3e4452;
      font-size: 12px;
      transform: scale(0.8) translate(-5px, 4px);
      transition: all 0.3s;
      &:hover {
        color: #cfd3dc;
      }
    }
    .msg-content {
      padding: 5px 7px;
      margin-top: 5px;
      border-radius: 3px;
      color: #21252b;
      font-size: 14px;
      word-break: break-all;
      background-color: #fff;
    }
    .img-content {
      max-width: 20vw;
      border-radius: 5px;
    }
    .file-content {
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 10px 20px;
      border-radius: 5px;
      font-size: 14px;
      background-color: #3e4452;
    }
  }
  .upload-item {
    margin-top: 20px;
  }
  .my {
    flex-direction: row-reverse;
    .msg-right {
      padding-left: 0;
      padding-right: 10px;
    }
    .user-name {
      display: none;
    }
  }
}
</style>
