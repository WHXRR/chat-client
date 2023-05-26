<script setup>
import { useStore } from "@/store/user";

const store = useStore();
const props = defineProps({
  messageContent: Array,
});
</script>
<template>
  <div class="chat-main">
    <TransitionGroup name="list" tag="div">
      <div
        :class="`msg-item ${item.sender_id === store.user.id ? 'my' : ''}`"
        v-for="(item, index) in messageContent"
        :key="index"
      >
        <el-avatar class="avatar" :src="item.avatar" />
        <div class="msg-right">
          <div class="user-name">
            <span>{{ item.username }}</span>
            <span class="time">{{ item.create_time }}</span>
          </div>
          <div class="msg-content">{{ item.message }}</div>
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

  /* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
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
      border-radius: 5px;
      color: #21252b;
      font-size: 14px;
      word-break: break-all;
      background-color: #fff;
    }
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
