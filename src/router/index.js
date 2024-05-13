import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/views/MainPage/MainPage.vue";
import Landing from "@/views/landing/Landing.vue";
import Login from "@/views/auth/Login.vue";
import MFA from "@/views/auth/MFA.vue";
import ReportListPage from "@/views/list/ReportListPage.vue";
import SavedVideo from "@/views/list/SavedVideo.vue";
import VideoPage from "@/views/list/VideoPage.vue";
import MyPage from "@/views/mypage/MyPage.vue";


const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/landing"
  },
  {
    path: "/landing",
    name: "landing",
    component: Landing
  },
  {
    path: "/landing/signin/",
    name: "SignIn",
    component: Login
  },
  {
    path: "/landing/mfa/",
    name: "mfa",
    component: MFA
  },
  {
    path: "/mainPage/",
    name: "MainPage",
    component: MainPage
  },
  {
    path: "/mainPage/reportListPage",
    name: "reportList",
    component: ReportListPage
  },
  {
    path: "/mainPage/savedVideo",
    name: "savedVideo",
    component: SavedVideo
  },
  {
    path: "/mainPage/savedVideo",
    name: "savedVideo",
    component: SavedVideo
  },
  {
    path: "/mainPage/video",
    name: "videoPage",
    component: VideoPage
  },
  {
    path: "/mainPage/mypage",
    name: "mypage",
    component: MyPage
  },



];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active"
});

export default router;
