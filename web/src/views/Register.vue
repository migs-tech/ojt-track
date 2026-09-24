<template>
    <div class="min-h-screen flex">
        <!-- Left Side - Info Panel -->
        <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 opacity-10">
                <div class="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
                <div class="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
            </div>
            <!-- Content -->
            <div class="relative z-10">
                <div class="flex items-center space-x-3 mb-16">
                    <div class="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <img :src="logo" alt="Logo" class="h-10 w-10 rounded-full" />
                    </div>
                    <span class="text-3xl font-bold text-white">OJT Tracker</span>
                </div>
                <div class="space-y-6">
                    <div class="inline-block px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full">
                        <span class="text-indigo-300 font-semibold text-sm">NEW USER REGISTRATION</span>
                    </div>
                    <h1 class="text-5xl font-bold text-white leading-tight">
                        Join Our<br />Training Program
                    </h1>
                    <p class="text-xl text-gray-300 leading-relaxed">
                        Create your account to start tracking your OJT journey, log hours, and collaborate with supervisors.
                    </p>
                    <div class="space-y-4 pt-8">
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">Quick & easy registration</span>
                        </div>
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">Track training hours efficiently</span>
                        </div>
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">Connect with supervisors</span>
                        </div>
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">Generate progress reports</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="relative z-10 text-gray-400">
                <p class="text-sm">&copy; 2024 OJT Tracker. All rights reserved.</p>
            </div>
        </div>
        <!-- Right Side - Registration Form -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
            <div class="w-full max-w-md space-y-8">
                <!-- Mobile Logo -->
                <div class="lg:hidden flex justify-center mb-8">
                    <div class="flex items-center space-x-2">
                        <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <img :src="logo" alt="Logo" class="h-8 w-8 rounded-full" />
                        </div>
                        <span class="text-2xl font-bold text-gray-800">OJT Tracker</span>
                    </div>
                </div>
                <!-- Badge -->
                <div class="flex justify-center">
                    <div class="inline-flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z">
                            </path>
                        </svg>
                        <span class="text-sm font-semibold text-green-700">CREATE NEW ACCOUNT</span>
                    </div>
                </div>
                <!-- Header -->
                <div class="text-center">
                    <h2 class="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p class="mt-2 text-sm text-gray-600">
                        Fill in your details to get started
                    </p>
                </div>
                <!-- Registration Form -->
                <form class="mt-8 space-y-6" @submit.prevent="register">
                    <!-- Error Message -->
                    <div v-if="error"
                        class="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm border border-red-300">
                        {{ error }}
                    </div>
                    <!-- Success Message -->
                    <div v-if="success"
                        class="mb-4 p-3 rounded-lg bg-green-100 text-green-700 text-sm border border-green-300">
                        {{ success }}
                    </div>
                    <div class="space-y-4">
                        <!-- Username -->
                        <div>
                            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                                        </path>
                                    </svg>
                                </div>
                                <input id="username" name="username" v-model="form.username" type="text" required
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                    placeholder="Choose a username">
                            </div>
                        </div>
                        <!-- Email -->
                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
                                        </path>
                                    </svg>
                                </div>
                                <input id="email" name="email" type="email" v-model="form.email" required
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                    placeholder="your.email@example.com">
                            </div>
                        </div>
                        <!-- Password -->
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                                        </path>
                                    </svg>
                                </div>
                                <input id="password" name="password" 
                                    :type="showPassword ? 'text' : 'password'" 
                                    v-model="form.password" required
                                    class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                    placeholder="••••••••">
                                <button
                                    type="button"
                                    @click="showPassword = !showPassword"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
                                        </path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg>
                                    <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <!-- Confirm Password -->
                        <div>
                            <label for="password-confirm" class="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                                        </path>
                                    </svg>
                                </div>
                                <input id="password-confirm" name="password-confirm" 
                                    :type="showConfirm ? 'text' : 'password'" 
                                    v-model="form.passwordConfirm" required
                                    class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                    placeholder="••••••••">
                                <button
                                    type="button"
                                    @click="showConfirm = !showConfirm"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg v-if="!showConfirm" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
                                        </path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                        </path>
                                    </svg>
                                    <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21">
                                        </path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button type="submit" :disabled="authStore.loading"
                            class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z">
                                </path>
                            </svg>
                            <span v-if="authStore.loading" class="loader mr-2"></span>
                            <span>{{ authStore.loading ? 'Creating Account...' : 'Create Account' }}</span>
                        </button>
                    </div>
                    <!-- Login link -->
                    <div class="text-center">
                        <p class="text-sm text-gray-600">
                            Already have an account?
                            <button @click="goToLogin"
                                class="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">
                                Sign in here
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import logo from "@/assets/icon.png";

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
});

const showPassword = ref(false);
const showConfirm = ref(false);

const error = ref("");
const success = ref("");

const register = async () => {
  error.value = "";
  success.value = "";

  // Simple validation
  if (!form.value.username || !form.value.email || !form.value.password || !form.value.passwordConfirm) {
    error.value = "All fields are required.";
    return;
  }
  if (form.value.password !== form.value.passwordConfirm) {
    error.value = "Passwords do not match.";
    return;
  }

  const credentials = {
    username: form.value.username,
    email: form.value.email,
    password: form.value.password,
    userRole: 3,
  };

  const result = await authStore.register(credentials);
  if (result.success) {
    success.value = result.message;
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } else {
    error.value = result.message || "Registration failed.";
  }
};

const goToLogin = () => router.push("/login");
</script>

<style scoped>
/* Loader animation if needed */
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>