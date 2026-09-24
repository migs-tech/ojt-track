<!-- src/components/LoadingScreen.vue -->
<template>
  <div
    v-if="visible"
    id="loading-screen"
    class="absolute inset-0 flex flex-col items-center justify-center 
          text-gray-800 z-10 transition-opacity duration-700 pl-10"
  >
    <p class="mt-6 text-lg font-medium tracking-wide">Loading data, please wait...</p>

    <!-- Animated Dots -->
    <div class="flex mt-2 space-x-1">
      <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: true,
  },
});

const visible = ref(props.show);
const fadeOut = ref(false);

// Watch parent loading prop
watch(
  () => props.show,
  (val) => {
    if (!val) {
      fadeOut.value = true;
      visible.value = false;
    } else {
      fadeOut.value = false;
      visible.value = true;
    }
  }
);
</script>

<style scoped>
#loading-screen {
  transition: opacity 0.7s ease-in-out;
}
</style>
