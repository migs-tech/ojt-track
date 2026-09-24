<!-- src/components/ModalComponent.vue -->
<template>
  <div
  v-if="show"
  class="fixed inset-0 z-[99] flex items-center justify-center bg-black/50"
  style="top: 0; left: 0; right: 0; bottom: 0; margin: 0; padding: 0;"
>
  <div
    class="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fadeIn mx-2 sm:mx-0"
  >
    <div class="flex justify-between items-center border-b px-4 py-3 bg-gray-50">
      <h3 class="text-lg font-semibold text-gray-700">{{ title }}</h3>
      <button
        class="text-gray-500 hover:text-gray-700 text-xl leading-none"
        @click="$emit('close')"
      >
        ✕
      </button>
    </div>

    <div class="p-4 max-h-[70vh] overflow-y-auto">
      <slot />
    </div>

    <div
      v-if="showActions"
      class="flex justify-end gap-2 p-4 border-t bg-gray-50"
    >
      <button
        v-for="(action, index) in actions"
        :key="index"
        @click="action.onClick"
        :class="[
          'px-4 py-2 rounded-md text-sm font-medium transition',
          action.type === 'confirm'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : action.type === 'danger'
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 hover:bg-gray-300',
        ]"
      >
        {{ action.label }}
      </button>
    </div>
  </div>
</div>
</template>

<script setup>
defineProps({
  show: Boolean,
  title: String,
  showActions: Boolean,
  actions: Array,
});
</script>
