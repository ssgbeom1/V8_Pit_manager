import { createStore } from "vuex";
import bootstrap from "bootstrap/dist/js/bootstrap.min.js";
import axios from "axios";
import querystring from "querystring";
import security from '../../security'
import createPersistedState from "vuex-persistedstate"

export default createStore({
  plugins: [createPersistedState()],
  state: {
    hideConfigButton: false,
    isPinned: true,
    showConfig: false,
    isRTL: false,
    color: "",
    sidebarType: "bg-white",
    darkMode: false,
    isNavFixed: false,
    isAbsolute: false,
    showNavs: true,
    showSidenav: true,
    showNavbar: true,
    showFooter: true,
    showMain: true,
    layout: "default",
    bootstrap,

    MFA_id:'',
    session_id:'',

    isLoggedIn: false,
    accessToken: '',
    refreshToken: '',
    pitManagerId: null,
    pitManagerInfo: {},
  },
  mutations: {
    toggleConfigurator(state) {
      state.showConfig = !state.showConfig;
    },
    navbarMinimize(state) {
      const sidenav_show = document.querySelector(".g-sidenav-show");
      if (sidenav_show.classList.contains("g-sidenav-hidden")) {
        sidenav_show.classList.remove("g-sidenav-hidden");
        sidenav_show.classList.add("g-sidenav-pinned");
        state.isPinned = true;
      } else if (sidenav_show.classList.contains("g-sidenav-pinned")) {
        sidenav_show.classList.add("g-sidenav-hidden");
        sidenav_show.classList.remove("g-sidenav-pinned");
        state.isPinned = false;
      } else if (window.innerWidth < 1200) {
        sidenav_show.classList.add("g-sidenav-pinned");
        state.isPinned = true;
      } else {
        sidenav_show.classList.add("g-sidenav-hidden");
      }
    },
    setSidebarType(state, payload) {
      state.sidebarType = payload;
    },
    navbarFixed(state) {
      if (state.isNavFixed === false) {
        state.isNavFixed = true;
      } else {
        state.isNavFixed = false;
      }
    },
    toggleDefaultLayout(state) {
      state.showNavbar = !state.showNavbar;
      state.showSidenav = !state.showSidenav;
      state.showFooter = !state.showFooter;
    },
    setUserSession(state, {MFA_id, session_id}){
      state.MFA_id = MFA_id;
      state.session_id = session_id
    },
    setAuthState(state, { accessToken, refreshToken, pitManagerId }) {
      state.isLoggedIn = true;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.pitManagerId = pitManagerId;
    },
    setPitManagerInfo(state, info) {
      state.pitManagerInfo = info;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.accessToken = '';
      state.refreshToken = '';
      state.pitManagerId = null;
      state.pitManagerInfo = {};
    }
  },
  actions: {
    toggleSidebarColor({ commit }, payload) {
      commit("setSidebarType", payload);
    },

    async login({ commit, dispatch }, authData) {
      commit('setAuthState', authData);
      try {
        await dispatch('fetchPitManagerInfo');
      } catch (error) {
        console.error("Error fetching pit manager info during login:", error);
      }
    },
    fetchPitManagerInfo({ commit, state }) {
      axios.post("https://v8test.com/pit/manager/info", {
        data: security.encrypt(querystring.stringify({ pitManagerId: state.pitManagerId })),
      })
          .then(response => {
            if (response.data.status === "success") {
              console.log('INFO:', response.data)
              commit('setPitManagerInfo', response.data.message.Info);
            } else {
              console.error("Fetching pit manager info failed with response:", response.data);
            }
          })
          .catch(error => console.error("Fetching pit manager info failed:", error));
    },
    logout({ commit }) {
      commit('logout');
      localStorage.removeItem('vuex');
    },

  },
  getters: {
    getAccessToken: state => state.accessToken
  },
});
