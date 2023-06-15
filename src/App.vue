<script setup></script>

<template>
  <div class="app-container">
    <router-view></router-view>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
}
</style>
