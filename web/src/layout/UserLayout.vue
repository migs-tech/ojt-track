<template>
  <div :class="['flex h-screen', { 'sidebar-collapsed': collapsed }]">
    <!-- Sidebar -->
    <UserSidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <UserHeader @toggle="collapsed = !collapsed" />

      <!-- Main Content -->
      <main ref="mainEl" class="p-2 overflow-y-auto space-y-6 flex-1 relative">
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in" @before-enter="scrollTop">
            <!-- Pages have several root elements, so wrap them for the transition -->
            <div :key="route.fullPath">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserHeader from "@/layout/user/Header.vue";
import UserSidebar from "@/layout/user/Sidebar.vue";

const collapsed = ref(false);
const mainEl = ref(null);

// Start each page at the top
const scrollTop = () => {
  if (mainEl.value) mainEl.value.scrollTop = 0;
};
</script>
