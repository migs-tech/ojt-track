import UserLayout from "@/layout/UserLayout.vue";
import Home from "@/views/Dashboard.vue";
import Trainee from "@/views/TraineeList.vue";
import Login from "@/views/LoginV1.vue";
import Register from "@/views/Register.vue";
import LandingPage from "@/views/LandingPages.vue";

export default [
  // Public routes
  {
    path: "/",
    name: "LandingPage",
    component: LandingPage,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { requiresAuth: false },
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("@/views/ForgotPassword.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/verify-email",
    name: "VerifyEmail",
    component: () => import("@/views/VerifyEmail.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/trainee-instructions",
    name: "TraineeInstructions",
    component: () => import("@/views/Instructions.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/supervisor-instructions",
    name: "SupervisorInstructions",
    component: () => import("@/views/SupervisorInstructions.vue"),
    meta: { requiresAuth: false },
  },
  // Protected routes (inside layout)
  {
    path: "/app",
    component: UserLayout,
    meta: { requiresAuth: true, role: "user" },
    children: [
      {
        path: "",
        name: "Home",
        meta: { title: "Dashboard", adminOnly: true },
        component: Home,
      },
      {
        path: "trainees",
        name: "Trainees",
        meta: { title: "Trainees" },
        component: Trainee,
      },
      {
        path: "trainees/details/:id",
        name: "TraineeDetails",
        meta: { title: "Trainee Details" },
        component: () => import("@/views/TraineeDetails.vue"),
      },
      {
        path: "supervisors",
        name: "Supervisors",
        meta: { title: "Supervisors" },
        component: () => import("@/views/supervisor/index.vue"),
      },
      {
        path: "unassigned-trainees",
        name: "UnassignedTrainees",
        meta: { title: "Unassigned Trainees" },
        component: () => import("@/views/trainee/UnassignedTrainees.vue"),
      },
      {
        path: "requests",
        name: "Requests",
        meta: { title: "Requests" },
        component: () => import("@/views/request/Index.vue"),
      },
      {
        path: "teachers",
        name: "Teachers",
        meta: { title: "Teachers", adminOnly: true },
        component: () => import("@/views/teachers/Index.vue"),
      },
      {
        path: "trainee-evaluations",
        name: "TraineeEvaluations",
        meta: { title: "Trainee Evaluations" },
        component: () => import("@/views/evaluation/EvaluationsPage.vue"),
      },
      {
        path: "completed-trainees",
        name: "CompletedTrainees",
        meta: { title: "Completed Trainees" },
        component: () => import("@/views/CompleteTrainee.vue"),
      },
      {
        path: "completed-trainees/details/:id",
        name: "CompletedTraineeDetails",
        meta: { title: "Completed Trainee Details" },
        component: () => import("@/views/Details.vue"),
      },
    ],
  },
  // Unknown addresses go back to the landing page
  { path: "/:pathMatch(.*)*", redirect: "/" },
];
