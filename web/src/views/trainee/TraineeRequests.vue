<template>
  <div class="">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Trainee Requests</h2>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow overflow-hidden">
      <table class="min-w-full border-collapse">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-4 text-left text-sm font-semibold text-gray-600">Trainee</th>
            <th class="p-4 text-left text-sm font-semibold text-gray-600">Course / Department</th>
            <th class="p-4 text-left text-sm font-semibold text-gray-600">OJT Hours</th>
            <th class="p-4 text-left text-sm font-semibold text-gray-600">Requested Supervisor</th>
            <th class="p-4 text-right text-sm font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          <tr
            v-for="(trainee, index) in traineeRequests"
            :key="index"
            class="hover:bg-gray-50 transition"
          >
            <td class="p-4 text-gray-800 font-medium">{{ trainee.name }}</td>
            <td class="p-4 text-gray-600">{{ trainee.department }}</td>
            <td class="p-4 text-gray-600">{{ trainee.hours }}</td>
            <td class="p-4 text-gray-600">{{ trainee.supervisor }}</td>
            <td class="p-4 text-right space-x-2">
              <button
                @click="acceptRequest(trainee)"
                class="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
              >
                Accept
              </button>
              <button
                @click="rejectRequest(trainee)"
                class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
              >
                Reject
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const traineeRequests = ref([
  { name: "Juan Dela Cruz", department: "Computer Science", hours: "600 Hours", supervisor: "Engr. Maria Santos" },
  { name: "Maria Lopez", department: "Information Technology", hours: "600 Hours", supervisor: "Prof. Jose Ramirez" },
  { name: "Carlos Santos", department: "Business Administration", hours: "600 Hours", supervisor: "Dr. Ana Mendoza" },
  { name: "Ana Garcia", department: "Engineering", hours: "600 Hours", supervisor: "Engr. Luis Fernando" },
  { name: "Luis Fernando", department: "Information Systems", hours: "600 Hours", supervisor: "Prof. Clara Reyes" },
  { name: "Clara Reyes", department: "Marketing", hours: "600 Hours", supervisor: "Dr. Pedro Gonzales" },
  { name: "Pedro Gonzales", department: "Finance", hours: "600 Hours", supervisor: "Ms. Elena Cruz" },
  { name: "Elena Cruz", department: "Human Resources", hours: "600 Hours", supervisor: "Mr. Roberto Diaz" },
  { name: "Roberto Diaz", department: "Accounting", hours: "600 Hours", supervisor: "Ms. Sofia Velasquez" },
  { name: "Sofia Velasquez", department: "Economics", hours: "600 Hours", supervisor: "Dr. Miguel Torres" }
]);

const acceptRequest = (trainee) => {
  alert(`Accepted trainee: ${trainee.name} (Supervisor: ${trainee.supervisor})`);
};

const rejectRequest = (trainee) => {
  alert(`Rejected trainee: ${trainee.name} (Supervisor: ${trainee.supervisor})`);
};
</script>
