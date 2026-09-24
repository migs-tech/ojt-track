<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[99] flex items-center justify-center bg-black/50"
      style="top: 0; left: 0; right: 0; bottom: 0; margin: 0; padding: 0;"
    >
      <div class="bg-white rounded-xl p-6 shadow-lg flex flex-col items-center text-center animate-pop">
        <!-- Spinner -->
        <svg
          class="animate-spin h-8 w-8 text-indigo-600 mb-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>

        <!-- Message -->
        <p class="text-gray-700 font-medium">{{ message }}</p>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  show: { type: Boolean, required: true },
  message: { type: String, default: "Processing..." },
});
</script>

<style scoped>
/* Smooth fade in/out */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Pop-in animation */
@keyframes pop {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-pop {
  animation: pop 0.2s ease-out;
}
</style>
