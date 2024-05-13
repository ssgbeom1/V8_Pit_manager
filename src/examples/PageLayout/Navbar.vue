<script setup>
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import {computed} from "vue";

const store = useStore();
const router = useRouter();
const pitManagerInfo = computed(() => store.state.pitManagerInfo);

const logout = () => {
  console.log(pitManagerInfo.value)
  store.dispatch('logout');
  console.log(pitManagerInfo.value)
  router.push({ name: 'SignIn' });
}

defineProps({
  btnBackground: {
    type: String,
    default: "",
  },
  isBlur: {
    type: String,
    default: "",
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <!-- Navbar -->
  <nav class="navbar navbar-expand-lg top-0 z-index-3 position-absolute mt-4" :class="isBlur ? isBlur : 'shadow-none my-2 navbar-transparent w-100'">
    <div class="container ps-2 pe-0">
      <router-link class="navbar-brand font-weight-bolder ms-lg-0 ms-3" :class="darkMode ? 'text-black' : 'text-white'" to="/mainPage">
        Pit-Manager Monitoring System
      </router-link>
    </div>
    <div class="dropdown">
        <div class="img-box dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <img class="user-img" :src=pitManagerInfo.image_url >
        </div>
      <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <li>
          <div class="info-text-area">
            <div class="main-text">
              welcome!
            </div>
            <div class="user-name">
              {{pitManagerInfo.name}}
            </div>
          </div>
        </li>
        <li><hr class="dropdown-divider divider2"></li>
        <li>
          <router-link :to="{name: 'mypage'}" class="dropdown-item">My Page</router-link>
        </li>
        <li>
          <button class="gray-btn" @click="logout">
            Logout
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>


<style scoped>
.dropdown-toggle::after, .dropdown-toggle::before {
  display: none;
}
.dropdown-menu{
  padding-bottom: 0;
}
.img-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #444444;
}
.user-img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-text-area{
  display: flex;
  padding: 0.3rem 1rem;
  align-items: center;
}
.main-text{
  margin-right: 0.5rem;
}
.user-name{
  font-weight: bold;
}

.divider2{

}
.gray-btn {
  width: 100%;
  height: 100%;
  background-color: #FFFFFF;
  border-width: 0;
  box-sizing: border-box;
  color: #777777;
  cursor: pointer;
  display: inline-block;
  font-size: 20px;
  margin: 0;
  opacity: 1;
  outline: 0;
  padding: 0.2rem 1rem;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  border-top: 1px solid #777777;
  margin-top: 10px;
}

.gray-btn:hover{
  color: white;
  background-color: #777777;
  transition-duration: .5s;
}
</style>