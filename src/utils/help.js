function throttle(func, delay, cb) {
  let timeoutId;

  return function () {
    // 如果之前已经设置了定时器，则直接返回
    if (timeoutId) {
      cb && cb();
      return;
    }

    // 调用原始函数
    func.apply(this, arguments);

    // 设置定时器，在延迟时间结束后清除定时器
    timeoutId = setTimeout(function () {
      timeoutId = null;
    }, delay);
  };
}

let timer = null;
let isFirstCall = true;
function debounce(fn, delay) {
  if (isFirstCall) {
    fn();
    isFirstCall = false;
    return;
  }
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    isFirstCall = true;
  }, delay);
}

function getDotPosition(x, y, w, h, size) {
  return [
    [x - size / 2, y - size / 2, size, size],
    [x + w / 2 - size / 2, y - size / 2, size, size],
    [x + w - size / 2, y - size / 2, size, size],
    [x - size / 2, y + h / 2 - size / 2, size, size],
    [x + w - size / 2, y + h / 2 - size / 2, size, size],
    [x - size / 2, y + h - size / 2, size, size],
    [x + w / 2 - size / 2, y + h - size / 2, size, size],
    [x + w - size / 2, y + h - size / 2, size, size],
  ];
}
export const getDashPosition = (x, y, w, h) => {
  return [
    [x, y + h / 3, x + w, y + h / 3],
    [x, y + (2 * h) / 3, x + w, y + (2 * h) / 3],
    [x + w / 3, y, x + w / 3, y + h],
    [x + (2 * w) / 3, y, x + (2 * w) / 3, y + h],
  ];
};

export const getPixelRatio = (context) => {
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};

export const getCursorStyle = (i) => {
  let cursor = "default";
  switch (i) {
    case 0:
    case 2:
      cursor = "nwse-resize";
      break;
    case 1:
    case 3:
      cursor = "nesw-resize";
      break;
    case 4:
    case 6:
      cursor = "ns-resize";
      break;
    case 5:
    case 7:
      cursor = "ew-resize";
      break;
    case 8:
      cursor = "move";
      break;
    default:
      break;
  }
  return cursor;
};

export const getRectDotPosition = (x, y, w, h, size) => {
  return [
    // 左上 右上 右下 左下 四个点
    [x - size / 2, y - size / 2, size, size],
    [x + w - size / 2, y - size / 2, size, size],
    [x + w - size / 2, y + h - size / 2, size, size],
    [x - size / 2, y + h - size / 2, size, size],
    // 上 右 下 左 四条边
    [x - size / 2, y - size / 2, w + 4, size],
    [x + w - size / 2, y - size / 2, size, h + 4],
    [x - size / 2, y + h - size / 2, w + 4, size],
    [x - size / 2, y - size / 2, size, h + 4],
  ];
};

export const calcRect = (i, select, distance) => {
  const _select = { ...select };
  // 判断鼠标选中的区域
  switch (i) {
    case 0:
      _select.x += distance.x;
      _select.y += distance.y;
      _select.w -= distance.x;
      _select.h -= distance.y;
      break;
    case 1:
      _select.y += distance.y;
      _select.w += distance.x;
      _select.h -= distance.y;
      break;
    case 2:
      _select.w += distance.x;
      _select.h += distance.y;
      break;
    case 3:
      _select.x += distance.x;
      _select.w -= distance.x;
      _select.h += distance.y;
      break;
    case 4:
      _select.y += distance.y;
      _select.h -= distance.y;
      break;
    case 5:
      _select.w += distance.x;
      break;
    case 6:
      _select.h += distance.y;
      break;
    case 7:
      _select.x += distance.x;
      _select.w -= distance.x;
      break;
    case 8:
      _select.x += distance.x;
      _select.y += distance.y;
      break;
    default:
      break;
  }

  return _select;
};

export const getPhotoData = ({
  imageParams,
  uploadImage,
  canvasSize,
  imgScale,
  selectRectParams,
}) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const { width: imgWidth, height: imgHeight } = imageParams;
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  ctx.save();
  ctx.drawImage(uploadImage, 0, 0, imgWidth, imgHeight);
  ctx.restore();
  let { width: canvasWidth, height: canvasHeight } = canvasSize;
  const putX =
    (imgWidth - canvasWidth / imgScale) / 2 + selectRectParams.x / imgScale;
  const putY =
    (imgHeight - canvasHeight / imgScale) / 2 + selectRectParams.y / imgScale;
  const putW = selectRectParams.w / imgScale;
  const putH = selectRectParams.h / imgScale;
  if (!putW || !putH) {
    return "";
  }
  const imgData = ctx.getImageData(putX, putY, putW, putH);
  canvas.width = putW;
  canvas.height = putH;
  ctx.putImageData(imgData, 0, 0);
  return new Promise((res) => {
    canvas.toBlob((e) => res(e));
  });
};

export { throttle, debounce, getDotPosition };
