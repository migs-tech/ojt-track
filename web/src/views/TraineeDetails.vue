<template>
  <LoadingScreen :show="loading" />

  <div v-if="!loading" class="min-h-screen bg-gray-50 p-4">

    <!-- Top Bar -->
    <div class="flex justify-between items-center mb-6">
      <button
        @click="goBack"
        class="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
      >
        <i class="fas fa-arrow-left"></i>
        <span>Back</span>
      </button>

      <button
        @click="generatePDF"
        :disabled="isGenerating"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm shadow hover:bg-indigo-700 transition"
      >
        {{ isGenerating ? "Generating..." : "Print PDF" }}
      </button>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-xl shadow p-6 mb-6">
      <div class="flex gap-4">
        <img
          :src="traineeDetails?.avatar_url || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'"
          class="w-16 h-16 rounded-lg object-cover"
        />

        <div class="flex-1">
          <h2 class="text-xl font-semibold text-gray-800">
            {{ traineeDetails?.trainee_name || "Unknown" }}
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm text-gray-600">
            <p><strong>Company:</strong> {{ traineeDetails?.company || "N/A" }}</p>
            <p><strong>Supervisor:</strong> {{ traineeDetails?.supervisor_name || "N/A" }}</p>
            <p><strong>Email:</strong> {{ traineeDetails?.email || "N/A" }}</p>
            <p><strong>Course:</strong> {{ traineeDetails?.course || "N/A" }}</p>
            <p><strong>Started:</strong>
              {{ traineeDetails?.started_at ? new Date(traineeDetails.started_at).toLocaleDateString() : "N/A" }}
            </p>
            <p><strong>Birthday:</strong>
              {{ traineeDetails?.birthdate ? new Date(traineeDetails.birthdate).toLocaleDateString() : "N/A" }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="rounded-xl p-5 bg-green-100/60">
        <p class="text-xs font-semibold text-green-700">Present</p>
        <p class="text-3xl font-bold text-green-700 mt-1">
          {{ traineeDetails?.attendance?.present || 0 }}
        </p>
      </div>

      <div class="rounded-xl p-5 bg-red-100/60">
        <p class="text-xs font-semibold text-red-700">Absent</p>
        <p class="text-3xl font-bold text-red-700 mt-1">
          {{ traineeDetails?.attendance?.absent || 0 }}
        </p>
      </div>

      <div class="rounded-xl p-5 bg-indigo-100/60">
        <p class="text-xs font-semibold text-indigo-700">Work Hours</p>
        <p class="text-2xl font-bold text-indigo-700 mt-1">
          {{ traineeDetails?.attendance?.work_hours || "0h 0m" }}
        </p>
        <p class="text-xs text-gray-600">{{ completePercentage }}% complete</p>
      </div>
    </div>

    <!-- Two Columns -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Weekly Reports -->
      <div class="bg-white rounded-xl shadow p-4 flex flex-col">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold text-gray-800 flex items-center gap-2">
            <i class="fas fa-file-alt text-indigo-500"></i> Weekly Reports
          </h3>
          <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
            {{ reports.length }} Weeks
          </span>
        </div>

        <div class="overflow-y-auto flex-1">
          <div
            v-for="(week, wIndex) in reports"
            :key="wIndex"
            class="border-b last:border-none py-2"
          >
            <button
              @click="toggleWeek(wIndex)"
              class="w-full flex justify-between items-center text-left py-2 hover:bg-gray-50 px-2 rounded transition"
            >
              <div>
                <p class="font-medium text-gray-800">{{ week.week_range }}</p>
                <p class="text-xs text-gray-500">{{ week.reports?.length }} report(s)</p>
              </div>

              <i :class="expandedWeeks.includes(wIndex)
                ? 'fas fa-chevron-up text-indigo-600'
                : 'fas fa-chevron-down text-gray-400'">
              </i>
            </button>

            <transition name="fade">
              <div v-if="expandedWeeks.includes(wIndex)" class="mt-2 ml-2">
                <div
                  v-for="(report, rIndex) in week.reports"
                  :key="rIndex"
                  class="p-3 bg-gray-50 rounded-lg mb-2 text-sm"
                >
                  <p class="font-medium text-gray-800">{{ report.title }}</p>
                  <p class="text-gray-500 text-xs">{{ report.description }}</p>
                  <p class="text-gray-400 text-xs mt-1">
                    <i class="fas fa-calendar"></i> {{ report.date }}
                  </p>
                </div>
              </div>
            </transition>
          </div>

          <div v-if="!reports.length" class="text-center py-6 text-gray-400">
            <i class="fas fa-file text-3xl mb-2"></i>
            <p>No reports yet</p>
          </div>
        </div>
      </div>

      <!-- Attendance Logs -->
      <div class="bg-white rounded-xl shadow p-4 flex flex-col">
        <div class="flex justify-between items-center mb-3">
          <h3 class="font-semibold text-gray-800 flex items-center gap-2">
            <i class="fas fa-clipboard-check text-green-500"></i> Attendance Logs
          </h3>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            {{ attendanceLogs.length }} Logs
          </span>
        </div>

        <div class="overflow-y-auto flex-1">
          <div
            v-for="(log, index) in attendanceLogs"
            :key="index"
            class="bg-gray-50 p-3 rounded-lg mb-3 text-sm"
          >
            <p class="flex items-center gap-2 text-gray-700 mb-1">
              <i class="fas fa-calendar text-indigo-500"></i> {{ log.created_at }}
            </p>

            <p v-if="log.time_in" class="flex items-center gap-2 text-green-700 text-xs">
              <i class="fas fa-sign-in-alt"></i> <strong>In:</strong> {{ log.time_in }}
            </p>

            <p v-if="log.time_out" class="flex items-center gap-2 text-red-700 text-xs mt-1">
              <i class="fas fa-sign-out-alt"></i> <strong>Out:</strong> {{ log.time_out }}
            </p>
          </div>

          <div v-if="!attendanceLogs.length" class="text-center py-6 text-gray-400">
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
import { toast } from "@/ui/feedback";

const router = useRouter();
const goBack = () => {
  if (window.history.state?.back) router.back();
  else router.push({ name: "Trainees" });
};
const traineeStore = useTraineeStore();
const { traineeDetails } = storeToRefs(traineeStore);
const traineeId = router.currentRoute.value.params.id;
const loading = ref(false);
const isGenerating = ref(false);

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

const generatePDF = async () => {
  if (isGenerating.value) return;
  isGenerating.value = true;

  try {
    const res = await traineeStore.generateTraineeReportPDF(traineeId);

    if (res.success && res.url) {
      const popupWidth = 800;
      const popupHeight = 600;
      const left = (window.screen.width / 2) - (popupWidth / 2);
      const top = (window.screen.height / 2) - (popupHeight / 2);

      window.open(
        res.url,
        '_blank',
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );

      toast("PDF ready. It opened in a new window.");
    } else {
      console.error("PDF generation failed:", res.message);
      toast(res.message || "Failed to generate PDF", "error");
    }

  } catch (error) {
    console.error("Error generating PDF:", error);
    toast("Error generating PDF, please try again.", "error");
  } finally {
    isGenerating.value = false;
  }
};

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
