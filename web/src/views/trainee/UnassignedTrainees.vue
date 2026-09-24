<template>
  <LoadingScreen :show="loading" />
  <div class="relative">
    
    <!-- Enhanced Table -->
    <div v-if="!loading" class="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <!-- Enhanced Header -->
      <div class="p-6 bg-white border-b border-indigo-500">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-gray flex items-center gap-3">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Supervisor Assignment
            </h3>
            <p class="text-gray text-sm mt-1">Manage trainees without assigned supervisors</p>
          </div>
          <div class="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30">
            <p class="text-gray text-sm font-medium">Unassigned</p>
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
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Trainee Name
                </div>
              </th>
              <th class="px-6 py-4 text-left">
                <div class="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Required Hours
                </div>
              </th>
              <th class="px-6 py-4 text-right">
                <span class="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(trainee, index) in trainees"
              :key="trainee.trainee_id"
              class="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-blue-500 font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {{ getInitials(trainee.trainee_name) }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">{{ trainee.trainee_name }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-2 bg-indigo-100 text-blue-700 rounded-lg px-3 py-1.5 font-semibold">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ trainee.ojt_required_hours }} hours
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="px-5 py-2.5 rounded-xl bg-blue-400 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 ml-auto"
                  @click="openModal(trainee)"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Assign Supervisor
                </button>
              </td>
            </tr>
            <tr v-if="trainees.length === 0">
              <td colspan="3" class="text-center py-16">
                <div class="flex flex-col items-center gap-4">
                  <div class="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-gray-500 font-medium text-lg">All trainees assigned!</p>
                    <p class="text-gray-400 text-sm mt-1">Every trainee has been assigned to a supervisor.</p>
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
          <div class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-semibold text-sm">
            Page {{ pagination.page }} of {{ pagination.totalPages }}
          </div>
          <span class="text-gray-600 text-sm">·</span>
          <span class="text-gray-600 text-sm">
            <span class="font-semibold text-gray-800">{{ pagination.total }}</span> total trainees
          </span>
        </div>

        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition-all duration-200 hover:border-indigo-300 hover:shadow-md flex items-center gap-2"
            :disabled="pagination.page === 1"
            @click="changePage(pagination.page - 1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            class="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-gray-700 transition-all duration-200 hover:border-indigo-300 hover:shadow-md flex items-center gap-2"
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

    <!-- Enhanced Modal -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-50"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-50"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        @click.self="showModal = false"
      >
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <!-- Modal Header -->
            <div class="p-6 bg-white rounded-t-2xl">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <svg class="w-7 h-7 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-gray">Assign Supervisor</h2>
                  <p class="text-gray text-sm mt-1">Select a supervisor for the trainee</p>
                </div>
              </div>
            </div>

            <!-- Modal Body -->
            <div class="p-6 space-y-5">
              <!-- Trainee Info Card -->
              <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {{ getInitials(selectedTrainee?.trainee_name) }}
                  </div>
                  <div>
                    <p class="text-xs text-gray-500 font-medium uppercase tracking-wide">Assigning to</p>
                    <p class="text-lg font-bold text-gray-800">{{ selectedTrainee?.trainee_name }}</p>
                  </div>
                </div>
              </div>

              <!-- Supervisor Selection -->
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Select Supervisor *
                </label>
                <v-select
                  v-model="selectedSupervisor"
                  :options="supervisors"
                  label="name"
                  placeholder="Choose a supervisor..."
                  class="custom-v-select"
                >
                  <template #option="{ name }">
                    <div class="flex items-center gap-3 py-1">
                      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow">
                        {{ getInitials(name) }}
                      </div>
                      <span class="font-medium text-gray-700">{{ name }}</span>
                    </div>
                  </template>
                  <template #selected-option="{ name }">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs shadow">
                        {{ getInitials(name) }}
                      </div>
                      <span class="font-medium text-gray-700">{{ name }}</span>
                    </div>
                  </template>
                </v-select>
                <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                  </svg>
                  Select from available supervisors in the list
                </p>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                class="px-5 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 hover:shadow-md flex items-center gap-2"
                @click="showModal = false"
                :disabled="confirming"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                class="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 min-w-[140px] justify-center"
                :disabled="confirming || !selectedSupervisor"
                @click="confirmAssign"
              >
                <svg v-if="!confirming" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="confirming">Assigning...</span>
                <span v-else>Confirm Assignment</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { toast } from "@/ui/feedback";
import { ref, onMounted, watch } from "vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import vSelect from "vue-select";
import { useTraineeStore } from "@/stores/traineeStore";
import { useSupervisorStore } from "@/stores/supervisorStore";

const traineeStore = useTraineeStore();
const supervisorStore = useSupervisorStore();

const trainees = ref([]);
const pagination = ref({
  page: 1,
  total: 0,
  totalPages: 1,
});

const supervisors = ref([]);
const fetchSupervisors = async () => {
  const raw = await supervisorStore.fetchSupervisors();
  supervisors.value = raw.map((sup) => ({
    id: sup.supervisor_id,
    name: sup.supervisor_name,
  }));
};

const showModal = ref(false);
const selectedTrainee = ref(null);
const selectedSupervisor = ref(null);


const openModal = (trainee) => {
  selectedTrainee.value = trainee;
  selectedSupervisor.value = null;
  showModal.value = true;
};

const confirming = ref(false);

const confirmAssign = async () => {
  if (!selectedSupervisor.value) {
    toast("Please select a supervisor.", "error");
    return;
  }
  confirming.value = true;

  const res = await traineeStore.assignSupervisor({
    trainee_id: selectedTrainee.value.trainee_id,
    supervisor_id: selectedSupervisor.value.id,
  });

  console.log("Assign response:", res);

  if (!res?.success) {
    toast(res?.message || "Failed to assign supervisor.", "error");
    confirming.value = false;
    return;
  }

  // Reload the page so the next unassigned trainee moves up (or go back a page if this one is now empty)
  const page = trainees.value.length === 1 && pagination.value.page > 1 ? pagination.value.page - 1 : pagination.value.page;
  await fetchData(page);

  toast(`${selectedSupervisor.value.name} assigned to ${selectedTrainee.value.trainee_name}`, "success");
  confirming.value = false;
  showModal.value = false;
};

const loading = ref(true);

const fetchData = async (page = 1) => {
  const data = await traineeStore.fetchUnassignedTrainees(page);
  trainees.value = data?.results || [];
  pagination.value = data?.pagination || { page: 1, total: 0, totalPages: 1 };
};

const changePage = (newPage) => {
  fetchData(newPage);
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

onMounted(async () => {
  await Promise.all([fetchData(), fetchSupervisors()]);
  loading.value = false;
});
</script>

<style>
/* Custom Vue Select Styling */
.custom-v-select .vs__dropdown-toggle {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 0.5rem;
  transition: border-color 0.15s ease;
}
.custom-v-select .vs__dropdown-toggle:hover {
  border-color: #a5b4fc;
}
.custom-v-select .vs__dropdown-menu {
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  margin-top: 0.25rem;
}
.custom-v-select .vs__dropdown-option--highlight {
  background: #e0e7ff;
  color: #111827;
}
.custom-v-select .vs__search::placeholder {
  color: #9ca3af;
}
.custom-v-select .vs__selected {
  margin: 0;
}
</style>