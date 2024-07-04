<script setup>
import { computed, ref } from "vue";
import {
  getDotPosition,
  getDashPosition,
  getPixelRatio,
  getCursorStyle,
  getRectDotPosition,
  calcRect,
  getPhotoData,
} from "@/utils/help";

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

const canvas = ref(null);
let ctx = null;
// 是否拖拽
let isMoveClipBox = false;
// 拖拽开始时获取鼠标位置
let startX = 0;
let startY = 0;
// 裁剪框信息
let selectRectParams = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
};
// 裁剪框上的像素点大小
const size = 4;
// 上传的图片
let uploadImage = null;
// 图片缩放比
let imgScale = 1;
// 图片的宽高
const imageParams = {
  width: 0,
  height: 0,
};
let ratio;
let areaPosition = [];
let mouseMoveArea = 0;
const initSize = {
  width: 500,
  height: 500,
  proportion: 1,
};
let canvasSize = {
  width: "",
  height: "",
};

const handleChange = async (e) => {
  const files = [...e.target.files];
  const { image } = await filesInfo(files[0]);
  uploadImage = image;
  resetCanvas();
};

// 获取file信息，并且返回图片
const filesInfo = (file) => {
  return new Promise((res, rej) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) {
      let image = new Image();
      image.onload = function () {
        res({
          image,
        });
      };
      image.src = e.target.result;
      image.crossOrigin = "Anonymous";
    };
  });
};

const initImageCanvas = () => {
  const { width: imgWidth, height: imgHeight } = uploadImage;
  const imgProportion = imgWidth / imgHeight;
  imageParams.width = imgWidth;
  imageParams.height = imgHeight;

  if (imgWidth <= initSize.width && imgHeight <= initSize.height) {
    return (imgScale = 1);
  }
  if (imgProportion > initSize.proportion) {
    imgScale = initSize.width / imgWidth;
  } else {
    imgScale = initSize.height / imgHeight;
  }
};
// canvas绘制图片
const calcCanvasSize = () => {
  ctx = canvas.value.getContext("2d");
  ratio = getPixelRatio(ctx);
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
  const canvasWidth = Math.min(initSize.width, imageParams.width * imgScale);
  const canvasHeight = Math.min(initSize.height, imageParams.height * imgScale);
  canvas.value.width = canvasWidth * ratio;
  canvas.value.height = canvasHeight * ratio;
  canvas.value.style.width = canvasWidth + "px";
  canvas.value.style.height = canvasHeight + "px";
  selectRectParams.w = canvasWidth;
  selectRectParams.h = canvasHeight;
  ctx.scale(ratio, ratio);
  canvasSize = {
    width: canvasWidth,
    height: canvasHeight,
  };
};

// 绘制蒙层
const drawMask = () => {
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  ctx.globalCompositeOperation = "source-atop";
  ctx.restore();
};
// 绘制图片
const drawImage = () => {
  let { width: canvasWidth, height: canvasHeight } = canvasSize;
  const scaleImgWidth = imgScale * imageParams.width;
  const scaleImgHeight = imgScale * imageParams.height;
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.drawImage(
    uploadImage,
    (canvasWidth - scaleImgWidth) / 2,
    (canvasHeight - scaleImgHeight) / 2,
    scaleImgWidth,
    scaleImgHeight
  );
  ctx.restore();
};
// 绘制裁剪框
const drawClipBox = (x, y, w, h) => {
  ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
  drawMask();
  ctx.save();
  ctx.clearRect(x, y, w, h);
  ctx.strokeStyle = "#5696f8";
  ctx.strokeRect(x, y, w, h);
  // 绘制8个点
  ctx.fillStyle = "#5696f8";
  const dots = getDotPosition(x, y, w, h, size);
  dots.map((v) => ctx.fillRect(...v));

  // 绘制线条
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 255, 255, .75)";
  const dashs = getDashPosition(x, y, w, h);
  dashs.map((v) => {
    ctx.beginPath();
    ctx.setLineDash([2, 4]);
    ctx.moveTo(v[0], v[1]);
    ctx.lineTo(v[2], v[3]);
    ctx.closePath();
    ctx.stroke();
    return null;
  });
  ctx.restore();

  drawImage();

  // 获取选择框四个顶点跟四条边坐标
  areaPosition = getRectDotPosition(x, y, w, h, size);
  areaPosition.push([x, y, w, h]);
};

const checkInPath = (pathX, pathY, rectPosi) => {
  ctx.beginPath();
  ctx.rect(...rectPosi);
  const result = ctx.isPointInPath(pathX, pathY);
  ctx.closePath();
  return result;
};

const handleMouseDown = (e) => {
  if (!uploadImage) return;
  isMoveClipBox = true;
  startX = e.offsetX;
  startY = e.offsetY;
  if (firstSelectArea === null) {
    firstSelectArea = mouseMoveArea;
  }
};

let firstSelectArea = null;
const handleMouseMove = (e) => {
  const { offsetX, offsetY } = e;
  const pathX = offsetX * ratio;
  const pathY = offsetY * ratio;
  let cursor = "initial";
  mouseMoveArea = 9;
  for (let i = 0; i < areaPosition.length; i++) {
    if (checkInPath(pathX, pathY, areaPosition[i])) {
      cursor = getCursorStyle(i);
      mouseMoveArea = i;
      break;
    }
  }
  canvas.value.style.cursor = cursor;
  if (!isMoveClipBox) return;
  const distanceX = offsetX - startX;
  const distanceY = offsetY - startY;
  selectRectParams = calcRect(
    firstSelectArea !== null ? firstSelectArea : mouseMoveArea,
    selectRectParams,
    {
      x: distanceX,
      y: distanceY,
    }
  );
  if (selectRectParams.x <= 0) {
    selectRectParams.x = 0;
  } else if (selectRectParams.x + selectRectParams.w >= canvasSize.width) {
    selectRectParams.x = canvasSize.width - selectRectParams.w;
  }
  if (selectRectParams.y <= 0) {
    selectRectParams.y = 0;
  } else if (selectRectParams.y + selectRectParams.h >= canvasSize.height) {
    selectRectParams.y = canvasSize.height - selectRectParams.h;
  }
  drawClipBox(
    selectRectParams.x,
    selectRectParams.y,
    selectRectParams.w,
    selectRectParams.h
  );
  startX = offsetX;
  startY = offsetY;
};

const handleMouseUp = () => {
  if (!isMoveClipBox) return;
  isMoveClipBox = false;
  firstSelectArea = null;
  previewImage();
};

const previewImage = async () => {
  const blob = await getPhotoData({
    imageParams,
    uploadImage,
    canvasSize,
    imgScale,
    selectRectParams,
  });
  const newDataUrl = window.URL.createObjectURL(blob);
  previewURL.value = newDataUrl;
};

const resetCanvas = () => {
  selectRectParams = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  };
  initImageCanvas();
  calcCanvasSize();
  drawClipBox(
    selectRectParams.x + size,
    selectRectParams.y + size,
    selectRectParams.w - size * 2,
    selectRectParams.h - size * 2
  );
  previewImage();
};

const save = () => {
  if (!previewURL.value) return;
  const link = document.createElement("a");
  link.href = previewURL.value;
  link.download = "image.png";
  link.click();
};

const previewURL = ref("");
</script>
<template>
  <el-dialog v-model="dialogVisible" title="图片裁剪">
    <div>
      <input
        type="file"
        @change="handleChange"
        multiple="true"
        accept="image/*"
      />
    </div>
    <div class="canvas-box" @mouseup="handleMouseUp">
      <div class="canvas-container">
        <canvas
          ref="canvas"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
        ></canvas>
      </div>
      <div class="preview">
        <img :src="previewURL" alt="" />
      </div>
    </div>
    <div class="btns">
      <el-button type="primary" @click="save">保存</el-button>
      <el-button @click="resetCanvas">重置</el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.canvas-box {
  display: flex;
  align-items: center;
  margin-top: 20px;
  .canvas-container {
    width: 500px;
    height: 500px;
    flex-shrink: 0;
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
  }
  .preview {
    width: 200px;
    height: 200px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #ccc;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
}
.btns {
  margin-top: 20px;
  text-align: center;
}
</style>
