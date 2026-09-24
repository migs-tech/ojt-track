<template>
  <div class="bg-white rounded-xl shadow p-5">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <span class="font-bold text-gray-700">OJT Hours Completion</span>
    </div>
    <!-- Chart -->
    <div class="h-72 flex items-center justify-center">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js';
import { ref, onMounted, watch } from 'vue';
import { useDashboardStore } from '@/stores/dashboardStore';

Chart.register(...registerables);

const dashboardStore = useDashboardStore();
const chartCanvas = ref(null);
let chartInstance = null;

// Function to render the chart
function renderChart(data) {
  if (!chartCanvas.value) return;

  // Destroy old instance if it exists
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartCanvas.value, {
    type: 'pie',
    data: {
      labels: ['Completed', 'In Progress', 'Not Started'],
      datasets: [
        {
          label: 'OJT Hour Completion',
          data: [data.completed, data.in_progress, data.not_started],
          backgroundColor: [
            'rgba(34,197,94,0.7)',  // Green - completed
            'rgba(234,179,8,0.7)',  // Yellow - in progress
            'rgba(239,68,68,0.7)',  // Red - not started
          ],
          borderColor: ['#fff'],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
          },
        },
      },
    },
  });
}

// Fetch data and render
onMounted(async () => {
  const res = await dashboardStore.prepareOjtHourCompletionPieChart();
  console.log('OJT Hour Completion Pie Chart Data Prepared:', res.data);

  renderChart(res.data);
});

// Optional: If store updates dynamically
watch(
  () => dashboardStore.ojtCompletionData,
  (newData) => {
    if (newData) renderChart(newData);
  },
  { deep: true }
);
</script>
