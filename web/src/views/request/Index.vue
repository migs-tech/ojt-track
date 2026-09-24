<template>
  <LoadingScreen :show="loading" />
  <div class="relative">
    <Alert
      v-model:show="alert.show"
      :type="alert.type"
      :message="alert.message"
    />
    
    <div v-if="!loading" class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <!-- Enhanced Header -->
      <div class="p-6 bg-white border-b border-blue-500">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-gray flex items-center gap-3">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Request Management
            </h3>
            <p class="text-gray text-sm mt-1">Review and manage trainee requests</p>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
            <p class="text-gray text-sm font-medium">Total Requests</p>
            <p class="text-3xl font-bold text-gray">{{ pagination.total }}</p>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-gray-100 to-gray-50">
            <tr>
              <th class="px-6 py-4 text-left">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Request Type
                </div>
              </th>
              <th class="px-6 py-4 text-left">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Trainee Name
                </div>
              </th>
              <th class="px-6 py-4 text-left">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Period
                </div>
              </th>
              <th class="px-6 py-4 text-left">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Reason
                </div>
              </th>
              <th class="px-6 py-4 text-right">
                <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(request, index) in requests"
              :key="index"
              class="hover:bg-blue-50/50 transition-all duration-200 group"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span class="font-semibold text-gray-800">{{ request.request_type }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    {{ getInitials(request.name) }}
                  </div>
                  <span class="font-medium text-gray-800">{{ request.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                  <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-700">{{ request.period }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-gray-600 line-clamp-2 max-w-xs">{{ request.reason }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex justify-end gap-2">
                  <button
                    @click="respondToRequest(request, 'approved')"
                    class="group/btn relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accept
                  </button>
                  <button
                    @click="openRejectModal(request)"
                    class="group/btn relative px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reject
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="requests.length === 0">
              <td colspan="5" class="text-center py-16">
                <div class="flex flex-col items-center gap-4">
                  <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-gray-500 font-medium text-lg">No requests found</p>
                    <p class="text-gray-400 text-sm mt-1">All caught up! No pending requests at the moment.</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Enhanced Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="flex justify-between items-center px-6 py-4 border-t bg-gradient-to-r from-gray-50 to-white"
      >
        <div class="flex items-center gap-2">
          <div class="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-semibold text-sm">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </div>
          <span class="text-gray-600 text-sm">·</span>
          <span class="text-gray-600 text-sm">
            <span class="font-semibold text-gray-800">{{ pagination.total }}</span> total requests
          </span>
        </div>

        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition-all duration-200 hover:border-blue-300 hover:shadow-md flex items-center gap-2"
            :disabled="pagination.page === 1"
            @click="changePage(pagination.page - 1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            class="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition-all duration-200 hover:border-blue-300 hover:shadow-md flex items-center gap-2"
            :disabled="pagination.page === pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            Next
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Reject Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-50"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-50"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showRejectModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        @click.self="closeRejectModal"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <!-- Modal Header -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-800">Reject Request</h2>
                  <p class="text-sm text-gray-500 mt-1">This action requires a reason</p>
                </div>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  v-model="rejectReason"
                  rows="4"
                  class="w-full border-2 border-gray-200 rounded-xl p-3 text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                  placeholder="Please provide a clear and detailed reason for rejecting this request..."
                  :class="{ 'border-red-300 bg-red-50': reasonError }"
                ></textarea>
                <Transition
                  enter-active-class="transition-all duration-200"
                  enter-from-class="opacity-0 -translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <div v-if="reasonError" class="flex items-center gap-2 mt-2 text-red-600 text-sm font-medium">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    {{ reasonError }}
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                @click="closeRejectModal"
                class="px-5 py-2.5 rounded-xl border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                @click="confirmReject"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Confirm Rejection
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <StatusModal :show="statusUpdating" message="Updating status..." />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useTraineeStore } from "@/stores/traineeStore";
import LoadingScreen from "@/components/LoadingScreen.vue";
import Alert from "@/components/Alert.vue";
import StatusModal from "@/components/StatusModal.vue";

const traineeStore = useTraineeStore();
const loading = ref(false);

const requests = computed(() => traineeStore.traineeReportRequest?.data || []);
const pagination = computed(
  () => traineeStore.traineeReportRequest?.pagination || { page: 1, total: 0, totalPages: 0 }
);

// Reject modal state
const showRejectModal = ref(false);
const rejectReason = ref("");
const selectedRequest = ref(null);
const reasonError = ref("");

const fetchData = async (page = 1) => {
  loading.value = true;
  await traineeStore.getReportRequest(page);
  loading.value = false;
};

const alert = ref({
  show: false,
  type: "success",
  message: "",
});

const statusUpdating = ref(false);

const respondToRequest = async (request, status, reason = null) => {
  statusUpdating.value = true;
  try {
    const payload = { id: request.id, status };
    if (reason) payload.reason = reason;
    const res = await traineeStore.updateReportRequestStatus(payload);
    console.log('Update Response:', res);
    if (res.success) {
      alert.value = {
        show: true,
        type: "success",
        message: `Request ${status} successfully.`,
      };
      await fetchData(pagination.value.page);
    } else {
      alert.value = {
        show: true,
        type: "error",
        message: res.message || `Failed to update request.`,
      };
    }
  } catch (error) {
    console.error(`Error updating request (${status}):`, error);
  } finally {
    statusUpdating.value = false;
  }
};

const openRejectModal = (request) => {
  selectedRequest.value = request;
  rejectReason.value = "";
  reasonError.value = "";
  showRejectModal.value = true;
};

const closeRejectModal = () => {
  showRejectModal.value = false;
  selectedRequest.value = null;
};

const confirmReject = async () => {
  if (!rejectReason.value.trim()) {
    reasonError.value = "Rejection reason is required.";
    return;
  }
  reasonError.value = "";
  showRejectModal.value = false;
  await respondToRequest(selectedRequest.value, "rejected", rejectReason.value);
};

const changePage = (newPage) => {
  fetchData(newPage);
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

onMounted(() => {
  if (requests.value.length === 0) {
    fetchData();
  }
});
</script>