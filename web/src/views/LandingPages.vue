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
            :href="apkDownloadUrl" @click="onDownload"
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
          :href="apkDownloadUrl" @click="onDownload"
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

    <!-- Who it's for -->
    <section class="py-20 px-6 bg-gray-50">
        <div class="container mx-auto">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-blue-600 font-semibold text-sm uppercase tracking-wider">One platform, four roles</span>
                <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-4">Built for everyone in the OJT program</h2>
                <p class="text-lg text-gray-600">Trainees and supervisors use the mobile app. OJT coordinators and administrators manage everything from the web portal.</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="role in roles" :key="role.title" class="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition duration-300">
                    <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-5', role.bg]">
                        <i :class="[role.icon, 'text-white text-xl']"></i>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-lg font-bold text-gray-900">{{ role.title }}</h3>
                        <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            <i :class="role.platform === 'Mobile app' ? 'fas fa-mobile-alt' : 'fas fa-desktop'" class="mr-1"></i>{{ role.platform }}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed">{{ role.text }}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Features -->
    <section class="py-20 px-6 bg-white">
        <div class="container mx-auto">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-blue-600 font-semibold text-sm uppercase tracking-wider">Features</span>
                <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-4">Everything You Need to Succeed</h2>
                <p class="text-lg text-gray-600">Secure attendance, smarter reports and real-time monitoring in one place.</p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="feature in features" :key="feature.title" class="group bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition duration-300">
                    <div :class="['w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br group-hover:scale-110 transition', feature.gradient]">
                        <i :class="[feature.icon, 'text-white text-2xl']"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">{{ feature.title }}</h3>
                    <p class="text-gray-600 leading-relaxed">{{ feature.text }}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- How attendance works -->
    <section class="py-20 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div class="container mx-auto">
            <div class="text-center max-w-2xl mx-auto mb-14">
                <span class="text-blue-200 font-semibold text-sm uppercase tracking-wider">How it works</span>
                <h2 class="text-4xl font-bold mt-2 mb-4">Secure attendance in four steps</h2>
                <p class="text-lg text-blue-100">Each QR code works once and expires, so attendance can't be copied or faked.</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div v-for="(step, i) in steps" :key="step.title" class="relative bg-white/10 backdrop-blur rounded-2xl p-7 border border-white/15">
                    <div class="w-10 h-10 rounded-full bg-white text-blue-700 font-bold flex items-center justify-center mb-5">{{ i + 1 }}</div>
                    <i :class="[step.icon, 'text-3xl text-blue-100 mb-4 block']"></i>
                    <h3 class="text-lg font-bold mb-2">{{ step.title }}</h3>
                    <p class="text-blue-100 text-sm leading-relaxed">{{ step.text }}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Mobile app showcase -->
    <section class="py-20 px-6 bg-gray-50 overflow-hidden">
        <div class="container mx-auto">
            <div class="flex flex-col lg:flex-row items-center gap-16">
                <div class="flex-1 text-center lg:text-left">
                    <span class="text-blue-600 font-semibold text-sm uppercase tracking-wider">Mobile app</span>
                    <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-5">Your OJT in your pocket</h2>
                    <p class="text-lg text-gray-600 mb-8 leading-relaxed">
                        Trainees generate their daily QR code, submit reports with photos and watch their hours add up.
                        Supervisors scan attendance, review reports and evaluate their trainees, all from their phone.
                    </p>
                    <ul class="space-y-3 mb-10 text-left max-w-md mx-auto lg:mx-0">
                        <li v-for="point in appPoints" :key="point" class="flex items-start gap-3 text-gray-700">
                            <i class="fas fa-check-circle text-green-500 mt-1"></i><span>{{ point }}</span>
                        </li>
                    </ul>
                    <a :href="apkDownloadUrl" @click="onDownload" class="inline-flex items-center gap-3 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:bg-green-700 hover:shadow-xl transition">
                        <i class="fab fa-android text-2xl"></i>
                        <span class="text-left leading-tight">Download App<br /><span class="text-xs font-normal text-green-100">Android 8.0 or higher</span></span>
                    </a>
                </div>

                <!-- Phone mockup of the trainee dashboard (Figure 4.2) -->
                <div class="flex-1 flex justify-center">
                    <div class="relative">
                        <div class="absolute -inset-8 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full blur-3xl opacity-60"></div>
                        <div class="relative w-72 h-[630px] bg-gray-900 rounded-[2.75rem] p-3 shadow-2xl">
                            <div class="w-full h-full bg-gray-100 rounded-[2.25rem] overflow-hidden flex flex-col">
                                <div class="bg-[#3b5bdb] text-white px-5 pt-8 pb-4 flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center"><i class="fas fa-user text-gray-500 text-sm"></i></div>
                                    <div>
                                        <p class="text-sm font-semibold leading-tight">Good morning, Trainee</p>
                                        <p class="text-[10px] text-blue-100">{{ todayLabel }}</p>
                                    </div>
                                </div>
                                <div class="flex-1 min-h-0 overflow-hidden p-3 space-y-2.5 text-[11px]">
                                    <div class="bg-blue-50 border border-blue-100 rounded-xl p-2.5 text-blue-700">
                                        <p class="font-semibold"><i class="fas fa-user-circle mr-1"></i>You have supervisor now</p>
                                        <p class="text-[9px] text-blue-500">You can submit your report to your supervisor.</p>
                                    </div>
                                    <div class="bg-white rounded-xl p-3 shadow-sm">
                                        <div class="flex justify-between items-start mb-2">
                                            <div><p class="font-bold text-gray-800">Daily Challenge</p><p class="text-[9px] text-gray-500">Get your QR code before 7:00 AM</p></div>
                                            <i class="far fa-clock text-blue-600 text-2xl"></i>
                                        </div>
                                        <div class="bg-[#2f74d0] text-white text-center rounded-lg py-1.5 font-semibold">Generate Code</div>
                                    </div>
                                    <div class="bg-white rounded-xl p-3 shadow-sm">
                                        <p class="font-bold text-gray-800 mb-2">Weekly Attendance</p>
                                        <div class="flex justify-between text-[9px] text-gray-500">
                                            <span v-for="d in ['Mon','Tue','Wed','Thu','Fri']" :key="d" class="flex flex-col items-center gap-1">{{ d }}<i class="fas fa-check-circle text-green-500"></i></span>
                                        </div>
                                    </div>
                                    <div class="bg-white rounded-xl p-3 shadow-sm">
                                        <div class="flex justify-between"><p class="font-bold text-gray-800">Total Hours</p><span class="text-[9px] text-blue-600">See all &gt;</span></div>
                                        <p class="text-[9px] text-gray-500 mb-2">Overall work hours</p>
                                        <div class="bg-[#2f74d0] text-white text-center rounded-lg py-2 font-bold text-base">312h 45m</div>
                                    </div>
                                    <div class="bg-white rounded-xl p-3 shadow-sm">
                                        <div class="flex justify-between"><p class="font-bold text-gray-800">Daily Report</p><span class="text-[9px] text-blue-600">See all &gt;</span></div>
                                        <p class="text-[9px] text-gray-500">- Fixed login page bugs</p>
                                    </div>
                                </div>
                                <div class="bg-white border-t flex justify-around py-2 text-[9px] text-gray-400">
                                    <span class="flex flex-col items-center text-blue-600"><i class="fas fa-home text-sm"></i>Home</span>
                                    <span class="flex flex-col items-center"><i class="far fa-file-alt text-sm"></i>Report</span>
                                    <span class="flex flex-col items-center"><i class="fas fa-qrcode text-sm"></i>QR Code</span>
                                    <span class="flex flex-col items-center"><i class="far fa-envelope text-sm"></i>Mail</span>
                                    <span class="flex flex-col items-center"><i class="far fa-user text-sm"></i>Profile</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Evaluation results from the study -->
    <section class="py-20 px-6 bg-white">
        <div class="container mx-auto">
            <div class="text-center max-w-2xl mx-auto mb-12">
                <span class="text-blue-600 font-semibold text-sm uppercase tracking-wider">Evaluated with ISO/IEC 25010</span>
                <h2 class="text-4xl font-bold text-gray-900 mt-2 mb-4">Rated "Very Functional" by its users</h2>
                <p class="text-lg text-gray-600">IT practitioners, faculty and OJT trainees rated OJTrack on a five-point scale.</p>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
                <div v-for="score in scores" :key="score.label"
                    :class="['rounded-2xl p-5 text-center border', score.overall ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-transparent shadow-lg' : 'bg-gray-50 border-gray-100']">
                    <p :class="['text-3xl font-bold', score.overall ? 'text-white' : 'text-gray-900']">{{ score.value }}</p>
                    <p :class="['text-xs mt-1 font-medium', score.overall ? 'text-blue-100' : 'text-gray-500']">{{ score.label }}</p>
                </div>
            </div>
            <p class="text-center text-sm text-gray-400 mt-6">Mean ratings out of 5.00</p>
        </div>
    </section>

    <!-- FAQ -->
    <section class="py-20 px-6 bg-gray-50">
        <div class="container mx-auto max-w-3xl">
            <div class="text-center mb-12">
                <span class="text-blue-600 font-semibold text-sm uppercase tracking-wider">FAQ</span>
                <h2 class="text-4xl font-bold text-gray-900 mt-2">Common questions</h2>
            </div>
            <div class="space-y-3">
                <details v-for="item in faqs" :key="item.q" class="group bg-white rounded-xl border border-gray-100 shadow-sm p-5 open:shadow-md">
                    <summary class="flex justify-between items-center cursor-pointer list-none font-semibold text-gray-900">
                        {{ item.q }}
                        <i class="fas fa-chevron-down text-gray-400 group-open:rotate-180 transition"></i>
                    </summary>
                    <p class="text-gray-600 mt-3 leading-relaxed">{{ item.a }}</p>
                </details>
            </div>
        </div>
    </section>

    <!-- Final call to action -->
    <section class="py-20 px-6 bg-white">
        <div class="container mx-auto">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl px-8 py-14 text-center text-white shadow-2xl">
                <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to track your OJT?</h2>
                <p class="text-lg text-blue-100 mb-8 max-w-xl mx-auto">Trainees and supervisors: get the app. OJT coordinators: create your account on the web portal.</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a :href="apkDownloadUrl" @click="onDownload" class="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow hover:bg-blue-50 transition">
                        <i class="fas fa-mobile-alt mr-2"></i>Download App
                    </a>
                    <button @click="goToRegister" class="px-8 py-4 border-2 border-white/70 text-white font-semibold rounded-xl hover:bg-white/10 transition">
                        <i class="fas fa-user-plus mr-2"></i>Coordinator Sign Up
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 pt-16 pb-8 px-6">
        <div class="container mx-auto">
            <div class="grid md:grid-cols-4 gap-10 mb-12">
                <div class="md:col-span-2">
                    <div class="flex items-center space-x-2 mb-4">
                        <img :src="logo" alt="Logo" class="h-10 w-10 rounded-lg" />
                        <span class="text-2xl font-bold text-white">OJT Tracker</span>
                    </div>
                    <p class="max-w-sm leading-relaxed">An Android and web-based OJT monitoring and attendance system with one-time QR codes, OTP verification and AI-assisted reports.</p>
                </div>
                <div>
                    <h4 class="text-white font-semibold mb-4">Get started</h4>
                    <ul class="space-y-2">
                        <li><a :href="apkDownloadUrl" @click="onDownload" class="hover:text-white transition">Download the app</a></li>
                        <li><button @click="goToLogin" class="hover:text-white transition">Login</button></li>
                        <li><button @click="goToRegister" class="hover:text-white transition">Coordinator sign up</button></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-white font-semibold mb-4">User guides</h4>
                    <ul class="space-y-2">
                        <li><router-link to="/trainee-instructions" class="hover:text-white transition">For trainees</router-link></li>
                        <li><router-link to="/supervisor-instructions" class="hover:text-white transition">For supervisors</router-link></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8 text-sm text-center">
                <p>&copy; {{ new Date().getFullYear() }} OJT Tracker. All rights reserved.</p>
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
import { toast } from "@/ui/feedback";
const mobileMenuOpen = ref(false);

const router = useRouter();
const goToRegister = () => router.push("/register");

// The link downloads the APK directly; tell people it started and how to install it.
const onDownload = () => {
  toast("Download started (about 115 MB). When it finishes, open ojt-track.apk to install. If Android asks, allow installing from your browser.", "info", 9000);
};
const goToLogin = () => router.push("/login");

// "Download App" link for the Android APK. By default it points to the APK attached to the
// latest GitHub release (upload it as ojt-track.apk); set VITE_APK_URL to use another link.
const apkDownloadUrl =
  import.meta.env.VITE_APK_URL ||
  "https://github.com/migs-tech/ojt-track/releases/latest/download/ojt-track.apk";

const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const roles = [
  { title: "Trainees", platform: "Mobile app", icon: "fas fa-user-graduate", bg: "bg-blue-600",
    text: "Log attendance with a one-time QR code, submit daily reports with photos and track your required hours." },
  { title: "Supervisors", platform: "Mobile app", icon: "fas fa-user-tie", bg: "bg-emerald-600",
    text: "Scan trainee QR codes, record attendance manually when needed, review reports and evaluate trainees." },
  { title: "OJT Coordinators", platform: "Web portal", icon: "fas fa-chalkboard-teacher", bg: "bg-indigo-600",
    text: "Monitor trainees and supervisors, assign supervisors and approve weekly or monthly report requests." },
  { title: "Administrators", platform: "Web portal", icon: "fas fa-user-shield", bg: "bg-purple-600",
    text: "Verify coordinator accounts, manage users and see attendance and completion across the program." },
];

const features = [
  { title: "QR Code + OTP Attendance", icon: "fas fa-qrcode", gradient: "from-blue-500 to-blue-600",
    text: "Trainees verify an OTP sent to their email, then show a one-time QR code that the supervisor scans to time them in." },
  { title: "AI-Assisted Reports", icon: "fas fa-wand-magic-sparkles", gradient: "from-indigo-500 to-indigo-600",
    text: "Short task notes and photos are turned into clear, professional daily accomplishment reports." },
  { title: "Hours & Progress Tracking", icon: "fas fa-chart-line", gradient: "from-green-500 to-green-600",
    text: "Total hours, weekly attendance and completion toward the required OJT hours, updated in real time." },
  { title: "Trainee Evaluations", icon: "fas fa-clipboard-check", gradient: "from-orange-500 to-orange-600",
    text: "Supervisors complete midterm and final evaluations that coordinators can review with full score details." },
  { title: "Report Requests", icon: "fas fa-file-pdf", gradient: "from-rose-500 to-rose-600",
    text: "Trainees request weekly or monthly reports; once approved, the PDF is generated and emailed automatically." },
  { title: "Notifications & Reminders", icon: "fas fa-bell", gradient: "from-purple-500 to-purple-600",
    text: "Push and email reminders for time-in, time-out and reports, plus alerts when requests are approved." },
];

const steps = [
  { title: "Verify your email", icon: "fas fa-envelope-circle-check", text: "Trainees confirm their Gmail once from their profile." },
  { title: "Get your OTP", icon: "fas fa-key", text: "Request an OTP from the dashboard. It arrives in your email." },
  { title: "Generate your QR code", icon: "fas fa-qrcode", text: "Enter the OTP to create a QR code that works only once and expires." },
  { title: "Supervisor scans", icon: "fas fa-camera", text: "Your supervisor scans it to time you in. Time out at the end of your shift." },
];

const appPoints = [
  "One-time QR code attendance with OTP verification",
  "Daily reports with photos, improved by AI",
  "Weekly attendance and total hours at a glance",
  "Supervisor scanner with manual entry for network issues",
];

const scores = [
  { label: "Functional Suitability", value: "4.47" },
  { label: "Usability", value: "4.46" },
  { label: "Performance Efficiency", value: "4.45" },
  { label: "Reliability", value: "4.45" },
  { label: "Security", value: "4.52" },
  { label: "Overall", value: "4.47", overall: true },
];

const faqs = [
  { q: "Who can use OJT Tracker?", a: "Trainees and company supervisors use the Android app. OJT coordinators and administrators use this web portal." },
  { q: "How do I get the mobile app?", a: "Tap \"Download App\" to get the Android app (Android 8.0 or higher), then register as a trainee or supervisor." },
  { q: "I'm an OJT coordinator. How do I get access?", a: "Create an account with \"Register\". An administrator verifies your account before you can log in." },
  { q: "Why do I need an OTP before my QR code?", a: "The OTP proves it's really you, and each QR code works once and expires. Together they prevent faked or shared attendance." },
  { q: "What if the supervisor's phone has no internet?", a: "Supervisors can record attendance with Manual Entry, and it still counts toward your hours." },
];
</script>
