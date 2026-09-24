<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 relative overflow-hidden">
    <!-- Decorative Background Circles -->
    <div class="absolute w-72 h-72 bg-blue-300 rounded-full opacity-20 -top-10 -left-20 blur-3xl"></div>
    <div class="absolute w-96 h-96 bg-purple-300 rounded-full opacity-20 -bottom-10 -right-20 blur-3xl"></div>

    <!-- Card -->
    <div class="relative bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-md w-full text-center border border-gray-200">
      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center">
        <svg
          class="animate-spin h-12 w-12 text-blue-600 mb-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          ></path>
        </svg>
        <p class="text-gray-700 text-lg font-medium">Verifying your email...</p>
      </div>

      <!-- Success -->
      <div v-else-if="verified" class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-green-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
        <p class="text-gray-600 mb-6">
          Your email has been successfully verified. You can now access all features of your account.
        </p>
        <a
          href="/login"
          class="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition"
        >
          Go to Login
        </a>
      </div>

      <!-- Failure -->
      <div v-else class="flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 text-red-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
        <p class="text-gray-600 mb-6">
          The verification link is invalid or has expired. Please request a new one.
        </p>
        <a
          href="/resend-verification"
          class="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg hover:opacity-90 transition"
        >
          Resend Email
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const loading = ref(true);
const verified = ref(false);

// Extract token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");
console.log("Token:", token);

onMounted(async () => {
  try {
    const res = await axios.post("https://ojt.kamsite.com/api/user/verifyEmailToken", {
      token: token,
    });

    verified.value = !!res.data.success;
  } catch (err) {
    verified.value = false;
  } finally {
    loading.value = false;
  }
});
</script>
