import { createRouter, createWebHistory } from "vue-router";
import Basic from "../views/auth/Basic.vue";
import Enter from "@/views/Enter/Enter.vue";
import MainPage from "@/views/MainPage/MainPage.vue";


const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/Enter/Enter"
  },
  {
    path: "/Enter/Enter",
    name: "Enter",
    component: Enter
  },
  {
    path: "/Enter/signIn/",
    name: "SignIn",
    component: Basic
  },
  {
    path: "/MainPage/",
    name: "MainPage",
    component: MainPage
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active"
});

export default router;
