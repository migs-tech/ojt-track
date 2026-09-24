<template>
<div class="bg-white">
    <!-- Header (as in Figure 4.8 of the study) -->
    <header class="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
    <nav class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center space-x-2">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <img :src="logo" alt="Logo" class="h-12 w-12 rounded-full" />
          </div>
          <span class="text-2xl font-bold text-gray-900">OJT Tracker</span>
        </div>

        <!-- Desktop Auth Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <button class="px-6 py-2 text-gray-700 font-medium hover:text-blue-600 transition duration-200" @click="goToLogin">
            Login
          </button>
          <button class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200 shadow-md hover:shadow-lg" @click="goToRegister">
            Register
          </button>
          <a
            :href="apkDownloadUrl"
            class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <i class="fas fa-mobile-alt text-white"></i>
            <span>Download App</span>
          </a>
        </div>

        <!-- Mobile Hamburger -->
        <div class="md:hidden">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-700 focus:outline-none">
            <i v-if="!mobileMenuOpen" class="fas fa-bars text-2xl"></i>
            <i v-else class="fas fa-times text-2xl"></i>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="md:hidden mt-4 flex flex-col space-y-3">
        <button class="px-6 py-2 text-gray-700 font-medium hover:text-blue-600 transition duration-200 text-left" @click="goToLogin">
          Login
        </button>
        <button class="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md" @click="goToRegister">
          Register
        </button>
        <a
          :href="apkDownloadUrl"
          class="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200 shadow-md flex items-center justify-center space-x-2"
        >
          <i class="fas fa-mobile-alt text-white"></i>
          <span>Download App</span>
        </a>
      </div>
    </nav>
  </header>
    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-6">
        <div class="container mx-auto">
            <div class="flex flex-col lg:flex-row items-center gap-12">
                <!-- Left Content -->
                <div class="flex-1 text-center lg:text-left">
                    <div class="inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-full mb-6">
                        <span class="text-blue-600 font-semibold text-sm">🚀 Transform Your Training Experience</span>
                    </div>
                    <h1 class="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                        Track Your OJT<br/>
                        <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Journey with Ease</span>
                    </h1>
                    <p class="text-xl text-gray-600 mb-8 leading-relaxed">
                        Streamline your on-the-job training with our comprehensive tracking platform. Monitor progress, manage tasks, and achieve your career goals efficiently.
                    </p>
                    <div v-if="isDemo" class="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                        <button @click="goToLogin"
                            class="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition">
                            <i class="fas fa-play mr-2"></i> Try the live demo
                        </button>
                        <a href="https://github.com/migs-tech/ojt-track" target="_blank" rel="noopener"
                            class="px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 text-lg font-semibold rounded-xl hover:border-gray-300 transition">
                            <i class="fab fa-github mr-2"></i> View source
                        </a>
                    </div>
                </div>

                <!-- Right Visual: dashboard mockup (as in Figure 4.8 / Appendix E) -->
                <div class="flex-1 relative w-full">
                    <div class="relative w-full h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-2xl">
                        <div class="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
                            <div class="flex items-center justify-between mb-6">
                                <div class="flex items-center space-x-2">
                                    <div class="w-3 h-3 bg-red-400 rounded-full"></div>
                                    <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                    <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                                </div>
                                <div class="text-xs font-semibold text-gray-500">Dashboard</div>
                            </div>
                            <div class="space-y-4 flex-1">
                                <div class="h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg animate-pulse"></div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="h-20 bg-blue-100 rounded-lg"></div>
                                    <div class="h-20 bg-indigo-100 rounded-lg"></div>
                                </div>
                                <div class="h-24 bg-gray-100 rounded-lg"></div>
                            </div>
                        </div>
                        <!-- Floating card -->
                        <div class="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center animate-bounce">
                            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 px-6 bg-gray-50">
        <div class="container mx-auto">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
                <p class="text-xl text-gray-600">Powerful features designed for modern training programs</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
                    <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-6">
                        <i class="fas fa-chart-line text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Progress Tracking</h3>
                    <p class="text-gray-600">Monitor your training progress in real-time with detailed analytics and visual charts.</p>
                </div>

                <!-- Feature 2 -->
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
                    <div class="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mb-6">
                        <i class="fas fa-tasks text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Task Management</h3>
                    <p class="text-gray-600">Organize and prioritize your training tasks with our intuitive management system.</p>
                </div>

                <!-- Feature 3 -->
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
                    <div class="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                        <i class="fas fa-clock text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Time Tracking</h3>
                    <p class="text-gray-600">Automatically log your training hours and generate accurate time reports.</p>
                </div>

                <!-- Feature 4 -->
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
                    <div class="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6">
                        <i class="fas fa-folder-open text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Document Storage</h3>
                    <p class="text-gray-600">Securely store and access all your training documents and certificates.</p>
                </div>

                <!-- Feature 5 -->
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
                    <div class="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-6">
                        <i class="fas fa-users text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Collaboration</h3>
                    <p class="text-gray-600">Connect with mentors and supervisors for feedback and guidance.</p>
                </div>

                <!-- Feature 6 -->
                <div class="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
                    <div class="w-14 h-14 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-6">
                        <i class="fas fa-file-alt text-white text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Reports & Analytics</h3>
                    <p class="text-gray-600">Generate comprehensive reports to showcase your achievements and progress.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-300 py-12 px-6">
        <div class="container mx-auto flex flex-col items-center justify-center">
            <div class="flex flex-col items-center mb-8">
                <div class="flex items-center space-x-2 mb-4">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-rocket text-white text-lg"></i>
                    </div>
                    <span class="text-xl font-bold text-white">OJT Tracker</span>
                </div>
                <p class="text-sm text-center">Empowering trainees to achieve their professional development goals.</p>
            </div>
            <div class="border-t border-gray-800 pt-8 text-center text-sm w-full">
                <p>&copy; 2025 OJT Tracker. All rights reserved.</p>
            </div>
        </div>
    </footer>
</div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref } from "vue";
import logo from "@/assets/icon.png";
import { isDemo } from "@/demo";
const mobileMenuOpen = ref(false);

const router = useRouter();
const goToRegister = () => router.push("/register");
const goToLogin = () => router.push("/login");

// "Download App" link for the Android APK. By default it points to the APK attached to the
// latest GitHub release (upload it as ojt-track.apk); set VITE_APK_URL to use another link.
const apkDownloadUrl =
  import.meta.env.VITE_APK_URL ||
  "https://github.com/migs-tech/ojt-track/releases/latest/download/ojt-track.apk";
</script>

