<template>
  <main class="p-5 space-y-5 bg-gradient-to-b from-slate-50 to-white text-slate-800 min-h-screen">

    <!-- Intro -->
    <section class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 fade-in">
      <h2 class="text-blue-500 font-semibold">
        <i class="fa-solid fa-user-shield mr-2"></i> Quick Overview
      </h2>
      <p class="text-sm mt-2 text-gray-700">
        As a supervisor you can <strong>scan trainee QR codes</strong>, record attendance manually, monitor trainee hours,
        manage trainee assignments (accept/decline/un-enroll), evaluate performance, and edit your profile (capture a photo and update details).
      </p>
    </section>

    <!-- Accordion -->
    <div class="space-y-4">

      <article
        v-for="(item, index) in accordionItems"
        :key="index"
        class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 fade-in"
      >
        <button
          class="w-full flex items-start justify-between accordion-btn"
          @click="toggleAccordion(index)"
        >
          <div class="flex items-center gap-3">
            <i :class="item.icon + ' text-lg'" :style="{ color: item.color }"></i>
            <div class="text-left">
              <div :class="['font-semibold', item.titleColor]">{{ item.title }}</div>
              <div class="text-xs text-gray-500">{{ item.subtitle }}</div>
            </div>
          </div>
          <i
            class="fa-solid toggle text-gray-400"
            :class="item.open ? 'fa-minus' : 'fa-plus'"
          ></i>
        </button>

        <div v-show="item.open" class="accordion-content mt-3 text-sm text-gray-700 space-y-2">
          <div v-for="(row, rIndex) in item.rows" :key="rIndex" class="flex items-start gap-3">
            <i :class="row.icon + ' mt-1'" :style="{ color: row.color }"></i>
            <p v-html="row.text"></p>
          </div>
        </div>
      </article>

      <!-- Tips & Security (non-accordion) -->
      <article class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 fade-in">
        <h3 class="font-semibold text-gray-800">
          <i class="fa-solid fa-shield-check text-gray-600 mr-2"></i> Tips & Security
        </h3>
        <ul class="mt-3 text-sm text-gray-700 space-y-2">
          <li class="flex items-start gap-3">
            <i class="fa-solid fa-circle-check text-green-600 mt-1"></i>
            Always verify the trainee name after scanning QR before confirming attendance.
          </li>
          <li class="flex items-start gap-3">
            <i class="fa-solid fa-lock text-gray-600 mt-1"></i>
            QR tokens are short-lived — ask trainee to re-generate if expired.
          </li>
          <li class="flex items-start gap-3">
            <i class="fa-solid fa-file-lines text-gray-600 mt-1"></i>
            Keep audit notes for manual edits or unusual attendance events.
          </li>
        </ul>
      </article>
    </div>
  </main>
</template>

<script>
export default {
  data() {
    return {
      accordionItems: [
        {
          title: "Monitor Trainee Attendance",
          subtitle: "View daily logs, totals & progress",
          icon: "fa-solid fa-chart-simple",
          color: "#3b82f6", // Tailwind green-600
          titleColor: "text-blue-500",
          open: false,
          rows: [
            { icon: "fa-solid fa-clock", color: "#6b7280", text: "Open the <strong>Attendance</strong> tab to see recent time-in/time-out logs per trainee." },
            { icon: "fa-solid fa-chart-pie", color: "#6b7280", text: "Use filters (date range / trainee / program) to inspect hours and completion percentage." },
            { icon: "fa-solid fa-bell", color: "#6b7280", text: "Enable alerts for trainees approaching required OJT hours or with missing logs." },
          ],
        },
        {
          title: "Scan QR Code for Attendance",
          subtitle: "Fast & secure daily check-in/out",
          icon: "fa-solid fa-qrcode",
          color: "#3b82f6", // Tailwind indigo-600
          titleColor: "text-blue-500",
          open: false,
          rows: [
            { icon: "fa-solid fa-camera", color: "#6b7280", text: "Open the <strong>Scan</strong> screen and point the camera at trainee's QR." },
            { icon: "fa-solid fa-shield", color: "#6b7280", text: "The system validates the QR payload (expiry/time & signed token). If valid, attendance is recorded." },
            { icon: "fa-solid fa-check-circle", color: "#6b7280", text: "On successful scan, you’ll see trainee name, time-in/out action and a confirmation." },
            { icon: "fa-solid fa-circle-exclamation", color: "#6b7280", text: "If the QR is expired or invalid, the scanner shows a warning — ask the trainee to regenerate the code." },
          ],
        },
        {
          title: "Manual Attendance",
          subtitle: "Add or fix attendance entries",
          icon: "fa-solid fa-hand-paper",
          color: "#3b82f6", // Tailwind amber-600
          titleColor: "text-blue-500",
          open: false,
          rows: [
            { icon: "fa-solid fa-user-clock", color: "#6b7280", text: "From the trainee profile, choose <strong>Manual Attendance</strong> to add a time-in/time-out entry." },
            { icon: "fa-solid fa-pen", color: "#6b7280", text: "Edit incorrect logs (with reason). Manual changes are logged for audit trail." },
            { icon: "fa-solid fa-lock", color: "#6b7280", text: "Only supervisors with permission can perform manual edits. Use comments to explain the change." },
          ],
        },
        {
          title: "Manage Trainees",
          subtitle: "Accept requests, unenroll and organize",
          icon: "fa-solid fa-users-cog",
          color: "#3b82f6", // Tailwind cyan-600
          titleColor: "text-blue-500",
          open: false,
          rows: [
            { icon: "fa-solid fa-check", color: "#6b7280", text: "<strong>Accept / Decline Requests:</strong> Review incoming supervisee requests and accept or decline. Provide a short response if declining." },
            { icon: "fa-solid fa-user-minus", color: "#6b7280", text: "<strong>Unenroll Trainee:</strong> Remove a trainee from your list when their OJT completes or if reassignment is needed." },
            { icon: "fa-solid fa-folder-plus", color: "#6b7280", text: "Organize trainees by program, batch, or priority — use filters to find a trainee quickly." },
          ],
        },
        {
          title: "Evaluate Trainee Performance",
          subtitle: "Record scores, remarks & final reviews",
          icon: "fa-solid fa-star",
          color: "#3b82f6", // Tailwind yellow-600
          titleColor: "text-blue-500",
          open: false,
          rows: [
            { icon: "fa-solid fa-list-check", color: "#6b7280", text: "Open <strong>Evaluation</strong> from a trainee profile, fill the score form and add remarks for each item." },
            { icon: "fa-solid fa-download", color: "#6b7280", text: "Save or export evaluation reports (PDF). Keep records for periodic reviews." },
            { icon: "fa-solid fa-comment-dots", color: "#6b7280", text: "Give constructive feedback and required actions. If re-evaluation is needed, flag the trainee." },
          ],
        },
        {
          title: "Edit Your Profile",
          subtitle: "Update photo and information",
          icon: "fa-solid fa-user-pen",
          color: "#3b82f6", // Tailwind violet-600
          titleColor: "text-blue-500",
          open: false,
          rows: [
            { icon: "fa-solid fa-camera", color: "#6b7280", text: "Use <strong>Take Photo</strong> to capture a profile picture directly from your device camera." },
            { icon: "fa-solid fa-pen", color: "#6b7280", text: "Edit name, contact details, and other profile fields. Changes are reflected immediately after saving." },
            { icon: "fa-solid fa-shield-halved", color: "#6b7280", text: "Profile edits are audited. Make sure information is accurate as it is used in attendance reports and evaluations." },
          ],
        },
      ],
    };
  },
  methods: {
    toggleAccordion(index) {
      this.accordionItems[index].open = !this.accordionItems[index].open;
    },
  },
};
</script>

<style>
.fade-in {
  animation: fadeIn 0.45s ease-out both;
}
@keyframes fadeIn {
  from { opacity:0; transform: translateY(6px);}
  to {opacity:1; transform:translateY(0);}
}
</style>