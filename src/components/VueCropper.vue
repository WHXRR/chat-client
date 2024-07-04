<script setup>
import { computed, reactive, ref } from "vue";
import { VueCropper } from "vue-cropper";
import "vue-cropper/dist/index.css";

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

const option = reactive({
  img: "https://avatars2.githubusercontent.com/u/15681693?s=460&v=4",
  size: 1,
  full: false,
  outputType: "png",
  canMove: true,
  fixedBox: false,
  original: false,
  canMoveBox: true,
  autoCrop: true,
  autoCropWidth: 750,
  autoCropHeight: 340,
  centerBox: true,
  high: true,
  max: 99999,
  show: true,
  fixed: false,
  fixedNumber: [75, 34],
});
const handleChange = (e) => {
  const file = e.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function (e) {
    option.img = e.target.result;
  };
};
// 实时预览函数
const previews = ref("");
const realTime = (data) => {
  previews.value = data;
};
</script>
<template>
  <el-dialog v-model="dialogVisible" title="图片裁剪">
    <div>
      <input type="file" @change="handleChange" accept="image/*" />
    </div>
    <div class="canvas-box">
      <div class="cropper-container">
        <vue-cropper
          ref="cropper"
          v-bind="option"
          mode="contain"
          @real-time="realTime"
        ></vue-cropper>
      </div>
      <div
        class="show-preview"
        :style="{
          width: previews.w + 'px',
          height: previews.h + 'px',
          overflow: 'hidden',
          margin: '5px',
        }"
      >
        <div :style="previews.div">
          <img :src="previews.url" :style="previews.img" />
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.canvas-box {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin-top: 20px;
  .cropper-container {
    width: 500px;
    height: 500px;
  }
}
.btns {
  margin-top: 20px;
  text-align: center;
}
</style>
