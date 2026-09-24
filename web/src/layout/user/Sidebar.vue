<template>
  <aside
    id="sidebar"
    class="sidebar w-64 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-lg flex flex-col p-4 border-r border-gray-200"
  >
    <!-- Title -->
    <div class="flex items-center sidebar-title mb-6">
      <img
        :src="logo"
        alt="Logo"
        class="h-12 w-12 mr-3 rounded-full border-2 border-blue-600 shadow-md object-cover"
      />
      <span class="text-xl font-bold primary-color sidebar-label">OJT Tracking</span>
    </div>

    <!-- Navigation -->
    <nav class="space-y-2 text-base flex-1">
      <router-link
        v-for="item in menuItems"
        :key="item.name"
        :to="item.to"
        :title="item.label"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-md transition',
          isActive(item.to)
            ? 'bg-blue-100 text-blue-600 font-semibold'
            : 'text-gray-700 hover:bg-indigo-50'
        ]"
      >
        <i :class="item.icon + ' text-lg'"></i>
        <span class="sidebar-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- Logout -->
    <div class="mt-auto border-t border-gray-200 pt-4">
      <button
        @click="handleLogout"
        class="flex items-center gap-3 px-3 py-2 rounded-md transition text-gray-700 hover:bg-indigo-50 w-full"
      >
        <i class="fas fa-sign-out-alt text-lg"></i>
        <span class="sidebar-label">Logout</span>
      </button>
    </div>
  </aside>
</template>

<script>
import { useRoute, useRouter } from "vue-router";
import logo from "@/assets/icon.png";
import { useAuthStore } from "@/stores/useAuthStore";
import { confirmDialog } from "@/ui/feedback";

export default {
  setup() {
  const route = useRoute();
  const router = useRouter();
  const authStore = useAuthStore();
  const userRole = authStore.user.role;

  const handleLogout = async () => {
    const ok = await confirmDialog({
      title: "Log out?",
      message: "You will need to sign in again to use the dashboard.",
      confirmText: "Log out",
      icon: "fa-right-from-bracket",
    });
    if (!ok) return;
    await authStore.logout();
    location.reload();
  };

  const isActive = (path) => {
    if (path === "/app" || path === "/app/") {
      return route.path === "/app" || route.path === "/app/";
    }
    return route.path.startsWith(path);
  };

  let menuItems = [
    { name: "Dashboard", label: "Dashboard", to: "/app", icon: "fas fa-home" },
    { name: "Trainees", label: "Trainees", to: "/app/trainees", icon: "fas fa-users" },
    { name: "Supervisors", label: "Supervisors", to: "/app/supervisors", icon: "fas fa-user-tie" },
    { name: "Requests", label: "Requests", to: "/app/requests", icon: "fas fa-inbox" },
    { name: "UnassignedTrainees", label: "Unassigned Trainees", to: "/app/unassigned-trainees", icon: "fas fa-user-slash" },
    { name: "TraineeEvaluations", label: "Trainee Evaluations", to: "/app/trainee-evaluations", icon: "fas fa-chart-bar" },
    { name: "CompletedTrainees", label: "Completed Trainees", to: "/app/completed-trainees", icon: "fas fa-check-circle" },
    { name: "Teachers", label: "Teachers", to: "/app/teachers", icon: "fas fa-chalkboard-teacher" },
  ];

  if (userRole === 3) {
    menuItems = menuItems.filter(item => item.name !== "Dashboard" && item.name !== "Teachers");
  }

  return { isActive, menuItems, logo, handleLogout };
},
};
</script>
