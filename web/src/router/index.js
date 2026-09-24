import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import userRoutes from "./userRoutes";

const router = createRouter({
  history: createWebHistory(),
  routes: userRoutes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Redirect unauthenticated users to Landing Page by default
  if (to.meta.requiresAuth && !isAuthenticated) {
    localStorage.setItem("userIntendedRoute", to.fullPath);
    return next({ name: "LandingPage" });
  }

  // Prevent authenticated users from accessing login/register pages
  if ((to.name === "Login" || to.name === "Register") && isAuthenticated) {
    return next({ name: "Home" });
  }

  next();
});

export default router;
