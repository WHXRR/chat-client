<script setup>
import data from "@/utils/emoji.json";
import { computed } from "vue";

const emit = defineEmits(["emojiClick"]);
const props = defineProps({
  showArrow: {
    type: Boolean,
    default: false,
  },
});

const categories = computed(() => Object.keys(data));
const categoryEmojis = computed(
  () => (category) => Object.values(data[category])
);

const handleEmojiClick = (emoji) => {
  emit("emojiClick", emoji);
};
</script>
<template>
  <div class="emoji-picker">
    <div class="picker-container">
      <div
        class="category"
        v-for="category in categories"
        :key="`category-${category}`"
      >
        <span>{{ category }}</span>
        <div class="emojis-container">
          <button
            @click="handleEmojiClick(emoji)"
            v-for="(emoji, index) in categoryEmojis(category)"
            :key="`emoji-${index}`"
          >
            {{ emoji }}
          </button>
        </div>
      </div>
    </div>
    <div class="bottom-arrow" v-if="showArrow"></div>
  </div>
</template>
<style lang="scss" scoped>
.emoji-picker {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 20rem;
  height: 20rem;
  max-width: 100%;
  user-select: none;
}

.emoji-picker,
.bottom-arrow {
  box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.0975);
}

.emoji-picker,
.picker-container {
  border-radius: 0.5rem;
  background: var(--background-color);
}

.picker-container {
  position: relative;
  padding: 1rem;
  overflow: auto;
  z-index: 1;
}

.category {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  color: rgb(169, 169, 169);
}

.emojis-container {
  display: grid;
  grid-template-columns: repeat(5, 55px);
  margin-top: 10px;
}

.category button {
  cursor: pointer;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  font-size: 1.75rem;
  background: inherit;
  transition: all 0.3s;
  &:hover {
    background-color: #21252b;
  }
}

.bottom-arrow {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0.75rem;
  height: 0.75rem;
  transform: translate(-50%, 50%) rotate(45deg);
  background: #3e4452;
}
</style>
