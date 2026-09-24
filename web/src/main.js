// src/main.js
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "flatpickr/dist/flatpickr.min.css";
import "vue-select/dist/vue-select.css";
import "./assets/ui.css";
import { isDemo, installDemo } from "./demo";

if (isDemo) installDemo();

const pinia = createPinia(); // ✅ Create Pinia instance first

const app = createApp(App);
app.use(pinia); // ✅ Register Pinia before the router
app.use(router); // ✅ Register router after Pinia

 
app.mount("#app");
