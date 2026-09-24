<!-- Password reset for admins and coordinators: email → 6-digit code → new password -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
    <div class="w-full max-w-md rise-in">
      <router-link
        :to="{ name: 'Login' }"
        class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-4"
      >
        <i class="fas fa-arrow-left"></i> Back to login
      </router-link>

      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Steps -->
        <div class="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
          <template v-for="n in 3" :key="n">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300',
                step >= n ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500',
              ]"
            >
              <i v-if="step > n" class="fas fa-check text-xs"></i>
              <span v-else>{{ n }}</span>
            </div>
            <div v-if="n < 3" :class="['w-10 h-1 rounded transition-colors duration-300', step > n ? 'bg-indigo-600' : 'bg-gray-200']"></div>
          </template>
        </div>

        <transition name="page" mode="out-in">
          <!-- 1. Email -->
          <form v-if="step === 1" key="1" class="space-y-5" @submit.prevent="sendCode">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-800">Forgot your password?</h1>
              <p class="text-sm text-gray-500 mt-1">Enter your account's email and we'll send you a 6-digit code.</p>
            </div>
            <input
              v-model.trim="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
            />
            <SubmitButton :busy="busy" label="Send code" />
          </form>

          <!-- 2. Code -->
          <form v-else-if="step === 2" key="2" class="space-y-5" @submit.prevent="verifyCode">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-800">Check your email</h1>
              <p class="text-sm text-gray-500 mt-1">
                If <strong>{{ email }}</strong> has an account, we sent a code to it. It expires in 15 minutes.
              </p>
            </div>
            <input
              v-model.trim="otp"
              inputmode="numeric"
              maxlength="6"
              required
              autocomplete="one-time-code"
              placeholder="123456"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-indigo-500 transition"
            />
            <SubmitButton :busy="busy" label="Verify code" />
            <div class="flex justify-between text-sm">
              <button type="button" class="text-gray-500 hover:text-indigo-600" @click="step = 1">
                <i class="fas fa-pen mr-1"></i> Change email
              </button>
              <button type="button" class="text-indigo-600 hover:text-indigo-500 disabled:text-gray-400" :disabled="busy" @click="sendCode">
                Resend code
              </button>
            </div>
          </form>

          <!-- 3. New password -->
          <form v-else-if="step === 3" key="3" class="space-y-5" @submit.prevent="resetPassword">
            <div class="text-center">
              <h1 class="text-2xl font-bold text-gray-800">Set a new password</h1>
              <p class="text-sm text-gray-500 mt-1">Use at least 6 characters.</p>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                autocomplete="new-password"
                placeholder="New password"
                class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <i :class="['fas', showPassword ? 'fa-eye-slash' : 'fa-eye']"></i>
              </button>
            </div>
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="new-password"
              placeholder="Confirm new password"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
            />
            <SubmitButton :busy="busy" label="Change password" />
          </form>

          <!-- 4. Done -->
          <div v-else key="4" class="text-center space-y-4">
            <div class="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fas fa-check text-2xl text-green-600"></i>
            </div>
            <h1 class="text-2xl font-bold text-gray-800">Password changed</h1>
            <p class="text-sm text-gray-500">You can now sign in with your new password.</p>
            <router-link
              :to="{ name: 'Login' }"
              class="block w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition"
            >
              Go to login
            </router-link>
          </div>
        </transition>

        <transition name="fade">
          <p v-if="error" class="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
            {{ error }}
          </p>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h, ref } from "vue";
import api from "@/api/api";
import { toast } from "@/ui/feedback";

// Full-width submit button with a spinner while busy
const SubmitButton = (props) =>
  h(
    "button",
    {
      type: "submit",
      disabled: props.busy,
      class:
        "w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition flex items-center justify-center gap-2",
    },
    [props.busy ? h("i", { class: "fas fa-spinner fa-spin" }) : null, props.busy ? "Please wait..." : props.label]
  );
SubmitButton.props = ["busy", "label"];

const step = ref(1);
const busy = ref(false);
const error = ref("");
const email = ref("");
const otp = ref("");
const resetToken = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);

const call = async (path, body) => {
  busy.value = true;
  error.value = "";
  try {
    const { data } = await api.post(path, body);
    if (!data?.success) error.value = data?.message || "Something went wrong. Please try again.";
    return data?.success ? data : null;
  } catch (e) {
    error.value = e.response?.data?.message || "Couldn't reach the server. Please try again.";
    return null;
  } finally {
    busy.value = false;
  }
};

const sendCode = async () => {
  const data = await call("/user/forgotPassword", { email: email.value });
  if (!data) return;
  if (step.value === 2) toast("A new code was sent.", "info");
  otp.value = "";
  step.value = 2;
};

const verifyCode = async () => {
  if (!/^\d{6}$/.test(otp.value)) {
    error.value = "Enter the 6-digit code from the email.";
    return;
  }
  const data = await call("/user/verifyForgotPasswordOtp", { email: email.value, otp: otp.value });
  if (!data) return;
  resetToken.value = data.reset_token;
  step.value = 3;
};

const resetPassword = async () => {
  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters.";
    return;
  }
  if (password.value !== confirmPassword.value) {
    error.value = "The passwords don't match.";
    return;
  }
  const data = await call("/user/resetPassword", {
    email: email.value,
    password: password.value,
    confirm_password: confirmPassword.value,
    reset_token: resetToken.value,
  });
  if (!data) return;
  step.value = 4;
};
</script>
