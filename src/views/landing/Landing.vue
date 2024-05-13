<script setup>
import { onBeforeMount, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import router from "@/router";


const store = useStore();
const toggleDefaultLayout = () => store.commit("toggleDefaultLayout");

const toSignIn = () => router.push({name: 'SignIn'});

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  toggleDefaultLayout();
});
onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  toggleDefaultLayout();
});
</script>
<template>
  <main class="main-content main-content-bg mt-0">
    <div
        class="page-header min-vh-100"
        style="
        background-color: #444444;
      "
    >
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-10 col-md-7 mt-2">
            <div class="card border-0 mb-0">
              <div class="info-wrap">
                <div class="text-box">
                  <div class="text-area">
                    <h5 class="logo">nextstud.io</h5>
                    <h5 class="logo-sub">Pit Manager Monitoring System</h5>
                    <div class="text-center text-muted mb-4">
                      <button class="button-57" role="button" @click="toSignIn"><span class="text">Enter</span><span><i class="fa-solid fa-arrow-right" style="font-size: 25px"></i></span></button>
                    </div>
                  </div>
                </div>
                <div class="img-box">
                  <img src="../../assets/PageImage/EnterImage.jpg" alt="image" style="">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

</template>

<style scoped>
/* Button-CSS */
.button-57 {
  width: 100%;
  position: relative;
  overflow: hidden;
  border: 1px solid #18181a;
  border-radius: 20px;
  color: #18181a;
  display: inline-block;
  font-size: 15px;
  line-height: 15px;
  padding: 18px 18px 17px;
  text-decoration: none;
  cursor: pointer;
  background: #fff;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-57 span:first-child {
  position: relative;
  transition: color 600ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 10;
}

.button-57 span:last-child {
  color: white;
  display: block;
  position: absolute;
  bottom: 0;
  transition: all 500ms cubic-bezier(0.48, 0, 0.12, 1);
  z-index: 100;
  opacity: 0;
  top: 55%;
  left: 50%;
  transform: translateY(225%) translateX(-90%);
  height: 14px;
  line-height: 13px;
}

.button-57:after {
  content: "";
  position: absolute;
  bottom: -50%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #444444;
  transform-origin: bottom center;
  transition: transform 600ms cubic-bezier(0.48, 0, 0.12, 1);
  transform: skewY(9.3deg) scaleY(0);
  z-index: 50;
}

.button-57:hover:after {
  transform-origin: bottom center;
  transform: skewY(9.3deg) scaleY(2);
}

.button-57:hover span:last-child {
  transform: translateX(-50%) translateY(-100%);
  opacity: 1;
  transition: all 900ms cubic-bezier(0.48, 0, 0.12, 1);
}
.text-box{
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}
.logo{
  margin-left: 10px;
  font-size: 50px;
  font-weight: bold;
  color: #222222;
}
.logo-sub{
  margin-left: 10px;
  font-size: 20px;
  color: #666666;
  margin-bottom: 45px;
}
.info-wrap{
  display: flex;
  justify-content: space-between;
}
.img-box{
  margin: 20px 20px;
  width: 480px;
  height: 600px;
  border-radius: 20px;
  overflow: hidden;
}
.img-box img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>