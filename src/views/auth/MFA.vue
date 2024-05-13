<script setup>
import { ref, computed} from 'vue';
import { useRouter } from 'vue-router';
import { onBeforeMount, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import querystring from "querystring";
import security from "@/security"

import ArgonButton from "@/components/ArgonButton.vue";
import Swal from 'sweetalert2'

const router = useRouter();

const store = useStore();
const toggleDefaultLayout = () => store.commit("toggleDefaultLayout");

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  toggleDefaultLayout();
});
onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  toggleDefaultLayout();
});

const userId = computed(() => store.state.MFA_id);
const sessionId = computed(() => store.state.session_id);


const verifyCode = ref('')

const onSubmit = async () => {
  if (!verifyCode.value.trim() ) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Enter the 6-digit verification code.',
    });
    return;
  }
  try {
    const response = await axios.post("https://v8test.com/pit/manager/signin/verify/code", {
      data: security.encrypt(querystring.stringify({id: userId.value, code:verifyCode.value, sessionId: sessionId.value})),
    });
    if (response.data.status === "success") {
      console.log(response);
      const access_token = response.data.message.accessToken;
      const refresh_token = response.data.message.refreshToken;
      const pit_manager_id = response.data.message.pitManagerId;
      await store.dispatch('login', {
        accessToken: access_token,
        refreshToken: refresh_token,
        pitManagerId: pit_manager_id
      });
      await store.dispatch('fetchPitManagerInfo');
      await router.push({name: 'MainPage'});
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Code',
        text: '인증실패'
      })
    }
  } catch (error) {
    console.error("Login error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'An error occurred during the login process.',
    });
  }
};

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
                <div class="img-box">
                  <img src="../../assets/PageImage/EnterImage.jpg" alt="image" style="">
                </div>
                <div class="login-box">
                  <div class="text-box">
                    <h5 class="logo">Verification</h5>
                    <h5 class="logo-sub">Pitmanager Monitoring System</h5>
                  </div>
                  <form role="form" class="text-start" @submit.prevent="onSubmit">
                    <div class="row gx-2 gx-sm-3" style="margin-bottom: 1rem">
                      <el-input
                          v-model="verifyCode"
                          style="width: 100%"
                          size="large"
                          maxlength="6"
                          placeholder="6-digit Verification Code"
                          show-word-limit
                          type="text"
                      />
                    </div>
                    <div class="text-center">
                      <argon-button
                          class="mt-0 mb-3"
                          variant="gradient"
                          color="dark"
                          full-width
                      >Send code</argon-button
                      >
                    </div>
                  </form>
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
.login-box{
  width: 35%;
  margin: auto auto;
}
.text-box{
  width: 100%;
  text-align: center;
}
.logo{
  font-size: 50px;
  font-weight: bold;
  color: #222222;
}
.logo-sub{
  font-size: 20px;
  color: #666666;
  margin-bottom: 30px;
}
.info-wrap{
  display: flex;
  justify-content: space-between;
}
.img-box {
  margin: 20px 20px;
  width: 480px;
  height: 600px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  animation: slideIn 1.5s ease-in-out forwards;
}

.img-box img{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

form{
  width: 80%;
  margin: 0 auto;
}
</style>