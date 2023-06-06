<script setup>
import { uploadStore } from "@/store/upload";

const useUploadStore = uploadStore();
const props = defineProps({
  width: {
    type: Number,
    default: 50,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  type: {
    type: String,
    required: true,
  },
  file: {
    type: Object,
  },
});
const colors = [
  { color: "#f56c6c", percentage: 20 },
  { color: "#e6a23c", percentage: 40 },
  { color: "#5cb87a", percentage: 60 },
  { color: "#1989fa", percentage: 80 },
  { color: "#6f7ad3", percentage: 100 },
];

const cancelUpload = () => {
  useUploadStore.cancelRequest(props.file.name);
};
</script>
<template>
  <div class="upload-loading">
    <el-icon v-if="type === 'image'" color="#ffffff" :size="150">
      <Picture />
    </el-icon>
    <div v-else class="file-content">
      <div style="margin-right: 20px">{{ file.name }}</div>
      <el-icon color="#ffffff" :size="50"><Folder /></el-icon>
    </div>
    <el-progress
      @click="cancelUpload"
      class="loading pointer"
      type="dashboard"
      :percentage="percentage"
      :color="colors"
      :width="width"
    />
  </div>
</template>
<style lang="scss" scoped>
.upload-loading {
  position: relative;
  .pointer {
    cursor: pointer;
  }
  &::after {
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    background-color: rgba(33, 37, 43, 0.7);
  }
  .loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2; 
    :deep(.el-progress__text) {
      color: #fff;
    }
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
</style>
