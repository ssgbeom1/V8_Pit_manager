<script setup>
import {ref, onBeforeMount, onBeforeUnmount, computed} from 'vue';
import { useStore } from 'vuex';
import axios from "axios";
import security from "@/security";
import querystring from "querystring";

import Swal from "sweetalert2";
import Navbar from '@/examples/PageLayout/Navbar.vue';
const store = useStore();
const pitManagerInfo = computed(() => store.state.pitManagerInfo);

const mfaDisplayValue = computed(() => {
  return pitManagerInfo.value.is_mfa ? 'Activated' : 'Disabled';
});


// Password Edit ======================================================================================================>
const CurrentPassword = ref('');
const ChangePassword = ref('');
const ChangePasswordConfirm = ref('');
const accessToken = computed(() => store.state.accessToken);
const pitManagerId = computed(() => store.state.pitManagerId);

const clearPasswordChange = () =>{
  CurrentPassword.value = '';
  ChangePassword.value = '';
  ChangePasswordConfirm.value = '';
}

const changePassword = async () => {
  if (!CurrentPassword.value.trim() || !ChangePassword.value.trim() || !ChangePasswordConfirm.value.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'All fields are not entered.',
    });
    return;
  }
  if (CurrentPassword.value === ChangePasswordConfirm.value) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'The existing password and the password to be changed are the same.',
    });
    return;
  }
  if (ChangePassword.value !== ChangePasswordConfirm.value){
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'The password you want to change is different.',
    });
    return;
  }
  try {
    const response = await axios.put("https://v8test.com/pit/manager/password", {
      data: security.encrypt(querystring.stringify(
          {
            accessToken: accessToken.value,
            pitManagerId : pitManagerId.value,
            previousPassword: CurrentPassword.value,
            proposedPassword: ChangePassword.value
          })),
    });

    if (response.data.status === "success") {
      console.log(response);
      Swal.fire({
        title: "Password change successful",
        icon: "success",
      });
      clearPasswordChange();

    } else {
      Swal.fire({
        icon: 'error',
        title: 'Password change failed',
        text: 'The account information is not vaild'
      })
      clearPasswordChange();
      return;
    }
  } catch
      (error) {
    console.error("Login error:", error);
    clearPasswordChange();
  }
};

// Name Edit ==========================================================================================================>
const changeName = ref(store.state.pitManagerInfo.name)
const staticName = ref(store.state.pitManagerInfo.name)
const nameChange = async () => {
  try {
    const data ={
      accessToken: accessToken.value,
      pitManagerId : pitManagerId.value,
      name : changeName.value,
      email : pitManagerInfo.value.email,
      isMFA : mfa.value,
      studioId:1
    }
    const response = await axios.put("https://v8test.com/pit/manager", {
      data: security.encrypt(querystring.stringify(data)),
    });
    console.log(data)

    if (response.data.status === "success") {
      console.log(response);
      Swal.fire({
        title: "Username change successful",
        icon: "success",
      })
      await store.dispatch('fetchPitManagerInfo');
    } else {
      console.log(response)
      Swal.fire({
        icon: 'error',
        title: 'Information change failed',
        text: 'failed'
      })
    }
  } catch
      (error) {
    console.error("Login error:", error);
  }
};

// email Edit =========================================================================================================>
const changeEmail = ref('')
const emailChange = async () => {
  try {
    const data ={
      accessToken: accessToken.value,
      pitManagerId : pitManagerId.value,
      name : staticName.value,
      email : changeEmail.value,
      isMFA : mfa.value,
      studioId:1
    }
    const response = await axios.put("https://v8test.com/pit/manager", {
      data: security.encrypt(querystring.stringify(data)),
    });
    console.log(data)

    if (response.data.status === "success") {
      console.log(response);
      Swal.fire({
        title: "User email change successful",
        icon: "success",
      })
      await store.dispatch('fetchPitManagerInfo');
    } else {
      console.log(response)
      Swal.fire({
        icon: 'error',
        title: 'Information change failed',
        text: 'failed'
      })
    }
  } catch
      (error) {
    console.error("Login error:", error);
  }
};

// MFA Edit ===========================================================================================================>
const mfa = ref(pitManagerInfo.value.is_mfa)
const is_mfa = ref(false);
if (pitManagerInfo.value.is_mfa === true) {
  is_mfa.value = true;
} else {
  is_mfa.value = false;
}
const MFAChange = async () => {
  try {
    const data ={
      accessToken: accessToken.value,
      pitManagerId : pitManagerId.value,
      name : changeName.value,
      email : pitManagerInfo.value.email,
      isMFA : is_mfa.value,
      studioId:1
    }
    const response = await axios.put("https://v8test.com/pit/manager", {
      data: security.encrypt(querystring.stringify(data)),
    });
    console.log(data)

    if (response.data.status === "success") {
      console.log(response);
      Swal.fire({
        title: "User MFA change successful",
        icon: "success",
      })
      await store.dispatch('fetchPitManagerInfo');
    } else {
      console.log(response)
      Swal.fire({
        icon: 'error',
        title: 'Information change failed',
        text: 'failed'
      })
    }
  } catch
      (error) {
    console.error("Login error:", error);
  }
};

// phone Edit =========================================================================================================>
const changePhoneNum = ref('+8210')
const verifyCode = ref('')

const clearPhone = () => {
  changePhoneNum.value = '+8210';
  verifyCode.value = '';
  store.dispatch('fetchPitManagerInfo');
}
const changePhone = async () => {
  try {
    const data ={
      accessToken: accessToken.value,
      pitManagerId : pitManagerId.value,
      phone : changePhoneNum.value
    }
    const response = await axios.put("https://v8test.com/pit/manager/phone", {
      data: security.encrypt(querystring.stringify(data)),
    });
    console.log(data)

    if (response.data.status === "success") {
      console.log(response);
      Swal.fire({
        title: "6-digit verification code sent",
        icon: "success",
      })
    } else {
      console.log(response)
      Swal.fire({
        icon: 'error',
        title: 'Information change failed',
        text: 'failed'
      })
    }
  } catch
      (error) {
    console.error("Login error:", error);
  }
};
const changePhoneVerify = async () => {
  if (!verifyCode.value.trim()) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Verification code has not been entered.',
    });
    return;
  }
  if (verifyCode.value.length !== 6) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'The verification code was not entered correctly. Please enter the 6-digit verification code.',
    });
    return;
  }
  try {
    const data ={
      accessToken: accessToken.value,
      pitManagerId : pitManagerId.value,
      code : verifyCode.value
    }
    const response = await axios.put("https://v8test.com/pit/manager/phone/verify", {
      data: security.encrypt(querystring.stringify(data)),
    });
    console.log(data)

    if (response.data.status === "success") {
      console.log(response);
      Swal.fire({
        title: "phone number change successful",
        icon: "success",
      });
      clearPhone();
    } else {
      console.log(response)
      Swal.fire({
        icon: 'error',
        title: 'Information change failed',
        text: 'failed'
      })
      clearPhone();
    }
  } catch
      (error) {
    console.error("Login error:", error);
    clearPhone();
  }
};

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  toggleDefaultLayout();
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  toggleDefaultLayout();
});

const toggleDefaultLayout = () => store.commit('toggleDefaultLayout');
</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar
            is-blur="blur border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
            btn-background="bg-gradient-success"
            :dark-mode="true"
        />
      </div>
    </div>
  </div>
  <main class="main-content main-content-bg mt-0">
    <div class="page-header min-vh-100" style="background-color: #444444;">
      <span class="mask bg-gradient-dark opacity-6"></span>

        <div class="container-fluid py-4">
          <div class="row">
            <div class="col-8 mx-auto">
              <div class="card my-5">
                <div class="my-page-wrap">
                  <div class="user-area">
                    <div class="card user-card">
                      <div class="logoImgBox">
                        <img class="mainLogo" :src=pitManagerInfo.image_url>
                      </div>
                      <div class="user-text-area">
                        <div class="userText">
                          Welcome!
                        </div>
                        <div class="dealer-name">
                          {{pitManagerInfo.name}}
                        </div>
                      </div>
                      <div class="card dealer-card">
                        <div style="font-size: 1.3rem; color: #222222">PitManager Info</div>
                        <div>Win : 39Games</div>
                        <div>Loss : 39Games</div>
                        <div>Status : {{pitManagerInfo.type}}</div>
                        <div>Withdraw : 333,000,000 $ </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-body pt-0 edit-area">
                    <div class="infoBox">
                      <div class="inputInfoText">
                        ID
                      </div>
                      <el-input v-model="pitManagerInfo.id" style="width: 60%" size="large" disabled />
                    </div>
                    <div class="infoBox">
                      <div class="inputInfoText">
                        Password
                      </div>
                      <el-input v-model="pitManagerInfo.id"  type="password" style="width: 60%" size="large" disabled />
                      <el-button size="large" type="info" style="margin-left: 5px" data-bs-toggle="modal" data-bs-target="#passwordModal">Update</el-button>
                    </div>
                    <div class="infoBox">
                      <div class="inputInfoText">
                        Name
                      </div>
                      <el-input v-model="pitManagerInfo.name" style="width: 60%" size="large" disabled />
                      <el-button size="large" type="info" style="margin-left: 5px" data-bs-toggle="modal" data-bs-target="#nameModal">Update</el-button>
                    </div>
                    <div class="infoBox">
                      <div class="inputInfoText">
                        E-mail
                      </div>
                      <el-input v-model="pitManagerInfo.email" style="width: 60%" size="large" disabled />
                      <el-button size="large" type="info" style="margin-left: 5px" data-bs-toggle="modal" data-bs-target="#emailModal">Update</el-button>
                    </div>
                    <div class="infoBox">
                      <div class="inputInfoText">
                        Phone Number
                      </div>
                      <el-input v-model="pitManagerInfo.phone" style="width: 60%" size="large" disabled />
                      <el-button size="large" type="info" style="margin-left: 5px" data-bs-toggle="modal" data-bs-target="#phoneModal">Update</el-button>
                    </div>
                    <div class="lastBox">
                      <div class="inputInfoText">
                        MFA
                      </div>
                      <div class="span-box">
                        <el-input v-model="mfaDisplayValue" style="width: 60%" size="large" disabled />
                        <el-button size="large" type="info" style="margin-left: 5px" data-bs-toggle="modal" data-bs-target="#MFAModal">Update</el-button>
                      </div>
                    </div>
                    <div class="text-center pt-1" >

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </main>

  <!-- passwordChange MODAL ( Column : ETC ) -->
  <div id="passwordModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Password Change</h2>
            </div>
            <div class="card-body ">
              <form role="form" class="text-start">
                <div>
                  <div class="inputInfoText">CurrentPassword</div>
                  <el-input v-model="CurrentPassword" type="password" style="width: 100%" size="large"
                            placeholder="CurrentPassword"/>
                </div>
                <div style="margin: 15px 0">
                  <div class="inputInfoText">ChangePassword</div>
                  <el-input v-model="ChangePassword" type="password" style="width: 100%" size="large"
                            placeholder="ChangePassword"/>
                </div>
                <div>
                  <div class="inputInfoText">ChangePasswordConfirm</div>
                  <el-input v-model="ChangePasswordConfirm" type="password" style="width: 100%" size="large"
                            placeholder="ChangePasswordConfirm"/>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer"
               style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal" @click="clearPasswordChange">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px 5px">
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="changePassword"
                    data-bs-dismiss="modal">
              <span class="text">Confirm</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- NameChange MODAL ( Column : ETC ) -->
  <div id="nameModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">User Name Change</h2>
            </div>
            <div class="card-body ">
              <form role="form" class="text-start">
                <div>
                  <div class="inputInfoText">Change Name</div>
                  <el-input v-model="changeName" type="text" style="width: 100%" size="large"
                            placeholder="Change Name"/>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer"
               style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px 5px">
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="nameChange"
                    data-bs-dismiss="modal">
              <span class="text">Confirm</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- EamilChange MODAL ( Column : ETC ) -->
  <div id="emailModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">User Email Change</h2>
            </div>
            <div class="card-body ">
              <form role="form" class="text-start">
                <div>
                  <div class="inputInfoText">Change Email</div>
                  <el-input v-model="changeEmail" type="text" style="width: 100%" size="large"
                            placeholder="Change Email"/>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer"
               style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px 5px">
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="emailChange"
                    data-bs-dismiss="modal">
              <span class="text">Confirm</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MFAChange MODAL ( Column : ETC ) -->
  <div id="MFAModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">User MFA Change</h2>
            </div>
            <div class="card-body">
              <form role="form" class="text-start">
                <div style="display: flex; justify-content: center">
                  <el-switch
                      v-model="is_mfa"
                      size="large"
                      active-text="MFA Enable"
                      inactive-text="MFA Disable"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer"
               style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px 5px">
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="MFAChange"
                    data-bs-dismiss="modal">
              <span class="text">Confirm</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Phone Change MODAL ( Column : ETC ) -->
  <div id="phoneModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">User phone change</h2>
            </div>
            <div class="card-body ">
              <div class="inputInfoText">Change Phone Number</div>
              <div style="display: flex">
                <el-tooltip :content="'Input format : +8210********'" placement="top">
                  <el-input v-model="changePhoneNum" type="text" style="width: 70%" size="large"
                            placeholder="Change Name"/>
                </el-tooltip>
                <el-button size="large" type="info" style="margin-left: 5px" @click="changePhone">verification code
                </el-button>
              </div>

              <div style="margin-top: 1rem">
                <div class="inputInfoText">Verification Code</div>
                <el-input v-model="verifyCode" type="text" style="width: 100%" maxlength="6" show-word-limit size="large"
                          placeholder="Verification Code Here (6-digit)"/>
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer"
               style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal" @click="clearPhone();">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px 5px">
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="changePhoneVerify"
                    data-bs-dismiss="modal">
              <span class="text">Confirm</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>



</template>

<style scoped>
.user-area{
  background-color: #777777;
  width: 30%;
  border-top-left-radius: 0.9rem;
  border-bottom-left-radius: 0.9rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.user-card{
  width: 90%;
  height: 90%;
}
.dealer-card{
  width: 90%;
  background-color: lightgray;
  padding: 0 20px;
  margin: 10px auto;
  color: #777777;
  font-size: 1rem;
  font-weight: bold;
}
.dealer-card div{
  margin: 5px 0;
  font-size: 1rem;
}
.user-text-area{
  display: flex;
  justify-content: center;
  align-items: center;
}
.userText{
  color: #222222;
  font-size: 1.1rem;
  margin-right: 10px;
}
.dealer-name{
  color: #222222;
  font-size: 1.2rem;
  font-weight: bold;
}
.my-page-wrap{
  display: flex;
  justify-content: center;
}
.logoImgBox {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10rem;
  height: 10rem;
  border-radius: 50%;
  overflow: hidden;
  margin: 20px auto;
  border: 3px solid #444444;
}
.infoBox{
  margin: 20px 0;
}
.edit-area{
  margin-left: 3rem;
}
.mainLogo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


argon-button {
  margin: 0 0;
}
.inputInfoText{
  font-size: 13px;
  font-weight: bold;
}

/*Modal*/
.btn {
  padding: 8px 20px;
  height: auto;
  width: auto;
  margin: 0;
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
  font-weight: bold;
  line-height: 1em;
  margin: 0;
  opacity: 1;
  outline: 0;
  padding: 1rem 1rem;
  border-radius: 10px ;

}

.gray-btn:hover{
  color: white;
  background-color: #777777;
  transition-duration: .5s;
}

.red-btn {
  color:crimson;
  background-color: white;
}

.red-btn:hover {
  color: #FFFFFF;
  background-color: crimson;
}

.blue-btn {
  color: #1E90FF;
  background-color: #FFFFFF;
}

.blue-btn:hover {
  color: #FFFFFF;
  background-color: #1E90FF;
}

.green-btn {
  color: #64CD3C;
  background-color: #FFFFFF;
}

.green-btn:hover {
  color: #FFFFFF;
  background-color: #64CD3C;
}

</style>