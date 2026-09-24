<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-lg rounded-2xl w-full max-w-md p-8">
      <!-- Logo / Title -->
      <div class="text-center mb-6">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Trainee"
          class="w-16 h-16 mx-auto mb-2"
        />
        <h2 class="text-2xl font-bold text-gray-800">OJT Tracking</h2>
        <p class="text-gray-500 text-sm">Sign in to continue</p>
      </div>

      <form @submit.prevent="handleLogin">
        <!-- Error Message -->
        <div
          v-if="errorMessage"
          class="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm border border-red-300"
        >
          {{ errorMessage }}
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email or Username
          </label>
          <input
            v-model="email"
            type="text"
            required
            placeholder="Enter your Username or Email"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <!-- Password -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <!-- reCAPTCHA Section -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Verify you're human
          </label>

          <div
            class="relative bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-center items-center hover:shadow-sm transition"
          >
            <!-- Loader while waiting -->
            <div
              v-if="captchaLoading"
              class="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10"
            >
              <svg
                class="animate-spin h-5 w-5 text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            </div>

            <div id="recaptcha-container" class="flex justify-center"></div>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition duration-300 flex items-center justify-center"
        >
          <span v-if="authStore.loading" class="loader mr-2"></span>
          <span>{{ authStore.loading ? "Logging in..." : "Login" }}</span>
        </button>
      </form>

      <!-- Footer -->
      <p class="text-center text-gray-500 text-sm mt-6">
        Don’t have an account?
        <a
          href="#"
          class="text-indigo-600 hover:underline"
          @click.prevent="goToRegister"
          >Register here</a
        >
      </p>
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
      router.push("/trainees");
      return;
    }
    router.push("/");
  } else {
    errorMessage.value = result.message || "Invalid username or password.";
    grecaptcha.reset(widgetId);
  }
};

const goToRegister = () => router.push("/register");
</script>