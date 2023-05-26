<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { useStore } from "@/store/user";
import { systemStore } from "@/store/system";
import api from "@/api";

const router = useRouter();
const store = useStore();
const sysStore = systemStore();
const formRef = ref(null);
const form = reactive({
  username: "",
  password: "",
});
const rules = reactive({
  username: {
    required: true,
    message: "Please input Activity username",
    trigger: "blur",
  },
  password: [
    {
      required: true,
      message: "Please input Activity password",
      trigger: "blur",
    },
    {
      min: 6,
      max: 12,
      message: "Length should be 6 to 12",
      trigger: "blur",
    },
  ],
});
const login = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      let res1 = await api.login({ ...form });
      if (!res1.status && res1.msg == "未查询到该用户") {
        ElMessageBox.confirm("未查询到该用户，是否注册？", {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning",
        }).then(async () => {
          let res2 = await api.register({ ...form });
          if (res2.status) {
            let res3 = await api.login({ ...form });
            if (res3.status) {
              store.token = res3.data.token;
              store.user = { ...res3.data };
              localStorage.setItem("token", res3.data.token);
              router.push({ name: "Home" });
            }
          }
        });
      } else {
        store.token = res1.data.token;
        store.user = { ...res1.data };
        localStorage.setItem("token", res1.data.token);
        router.push({ name: "Home" });
      }
    }
  });
};
</script>
<template>
  <div class="login-container">
    <div class="login-box">
      <el-form
        ref="formRef"
        :model="form"
        label-width="120px"
        label-position="top"
        :rules="rules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-focus v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="form.password"
            @keyup.enter="login"
          />
        </el-form-item>
      </el-form>
      <div class="btn-box">
        <el-button class="btn" @click="login" :loading="sysStore.btnLoading">
          登录
        </el-button>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  .login-box {
    width: 50%;
    max-width: 350px;
    padding: 20px 30px;
    border-radius: 10px;
    border: 2px solid #323842;
    box-shadow: -3px 3px 0px 0px #323842;
    .btn-box {
      display: flex;
      justify-content: center;
      padding-top: 10px;
      .btn {
        font-size: 0.9rem;
        padding: 0.8rem 1.5rem;
        border: none;
        outline: none;
        border-radius: 0.4rem;
        cursor: pointer;
        text-transform: uppercase;
        background-color: rgb(14, 14, 26);
        color: rgb(234, 234, 234);
        font-weight: 700;
        transition: 0.6s;
        box-shadow: 0px 0px 60px #1f4c65;
      }

      .btn:active {
        scale: 0.92;
      }

      .btn:hover {
        background: rgb(2, 29, 78);
        background: linear-gradient(
          270deg,
          rgba(2, 29, 78, 0.681) 0%,
          rgba(31, 215, 232, 0.873) 60%
        );
        color: rgb(4, 4, 38);
      }
    }
  }
}
</style>
