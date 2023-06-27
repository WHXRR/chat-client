const { execSync } = require('child_process');
const axios = require('axios');
// 生成版本号或哈希值的逻辑
function generateVersion() {
  // 可以使用类似于Git的提交哈希、构建日期时间或自定义算法来生成一个唯一的标识符
  const hash = execSync('git rev-parse HEAD').toString().trim(); // 使用Git提交哈希作为版本号或哈希值
  return hash;
}

// 获取版本号或哈希值
const version = generateVersion();
// 将版本号或哈希值发送给后端
async function sendVersionToBackend() {
  try {
    // let res = await axios.post('http://127.0.0.1:3000/api/check-version', { version });
    let res = await axios.post('http://47.97.159.103:3000/api/check-version', { version });
    if (res.data === 'update') {
      location.reload();
    }
  } catch (error) {
    console.error('Failed to send version to backend:', error.message);
  }
}

// 执行发送版本号或哈希值的操作
sendVersionToBackend();
