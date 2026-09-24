<!-- src/pages/TraineeList.vue -->
<template>
  <LoadingScreen :show="loading" />
  
  <div v-if="!loading" class="space-y-6">
    <!-- Main Content Card -->
    <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
      <!-- Search and Filter Bar -->
      <div class="p-6 border-b bg-gradient-to-r from-gray-50 to-white">
        <div class="flex justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 p-2.5 rounded-lg">
              <i class="fas fa-users text-blue-600 text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">Trainee List</h3>
              <p class="text-xs text-gray-500">
                Showing {{ trainees.length }} of {{ pagination.total }} trainees
              </p>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="relative w-80">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by Trainee Name..."
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              @input="onSearch"
            />
            <i class="fas fa-search absolute left-4 top-3.5 text-gray-400"></i>
            <div
              v-if="searchQuery"
              @click="clearSearch"
              class="absolute right-3 top-3 cursor-pointer text-gray-400 hover:text-gray-600"
            >
              <i class="fas fa-times-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <i class="fas fa-user text-gray-400"></i>
                  Trainee Name
                </div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <i class="fas fa-user-tie text-gray-400"></i>
                  Supervisor
                </div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <i class="fas fa-clock text-gray-400"></i>
                  OJT Hours Required
                </div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <i class="fas fa-chart-line text-gray-400"></i>
                  OJT Progress
                </div>
              </th>
              <th class="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(trainee, index) in trainees"
              :key="index"
              class="hover:bg-blue-50/50 transition-colors duration-150"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
                    {{ getInitials(trainee.trainee_name) }}
                  </div>
                  <div>
                    <div class="font-semibold text-gray-800">
                      {{ trainee.trainee_name }}
                    </div>                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <i class="fas fa-user-tie text-green-600 text-xs"></i>
                  </div>
                  <span class="text-gray-700 font-medium">{{ trainee.supervisor_name }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                  <i class="fas fa-clock text-blue-600 text-xs"></i>
                  <span class="text-sm font-semibold text-blue-700">
                    {{ trainee.ojt_required_hours }} hrs
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 relative">
                <div class="w-32 bg-gray-200 rounded-full h-4 overflow-hidden relative">
                  <!-- Green progress bar -->
                  <div
                    class="h-4 bg-green-500 rounded-full transition-all duration-300"
                    :style="{ width: Number(trainee.ojt_completion_percentage) + '%' }"
                  ></div>
                  <!-- Text overlay -->
                  <div class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
                    {{ trainee.ojt_completion_percentage }}%
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <button
                  @click="viewTrainee(trainee)"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 font-medium text-sm shadow-sm hover:shadow-md"
                >
                  <i class="fas fa-eye"></i>
                  View Details
                </button>
              </td>
            </tr>
            <tr v-if="trainees.length === 0">
              <td colspan="4" class="px-6 py-16">
                <div class="flex flex-col items-center justify-center text-gray-400">
                  <i class="fas fa-users text-5xl mb-4 opacity-50"></i>
                  <p class="text-lg font-semibold text-gray-500">No trainees found</p>
                  <p class="text-sm text-gray-400 mt-1">
                    Try adjusting your search criteria
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.totalPages > 1"
        class="flex justify-between items-center px-6 py-4 border-t bg-gradient-to-r from-gray-50 to-white"
      >
        <div class="text-sm text-gray-600 font-medium">
          Page <span class="font-bold text-gray-800">{{ pagination.page }}</span> of 
          <span class="font-bold text-gray-800">{{ pagination.totalPages }}</span>
          <span class="text-gray-400 mx-2">•</span>
          Total: <span class="font-bold text-gray-800">{{ pagination.total }}</span> trainees
        </div>

        <div class="flex gap-2">
          <button
            class="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm transition-all duration-150 flex items-center gap-2"
            :disabled="pagination.page === 1"
            @click="changePage(pagination.page - 1)"
          >
            <i class="fas fa-chevron-left text-xs"></i>
            Previous
          </button>
          
          <!-- Page Numbers -->
          <div class="flex gap-1">
            <button
              v-for="page in getPageNumbers()"
              :key="page"
              @click="page !== '...' && changePage(page)"
              :class="[
                'w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-150',
                page === pagination.page
                  ? 'bg-blue-600 text-white shadow-md'
                  : page === '...'
                  ? 'cursor-default text-gray-400'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="px-4 py-2 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm transition-all duration-150 flex items-center gap-2"
            :disabled="pagination.page === pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            Next
            <i class="fas fa-chevron-right text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useTraineeStore } from "@/stores/traineeStore";
import LoadingScreen from "@/components/LoadingScreen.vue";

const traineeStore = useTraineeStore();
const router = useRouter();
const loading = ref(false);
const searchQuery = ref("");

const trainees = computed(() => traineeStore.trainees);
const pagination = computed(() => traineeStore.pagination);

// Get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Generate page numbers for pagination
const getPageNumbers = () => {
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  const pages = [];

  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (current > 3) {
      pages.push("...");
    }

    // Show pages around current
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(total);
  }

  return pages;
};

const viewTrainee = (trainee) => {
  router.push({ name: "TraineeDetails", params: { id: trainee.trainee_id } });
};

// Clear search
const clearSearch = () => {
  searchQuery.value = "";
  fetchData(1);
};

// Fetch trainees (supports pagination + search)
const fetchData = async (page = 1) => {
  await traineeStore.fetchTrainees({ page, search: searchQuery.value.trim() });
};

// Pagination controls
const changePage = (newPage) => {
  fetchData(newPage);
};

// API-based search (calls backend on each input)
let searchTimeout = null;
const onSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchData(1);
  }, 400); // debounce to reduce API calls
};

onMounted(async () => {
  if (traineeStore.trainees.length === 0) {
    loading.value = true;
    await fetchData();
    loading.value = false;
  }
});
</script>

<style scoped>
/* Add smooth transitions */
button {
  transition: all 0.15s ease-in-out;
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>