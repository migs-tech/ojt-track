<template>
  <LoadingScreen :show="loading" />
  <div v-if="!loading" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Back Button -->
    <div class="mb-4">
      <button
        @click="goBack"
        class="group flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-indigo-600 transition-all duration-200 hover:gap-3"
      >
        <i class="fas fa-arrow-left"></i>
        <span class="font-medium">Back</span>
      </button>
    </div>

    <!-- Profile Header -->
    <div class="bg-white rounded-xl shadow-sm p-5 mb-5 border border-gray-200">
      <div class="flex items-start gap-4">
        <img
          :src="traineeDetails?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
          alt="Profile"
          class="w-16 h-16 rounded-lg border-2 border-indigo-400 object-cover flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <h2 class="text-xl font-bold text-gray-800 truncate">
            {{ traineeDetails?.trainee_name || 'Unknown' }}
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2 text-sm">
            <div class="flex items-center gap-2 truncate">
              <i class="fas fa-building text-indigo-500 text-xs flex-shrink-0"></i>
              <span class="text-gray-500 text-xs">Company:</span>
              <span class="truncate text-gray-700 font-medium">{{ traineeDetails?.company || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2 truncate">
              <i class="fas fa-user-tie text-indigo-500 text-xs flex-shrink-0"></i>
              <span class="text-gray-500 text-xs">Supervisor:</span>
              <span class="truncate text-gray-700 font-medium">{{ traineeDetails?.supervisor_name || 'N/A'  }}</span>
            </div>
            <div class="flex items-center gap-2 truncate">
              <i class="fas fa-envelope text-indigo-500 text-xs flex-shrink-0"></i>
              <span class="text-gray-500 text-xs">Email:</span>
              <span class="truncate text-gray-700 font-medium">{{ traineeDetails?.email || 'N/A'  }}</span>
            </div>
            <div class="flex items-center gap-2 truncate">
              <i class="fas fa-graduation-cap text-indigo-500 text-xs flex-shrink-0"></i>
              <span class="text-gray-500 text-xs">Course:</span>
              <span class="truncate text-gray-700 font-medium">{{ traineeDetails?.course  || 'N/A' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-calendar text-indigo-500 text-xs flex-shrink-0"></i>
              <span class="text-gray-500 text-xs">Started:</span>
              <span class="mx-1 text-gray-400"> {{ traineeDetails?.started_at ? new Date(traineeDetails.started_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) :  'N/A'  }}</span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-birthday-cake text-indigo-500 text-xs flex-shrink-0"></i>
              <span class="text-gray-500 text-xs">Birthday:</span>
              <span class="text-gray-700 font-medium">
                {{ traineeDetails?.birthdate ? new Date(traineeDetails.birthdate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="bg-green-50 p-5 rounded-2xl shadow-sm border border-green-100">
        <div class="flex justify-between items-center">
          <i class="fas fa-check-circle text-green-500 text-2xl"></i>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">Present</span>
        </div>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ traineeDetails?.attendance?.present || 0 }}</p>
      </div>

      <div class="bg-red-50 p-5 rounded-2xl shadow-sm border border-red-100">
        <div class="flex justify-between items-center">
          <i class="fas fa-times-circle text-red-500 text-2xl"></i>
          <span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">Absent</span>
        </div>
        <p class="text-3xl font-bold text-red-600 mt-2">{{ traineeDetails?.attendance?.absent || 0 }}</p>
      </div>

      <div class="bg-indigo-50 p-5 rounded-2xl shadow-sm border border-indigo-100">
        <div class="flex justify-between items-center">
          <i class="fas fa-clock text-indigo-500 text-2xl"></i>
          <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">Work Hours</span>
        </div>
        <p class="text-2xl font-bold text-indigo-600 mt-2">{{ traineeDetails?.attendance?.work_hours || "0h 0m 0s" }}</p>
        <p class="text-xs text-gray-500">{{ completePercentage }}% complete</p>
      </div>
    </div>

    <!-- Two-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Weekly Reports -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
        <div class="p-4 border-b bg-indigo-50 flex justify-between items-center">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-file-alt text-indigo-500"></i> Weekly Reports
          </h3>
          <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{{ reports.length }} Weeks</span>
        </div>
        <div class="overflow-y-auto scrollbar-thin flex-1">
          <div
            v-for="(week, wIndex) in reports"
            :key="wIndex"
            class="border-b border-gray-100 last:border-b-0"
          >
            <button
              @click="toggleWeek(wIndex)"
              class="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-indigo-50 transition"
            >
              <div class="flex items-center gap-2">
                <i class="fas fa-calendar-week text-indigo-600"></i>
                <div>
                  <span class="font-semibold text-gray-800 block">{{ week.week_range }}</span>
                  <span class="text-xs text-gray-500">{{ week.reports?.length || 0 }} report(s)</span>
                </div>
              </div>
              <i
                class="fas text-gray-400 transition-transform duration-300"
                :class="expandedWeeks.includes(wIndex) ? 'fa-chevron-up text-indigo-600' : 'fa-chevron-down'"
              ></i>
            </button>

            <transition
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-screen"
              leave-from-class="opacity-100 max-h-screen"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="expandedWeeks.includes(wIndex)" class="bg-gray-50 px-3 pb-3">
                <div
                  v-for="(report, rIndex) in week.reports"
                  :key="rIndex"
                  class="p-3 bg-white border border-gray-200 rounded-lg my-1 hover:shadow-sm"
                >
                  <h4 class="font-semibold text-gray-800 text-sm">{{ report.title }}</h4>
                  <p class="text-xs text-gray-600 line-clamp-2">{{ report.description }}</p>
                  <div class="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <i class="fas fa-calendar"></i> {{ report.date }}
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
         <!-- No Reports Message -->
        <div v-if="!reports.length" class="p-8 text-center text-gray-400">
          <i class="fas fa-file-alt text-3xl mb-2"></i>
          <p>No reports yet</p>
        </div>
      </div>

      <!-- Attendance Logs -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
        <div class="p-4 border-b bg-green-50 flex justify-between items-center">
          <h3 class="font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-clipboard-check text-green-500"></i> Attendance Logs
          </h3>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{{ attendanceLogs.length }} Logs</span>
        </div>

        <div class="overflow-y-auto flex-1 scrollbar-thin">
          <div
            v-for="(log, index) in attendanceLogs"
            :key="index"
            class="p-3 mx-3 my-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700"
          >
            <div class="flex justify-between items-center mb-1">
              <div class="flex items-center gap-1">
                <i class="fas fa-calendar-day text-indigo-500"></i>
                <span>{{ log.created_at }}</span>
              </div>
            </div>
            <div v-if="log.time_in" class="flex items-center gap-2">
              <i class="fas fa-sign-in-alt text-green-500"></i>
              <span><strong>In:</strong> {{ log.time_in }}</span>
            </div>
            <div v-if="log.time_out" class="flex items-center gap-2 mt-1">
              <i class="fas fa-sign-out-alt text-red-500"></i>
              <span><strong>Out:</strong> {{ log.time_out }}</span>
            </div>
          </div>

          <div v-if="!attendanceLogs.length" class="p-8 text-center text-gray-400">
            <i class="fas fa-calendar-times text-3xl mb-2"></i>
            <p>No logs yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { onMounted, watch, computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useTraineeStore } from "@/stores/traineeStore";
import LoadingScreen from "@/components/LoadingScreen.vue";

const router = useRouter();
const goBack = () => {
  if (window.history.state?.back) router.back();
  else router.push({ name: "CompletedTrainees" });
};
const traineeStore = useTraineeStore();
const { traineeDetails } = storeToRefs(traineeStore);
const traineeId = router.currentRoute.value.params.id;
const loading = ref(false);

const reports = computed(() => traineeDetails.value?.reports || []);
const attendanceLogs = computed(() => traineeDetails.value?.attendance_logs || []);
const expandedWeeks = ref([]);

const toggleWeek = (index) => {
  expandedWeeks.value = expandedWeeks.value.includes(index)
    ? expandedWeeks.value.filter((i) => i !== index)
    : [...expandedWeeks.value, index];
};

const fetchTraineeDetails = async (id) => {
  if (!id) return;
  loading.value = true;
  await traineeStore.fetchTraineeDetails(id);
  loading.value = false;
};

const completePercentage = computed(() => {
  if (!traineeDetails.value) return 0;
  const raw = traineeDetails.value.attendance?.work_hours || "0h 0m 0s";
  const req = Number(traineeDetails.value.ojt_required_hours) || 1;

  const match = raw.match(/(\d+)h\s*(\d+)m\s*(\d+)s/);
  let total = 0;
  if (match) {
    const [_, h, m, s] = match.map(Number);
    total = h + m / 60 + s / 3600;
  }
  return Math.min(100, Math.round((total / req) * 100));
});

onMounted(() => fetchTraineeDetails(traineeId));

watch(() => router.currentRoute.value.params.id, (newId) => fetchTraineeDetails(newId));
</script>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  width: 5px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
