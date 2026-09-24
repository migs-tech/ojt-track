<template>
  <div class="bg-gradient-to-b from-indigo-50 to-white text-gray-800 min-h-screen p-5 space-y-5">

    <!-- INTRO CARD -->
    <section class="fade-in bg-white/90 backdrop-blur-md p-5 rounded-2xl">
      <h2 class="font-bold text-xl text-blue-500">
        <i class="fa-solid fa-book-open"></i> Overview
      </h2>
      <p class="text-sm mt-2 leading-relaxed">
        Welcome! This guide explains how to use the OJT attendance and verification system.
        Learn how to generate codes, scan attendance, upload reports, and manage your profile.
      </p>
    </section>

    <!-- ACCORDION SECTIONS -->
    <div class="space-y-4">

      <div
        v-for="(item, index) in accordionItems"
        :key="index"
        class="bg-white p-4 rounded-2xl fade-in"
        :class="{ 'accordion-open': item.open }"
      >
        <button
          class="w-full flex justify-between items-center text-left"
          @click="toggleAccordion(index)"
        >
          <span class="font-semibold text-blue-500 text-lg">
            <i :class="item.icon"></i> {{ item.title }}
          </span>
          <i
            class="fa-solid text-gray-500"
            :class="item.open ? 'fa-minus' : 'fa-plus'"
          ></i>
        </button>

        <div
          class="accordion-content mt-3 space-y-2 text-sm leading-relaxed text-gray-700"
          v-show="item.open"
        >
          <div
            v-for="(row, rIndex) in item.rows"
            :key="rIndex"
            class="flex items-start gap-3"
          >
            <i :class="row.icon + ' mt-1'"></i>
            <p v-html="row.text"></p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      accordionItems: [
        {
          title: "Verification Code",
          icon: "fa-solid fa-shield-halved",
          open: false,
          rows: [
            { icon: "fa-solid fa-key text-indigo-500", text: "Tap <strong>Generate Code</strong> inside the app." },
            { icon: "fa-solid fa-envelope text-indigo-500", text: "A verification code will be sent to your email." },
            { icon: "fa-solid fa-clock text-red-500", text: "Your verification code expires in <strong>40 minutes</strong>." },
          ],
        },
        {
          title: "QR Code Generation",
          icon: "fa-solid fa-qrcode",
          open: false,
          rows: [
            { icon: "fa-solid fa-pen-to-square text-indigo-500", text: "Enter your verification code in the app." },
            { icon: "fa-solid fa-qrcode text-indigo-500", text: "Your personal QR code will appear." },
            { icon: "fa-solid fa-circle-check text-green-600", text: "Use this QR code for daily attendance." },
          ],
        },
        {
          title: "Supervisor Scan",
          icon: "fa-solid fa-user-tie",
          open: false,
          rows: [
            { icon: "fa-solid fa-id-badge text-indigo-500", text: "Show your QR code to your supervisor." },
            { icon: "fa-solid fa-scan text-indigo-500", text: "The supervisor scans to mark <strong>Time-In</strong> or <strong>Time-Out</strong>." },
          ],
        },
        {
          title: "Monitor OJT Hours",
          icon: "fa-solid fa-chart-line",
          open: false,
          rows: [
            { icon: "fa-solid fa-hourglass-half text-indigo-500", text: "Check your rendered hours anytime." },
            { icon: "fa-solid fa-percent text-indigo-500", text: "View completion percentage and progress bar." },
          ],
        },
        {
          title: "Daily Accomplishment Report",
          icon: "fa-solid fa-file-lines",
          open: false,
          rows: [
            { icon: "fa-solid fa-file-upload text-indigo-500", text: "Submit your daily tasks and upload attachments." },
          ],
        },
        {
          title: "Edit Profile",
          icon: "fa-solid fa-user-pen",
          open: false,
          rows: [
            { icon: "fa-solid fa-image text-indigo-500", text: "Update profile picture anytime." },
            { icon: "fa-solid fa-id-card text-indigo-500", text: "Edit your personal information easily." },
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
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>