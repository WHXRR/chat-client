function throttle(func, delay, cb) {
  let timeoutId

  return function () {
    // 如果之前已经设置了定时器，则直接返回
    if (timeoutId) {
      cb && cb()
      return
    }

    // 调用原始函数
    func.apply(this, arguments)

    // 设置定时器，在延迟时间结束后清除定时器
    timeoutId = setTimeout(function () {
      timeoutId = null
    }, delay)
  }
}

let timer = null
let isFirstCall = true
function debounce(fn, delay) {
  if (isFirstCall) {
    fn()
    isFirstCall = false
    return
  }
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    isFirstCall = true
  }, delay)
}

export {
  throttle,
  debounce
}