<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Trainee Evaluations</h1>

    <!-- 🔍 Filters -->
    <div class="flex flex-wrap gap-4 items-end mb-6">
      <!-- Year Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
        <select
          v-model="filters.year"
          class="border rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <!-- Evaluation Type Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Evaluation Type</label>
        <select
          v-model="filters.evaluation_type"
          class="border rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="Midterm">Midterm</option>
          <option value="Final">Final</option>
        </select>
      </div>

      <!-- Filter Button -->
      <button
        @click="fetchEvaluations"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow text-sm"
      >
        Apply Filter
      </button>
    </div>

    <!-- 📋 Table -->
    <div class="overflow-x-auto bg-white rounded-2xl shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Trainee</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Supervisor</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Comments</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Evaluation Type</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Evaluated At</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Total Score</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="evalItem in evaluations" :key="evalItem.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-800">{{ evalItem.trainee_name }}</td>
            <td class="px-4 py-3 text-gray-700">{{ evalItem.supervisor_name }}</td>
            <td class="px-4 py-3 text-gray-600 truncate max-w-xs">{{ evalItem.comments }}</td>
            <td class="px-4 py-3 text-gray-500">{{ evalItem.evaluation_type }}</td>
            <td class="px-4 py-3 text-gray-500">{{ formatDate(evalItem.evaluated_at) }}</td>
            <td class="px-4 py-3 font-semibold text-gray-800">{{ evalItem.total_score / 20 * 100 }}</td>
            <td class="px-4 py-3 text-center">
              <button
                @click="openModal(evalItem)"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details
              </button>
            </td>
          </tr>

          <tr v-if="!evaluations.length">
            <td colspan="6" class="text-center py-6 text-gray-500">No evaluations found</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📊 Modal -->
    <div
      v-if="selectedEvaluation"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
    >
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative animate-fadeIn">
        <button
          @click="selectedEvaluation = null"
          class="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 class="text-xl font-semibold mb-4 text-gray-800">
          Evaluation Details - {{ selectedEvaluation.evaluation_type }}
        </h2>

        <div class="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div><strong>Trainee:</strong> {{ selectedEvaluation.trainee_name }}</div>
          <div><strong>Supervisor:</strong> {{ selectedEvaluation.supervisor_name }}</div>
          <div><strong>Date:</strong> {{ formatDate(selectedEvaluation.evaluated_at) }}</div>
          <div><strong>Total Score:</strong> {{ selectedEvaluation.total_score / 20 * 100 }}</div>
        </div>

        <hr class="my-4" />

        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <div v-for="(label, key) in criteriaLabels" :key="key" class="flex justify-between">
            <span>{{ label }}</span>
            <span class="font-medium">{{ selectedEvaluation[key] }}</span>
          </div>
        </div>

        <div class="mt-5">
          <strong class="text-gray-800">Comments:</strong>
          <p class="text-gray-600 mt-1">
            {{ selectedEvaluation.comments || 'No comments provided.' }}
          </p>
        </div>

        <div class="mt-6 text-right">
          <button
            @click="selectedEvaluation = null"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const evaluations = ref([])
const selectedEvaluation = ref(null)
const filters = ref({
  year: '',
  evaluation_type: ''
})

const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

const criteriaLabels = {
  personality: 'Personality',
  punctuality: 'Punctuality',
  courtesy: 'Courtesy',
  attitude: 'Attitude towards Work',
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

const openModal = (evalItem) => {
  selectedEvaluation.value = evalItem
}

// 🧠 Fetch evaluations with optional filters
const fetchEvaluations = async () => {
  try {
    const { data } = await axios.post('https://ojt.kamsite.com/api/admin/getAllEvaluations', filters.value)
    evaluations.value = data.data || []
  } catch (error) {
    console.error('Failed to fetch evaluations:', error)
  }
}

onMounted(fetchEvaluations)
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>