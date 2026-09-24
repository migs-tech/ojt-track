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
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                            </path>
                        </svg>
                    </div>
                    <span class="text-3xl font-bold text-white">OJT Tracker</span>
                </div>
                <div class="space-y-6">
                    <div class="inline-block px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full">
                        <span class="text-indigo-300 font-semibold text-sm">ADMIN PORTAL</span>
                    </div>
                    <h1 class="text-5xl font-bold text-white leading-tight">
                        Administrative<br />Control Center
                    </h1>
                    <p class="text-xl text-gray-300 leading-relaxed">
                        Manage trainees, monitor progress, generate reports, and oversee the entire OJT program from your centralized dashboard.
                    </p>
                    <div class="space-y-4 pt-8">
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">User & trainee management</span>
                        </div>
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">Advanced analytics & reports</span>
                        </div>
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                                    </path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">System configuration & settings</span>
                        </div>
                        <div class="flex items-center space-x-3 text-white">
                            <div class="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                                    </path>
                                </svg>
                            </div>
                            <span class="text-lg">Enhanced security & access control</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="relative z-10 text-gray-400">
                <p class="text-sm">&copy; 2024 OJT Tracker. All rights reserved.</p>
            </div>
        </div>
        <!-- Right Side - Admin Login Form -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
            <div class="w-full max-w-md space-y-8">
                <!-- Mobile Logo -->
                <div class="lg:hidden flex justify-center mb-8">
                    <div class="flex items-center space-x-2">
                        <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z">
                                </path>
                            </svg>
                        </div>
                        <span class="text-2xl font-bold text-gray-800">OJT Tracker</span>
                    </div>
                </div>
                <!-- Security Badge -->
                <div class="flex justify-center">
                    <div class="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full">
                        <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                            </path>
                        </svg>
                        <span class="text-sm font-semibold text-indigo-700">SECURE ADMIN ACCESS</span>
                    </div>
                </div>
                <!-- Header -->
                <div class="text-center">
                    <h2 class="text-3xl font-bold text-gray-900">Administrator Login</h2>
                    <p class="mt-2 text-sm text-gray-600">
                        Access the administrative control panel
                    </p>
                </div>
                <!-- Admin Login Form -->
                <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
                    <!-- Error Message -->
                    <div v-if="errorMessage"
                        class="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm border border-red-300">
                        {{ errorMessage }}
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label for="admin-email" class="block text-sm font-medium text-gray-700 mb-2">
                                Admin Email or Username
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                                        </path>
                                    </svg>
                                </div>
                                <input id="admin-email" name="admin-email" v-model="email" type="text" required
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                    placeholder="admin@example.com or username">
                            </div>
                        </div>
                        <div>
                            <label for="admin-password" class="block text-sm font-medium text-gray-700 mb-2">
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
                                <input id="admin-password" name="admin-password" type="password" v-model="password" required
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                    placeholder="••••••••">
                            </div>
                        </div>
                        <!-- reCAPTCHA Section -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Verify you're human
                            </label>
                            <div
                                class="relative bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-center items-center hover:shadow-sm transition">
                                <!-- Loader while waiting -->
                                <div v-if="captchaLoading"
                                    class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                                    <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                                        viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                    </svg>
                                </div>
                                <div v-show="!captchaLoading" id="recaptcha-container" style="width: 100%;"></div>
                            </div>
                        </div>
                        <!-- 2FA Code (Optional) -->
                        <!--
                        <div>
                            <label for="auth-code" class="block text-sm font-medium text-gray-700 mb-2">
                                Two-Factor Authentication Code (Optional)
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z">
                                        </path>
                                    </svg>
                                </div>
                                <input id="auth-code" name="auth-code" type="text" maxlength="6"
                                    class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                    placeholder="Enter 6-digit code">
                            </div>
                        </div>
                        -->
                    </div>
                    <!-- remember-->
                    <!--
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input id="remember-admin" name="remember-admin" type="checkbox"
                                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                            <label for="remember-admin" class="ml-2 block text-sm text-gray-700">
                                Remember this device
                            </label>
                        </div>
                        <div class="text-sm">
                            <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                                Request access
                            </a>
                        </div>
                    </div>
                    -->
                    <div>
                        <button type="submit" :disabled="authStore.loading"
                            class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                                </path>
                            </svg>
                            <span v-if="authStore.loading" class="loader mr-2"></span>
                            <span>{{ authStore.loading ? 'Authenticating...' : 'Sign In' }}</span>
                        </button>
                    </div>
                    <!-- register -->
                    <div class="text-center">
                        <p class="text-sm text-gray-600">
                            Don't have an admin account?
                            <button @click="goToRegister"
                                class="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none">
                                Register here
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { get } from "lodash";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const token = ref("");
const captchaLoading = ref(true);

const siteKey = "6Lf5U-grAAAAADVVBh1BOtBQNH7kLnfNoe45COyp";
let widgetId = null;

// Wait until reCAPTCHA script is available
const waitForGrecaptcha = () => {
    return new Promise((resolve) => {
        const check = () => {
            if (window.grecaptcha && typeof window.grecaptcha.render === "function") {
                resolve(window.grecaptcha);
            } else {
                setTimeout(check, 200);
            }
        };
        check();
    });
};

// Initialize reCAPTCHA once script is ready
onMounted(async () => {
    const grecaptcha = await waitForGrecaptcha();
    captchaLoading.value = false;
    widgetId = grecaptcha.render("recaptcha-container", {
        sitekey: siteKey,
        callback: onVerify,
    });
});

// reCAPTCHA callback when solved
const onVerify = (response) => {
    token.value = response;
    console.log("✅ reCAPTCHA Token:", token.value);
};

// Handle Login
const handleLogin = async () => {
    errorMessage.value = "";

    if (!token.value) {
        errorMessage.value = "Please complete the reCAPTCHA.";
        return;
    }

    const credentials = {
        username: email.value,
        password: password.value,
        captcha_token: token.value,
    };

    const result = await authStore.login(credentials);

    if (result.success) {
        const storedUser = localStorage.getItem("user");
        const parsedUser = storedUser ? JSON.parse(storedUser) : {};
        console.log("Parsed User from Local Storage:", parsedUser);

        const userRole = authStore.user.role ?? parsedUser.role ?? null;
        if (userRole == 3) {
            router.push("app/trainees");
            return;
        }
        router.push("app/");
    } else {
        errorMessage.value = result.message || "Invalid username or password.";
        grecaptcha.reset(widgetId);
    }
};

const goToRegister = () => router.push("/register");
</script>