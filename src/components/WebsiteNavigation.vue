<script setup>
import { computed } from "vue";
import website from "@/utils/website.json";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleClose = () => {
  emit("update:modelValue", false);
};
</script>
<template>
  <div>
    <el-dialog
      title="网址导航"
      v-model="visible"
      width="80%"
      :before-close="handleClose"
    >
      <div v-for="(item, idx) in website" :key="idx">
        <div class="nav-title">{{ item.title }}</div>
        <div class="nav-content">
          <a
            :href="item.link"
            target="_black"
            class="nav-item"
            v-for="(ele, idx2) in item.data"
            :key="idx2"
          >
            {{ ele.name }}
          </a>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.nav-title {
  padding: 10px 0;
  font-size: 16px;
  font-weight: bold;
  color: var(--font-color);
}
.nav-content {
  display: flex;
  flex-wrap: wrap;
  .nav-item {
    cursor: pointer;
    display: block;
    padding: 5px 10px;
    margin: 0 5px 5px 0;
    font-size: 14px;
    border-radius: 5px;
    user-select: none;
    transition: all 0.3s;
    &:hover {
      transform: scale(1.01);
      background-color: #909399;
    }
  }
}
</style>
