<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
  >
    <div
      class="bg-white w-full max-w-md rounded-2xl shadow-lg overflow-hidden animate-fadeIn"
    >
      <div class="p-5 border-b flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">
          Supervisor Details
        </h3>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-800"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div class="flex flex-col items-center">
          <img
            v-if="supervisor?.avatar_url"
            :src="supervisor.avatar_url"
            class="w-24 h-24 rounded-full object-cover border"
          />
          <div
            v-else
            class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-500 font-semibold"
          >
            {{ supervisor?.supervisor_name?.[0] || "?" }}
          </div>
          <h4 class="mt-3 text-xl font-semibold text-gray-800">
            {{ supervisor?.supervisor_name }}
          </h4>
          <p class="text-gray-500">{{ supervisor?.email }}</p>
        </div>

        <div class="border-t pt-4 text-sm space-y-2">
          <p><strong>Birthdate:</strong> {{ supervisor?.birthdate || "N/A" }}</p>
          <p><strong>Company:</strong> {{ supervisor?.company || "N/A" }}</p>
          <p><strong>Created:</strong> {{ formatDate(supervisor?.created) }}</p>
          <p><strong>Last Modified:</strong> {{ formatDate(supervisor?.modified) }}</p>
        </div>
      </div>

      <div class="bg-gray-50 p-4 text-right">
        <button
          @click="$emit('close')"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>

const props = defineProps({
  show: Boolean,
  supervisor: Object,
});

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString();
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-in-out;
}
</style>
