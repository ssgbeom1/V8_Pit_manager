<script setup>
import { ref, onMounted, onBeforeMount, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { DataTable } from 'simple-datatables';

import router from '@/router';

const selectedUsers = ref([]);
const maxSelections = 4;
let dataTable = null;

const getData = async () => {
  const response = await fetch('https://dummyjson.com/users');
  const { users } = await response.json();
  return users;
};

const updateCheckboxState = () => {
  if (dataTable && dataTable.body) {
    const checkboxes = dataTable.body.querySelectorAll('input[type=checkbox]');
    checkboxes.forEach(checkbox => {
      const userId = parseInt(checkbox.dataset.id, 10);
      checkbox.disabled = selectedUsers.value.length >= maxSelections && !selectedUsers.value.includes(userId);
    });
  }
};

const initializeDataTable = async () => {
  const users = await getData();
  if (users.length > 0) {
    dataTable = new DataTable('#datatable-basic', {
      searchable: true,
      fixedHeight: false,
      data: {
        headings: ['Select', 'First Name', 'Last Name', 'Age', 'Gender', 'Birth Date', 'Blood Group'],
        data: users.map(user => [
          `<input type='checkbox' data-id='${user.id}' />`,
          user.firstName, user.lastName, user.age.toString(), user.gender, user.birthDate, user.bloodGroup
        ])
      }
    });

    dataTable.on('datatable.init', updateCheckboxState);
    dataTable.on('datatable.page', updateCheckboxState);
    dataTable.on('datatable.update', updateCheckboxState);

    dataTable.body.addEventListener('change', e => {
      if (e.target.type === 'checkbox') {
        const userId = parseInt(e.target.dataset.id, 10);

        if (e.target.checked && selectedUsers.value.length < maxSelections) {
          selectedUsers.value.push(userId);
        } else {
          selectedUsers.value = selectedUsers.value.filter(u => u !== userId);
        }
        console.log('Selected users:', selectedUsers.value);
        updateCheckboxState();
      }
    });
  }
};

onMounted(() => {
  initializeDataTable();
});

onBeforeUnmount(() => {
  if (dataTable) {
    dataTable.destroy();
    dataTable = null;
  }
});

const store = useStore();

const toLiveMonitoringPage = () => router.push({ name: 'VideoPage' });
const toReportListPage = () => router.push({ name: 'ReportListPage' });
const toSavedVideoPage = () => router.push({ name: 'SavedVideo' });
const toggleDefaultLayout = () => store.commit('toggleDefaultLayout');

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
    <div class="page-header min-vh-100" style="background-color: #444444;">
      <span class="mask bg-gradient-dark opacity-6"></span>
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-12 col-md-7 mt-2">
            <div class="border-0 mb-0">
              <div class="menu-wrap">
                <div class="menu-box" @click="toReportListPage">
                  <div class="menu-flip">
                    <div class="menu-front">
                      <img src="../../assets/MainPage/img1.jpg" alt="LiveMonitoring">
                      <div class="text text-background">Report-List</div>
                    </div>
                    <div class="menu-back">
                      <div class="text enter-text">ENTER</div>
                      <i class="fa-solid fa-arrow-right" style="font-size: 25px; transition-delay: 0.5s;"></i>
                    </div>
                  </div>
                </div>
                <div class="menu-box" data-bs-toggle="modal" data-bs-target="#LMtable">
                  <div class="menu-flip">
                    <div class="menu-front">
                      <img src="../../assets/MainPage/monitoring.jpeg" alt="LiveMonitoring">
                      <div class="text text-background">Live-Monitoring</div>
                    </div>
                    <div class="menu-back">
                      <div class="text enter-text">ENTER</div>
                      <i class="fa-solid fa-arrow-right" style="font-size: 25px; transition-delay: 0.5s;"></i>
                    </div>
                  </div>
                </div>
                <div class="menu-box" @click="toSavedVideoPage">
                  <div class="menu-flip">
                    <div class="menu-front">
                      <img src="../../assets/MainPage/img2.jpg" alt="LiveMonitoring">
                      <div class="text text-background">Saved-Video</div>
                    </div>
                    <div class="menu-back">
                      <div class="text enter-text">ENTER</div>
                      <i class="fa-solid fa-arrow-right" style="font-size: 25px; transition-delay: 0.5s;"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div id="LMtable" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <div class="mt-4 row">
            <div class="col-12">
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Live Monitoring Video Select</h5>
                </div>
                <div class="table-responsive">
                  <table id="datatable-basic" class="table table-flush">
                    <thead class="thead-light">
                    <tr>
                    </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn bg-gradient-secondary btn-sm" data-bs-dismiss="modal">
            Close
          </button>
          <button data-bs-dismiss="modal" type="button" class="btn bg-gradient-success btn-sm" @click="toLiveMonitoringPage">
            Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-wrap {
  animation: fadeIn 1.8s ease-in-out forwards;
}
.menu-wrap{
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
.menu-box {
  width: 370px;
  height: 530px;
  margin-top: 10px;
  background-color: #222222;
  border-radius: 20px;
  perspective: 1000px;
  overflow: hidden;
}

.menu-flip {
  width: 100%;
  height: 100%;
  position: relative;
  text-align: center;
  transition: transform 0.9s;
  transform-style: preserve-3d;
}

.menu-front, .menu-back {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-front img {
  width: auto;
  height: 100%;
  min-width: 100%;
  position: absolute;
  filter: grayscale(100%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  object-fit: cover;
}

.text {
  z-index: 2;
  color: white;
  position: relative;
  font-weight: bold;
  font-size: 30px;
}
.text-background{
  z-index: 2;
  color: white;
  position: relative;
  top: 30%;
  font-weight: bold;
  font-size: 30px;
}

.menu-back {
  background-color: #444444;
  transform: rotateY(180deg);
}

.menu-box:hover .menu-flip {
  transform: rotateY(180deg);
}

.fa-arrow-right{
  color: white;
  font-weight: bold;
}
.text-background {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 5px 10px;
}

.menu-back .enter-text {
  opacity: 0;
  transition: opacity 1s ease 0.9s;
}

.menu-box:hover .menu-back .enter-text,
.menu-box:hover .menu-back .fa-arrow-right {
  opacity: 1;
}


.fa-arrow-right {
  position: absolute;
  left: 10%;
  transition: left 0.8s ease 0.9s, opacity 0.5s ease 0.9s;
}

.menu-box:hover .fa-arrow-right {
  left: 65%;
}

</style>