<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);

const dialogVisible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const videoRef = ref();
const videoURL = ref("");
const second = ref(10);
const handleChange = (e) => {
  const file = e.target.files[0];
  videoURL.value = window.URL.createObjectURL(file);
  videoRef.value.currentTime = second.value;
  videoRef.value.addEventListener("seeked", () => {
    captureFrame();
  });
};

// 截取视频帧
const frames = ref([]);
const captureFrame = () => {
  const canvas = document.createElement("canvas");
  canvas.width = videoRef.value.clientWidth;
  canvas.height = videoRef.value.clientHeight;
  const context = canvas.getContext("2d");
  context.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL("image/jpeg");
  frames.value.push(imageData);
};

const save = (data) => {
  const link = document.createElement("a");
  link.href = data;
  link.download = "frame.png";
  link.click();
};

watch(second, (val) => {
  videoRef.value.currentTime = val;
});
</script>
<template>
  <el-dialog v-model="dialogVisible" title="视频帧提取">
    <div>
      <input type="file" @change="handleChange" accept="video/*" />
    </div>
    <div class="video-box">
      <video :src="videoURL" controls ref="videoRef" muted></video>
      <div class="input-box">提取视频第<input v-model="second" />秒</div>
    </div>
    <div class="frame">
      <ul>
        <li v-for="(item, idx) in frames" :key="idx">
          <img :src="item" />
          <el-button @click="save(item)" size="small" type="primary"
            >保存</el-button
          >
        </li>
      </ul>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.video-box {
  margin-top: 20px;
  video {
    width: 100%;
  }
}
.input-box {
  margin: 10px;
  text-align: center;
  input {
    width: 50px;
    border: none;
    border-bottom: 1px solid #ccc;
    margin: 0 5px;
    text-align: center;
  }
}
</style>
