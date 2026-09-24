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
        component: Home,
      },
      {
        path: "trainees",
        name: "Trainees",
        component: Trainee,
      },
      {
        path: "trainees/details/:id",
        name: "TraineeDetails",
        component: () => import("@/views/TraineeDetails.vue"),
      },
      {
        path: "supervisors",
        name: "Supervisors",
        component: () => import("@/views/supervisor/index.vue"),
      },
      {
        path: "trainee-requests",
        name: "TraineeRequests",
        component: () => import("@/views/trainee/TraineeRequests.vue"),
      },
      {
        path: "unassigned-trainees",
        name: "UnassignedTrainees",
        component: () => import("@/views/trainee/UnassignedTrainees.vue"),
      },
      {
        path: "requests",
        name: "Requests",
        component: () => import("@/views/request/Index.vue"),
      },
      {
        path: "teachers",
        name: "Teachers",
        component: () => import("@/views/teachers/Index.vue"),
      },
      {
        path: "trainee-evaluations",
        name: "TraineeEvaluations",
        component: () => import("@/views/evaluation/EvaluationsPage.vue"),
      },
      {
        path: "completed-trainees",
        name: "CompletedTrainees",
        component: () => import("@/views/CompleteTrainee.vue"),
      },
      {
        path: "completed-trainees/details/:id",
        name: "CompletedTraineeDetails",
        component: () => import("@/views/Details.vue"),
      },
    ],
  },
];
