function useClickArea(targetEle, curEle) {
  if (!targetEle || targetEle === null) return
  let current = curEle
  while (current !== null && current.classList) {
    if (current.classList.contains(targetEle)) {
      return current
    }
    current = current.parentNode
  }
  return false
}

export default useClickArea