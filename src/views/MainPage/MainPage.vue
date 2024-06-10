<script setup>
import {ref, onBeforeMount, onBeforeUnmount, watch, onMounted,computed} from 'vue';
import { useStore } from 'vuex';
import axios from "axios";
import security from "@/security";
import querystring from "querystring";
import router from '@/router';
import {ElTable, ElTableColumn, ElButton, ElPagination, ElSelect, ElOption} from 'element-plus';
import { format, parseISO } from 'date-fns';
import Swal from "sweetalert2";
import Navbar from '@/examples/PageLayout/Navbar.vue';


const store = useStore();

//최대 4명 선택
const selectedVideoId = ref([]);
const maxSelections = 4;

//Pagination
const totalPages = ref(0);
const tableData = ref([]);
const total = ref(0);

const perPageOptions = [5, 10, 20, 30];


//API Requirement
const Page = ref(1);
const length = ref(10);
const searchOption =ref('')
const search =ref('')
const pitManagerId = computed(() => store.state.pitManagerInfo.pit_managers_id);
// const pitManagerId = ref(12)

//테이블 불러오기
const fetchData = async () => {
  try {
    const data = {
      page: Page.value,
      length: length.value,
      searchoption: searchOption.value,
      search: search.value,
      pitManagerId: pitManagerId.value
    }
    const response = await axios.post("https://v8test.com/pit/manager/game/live/monitoring/select/list", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      totalPages.value = Math.ceil(response.data.message.RecordTotalCount / parseInt(length.value));
      total.value = response.data.message.RecordTotalCount;
      tableData.value = response.data.message.Info;
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

//선택한 VideoID를 통해 API 요청
const sendVideoInfo = async () => {
  console.log(Array.isArray(selectedVideoId.value))
  if(selectedVideoId.value.length === 0){
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please select at least one video.',
    });
    return;
  }
  try {
    const data = {
      pitManagerId: pitManagerId.value,
      gameLiveIds: JSON.stringify(selectedVideoId.value) //JSON.stringify를 사용해서 보내야 배열 형태 그대로 전달 가능
    }
    const response = await axios.post("https://v8test.com/pit/manager/game/live/monitoring", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      resetSelectedUsers()
      router.push({ name: 'videoPage' });
    } else {
      console.error('Response error', response.data.message);
      resetSelectedUsers()
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    resetSelectedUsers()
  }
}


watch(length, () => {
  fetchData();
});

//Table에서 클릭 상태에 따른 Row 데이터 저장
const toggleSelection = (row) => {
  const index = selectedVideoId.value.findIndex(u => u === row.game_real_time_lives_id);
  if (index === -1 && selectedVideoId.value.length < maxSelections) {
    selectedVideoId.value.push(row.game_real_time_lives_id);
  } else if (index !== -1) {
    selectedVideoId.value.splice(index, 1);
  }
};

// 클릭한 버튼의 row id 가져오기
const isRowSelected = (row) => {
  return selectedVideoId.value.includes(row.game_real_time_lives_id);
};

//4개까지 선택되면 선택한 버튼 제외 나머지 버튼 disabled
const isDisabled = (row) => {
  return !isRowSelected(row) && selectedVideoId.value.length >= maxSelections;
};

// 페이지 업데이트
const handlePageChange = (newPage) => {
  Page.value = newPage;
  fetchData();
};

//API 요청 또는 모달을 닫을 때 배열 초기화
const resetSelectedUsers = () => {
  selectedVideoId.value = [];
};

//데이터 테이블 date format 변경
const formatDate = (dateStr) => {
  return format(parseISO(dateStr), 'yyyy-MM-dd HH:mm:ss');
};

//resizeObserver 오류 해결 코드
const resizeObserver = ref(null);

onMounted(() => {
  const observedElement = document.querySelector('#LMtable');
  resizeObserver.value = new ResizeObserver(() => {
  });
  resizeObserver.value.observe(observedElement);
});

onBeforeMount(() => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
  store.state.hideConfigButton = true;
  toggleDefaultLayout();
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  toggleDefaultLayout();
});

const toReportListPage = () => router.push({ name: 'reportList' });
const toSavedVideoPage = () => router.push({ name: 'savedVideo' });
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
                <div class="menu-box" data-bs-toggle="modal" data-bs-target="#LMtable" @click="fetchData">
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

  <div id="LMtable" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl-custom  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Live Monitoring Video Select</h2>
            </div>
            <div class="search-box row-12">
              <div class="search-area col-11">
                <div class="row-12 search-wrap">
                  <div class="option-search inner-box col-12">
                    <div class="input-name">
                      Option Search
                    </div>
                    <div>
                      <el-input
                          v-model="search"
                          style="max-width: 500px"
                          placeholder="Select Option Text"
                          class="input-with-select"
                          size="large"
                      >
                        <template #prepend>
                          <el-select v-model="searchOption" placeholder="Search Option" size="large" style="width: 150px">
                            <el-option label="1" value="" />
                            <el-option label="2." value="" />
                            <el-option label="3" value="" />
                          </el-select>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </div>
              <button class="btn btn-primary col-1" @click="fetchData">Search</button>
            </div>
            <div class="data-table-body">
              <div class="table-area">
                <div class="table-header">
                  <div class="dropdownMenu">
                    <el-select v-model="length" size="large" placeholder="Select rows per page" @change="fetchData">
                      <el-option
                          v-for="item in perPageOptions"
                          :key="item"
                          :label="item"
                          :value="item">
                      </el-option>
                    </el-select>
                  </div>
                </div>

                <el-table id="videoSelectTable" :data="tableData" style="width: 100%">
                  <el-table-column prop="game_name" label="GameName"></el-table-column>
                  <el-table-column prop="dealer_name" label="Dealer"></el-table-column>
                  <el-table-column prop="game_tables_id" label="Game Table"></el-table-column>
                  <el-table-column label="Game Start Time">
                    <template v-slot="{ row }">
                      {{formatDate(row.reg_datetime)}}
                    </template>
                  </el-table-column>
                  <el-table-column label="Win/Loss Rate">
                    <template v-slot="{ row }">
                      {{row.win_rate}}/{{row.loss_rate}}
                    </template>
                  </el-table-column>
                  <el-table-column prop="player_count" label="Player"></el-table-column>
                  <el-table-column prop="monitoring_count" label="Current Monitoring"></el-table-column>
                  <el-table-column prop="margin_coin_percent" label="Margin"></el-table-column>
                  <el-table-column
                      label="Actions"
                      width="180">
                    <template #default="{ row }">
                      <el-button
                          small
                          background
                          :type="isRowSelected(row) ? 'success' : 'danger'"
                          :disabled="isDisabled(row)"
                          style="width: 80px"
                          @click.stop="toggleSelection(row)">
                        {{ isRowSelected(row) ? 'Selected' : 'Select' }}
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
                <el-pagination
                    layout="prev, pager, next"
                    v-model="Page"
                    :page-count="totalPages"
                    :per-page="length"
                    @current-change="handlePageChange"
                ></el-pagination>
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal" @click="resetSelectedUsers">
              <span class="btn-text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn blue-btn" style=" border-radius: 5px" data-bs-dismiss="modal" @click="sendVideoInfo">
              <span class="btn-text">Confirm</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>


<style scoped>

.modal-xl-custom {
  max-width: 1500px;
  width: 90%;
}

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

/*Button*/
.btn{
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

.blue-btn {
  color: #1E90FF;
  background-color: #FFFFFF;
}


.blue-btn:hover {
  color: #FFFFFF;
  background-color: #1E90FF;
}

/*Table*/
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 10px 20px 10px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;

}
.btn-wrap{
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
}
.menu-btn{
  width: 200px;
  height: 100px;
  margin: 0 20px;
  font-size: 17px;
  color: white;
  font-weight: bold;
  background-color: #343a40 ;
  border: none;
  border-radius: 10px;
}
h5{
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0;
}

.table-header{
  display: flex;
  justify-content: left;
  align-items: center;
  margin-bottom: 10px;
}

.table-header .el-select{
  width: 180px;
}

.table-area{
  padding: 20px;
  margin: 0 0 20px 0;
}
.data-table-body {
  margin: 10px 10px 20px 10px;
  border-radius: 10px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}
.el-pagination{
  float: right;
}

</style>