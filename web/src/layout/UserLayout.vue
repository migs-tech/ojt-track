<template>
  <div :class="['flex h-screen', { 'sidebar-collapsed': collapsed }]">
    <!-- Sidebar -->
    <UserSidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <UserHeader @toggle="collapsed = !collapsed" />

      <!-- Main Content -->
      <main class="p-2 overflow-y-auto space-y-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserHeader from "@/layout/user/Header.vue";
import UserSidebar from "@/layout/user/Sidebar.vue";

const collapsed = ref(false);
</script>
