<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: String,
});
const emit = defineEmits(["send", "update:modelValue"]);
const send = () => {
  if (!message.value) return;
  emit("send");
};
const message = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit("update:modelValue", val);
  },
});

</script>
<template>
  <div class="chat-footer">
    <textarea
      v-focus
      class="send-ipt"
      placeholder="请输入..."
      v-model.trim="message"
      @keyup.enter="send"
    ></textarea>
    <button class="send-btn" @click="send">发送</button>
  </div>
</template>
<style lang="scss" scoped>
.chat-footer {
  padding: 10px;
  border-top: 1px solid #3e4452;
  .send-ipt {
    height: 100px;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    color: #cfd3dc;
    font-size: 14px;
    box-sizing: border-box;
    background-color: #21252b;
  }
  .send-btn {
    float: right;
    cursor: pointer;
    font-size: 14px;
    padding: 5px 20px;
    background-color: #21252b;
    border: 2px solid #323842;
    border-radius: 1em;
    color: #cfd3dc;
    font-weight: bolder;
    transition: cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.4s;
    box-shadow: -3px 3px 0px 0px #323842;
  }
  .send-btn:hover {
    transform: translate(5px, -5px);
  }
}
</style>
