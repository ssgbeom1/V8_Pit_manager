<script setup>
import {onBeforeMount, onBeforeUnmount, onMounted, ref} from "vue";
import {useStore} from "vuex";
import axios from "axios";
import security from "@/security";
import querystring from "querystring";
import {ElDatePicker, ElOption, ElPagination, ElSelect, ElTable, ElTableColumn} from 'element-plus'
import { format, parseISO } from 'date-fns';
import {auto} from "@popperjs/core";
import * as XLSX from 'xlsx';
const store = useStore();

const toggleDefaultLayout = () => store.commit("toggleDefaultLayout");

//API Requirement
const startDate = ref(null);
const endDate = ref(null);
const Page = ref(1);
const length = ref(10);
const searchOption = ref('') // name, game, type, table
const search = ref('')

const pitManagerId = ref(1) // 나중에 vuex 에서 가져와야 하는 값

// 계산된 총 페이지 수 페이지네이션 전달
const totalPages = ref(0);

// API 요청 통해 받아온 데이터
const tableData = ref([]);

// 버튼 클릭시 받아온 데이터 중 버튼이 위치한 Row의 데이터를 저장
const selectedRowData = ref({});

//페이지당 Row 수 선택 옵션 값
const perPageOptions = [5, 10, 20, 30];

//API 요청 통해 받아온 데이터 총 Row수 저장
const total = ref(0);


// Table Data --------------------------------------------------------------------------------------------------------->
const fetchData = async () => {
  try {
    const data = {
      startDate: startDate.value,
      endDate: endDate.value,
      page: Page.value,
      length: length.value,
      searchOption: searchOption.value,
      search: search.value,
      pitManagerId: pitManagerId.value
    };
    const response = await axios.post('https://v8test.com/pit/manager/game/video/store/list', {
      data: security.encrypt(querystring.stringify(data)),
    });

    console.log(data);

    if (response.data.status === 'success') {
      console.log(response.data);
      console.log(length.value);
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

// Video fetching ----------------------------------------------------------------------------------------------------->
const videoUrl = ref('')
const fetchListvideo = async () => {
  try {
    const data = {
      gameId: selectedRowData.value.games_id,
      gameTableId: selectedRowData.value.game_tables_id,
      viewerId: pitManagerId.value,
      viewerType: "pit_manager"
    }
    console.log('video fetching data : ', data)
    const response = await axios.post("https://v8test.com/game/table/video", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      videoUrl.value = response.data.message.url
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// const clearUrl = () => {
//   videoUrl.value = ''
// }

// Dealer Info -------------------------------------------------------------------------------------------------------->
const dealerId = ref('')
const dealerInfo = ref([])
const fetchDealerInfo = async (row) => {
  dealerId.value = row.dealers_id
  try {
    const data = {
      dealerId : dealerId.value
    };
    const response = await axios.post('https://v8test.com/dealer/info', {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      dealerInfo.value = response.data.message.Info
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const reportType = ref([])
const selectedReportType = ref('')
const fetchReportType = async () => {
  try {
    const data = {}
    const response = await axios.post("https://v8test.com/pit/manager/game/report/type/list", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('ReportType : ',response)
      reportType.value= response.data.message.Info
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


// Dealer / Player Report --------------------------------------------------------------------------------------------->
const reportTarget = ref('')
const setReportTarget = (target) => {
  reportTarget.value = target;
}
const description = ref('')
const gameTableId = ref([])
const sendDealerReport = async () => {
  gameTableId.value = [selectedRowData.value.game_tables_id];
  try {
    const data = {
      reportTarget: reportTarget.value,
      description: description.value,
      gameId : selectedRowData.value.games_id,
      reportTypeId : selectedReportType.value,
      pitManagerId : pitManagerId.value,
      gameTableIds : JSON.stringify(gameTableId.value),
      reporterId: selectedRowData.value.dealers_id
    }
    console.log(selectedRowData.value.games_id)
    const response = await axios.post("https://v8test.com/pit/manager/game/report", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('Report Sending Success');
      description.value = ''
      selectedReportType.value = ''
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const playerId = ref('')
const playerName = ref('')
const setPlayerInfo = (id, name) => {
  playerId.value = id
  playerName.value = name
  console.log('store id Success',playerId.value)
  console.log('store name Success',playerName.value)
}

const sendPlayerReport = async () => {
  gameTableId.value = [selectedRowData.value.game_tables_id];
  try {
    const data = {
      reportTarget: reportTarget.value,
      description: description.value,
      gameId : selectedRowData.value.games_id,
      reportTypeId : selectedReportType.value,
      pitManagerId : pitManagerId.value,
      gameTableIds : JSON.stringify(gameTableId.value),
      reporterId: playerId.value
    }
    console.log(data)
    const response = await axios.post("https://v8test.com/pit/manager/game/report", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('Report Sending Success')
      description.value = ''
      selectedReportType.value = ''
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//Participant Player List --------------------------------------------------------------------------------------------->
//Player 버튼을 누르면 나오는 테이블의 테이블 데이터를 받아오는 API
const playerTableData = ref([])
const playerSearch =ref('')
const fetchPlayerList = async () => {
  try {
    const data = {
      page : Page.value,
      length : length.value,
      searchoption : "name",
      search : playerSearch.value,
      gameId : selectedRowData.value.games_id
    }
    const response = await axios.post("https://v8test.com/pit/manager/game/participant/list", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      totalPages.value = Math.ceil(response.data.message.RecordTotalCount / parseInt(length.value));
      total.value = response.data.message.RecordTotalCount;
      playerTableData.value = response.data.message.Info;
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}


// Save Video Delete -------------------------------------------------------------------------------------------------->

const deleteReport = async () => {
  try {
    const data = {
      gameVideoStoresId: selectedRowData.value.pit_manager_game_video_stores_id,
    }
    const response = await axios.post("https://v8test.com/pit/manager/game/video/store/delete", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('Video delete success')
      fetchData()
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Page & Table Control ----------------------------------------------------------------------------------------------->
//페이지 넘겨도 인덱스 유지
const indexMethod = (index) => {
  return (Page.value - 1) * length.value + (index + 1);
}

// 버튼 클릭시 해당 Row 데이터 불러와 저장하는 메소드
const selectRowData = (rowData) => {
  selectedRowData.value = rowData;
  console.log("Selected data:", selectedRowData.value);
};


// 선택한 페이지 보여주는 함수
const handlePageChange = (val) => {
  console.log(`current page: ${val}`)
  console.log(`current page: `, val)
  Page.value = val;
  fetchData()
}


// Date --------------------------------------------------------------------------------------------------------------->
// Date Range Picker
const dateRange = ref([null, null]);

function updateDateRange(value) {
  if (value && value.length === 2) {
    const offset = value[0].getTimezoneOffset() * 60000;
    const startDateValue = new Date(value[0] - offset);
    const endDateValue = new Date(value[1] - offset);

    startDate.value = startDateValue.toISOString().substring(0, 10);
    endDate.value = endDateValue.toISOString().substring(0, 10);

    console.log('Start :' + startDate.value);
    console.log('End :' + endDate.value);
  } else {
    startDate.value = null;
    endDate.value = null;
  }
}

//DateFormat
const formatDate = (dateStr) => {
  if (!dateStr) {
    return "No date provided";
  }
  try {
    return format(parseISO(dateStr), 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

//Excel --------------------------------------------------------------------------------------------------------------->
const exportToExcel = async () => {
  const maxDataRequest = {
    startDate: startDate.value,
    endDate: endDate.value,
    page: 1,
    length: 999999,
    searchOption: searchOption.value,
    search: search.value,
    pitManagerId: pitManagerId.value
  };

  try {
    const response = await axios.post('https://v8test.com/pit/manager/game/video/store/list', {
      data: security.encrypt(querystring.stringify(maxDataRequest)),
    });

    if (response.data.status === 'success') {
      const worksheet = XLSX.utils.json_to_sheet(response.data.message.Info);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, "pit_manager_saved_video_list.xlsx");
    } else {
      console.error('Excel export error:', response.data.message);
    }
  } catch (error) {
    console.error("Error exporting to Excel:", error);
  }
};

//Resize Error handling ----------------------------------------------------------------------------------------------->
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}
const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver{
  constructor(callback) {
    callback = debounce(callback, 16);
    super(callback);
  }
}

//On~~~
onBeforeMount(() => {
  store.state.hideConfigButton = true;
  toggleDefaultLayout();
  document.getElementsByTagName("body")[0].classList.remove("bg-gray-100");
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  toggleDefaultLayout();
});

onMounted(() => {
  fetchData();
  fetchReportType()
});


//Modal UI Changer ---------------------------------------------------------------------------------------------------->
const viewState = ref('initial');
const modalTitle = ref('Video');

const setDealerView = () => {
  viewState.value = 'dealer';
  modalTitle.value = 'Dealer Report';
}

const setPlayerView = () => {
  viewState.value = 'player';
  modalTitle.value = 'Player Report';
}

const setInitialView = () => {
  viewState.value = 'initial';
  modalTitle.value = 'Video';
}

//MACRO --------------------------------------------------------------------------------------------------------------->
const VideoViewMacro = async (row) => {
  await selectRowData(row)
  await fetchDealerInfo(row);
  await fetchListvideo();
}

const dealerMacro = () => {
  setReportTarget('DEALER');
  setDealerView();
}

const playerMacro = async () => {
  await fetchPlayerList()
  setReportTarget('USER');
  setPlayerView();
}

const dealerSendMacro = async () => {
  await sendDealerReport()
  setInitialView();
}

const playerSendMacro = async () => {
  await sendPlayerReport()
  setInitialView();
}

const backMacro = () => {
  setInitialView(),
      description.value = ''
  selectedReportType.value = ''
}

</script>

<template>
  <main class="main-content mt-0">
    <div class="page-header min-vh-100" style="background-color:#222222;">
      <div class="container-xxl card">
        <div class="title">
          Saved Video
        </div>
        <div class="search-box">
          <div class="search-area">
            <div class="search-wrap">
              <div class="inner-box">
                <div class="input-name">
                  Search Date
                </div>
                <div class="date-search">
                  <el-date-picker
                      v-model="dateRange"
                      type="daterange"
                      size="large"
                      clearable
                      start-placeholder="Start date"
                      end-placeholder="End date"
                      format="YYYY-MM-DD"
                      range-separator="to"
                      @change="updateDateRange">
                  </el-date-picker>
                </div>
              </div>

              <div class="inner-box">
                <div class="input-name">
                  Status
                </div>
                <div class="status">
                  <el-select size="large" placeholder="select status">
                    <el-option label="normal" value="" />
                    <el-option label="lock" value="" />
                    <el-option label="delete" value="" />
                  </el-select>
                </div>
              </div>

              <div class=" inner-box">
                <div class="input-name">
                  Option Search
                </div>
                <div class="option-search">
                  <el-input
                      v-model="search"
                      style="max-width: 500px"
                      placeholder="Select Option Text"
                      class="input-with-select"
                      size="large"
                  >
                    <template #prepend>
                      <el-select v-model="searchOption" placeholder="Search Option" size="large" style="width: 150px">
                        <el-option label="None" value="" />
                        <el-option label="Name" value="name" />
                        <el-option label="Game" value="game" />
                        <el-option label="Type" value="type" />
                        <el-option label="Table" value="table" />
                      </el-select>
                    </template>
                  </el-input>
                </div>
              </div>
            </div>
            <button class="btn btn-primary" @click="fetchData()">Search</button>
          </div>
        </div>

        <div class="data-table-body">
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
            <div class="btn-wrap">
              <div>
                <button class="btn btn-success col-1 excelBtn" @click="exportToExcel">Excel</button>
              </div>
            </div>
          </div>
          <!-- Element Plus Table -->
          <el-table id="savedVideoTable" :data="tableData" :table-layout='auto' style="width: 100%">
            <el-table-column type="index" label="No" :index="indexMethod"/>
            <el-table-column label="Video">
              <template #default="{row}">
                <button class="btn btn-success videoBtn" @click="VideoViewMacro(row)" data-bs-toggle="modal" data-bs-target="#videoViewModal">
                  Video
                </button>
              </template>
            </el-table-column>
            <el-table-column prop="game_name" label="Game Name"/>
            <el-table-column prop="dealer_name" label="Dealer"/>
            <el-table-column label="Table Start Time">
              <template #default="{ row }">
                {{ formatDate(row.game_table_start_reg_datetime) }}
              </template>
            </el-table-column>
            <el-table-column label="Desc">
              <template #default="{row}">
                <button class="btn btn-secondary descBtn" @click="selectRowData(row)" data-bs-toggle="modal" data-bs-target="#descriptionModal">
                  Detail
                </button>
              </template>
            </el-table-column>
            <el-table-column label="Saved Date Time">
              <template #default="{ row }">
                {{ formatDate(row.game_video_store_reg_datetime) }}
              </template>
            </el-table-column>
            <el-table-column label="ETC">
              <template #default="{row}">
                <button class="btn btn-danger deleteBtn" style="margin-right: 10px" @click="selectRowData(row)" data-bs-toggle="modal" data-bs-target="#deleteModal">
                  <i class="fa-solid fa-trash"></i>
                </button>
                <button class="btn btn-success editBtn" @click="selectRowData(row),fetchDealerInfo(row),fetchListvideo()" data-bs-toggle="modal" data-bs-target="#reportModal">
                  <i class="fa-solid fa-pencil"></i>
                </button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              small
              background
              layout="prev, pager, next"
              v-model="Page"
              :per-page="length"
              :page-count="totalPages"
              :total="total"
              @current-change="handlePageChange"
              class="mt-4"
          />
        </div>
      </div>
    </div>
  </main>

  <!-- --------- ---------- ---------- --------- MODALS --------- --------- ---------- ---------- -->
  <!-- Video MODAL ( Column : VIDEO ) -->
  <div id="videoViewModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl-custom modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
          <h2 class="mb-0" style="color: #444444">{{ modalTitle }}</h2>
        </div>
        <div class="card-body">
          <div v-if="viewState === 'initial'">
            <div class="mf" style="display: flex; margin-bottom: 1rem">
              <div class="btn-box" style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;" >
                <button class="gray-btn" style="border-radius: 5px" @click="dealerMacro">
                  <span class="text">Dealer</span></button>
              </div>
              <div class="btn-box" style="width: 50%; padding: 5px 5px" >
                <button class="gray-btn green-btn" style="border-radius: 5px" @click="playerMacro">
                  <span class="text">Player</span></button>
              </div>
            </div>
            <video :src=videoUrl controls style="width: 100%;"></video>
            <div class="report-desc-area" style="margin: 10px 0">
                  <textarea
                      v-model="selectedRowData.description"
                      name="reason"
                      rows="6"
                      style="width: 100%; padding: 10px; box-sizing: border-box;"
                      disabled
                  ></textarea>
            </div>
          </div>
          <div v-if="viewState === 'dealer' || viewState === 'player'">
            <div class="d-flex">
              <div class="flex-fill" style="width: 50%; border-right: 1px solid #ccc; padding-right: 10px">
                <video :src=videoUrl controls style="width: 100%;"></video>
                <div class="report-desc-area" style="margin: 10px 0">
                  <textarea
                      v-model="selectedRowData.description"
                      name="reason"
                      rows="6"
                      style="width: 100%; padding: 10px; box-sizing: border-box;"
                      disabled
                  ></textarea>
                </div>
              </div>
              <div class="flex-fill" style="width: 50%; margin-left: 10px">
                <div v-if="viewState === 'dealer'">
                  <div class="img-box" style="display: flex; justify-content: center">
                    <img :src=dealerInfo.image_url alt="dealer_image" style="width: 180px; height: 180px" >
                  </div>
                  <div class="text-area" style="display: flex; justify-content: center; align-items: center; margin-top: 15px">
                    Dealer Name : {{dealerInfo.name}}<br>
                    Dealer Status : {{dealerInfo.type}}
                  </div>
                  <div class="select-type" style="margin: 15px 0 10px 0">
                    <el-select placeholder="Select a Report Type" v-model="selectedReportType">
                      <el-option
                          v-for="item in reportType"
                          :key="item.type"
                          :label="item.type"
                          :value="item.pit_manager_game_report_types_id">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="report-desc-area">
              <textarea id="description" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
                  </div>
                  <div class="btn-box" style=" padding: 5px 5px; border-bottom-right-radius: 0;  margin-bottom: 1rem">
                    <button class="gray-btn green-btn" style="border-radius: 5px" @click="dealerSendMacro">
                      <span class="text">Send</span></button>
                  </div>
                </div>
                <div v-if="viewState === 'player'">
                  <div class="table-area">
                    <div class="table-header" style="display: flex; justify-content: space-between">
                      <div class="dropdownMenu">
                        <el-select v-model="length" size="large" placeholder="Select rows per page" @change="fetchPlayerList">
                          <el-option
                              v-for="item in perPageOptions"
                              :key="item"
                              :label="item"
                              :value="item">
                          </el-option>
                        </el-select>
                      </div>
                      <div class="input">
                        <el-input
                            v-model="playerSearch"
                            style="max-width: 500px"
                            placeholder="search user name"
                            class="input"
                            size="large"
                            @change="fetchPlayerList"
                        >
                        </el-input>
                      </div>
                    </div>
                    <el-table id="playerTable" :data="playerTableData" style="width: 100%">
                      <el-table-column prop="user_name" label="Player Name"></el-table-column>
                      <el-table-column prop="total_user_betting_count" label="Betting Count"></el-table-column>
                      <el-table-column label="Earn/Loss">
                        <template #default="{row}">
                          {{(row.earn_coin).toLocaleString()}} / {{(row.loss_coin).toLocaleString()}}
                        </template>
                      </el-table-column>
                      <el-table-column label="Margin">
                        <template #default="{row}">
                          {{row.margin}}%
                        </template>
                      </el-table-column>
                      <el-table-column label="ETC">
                        <template #default="{row}">
                          <button class="btn btn-success " @click="setPlayerInfo(row.users_id, row.user_name)">
                            Report
                          </button>
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
                  <div class="select-type" style="margin: 15px 0 10px 0">
                    <div v-if=(playerName) class="target-name">
                      Target Player : {{playerName}}
                    </div>
                    <el-select placeholder="Select a Report Type" v-model="selectedReportType">
                      <el-option
                          v-for="item in reportType"
                          :key="item.type"
                          :label="item.type"
                          :value="item.pit_manager_game_report_types_id">
                      </el-option>
                    </el-select>
                  </div>
                  <div class="report-desc-area">
              <textarea id="description" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
                  </div>
                  <div class="btn-box"
                       style=" padding: 5px 5px; border-bottom-right-radius: 0;  margin-bottom: 1rem">
                    <button class="gray-btn green-btn" style="border-radius: 5px" @click="playerSendMacro">
                      <span class="text">Send</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 5px">
          <button v-if="viewState === 'initial'" class="gray-btn" style="width: 100%"
                  data-bs-dismiss="modal">
            <span class="text">Close</span>
          </button>
          <button v-else class="gray-btn" style="width: 100%"
                  @click="backMacro">
            <span class="text">Back</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Descirption MODAL ( Column : DESC ) -->
  <div id="descriptionModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
            <h2 class="mb-0" style="color: #444444">Description</h2>
          </div>
          <div class="card-body ">
            <div class="report-desc-area" style="margin: 10px 0">
                  <textarea
                      v-model="selectedRowData.description"
                      name="reason"
                      rows="6"
                      style="width: 100%; padding: 10px; box-sizing: border-box;"
                      disabled
                  ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="width: 100%; padding: 5px 5px" >
          <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
            <span class="text">close</span></button>
        </div>
      </div>
    </div>
  </div>


  <!-- Delete MODAL ( Column : ETC ) -->
  <div id="deleteModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Remove</h2>
            </div>
            <div class="card-body ">
              <div class="title">
                Are you sure to delete a saved video?
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px 5px" >
            <button class="gray-btn red-btn" style="border-radius: 5px" @click="deleteReport" data-bs-dismiss="modal">
              <span class="text">Delete</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Report MODAL ( Column : ETC ) -->
  <div id="reportModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
            <h2 class="mb-0" style="color: #444444">Report</h2>
          </div>
          <div class="card-body" style="display: flex; justify-content: center;">
            <button class="gray-btn red-btn" style="border-radius: 5px" @click="dealerMacro" data-bs-toggle="modal" data-bs-target="#dealerReportModal">
              Dealer
            </button>
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="playerMacro" data-bs-toggle="modal" data-bs-target="#playerReportModal">
              Player
            </button>
          </div>
        </div>
        <div class="modal-footer" style="width: 100%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
          <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
            <span class="text">Cancel</span></button>
        </div>
      </div>
    </div>
  </div>

  <div id="dealerReportModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
            <h2 class="mb-0" style="color: #444444">Dealer Report</h2>
          </div>
          <div class="card-body">
            <div class="img-box" style="display: flex; justify-content: center">
              <img :src=dealerInfo.image_url alt="dealer_image" style="width: 180px; height: 180px" >
            </div>
            <div class="text-area" style="display: flex; justify-content: center; align-items: center; margin-top: 15px">
              Dealer Name : {{dealerInfo.name}}<br>
              Dealer Status : {{dealerInfo.type}}
            </div>
            <div class="select-type" style="margin: 12px 0">
              <el-select placeholder="Select a Report Type" v-model="selectedReportType">
                <el-option
                    v-for="item in reportType"
                    :key="item.type"
                    :label="item.type"
                    :value="item.pit_manager_game_report_types_id">
                </el-option>
              </el-select>
            </div>
            <div class="report-desc-area">
              <textarea id="description" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn green-btn" style=" border-radius: 5px"  @click="dealerSendMacro" data-bs-dismiss="modal">
              <span class="text">Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="playerReportModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
            <h2 class="mb-0" style="color: #444444">Dealer Report</h2>
          </div>
          <div class="card-body">
            <div class="table-area">
              <div class="table-header" style="display: flex; justify-content: space-between">
                <div class="input">
                  <el-input
                      v-model="playerSearch"
                      style="max-width: 500px"
                      placeholder="search user name"
                      class="input"
                      size="large"
                      @change="fetchPlayerList"
                  >
                  </el-input>
                </div>
              </div>
              <el-table id="playerTable" :data="playerTableData" style="width: 100%">
                <el-table-column prop="user_name" label="Player Name"></el-table-column>
                <el-table-column prop="total_user_betting_count" label="Betting Count"></el-table-column>
                <el-table-column label="Earn/Loss">
                  <template #default="{row}">
                    {{(row.earn_coin).toLocaleString()}} / {{(row.loss_coin).toLocaleString()}}
                  </template>
                </el-table-column>
                <el-table-column label="Margin">
                  <template #default="{row}">
                    {{row.margin}}%
                  </template>
                </el-table-column>
                <el-table-column label="ETC">
                  <template #default="{row}">
                    <button class="btn btn-success " @click="setPlayerInfo(row.users_id, row.user_name)">
                      Report
                    </button>
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
            <div class="select-type" style="margin: 25px 0">
              <div v-if=(playerName) class="target-name">
                Target Player : {{playerName}}
              </div>
              <el-select placeholder="Select a Report Type" v-model="selectedReportType">
                <el-option
                    v-for="item in reportType"
                    :key="item.type"
                    :label="item.type"
                    :value="item.pit_manager_game_report_types_id">
                </el-option>
              </el-select>
            </div>
            <div class="report-desc-area">
              <textarea id="description" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn green-btn" style=" border-radius: 5px"  @click="playerSendMacro" data-bs-dismiss="modal">
              <span class="text">Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped>
.modal-transition-enter-active, .modal-transition-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.modal-transition-enter, .modal-transition-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
.flex-fill {
  flex: 1;
}
.data-table-body {
  padding: 20px;
  border-radius: 10px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}

.table-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 20px 0;
}

.dropdownMenu .el-select {
  width: 200px;
  font-size: 16px;
}


.title {
  padding: 0 10px 10px 10px;
  font-size: 30px;
  font-weight: bold;
  border-bottom: 2px solid whitesmoke;
}

@media (min-width: 1400px) {
  .container-xxl {
    max-width: 2000px;
    background-color: ghostwhite;
    padding: 20px 20px;
    border-radius: 20px;
  }
}

.modal-xl-custom {
  max-width: 1200px;
  width: 90%;
}

.search-box {
  display: flex;
  align-items: center;
  margin: 20px 0;
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}

.card {
  padding: 20px 30px;
  border-radius: 10px;
}
.search-area{
  display: flex;
  width: 100%;
  justify-content: space-between;
}
.search-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inner-box {
  margin-right: 10px;
  width: 100%;
}
.status{
  width: 13rem;
}
.option-search{
  width: 20rem;
}

.input-name {
  display: inline-block;
}

.btn-wrap {
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 10px;
}

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

p {
  margin: 0 10px;
}

.el-pagination{
  float: right;
}


</style>