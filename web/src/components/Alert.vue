<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="[
        'absolute w-full px-4 py-3 text-center font-medium',
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]"
    >
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  type: { type: String, default: "success" }, // success | error
  message: { type: String, required: true },
  duration: { type: Number, default: 2000 },
  show: { type: Boolean, default: false },
});

const emit = defineEmits(["update:show"]);
const visible = ref(props.show);

watch(
  () => props.show,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      setTimeout(() => {
        visible.value = false;
        emit("update:show", false);
      }, props.duration);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.alert {
  top: 40px; /* adjust to match header height */
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
