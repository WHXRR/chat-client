<script setup>
import { useStore } from "@/store/user";
import { uploadStore } from "@/store/upload";
import { ElNotification } from "element-plus";
import UploadLoading from "@/components/UploadLoading.vue";
import api from "@/api";
import socket from "@/socket";

const emit = defineEmits(["loadedImg", "cuePeople", "kickOutGroupChat"]);
const date = new Date();
const store = useStore();
const useUploadStore = uploadStore();
const props = defineProps({
  messageContent: Array,
  messagesUser: Object,
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

const rootPermission = (id, permission) => {
  api.grantPermissions({ id, permission }).then((res) => {
    if (res.status) {
      socket.emit("updateUserInfo", {
        id,
      });
    }
  });
};

const kickOutGroupChat = (id) => {
  emit("kickOutGroupChat", id);
};

const collectEmoji = (data) => {
  api
    .collectEmoji({
      emoji_name: data.fileName,
      emoji_path: data.message,
    })
    .then((res) => {
      if (res.status) {
        store.getUserEmoji();
        ElNotification({
          message: `收藏成功~`,
          type: "success",
        });
      }
    })
    .catch((err) => {
      ElNotification({
        message: err,
        type: "warning",
      });
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
        <div>
          <el-avatar
            class="avatar"
            :src="messagesUser[item.sender_id]?.avatar"
            v-if="item.sender_id === store.user.id"
          >
            <el-icon :size="30"><Pear /></el-icon>
          </el-avatar>
          <!-- 用户菜单 -->
          <el-popover
            v-else
            placement="right"
            trigger="click"
            popper-class="menu-popper"
          >
            <template #reference>
              <el-avatar
                class="avatar"
                :src="messagesUser[item.sender_id]?.avatar"
              >
                <el-icon :size="30"><Pear /></el-icon>
              </el-avatar>
            </template>
            <div class="user-menu">
              <div
                class="user-menu-item"
                v-if="
                  !['admin', 'root'].includes(
                    messagesUser[item.sender_id]?.identity
                  ) && store.user.identity === 'root'
                "
                @click="rootPermission(item.sender_id, 'admin')"
              >
                赋予管理员权限
              </div>
              <div
                class="user-menu-item"
                v-if="
                  !['tourist', 'root'].includes(
                    messagesUser[item.sender_id]?.identity
                  ) && store.user.identity === 'root'
                "
                @click="rootPermission(item.sender_id, 'tourist')"
              >
                转为普通群众
              </div>
              <div
                class="user-menu-item"
                v-if="
                  !['root'].includes(messagesUser[item.sender_id]?.identity) &&
                  ['root', 'admin'].includes(store.user.identity) &&
                  item.sender_id !== store.user.sender_id
                "
                @click="kickOutGroupChat(item.sender_id, item.username)"
              >
                踢出群聊
              </div>
              <div class="user-menu-item">暂未开放</div>
            </div>
          </el-popover>
          <!-- 标签 -->
          <div
            class="tag"
            v-if="messagesUser[item.sender_id]?.identity === 'admin'"
          >
            管理员
          </div>
          <div
            class="tag"
            v-if="messagesUser[item.sender_id]?.identity === 'root'"
          >
            root
          </div>
        </div>
        <div class="msg-right">
          <!-- 发送者信息 -->
          <div
            class="user-name"
            @click="clickName(messagesUser[item.sender_id]?.username)"
          >
            <span
              :class="
                ['root'].includes(messagesUser[item.sender_id]?.identity)
                  ? 'changing-text'
                  : ''
              "
              >{{ messagesUser[item.sender_id]?.username }}</span
            >
            <span class="time">{{ item.create_time }}</span>
          </div>
          <!-- 聊天内容 -->
          <div v-if="item.type === 'text'" class="msg-content">
            {{ item.message }}
          </div>
          <div v-else-if="item.type === 'image'" class="image-container">
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
            <div class="image-icon">
              <el-icon :size="20" @click="collectEmoji(item)"
                ><CirclePlus
              /></el-icon>
            </div>
          </div>
          <div v-else class="file-content" @click="downLoadFile(item.message)">
            <div style="margin-right: 20px">{{ item.fileName }}</div>
            <el-icon :size="50"><Folder /></el-icon>
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
      color: var(--time-color);
      font-size: 12px;
      transform: scale(0.8) translate(-5px, 4px);
      transition: all 0.3s;
      &:hover {
        color: var(--font-color);
      }
    }
    .msg-content {
      padding: 5px 7px;
      margin-top: 5px;
      border-radius: 3px;
      color: var(--message-content-color);
      font-size: 14px;
      word-break: break-all;
      background-color: var(--message-content-background-color);
    }
    .image-container {
      position: relative;
      margin-top: 5px;
      .image-icon {
        cursor: pointer;
        position: absolute;
        right: 0;
        bottom: 0;
        opacity: 0;
        transition: all 0.3s;
        transform: translateX(120%);
      }
      &:hover .image-icon {
        opacity: 1;
      }
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
      margin-top: 5px;
      border-radius: 5px;
      color: var(--file-content-color);
      font-size: 14px;
      background-color: var(--file-content-background-color);
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
      align-items: flex-end;
    }
    .user-name {
      /* display: none; */
      flex-direction: row-reverse;
    }
  }
  .tag {
    padding: 2px;
    border-radius: 3px;
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    text-align: center;
    background-color: #ee7f65;
    transform: scale(0.8);
  }
}
</style>
