<script setup>
import SystemDrawer from "@/components/SystemDrawer.vue";
import api from "@/api";
import { ref } from "vue";
import { useStore } from "@/store/user";

const store = useStore();
const props = defineProps({
  allPeoples: {
    type: Number,
    default: 0,
  },
});

const registerPeople = ref(0);
const getAllRegisterPeople = () => {
  api.getAllRegisterPeople().then((res) => {
    registerPeople.value = res.data.total;
  });
};
getAllRegisterPeople();

const open = ref(false);

const showOnlineContainer = ref(false);
</script>
<template>
  <div class="header">
    <div class="chat-header">
      <div>相亲相爱一家人({{ allPeoples }}/{{ registerPeople }})</div>
      <div class="icon" @click="open = true">
        <el-icon size="20">
          <More />
        </el-icon>
      </div>
    </div>
    <div class="online-container">
      <Transition name="online">
        <div class="online-content" v-show="showOnlineContainer">
          <div class="online-user" v-for="item in store.onlineUsers">
            <el-avatar class="avatar" :src="item.avatar">
              <el-icon :size="20"><Pear /></el-icon>
            </el-avatar>
            <div class="username">{{ item.username }}</div>
          </div>
        </div>
      </Transition>
      <div
        class="online-icon"
        @click="showOnlineContainer = !showOnlineContainer"
      >
        <el-icon :size="14" v-show="!showOnlineContainer"
          ><ArrowDownBold
        /></el-icon>
        <el-icon :size="14" v-show="showOnlineContainer"
          ><ArrowUpBold
        /></el-icon>
      </div>
    </div>
  </div>
  <SystemDrawer v-model="open" />
</template>
<style lang="scss" scoped>
.online-enter-active,
.online-leave-active {
  transition: all 0.5s ease;
}

.online-enter-from,
.online-leave-to {
  transform: translateY(-50%);
  opacity: 0;
}
.header {
  position: relative;
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  .icon {
    cursor: pointer;
  }
}
.online-container {
  position: absolute;
  width: 100%;
  z-index: 2;
  .online-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(40px, 40px));
    gap: 20px;
    justify-content: center;
    margin: 0 20px;
    padding: 10px;
    font-size: 12px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    border: 1px solid var(--border-color);
    border-top: none;
    background-color: var(--background-color);
    .online-user {
      text-align: center;
    }
    .username {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .online-icon {
    cursor: pointer;
    width: 36px;
    margin: 0 auto;
    padding: 2px 10px;
    border-top: none;
    line-height: 0.1;
    border: 1px solid var(--border-color);
    border-top: none;
    box-sizing: border-box;
    background-color: var(--background-color);
  }
}
</style>
