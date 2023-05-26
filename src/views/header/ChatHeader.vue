<script setup>
import SystemDrawer from "@/components/SystemDrawer.vue";
import { ref } from "vue";

const props = defineProps({
  allPeoples: {
    type: Number,
    default: 0
  },
});

const open = ref(false);
</script>
<template>
  <div class="chat-header">
    <div>相亲相爱一家人({{ allPeoples }})</div>
    <div class="icon" @click="open = true">
      <el-icon size="20">
        <More />
      </el-icon>
    </div>
  </div>
  <SystemDrawer v-model="open" />
</template>
<style lang="scss" scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #3e4452;
  .icon {
    cursor: pointer;
  }
}
</style>
