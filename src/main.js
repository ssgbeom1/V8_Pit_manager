import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import VueTilt from "vue-tilt.js";
import VueSweetalert2 from "vue-sweetalert2";
import ArgonDashboard from "./argon-dashboard";

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

const appInstance = createApp(App);
appInstance.use(ElementPlus);
appInstance.use(store);
appInstance.use(router);
appInstance.use(VueTilt);
appInstance.use(VueSweetalert2);
appInstance.use(ArgonDashboard);
appInstance.mount("#app");
