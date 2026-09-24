<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative"
    >
      <!-- Close Button -->
      <button
        class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        @click="$emit('update:modelValue', false)"
      >
        ✖
      </button>

      <!-- Slot Content -->
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
});

defineEmits(["update:modelValue"]);
</script>
