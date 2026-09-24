// App-wide confirmation dialog and toast messages, rendered by components/UiFeedback.vue.
import { reactive } from "vue";

export const feedback = reactive({
  toasts: [],
  dialog: null, // { title, message, confirmText, cancelText, tone, icon, resolve }
});

let nextId = 1;

/** Shows a short message in the corner. type: success | error | info */
export function toast(message, type = "success", duration = 3500) {
  const id = nextId++;
  feedback.toasts.push({ id, message, type });
  setTimeout(() => dismissToast(id), duration);
}

export function dismissToast(id) {
  const i = feedback.toasts.findIndex((t) => t.id === id);
  if (i !== -1) feedback.toasts.splice(i, 1);
}

/**
 * Asks the user to confirm an action. Resolves to true (confirmed) or false.
 * tone: "primary" | "danger" | "success"
 */
export function confirmDialog({
  title = "Are you sure?",
  message = "",
  confirmText = "Confirm",
  cancelText = "Cancel",
  tone = "primary",
  icon,
} = {}) {
  // Answer an already-open dialog with "cancel" before opening a new one.
  if (feedback.dialog) feedback.dialog.resolve(false);
  return new Promise((resolve) => {
    feedback.dialog = { title, message, confirmText, cancelText, tone, icon, resolve };
  });
}

export function answerDialog(value) {
  const dialog = feedback.dialog;
  if (!dialog) return;
  feedback.dialog = null;
  dialog.resolve(value);
}
