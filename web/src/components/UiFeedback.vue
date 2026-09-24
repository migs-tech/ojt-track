<!-- Renders the app-wide toasts and confirmation dialog from src/ui/feedback.js -->
<template>
  <!-- Toasts -->
  <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))] pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="t in feedback.toasts"
        :key="t.id"
        role="status"
        :class="[
          'pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border text-sm bg-white',
          t.type === 'error' ? 'border-red-200' : t.type === 'info' ? 'border-blue-200' : 'border-green-200',
        ]"
      >
        <i
          :class="[
            'mt-0.5 fas',
            t.type === 'error' ? 'fa-circle-exclamation text-red-500' : t.type === 'info' ? 'fa-circle-info text-blue-500' : 'fa-circle-check text-green-500',
          ]"
        ></i>
        <p class="flex-1 text-gray-700">{{ t.message }}</p>
        <button class="text-gray-400 hover:text-gray-600" aria-label="Dismiss" @click="dismissToast(t.id)">
          <i class="fas fa-xmark"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>

  <!-- Confirmation dialog -->
  <Transition name="modal">
    <div
      v-if="feedback.dialog"
      class="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 p-4"
      @click.self="answerDialog(false)"
    >
      <div
        class="modal-panel bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center"
        role="alertdialog"
        aria-modal="true"
        :aria-label="feedback.dialog.title"
      >
        <div :class="['mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center', tone.bg]">
          <i :class="['fas text-2xl', feedback.dialog.icon || tone.icon, tone.text]"></i>
        </div>
        <h3 class="text-lg font-bold text-gray-800">{{ feedback.dialog.title }}</h3>
        <p v-if="feedback.dialog.message" class="mt-2 text-sm text-gray-500">{{ feedback.dialog.message }}</p>
        <div class="mt-6 flex gap-3">
          <button
            class="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 active:scale-95 transition"
            @click="answerDialog(false)"
          >
            {{ feedback.dialog.cancelText }}
          </button>
          <button
            ref="confirmBtn"
            :class="['flex-1 px-4 py-2.5 rounded-xl text-white font-semibold shadow active:scale-95 transition', tone.btn]"
            @click="answerDialog(true)"
          >
            {{ feedback.dialog.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { feedback, dismissToast, answerDialog } from "@/ui/feedback";

const confirmBtn = ref(null);

const tones = {
  danger: { bg: "bg-red-100", text: "text-red-600", icon: "fa-triangle-exclamation", btn: "bg-red-600 hover:bg-red-700" },
  success: { bg: "bg-green-100", text: "text-green-600", icon: "fa-circle-check", btn: "bg-green-600 hover:bg-green-700" },
  primary: { bg: "bg-blue-100", text: "text-blue-600", icon: "fa-circle-question", btn: "bg-blue-600 hover:bg-blue-700" },
};
const tone = computed(() => tones[feedback.dialog?.tone] || tones.primary);

// Focus the confirm button when the dialog opens, so Enter confirms and Esc cancels.
watch(
  () => feedback.dialog,
  async (d) => {
    if (d) {
      await nextTick();
      confirmBtn.value?.focus();
    }
  }
);

const onKey = (e) => {
  if (e.key === "Escape" && feedback.dialog) answerDialog(false);
};
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>
