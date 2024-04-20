<script setup>
import { computed, ref, onBeforeUpdate } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const showMenu = ref(false);
const store = useStore();


const route = useRoute();



const navbarMinimize = () => store.commit("navbarMinimize");


const toggleNavigationOnMobile = () => {
  if (window.innerWidth < 1200) {
    navbarMinimize();
  }
};

onBeforeUpdate(() => {
  toggleNavigationOnMobile();
});
</script>
<template>
      <div id="navbar" class="mt-2 collapse navbar-collapse mt-sm-0 me-md-0 me-sm-4">
      </div>
</template>
