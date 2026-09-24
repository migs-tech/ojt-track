<template>
  <!-- Dashboard Cards -->
  <LoadingScreen :show="loading" />
  <div v-if="!loading" class="">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <!-- Total Trainees -->
      <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
        <h3 class="text-sm text-gray-500">Total Trainees</h3>
        <p class="text-3xl font-bold text-indigo-600">
          <i class="fas fa-user-graduate mr-2"></i>{{ totalTrainees }}
        </p>
      </div>

      <!-- Total Supervisors -->
      <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
        <h3 class="text-sm text-gray-500">Total Supervisors</h3>
        <p class="text-3xl font-bold text-green-500">
          <i class="fas fa-user-tie mr-2"></i>{{ totalSupervisors }}
        </p>
      </div>

      <!-- Total Users -->
      <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
        <h3 class="text-sm text-gray-500">Total Users</h3>
        <p class="text-3xl font-bold text-yellow-500">
          <i class="fas fa-users mr-2"></i>{{ totalUsers }}
        </p>
      </div>

      <!-- Completed OJT -->
      <div class="bg-white p-5 rounded-xl shadow hover:shadow-lg transition">
        <h3 class="text-sm text-gray-500">Completed OJT</h3>
        <p class="text-3xl font-bold text-purple-600">
          <i class="fas fa-check-circle mr-2"></i>
          {{
            ojtHoursCompletionPieChart?.completed
              ? ojtHoursCompletionPieChart?.completed
              : 0
          }}
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <attendance-bar-chart />
      <ojt-hours-completion-pie-chart />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="p-4 border-b bg-gray-50">
        <h3 class="text-lg font-semibold text-gray-700">Recent Trainee Evaluation</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-700">
          <thead class="bg-gray-100 uppercase text-xs font-semibold text-gray-500">
            <tr>
              <th class="px-4 py-3">Supervisor Name</th>
              <th class="px-4 py-3">Trainee Name</th>
              <th class="px-4 py-3">Evaluation Type</th>
              <th class="px-4 py-3">Score</th>
              <th class="px-4 py-3">Date Evaluate</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr
              v-for="(evaluation, index) in recentOjtEvaluations"
              :key="index"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-4 py-1.5">{{ evaluation.supervisor_name }}</td>
              <td class="px-4 py-1.5">{{ evaluation.trainee_name }}</td>
              <td class="px-4 py-1.5">{{ evaluation.evaluation_type }}</td>
              <td class="px-4 py-1.5">{{ evaluation.score }}</td>
              <td class="px-4 py-1.5">
                {{ new Date(evaluation.date).toLocaleDateString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '@/stores/dashboardStore';
import { onMounted, computed, ref } from 'vue';
import attendanceBarChart from '@/components/dashboard/AttendanceBarChart.vue';
import OjtHoursCompletionPieChart from '@/components/dashboard/OjtHoursCompletionPieChart.vue';
import LoadingScreen from '@/components/LoadingScreen.vue';

const store = useDashboardStore();
const loading = ref(false);

const totalTrainees = computed(() => store.totalTrainees);
const totalSupervisors = computed(() => store.totalSupervisors);
const totalUsers = computed(() => store.totalUsers);
const recentOjtEvaluations = computed(() => store.recentOjtEvaluations);
const ojtHoursCompletionPieChart = computed(() => store.ojtHoursCompletionPieChart);

onMounted(async () => {
  await Promise.all([
    store.fetchDashboardStats(),
    store.fetchRecentEvaluations(),
  ]);
});
</script>
