<template>
  <div>
    <!-- Main App -->
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <Analytics />

    <!-- Logout Modal -->
    <div
      v-if="showLogoutModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 class="text-lg font-semibold mb-4">Session Timeout</h2>
        <p class="text-gray-600 mb-6">
          You have been automatically logged out due to 15 minutes of inactivity.
        </p>
        <button
          @click="redirectLogin"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Analytics } from "@vercel/analytics/vue";
import { ref, onMounted } from "vue";
import { setupInactivityListener } from "./utils/inactivity.js";
import { useRouter } from "vue-router";

export default {
  name: "App",
  components: { Analytics },
  setup() {
    const showLogoutModal = ref(false);
    const router = useRouter();

    const redirectLogin = () => {
      // 🔒 clear token only after user clicks OK
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastActive");

      showLogoutModal.value = false;
      window.location.href = "/login";
    };

    onMounted(() => {
      window.showLogoutModal = () => {
        const currentPath = window.location.pathname;

        const excludedPaths = ["/login", "/register"];
        if (currentPath.includes("/app") && !excludedPaths.includes(currentPath)) {
          showLogoutModal.value = true;
        }
      };

      setupInactivityListener();
    });

    return { showLogoutModal, redirectLogin };
  },
};
</script>
