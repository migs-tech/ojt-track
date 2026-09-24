<template>
  <div class="bg-white rounded-xl shadow p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <span class="font-bold text-gray-700">Attendance ({{ dashboardStore.selectedYear }})</span>

      <div class="relative">
        <!-- Toggle Button -->
        <button
          class="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-1"
          type="button"
          @click="toggleDropdown"
        >
          <i class="fa-solid fa-filter"></i>
          {{ dashboardStore.selectedYear }}
        </button>

        <!-- Dropdown -->
        <ul
          v-if="dropdownOpen"
          class="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-10"
        >
          <li
            v-for="year in years"
            :key="year"
            class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
            @click="selectYear(year)"
          >
            {{ year }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Chart -->
    <div class="h-72">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js';
import { ref, watch, computed, onMounted, nextTick } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';

Chart.register(...registerables);

const dashboardStore = useDashboardStore();
const chartCanvas = ref(null);
let chartInstance = null;

/* Dropdown state */
const dropdownOpen = ref(false);

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
}

async function selectYear(year) {
  dropdownOpen.value = false;
  await dashboardStore.prepareAttendanceBarChart(year);
}

function renderChart() {
  if (!chartCanvas.value) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: dashboardStore.attendanceBarChart.labels,
      datasets: [
        {
          label: 'Present',
          data: dashboardStore.attendanceBarChart.present,
          backgroundColor: 'rgba(34,197,94,0.7)', // green
        },
        {
          label: 'Absent',
          data: dashboardStore.attendanceBarChart.absent,
          backgroundColor: 'rgba(239,68,68,0.7)', // red
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
        plugins: {
        legend: {
            position: 'top',
            labels: {
            usePointStyle: true,  
            pointStyle: 'circle',
            },
        },
        },
        scales: {
        x: { grid: { display: false } },
        y: { grid: { display: false }, beginAtZero: true },
        },
    },
  });
}

/* Watch for data updates */
watch(
  () => dashboardStore.attendanceBarChart,
  async (val) => {
    if (val.labels.length) {
      await nextTick();
      renderChart();
    }
  },
  { deep: true }
);

/* Initial load */
onMounted(() => {
  dashboardStore.prepareAttendanceBarChart(dashboardStore.selectedYear);
});

/* Dropdown years */
const years = computed(() => {
  const current = new Date().getFullYear();
  return [current, current - 1, current - 2, current - 3, current - 4];
});
</script>
