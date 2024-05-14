import { createRouter, createWebHistory } from "vue-router";
import MainPage from "@/views/MainPage/MainPage.vue";
import Landing from "@/views/landing/Landing.vue";
import Login from "@/views/auth/Login.vue";
import MFA from "@/views/auth/MFA.vue";
import ReportListPage from "@/views/list/ReportListPage.vue";
import SavedVideo from "@/views/list/SavedVideo.vue";
import VideoPage from "@/views/list/VideoPage.vue";
import MyPage from "@/views/mypage/MyPage.vue";
import {computed} from "vue";


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
    component: MainPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/mainPage/reportListPage",
    name: "reportList",
    component: ReportListPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/mainPage/savedVideo",
    name: "savedVideo",
    component: SavedVideo,
    meta: { requiresAuth: true }
  },
  {
    path: "/mainPage/video",
    name: "videoPage",
    component: VideoPage,
    meta: { requiresAuth: true }
  },
  {
    path: "/mainPage/mypage",
    name: "mypage",
    component: MyPage,
    meta: { requiresAuth: true }
  },



];

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: "active"
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const accessToken = store.getters.getAccessToken;
    if (!accessToken) {
      next({ name: 'SignIn' });
    } else {
      next();
    }
  } else {
    next();
  }
});


export default router;
