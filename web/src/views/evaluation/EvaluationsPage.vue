<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold mb-6 text-gray-800">Trainee Evaluations</h1>

    <!-- TABLE LIST -->
    <div class="overflow-x-auto bg-white rounded-2xl shadow">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Trainee</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Supervisor</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-600">
              Total Score (%)
            </th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-600">Action</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="item in evaluations"
            :key="item.trainee_id"
            class="hover:bg-gray-50"
          >
            <td class="px-4 py-3">{{ item.trainee_name }}</td>
            <td class="px-4 py-3">{{ item.supervisor_name }}</td>
            <td class="px-4 py-3 text-center font-medium text-gray-700">
              {{ calculateTotalPercent(item.evaluations) }}%
            </td>
            <td class="px-4 py-3 text-center">
              <button
                @click="openModal(item)"
                class="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Details
              </button>
            </td>
          </tr>

          <tr v-if="!evaluations.length">
            <td colspan="3" class="text-center py-6 text-gray-500">
              No evaluations found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <div
      v-if="selectedEvaluation"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
    >
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-4xl p-6 relative animate-fadeIn">
        
        <h2 class="text-xl font-semibold text-gray-800 mb-3">
          {{ selectedEvaluation.trainee_name }} – Evaluation Details
        </h2>

        <p class="text-gray-600 mb-4">
          Supervisor: <strong>{{ selectedEvaluation.supervisor_name }}</strong>
        </p>

        <!-- TABLE INSIDE MODAL -->
        <div class="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
          <table class="min-w-full text-sm">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-3 py-2 text-left font-semibold">Category</th>
                <th class="px-3 py-2 text-left font-semibold">Criteria</th>
                <th class="px-3 py-2 text-center font-semibold">Highest Points</th>
                <th class="px-3 py-2 text-center font-semibold">Points</th>
                <th class="px-3 py-2 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(category, catKey) in selectedEvaluation.evaluations" :key="catKey">
                <!-- CATEGORY TITLE -->
                <tr class="bg-gray-200">
                  <td class="px-3 py-2 font-bold" colspan="5">
                    {{ criteriaLabels[catKey] }}
                  </td>
                </tr>

                <!-- CRITERIA -->
                <tr v-for="(crit, critKey) in category" :key="critKey" class="border-b">
                  <td class="px-3 py-2">{{ letterMap[critKey.slice(-1)] || '' }}</td>
                  <td class="px-3 py-2">{{ criteriaDescriptions[critKey] || critKey }}</td>
                  <td class="px-3 py-2 text-center">5</td>
                  <td class="px-3 py-2 text-center">{{ crit.points }}</td>
                  <td class="px-3 py-2">{{ crit.remarks }}</td>
                </tr>

                <!-- CATEGORY TOTAL -->
                <tr class="bg-gray-100 font-semibold">
                  <td colspan="2" class="px-3 py-2 text-left">Total</td>
                  <td class="px-3 py-2 text-center">{{ calculateCategoryHighest(category) }}</td>
                  <td class="px-3 py-2 text-center">{{ calculateCategoryTotal(category) }}</td>
                  <td></td>
                </tr>
              </template>
              <!-- GRAND TOTAL -->
              <tr class="bg-gray-300 font-bold text-lg">
                <td colspan="2" class="px-3 py-2 text-left">Grand Total for Affiliate Agency’s Rating</td>
                <td class="px-3 py-2 text-center">{{ calculateGrandHighest(selectedEvaluation.evaluations) }}</td>
                <td class="px-3 py-2 text-center">{{ calculateGrandTotal(selectedEvaluation.evaluations) }}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-6 text-right">
          <button
            @click="selectedEvaluation = null"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
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
import api from '@/api/api'

const evaluations = ref([])
const selectedEvaluation = ref(null)

const criteriaLabels = {
  1: 'Leadership',
  2: 'Attitude Towards Work',
  3: 'Performance',
}

// Map of criteria keys to descriptive text
const criteriaDescriptions = {
  '1a': 'Has self – discipline and potential for leadership',
  '1b': 'Assumes responsibility readily, gets results and group loyalty',
  '1c': 'Able to understand clear instructions and does not hesitate',
  '1d': 'Accepts suggestions and strives to improve his work',

  '2a': 'Makes use of time and does not squander it',
  '2b': 'Reports to work regularly on time',
  '2c': 'Follows company/agency rules and regulations',
  '2d': 'Courteous/polite',

  '3a': 'Works accurately, efficiently and effectively',
  '3b': 'Accomplishes assigned tasks on time',
  '3c': 'Follows directions/instructions correctly',
  '3d': 'Produces quality work and shows cooperation with others',
}

// Map the last character of key to letters
const letterMap = { a: 'A.', b: 'B.', c: 'C.', d: 'D.' }

const openModal = (item) => {
  selectedEvaluation.value = item
}

const fetchEvaluations = async () => {
  try {
    const res = await api.post("admin/getEvaluationsTrainee")
    evaluations.value = res.data.data || []
  } catch (err) {
    console.error("Error loading evaluations:", err)
  }
}

// Assuming total max points = 60
const calculateTotalPercent = (evaluations) => {
  let total = 0
  for (const categoryKey in evaluations) {
    const category = evaluations[categoryKey]
    for (const critKey in category) {
      total += category[critKey].points || 0
    }
  }
  const percent = (total / 60) * 100
  return Math.round(percent) // Round to nearest integer
}

// Calculate total points for a single category
// Calculate total points for a single category
const calculateCategoryTotal = (category) => {
  let total = 0
  for (const critKey in category) {
    total += category[critKey].points || 0
  }
  return total
}

// Calculate highest points for a single category
const calculateCategoryHighest = (category) => {
  let total = 0
  for (const critKey in category) {
    total += 5 // Assuming max points per criterion = 5
  }
  return total
}

// Calculate grand total for all categories
const calculateGrandTotal = (evaluations) => {
  let grandTotal = 0
  for (const catKey in evaluations) {
    grandTotal += calculateCategoryTotal(evaluations[catKey])
  }
  return grandTotal
}

// Calculate grand total of highest points
const calculateGrandHighest = (evaluations) => {
  let grandTotal = 0
  for (const catKey in evaluations) {
    grandTotal += calculateCategoryHighest(evaluations[catKey])
  }
  return grandTotal
}

onMounted(fetchEvaluations)
</script>
<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
</style>
