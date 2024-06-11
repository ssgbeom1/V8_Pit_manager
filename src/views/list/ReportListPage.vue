<script setup>
import {onBeforeMount, onBeforeUnmount, onMounted, ref, computed, watch} from "vue";
import {useStore} from "vuex";
import axios from "axios";
import security from "@/security";
import querystring from "querystring";
import {ElDatePicker, ElOption, ElSelect} from 'element-plus'
import { format, parseISO } from 'date-fns';
import {auto} from "@popperjs/core";
import ArgonInput from "@/components/ArgonInput.vue";
import * as XLSX from 'xlsx';
import router from "@/router";
import Swal from "sweetalert2";

const store = useStore();

const toggleDefaultLayout = () => store.commit("toggleDefaultLayout");

//API Requirement
const startDate = ref('');
const endDate = ref('');
const Page = ref('1');
const length = ref('10');
const searchOption = ref("")
const search = ref("")
const isConfirm = ref('')


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

const pitManagerId = computed(() => store.state.pitManagerInfo.pit_managers_id);

// 데이터를 가져오는 함수
const fetchData = async () => {
  try {
    const data = {
      startDate: startDate.value,
      endDate: endDate.value,
      page: Page.value,
      length: length.value,
      searchoption: searchOption.value,
      search: search.value,
      isConfirm : isConfirm.value,
      pitManagerId : pitManagerId.value
    };
    const response = await axios.post('https://v8test.com/pit/manager/game/report/list', {
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

const reportId = ref('')
const reportData = ref([])
const reportTable = ref([])

const fetchReportinfo = async (reportedId) => {
  try {
    reportId.value = reportedId
    const data = {
      reportId: reportId.value,
    };
    const response = await axios.post('https://v8test.com/pit/manager/game/report/info', {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      reportData.value = response.data.message.Info;
      reportTable.value= JSON.parse(response.data.message.Info.game_tables_ids)
      gameTableIds.value = reportTable.value;
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const fetchVideoStoreList = async () => {
  try {
    const data = {
      startDate: startDate.value,
      endDate: endDate.value,
      page: Page.value,
      length: length.value,
      searchoption: searchOption.value,
      search: search.value,
      pitManagerId: pitManagerId.value,
    };
    const response = await axios.post('https://v8test.com/pit/manager/game/video/store/list', {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      videoStoreData.value = response.data.message.Info;
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

function addTable(event) {
  const newTableId = event;
  if (!gameTableIds.value.includes(newTableId)) {
    gameTableIds.value.push(newTableId)
  }
}

function removeTable(index) {
  gameTableIds.value.splice(index, 1)
}

const updateRowGameTableId = () => {
  const attachGameTableIds = JSON.parse(selectedRowData.value.attach_game_tables_id);
  gameTableIds.value = attachGameTableIds
}

const gameTableIds =ref([])

const videoStoreData = ref([])
const description = ref('')
const updateReason = ref('')
const sendUpdatedDescription = async () => {
  try {
    const data = {
      pitManagerGameReportsId: reportData.value.pit_manager_game_reports_id,
      description: description.value,
      updateReasonDescription: updateReason.value,
      gameTableIds: JSON.stringify(gameTableIds.value),
      reportTypeId: reportData.value.report_type_id,
      pitManagerId: pitManagerId.value,
    };
    const response = await axios.put('https://v8test.com/pit/manager/game/report', {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      Swal.fire({
        title: "Report Update successful",
        icon: "success",
      });
      clearReport();
    } else {
      Swal.fire({
        title: "Report update failed",
        text: response.data.message,
        icon: "error",
      });
      clearReport();
    }
  } catch (error) {
    Swal.fire({
      title: "Something went wrong",
      text: error,
      icon: "error",
    });
    clearReport();
  }
};

const clearReport = () => {
  description.value = '';
  updateReason.value = '';
  gameTableIds.value = [];
}

const confirmInfo = ref([])
const fetchConfirmInfo = async () => {
  try {
    const data = {
      reportId: reportData.value.pit_manager_game_reports_id,
    };
    const response = await axios.put('https://v8test.com/pit/manager/game/report', {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      confirmInfo.value = response.data.message.Info
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
    const response = await axios.post("https://v8test.com/pit/manager/game/report/delete/type/list", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      reportType.value = response.data.message.Info
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const deleteReport = async () => {
  try {
    const data = {
      reportId: reportData.value.pit_manager_game_reports_id,
      reportDeleteTypeId: selectedReportType.value,
      description: description.value,
      pitManagerId: pitManagerId.value
    }
    const response = await axios.post("https://v8test.com/pit/manager/game/report/delete", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      Swal.fire({
        title: "Report Delete successful",
        icon: "success",
      });
      description.value = ''
      fetchData()
    } else {
      Swal.fire({
        title: "Report delete failed",
        text: response.data.message,
        icon: "error",
      });
      description.value = ''
    }
  } catch (error) {
    Swal.fire({
      title: "Something went wrong",
      text: error,
      icon: "error",
    });
    description.value = ''
  }
}

const videoListTableData = ref([])
const gameName = ref('')
const fetchvideoList = async () => {
  try {
    const data = {
      reportId: reportData.value.pit_manager_game_reports_id,
    }
    const response = await axios.post("https://v8test.com/pit/manager/game/report/info", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      gameName.value = response.data.message.Info.game_name
      const gameTablesIds = JSON.parse(response.data.message.Info.game_tables_ids);
      videoListTableData.value = gameTablesIds.map(id => ({
        ...response.data.message.Info,
        game_table_id: id,
      }));
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const gameId = ref()
const gameTableId = ref()
const videoUrl = ref('')
const fetchListvideo = async (row) => {
  gameId.value = row.games_id
  gameTableId.value = row.game_table_id

  try {
    const data = {
      gameId: gameId.value,
      gameTableId: gameTableId.value,
      viewerId: pitManagerId.value,
      viewerType: "pit_manager"
    }
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

const clearUrl = () => {
  videoUrl.value = ''
}

//페이지 넘겨도 인덱스 유지
const indexMethod = (index) => {
  return (Page.value - 1) * length.value + (index + 1);
}

//row 저장 메소드
const selectRowData = (rowData) => {
  selectedRowData.value = rowData;
};

// 선택한 페이지 보여주는 함수
const handlePageChange = (val) => {
  Page.value = val;
  fetchData()
}


// Date Range Picker
const dateRange = ref([null, null]);

function updateDateRange(value) {
  if (value && value.length === 2) {
    const offset = value[0].getTimezoneOffset() * 60000;
    const startDateValue = new Date(value[0] - offset);
    const endDateValue = new Date(value[1] - offset);

    startDate.value = startDateValue.toISOString().substring(0, 10);
    endDate.value = endDateValue.toISOString().substring(0, 10);
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
const exportToExcel = async () => {
  const maxDataRequest = {
    startDate: startDate.value,
    endDate: endDate.value,
    page: 1,
    length: 9999999,
    searchOption: searchOption.value,
    search: search.value,
    isConfirm: isConfirm.value
  };

  try {
    const response = await axios.post('https://v8test.com/pit/manager/game/report/list', {
      data: security.encrypt(querystring.stringify(maxDataRequest)),
    });

    if (response.data.status === 'success') {
      const info = response.data.message.Info;
      if (!info || info.length === 0) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'There is no data available for export',
        });
        return;
      } else {
        const worksheet = XLSX.utils.json_to_sheet(info);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, "pit_manager_game_report_list.xlsx");
      }
    } else {
      console.error('Excel export error:', response.data.message);
    }
  } catch (error) {
    console.error("Error exporting to Excel:", error);
  }
};

//Macros ----------------------------------------------------------------------------------------------------------->
const viewMacro = async (row) => {
  await selectRowData(row);
  await fetchReportinfo(row.pit_manager_game_reports_id)
  await fetchvideoList();
}

const confirmMacro = async (row) => {
  await selectRowData(row);
  await fetchReportinfo(row.pit_manager_game_reports_id)
  await fetchConfirmInfo()
}

const removeMacro = async (row) => {
  await selectRowData(row);
  await fetchReportinfo(row.pit_manager_game_reports_id)
  await fetchReportType()
}

const updateMacro = async (row) => {
  await selectRowData(row);
  await fetchReportinfo(row.pit_manager_game_reports_id)
  await updateRowGameTableId()
}

const formatGameTableIds = (ids) => {
  try {
    const parsedIds = JSON.parse(ids);
    if (Array.isArray(parsedIds)) {
      return parsedIds.join(', ');
    } else {
      return ids;
    }
  } catch (error) {
    return ids;
  }
};

//Resize Error handling function
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
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
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
  fetchVideoStoreList();
});

/*Search option*/
watch(searchOption, () => {
  search.value = '';
});

const isSearchDisabled = computed(() => searchOption.value === 'none');

const toMainPage = () => router.push({name: 'MainPage'});
</script>

<template>
  <main class="main-content mt-0">
    <div class="page-header min-vh-100" style="background-color:#222222;">
      <div class="container-xxl card">
        <div class="title-wrap">
          <div class="title">
            Report List
          </div>
          <button class="button-57" role="button" @click="toMainPage">
            <span class="text">MainPage<i class="fa-solid fa-door-open"
                                          style="color: #777777; margin-left: 5px"></i></span>
            <span><i class="fa-solid fa-arrow-right" style="font-size: 25px"></i></span>
          </button>
        </div>
        <div class="search-box">
          <div class="search-inner-row">
            <div class="search-section">
              <div class="date-search inner-box">
                <div class="input-name mb-1">
                  Search Date
                </div>
                <div class="date-box">
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

              <div class="option-search inner-box">
                <div class="input-name mb-1">
                  Option Search
                </div>
                <el-input
                    v-model="search"
                    :disabled="isSearchDisabled"
                    style="max-width: 500px"
                    placeholder="Select Option Text"
                    class="input-with-select"
                    size="large">
                  <template #prepend>
                    <el-select v-model="searchOption" placeholder="Search Option" size="large" style="width: 150px">
                      <el-option label="All" value="none"/>
                      <el-option label="Name" value="name"/>
                      <el-option label="Game" value="game"/>
                      <el-option label="Table" value="table"/>
                    </el-select>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="btn-box">
              <button class="btn btn-primary" @click="fetchData()">Search</button>
            </div>
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
          <el-table id="ReportListTable" :data="tableData" :table-layout='auto' style="width: 100%">
            <el-table-column type="index" label="No" :index="indexMethod"/>
            <el-table-column prop="pit_manager_game_reports_id" label="ID"/>
            <el-table-column prop="pit_manager_name" label="Name"/>
            <el-table-column prop="game_name" label="Game Name"/>
            <el-table-column label="Game Table">
              <template #default="{ row }">
                <span>{{ formatGameTableIds(row.attach_game_tables_id) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="Type">
              <template #default="{row}">
                <button v-if="row.reporter_target_type === 'DEALER'" class="btn btn-secondary dealerInfoBtn"
                        @click="selectRowData(row)" data-bs-toggle="modal" data-bs-target="#DealerModal">
                  Dealer
                </button>
                <button v-else-if="row.reporter_target_type === 'USER'" class="btn btn-secondary userInfoBtn"
                        @click="selectRowData(row)" data-bs-toggle="modal" data-bs-target="#PlayerModal">
                  Player
                </button>
              </template>
            </el-table-column>
            <el-table-column label="Description">
              <template #default="{row}">
                <button class="btn btn-success descBtn" @click="fetchReportinfo(row.pit_manager_game_reports_id)"
                        data-bs-toggle="modal" data-bs-target="#infoModal">
                  Detail
                </button>
              </template>
            </el-table-column>
            <el-table-column label="Confirm">
              <template #default="{row}">
                <span>{{ row.is_confirm === 1 ? 'True' : 'False' }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="studio_manager_name" label="Studio Manager"/>
            <el-table-column label="Video">
              <template #default="{row}">
                <button class="btn btn-success viewBtn" @click="viewMacro(row)" data-bs-toggle="modal"
                        data-bs-target="#videoViewModal">
                  View
                </button>
              </template>
            </el-table-column>
            <el-table-column label="Reg Date">
              <template #default="{ row }">
                {{ formatDate(row.reg_datetime) }}
              </template>
            </el-table-column>
            <el-table-column label="ETC">
              <template #default="{row}">
                <button v-if="row.is_confirm === 1" class="btn btn-success confirmBtn" @click="confirmMacro(row)"
                        data-bs-toggle="modal" data-bs-target="#confirmModal">
                  Confirm
                </button>
                <div v-else>
                  <button class="btn btn-danger removeBtn" @click="removeMacro(row)" data-bs-toggle="modal"
                          data-bs-target="#DeleteModal">
                    Remove
                  </button>
                  <button class="btn btn-primary updateBtn" @click="updateMacro(row)" data-bs-toggle="modal"
                          data-bs-target="#infoUpdateModal" style="margin-left: 5px;">
                    Update
                  </button>
                </div>
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


  <!-- USER/DEALER INFO MODAL ( Column : TYPE ) -->
  <div id="DealerModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div v-if="selectedRowData" class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
            <h2 class="mb-0" style="color: #444444">Dealer</h2>
          </div>
          <div class="card-body ">
            <div class="img-box" style="margin-top: 20px">
              <img :src=selectedRowData.dealer_image_url width="280px" height="280px">
            </div>
            <div class="name">
              <p style="margin-top: 10px">Dealer Name : {{ selectedRowData.dealer_name }}</p>
            </div>
            <div class="game-time">
              <p style="margin-top: 10px">Game Start Time : {{ formatDate(selectedRowData.dealer_reg_datetime) }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 5px">
          <button class="gray-btn" style="width: 100%" data-bs-dismiss="modal"><span class="text">close</span></button>
        </div>
      </div>
    </div>
  </div>

  <div id="PlayerModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div v-if="selectedRowData" class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
            <h2 class="mb-0" style="color: #444444">Player</h2>
          </div>
          <div class="card-body ">
            <div class="img-box" style="margin-top: 20px">
              <img src="../../assets/Dummyfolder/dummy_img1.jpg" width="280px" height="280px">
            </div>
            <div class="name">
              <p style="margin-top: 10px">Player Name : {{ selectedRowData.user_name }}</p>
            </div>
            <div class="game-time">
              <p style="margin-top: 10px">Game Start Time : {{ formatDate(selectedRowData.user_reg_datetime) }}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 5px">
          <button class="gray-btn" style="width: 100%" data-bs-dismiss="modal"><span class="text">close</span></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Description INFO- > Info MODAL, Update MODAL, SaveVideo MODAL ( Column : DESC ) -->
  <div id="infoModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div v-if=(reportData) class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 10px 20px 10px; ">
            <h2 class="mb-0" style="color: #444444">Description</h2>
          </div>
          <div class="card-body ">
            <div class="text-area">
              <div class="type-info">
                Type : {{ reportData.report_type }}
              </div>
              <div class="name-date-wrap" style="display: flex; justify-content: space-between; align-items: center">
                <div class="name-info">
                  Name : {{ reportData.person_report_name }}
                </div>
                <div class="date-info">
                  {{ formatDate(reportData.reg_datetime) }}
                </div>
              </div>
            </div>
            <div class="report-desc-area">
              <textarea
                  v-model="reportData.description"
                  name="reason"
                  rows="10"
                  style="width: 100%; padding: 10px; margin: 10px 0; box-sizing: border-box;"
                  placeholder="write the reason for the update"
                  disabled
              ></textarea>
            </div>
            <div class="table-info-area" style="margin-top: 20px">
              <div>
                Table Video
              </div>
              <div class="table-wrap" style="display: flex; justify-content: left;">
                <template v-if="reportTable && reportTable.length > 0">
                  <el-tag
                      v-for="(tableId, index) in reportTable"
                      :key="index"
                      class="table-tag"
                      type="info"
                      style="margin-right: 10px;"
                      disable-transitions
                  >
                    Table {{ tableId }}
                  </el-tag>
                </template>
                <div v-else style="flex-grow: 1; text-align: center; color: grey;">
                  No table selected
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer"
               style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px">
            <button class="gray-btn blue-btn" style=" border-radius: 5px" data-bs-toggle="modal"
                    data-bs-target="#infoUpdateModal" @click="fetchVideoStoreList">
              <span class="text">Update</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="infoUpdateModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 10px 20px 10px;">
            <h2 class="mb-0" style="color: #444444">Report</h2>
          </div>
          <div class="card-body">
            <div class="text-area">
              <div class="type-info">
                Type : {{ reportData.report_type }}
              </div>
              <div class="name-date-wrap" style="display: flex; justify-content: space-between; align-items: center">
                <div class="name-info">
                  Name : {{ reportData.person_report_name }}
                </div>
                <div class="date-info">
                  {{ formatDate(reportData.reg_datetime) }}
                </div>
              </div>
            </div>
            <div class="report-desc-area">
              <el-input v-model="reportData.report_type" type="text" placeholder="Report Type" disabled=true
                           style="margin: 10px 0"></el-input>
              <textarea id="description" v-model="description" name="reason" rows="10"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
              <textarea id="reason" v-model="updateReason" name="reason" rows="4"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="write the reason for the update"></textarea>
            </div>
            <div class="table-info-area" style="margin-top: 20px">
              <div>
                Table Video
              </div>
              <div class="select-game">
                <el-select placeholder="Select a game table" @change="addTable">
                  <el-option
                      v-for="item in videoStoreData"
                      :key="item.game_tables_id"
                      :label="'Table - ' + item.game_tables_id"
                      :value="item.game_tables_id">
                  </el-option>
                </el-select>
              </div>
              <div class="selected-tables" style="margin: 10px 0">
                <el-tag
                    v-for="(id, index) in gameTableIds"
                    :key="id"
                    closable
                    @close="removeTable(index)"
                    style="margin-right: 10px">
                  Table {{ id }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer"
               style="width: 50%; padding: 5px 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal" @click="clearReport()">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px 5px">
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="sendUpdatedDescription"
                    data-bs-dismiss="modal">
              <span class="text">Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>


  <!-- GameTableVideoList INFO- > VideoView MODAL ( Column : VIDEO ) -->
  <div id="videoViewModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div v-if=(videoListTableData) class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Game Table Video List</h2>
            </div>
            <div class="card-body ">
              <div v-if="videoUrl" class="video-area" style="display: flex; justify-content: center;">
                <video :src="videoUrl" controls preload="auto" width="100%"></video>
              </div>
              <div v-else class="placeholder-box"
                   style="width: 980px; height: 550px; display: flex; align-items: center; justify-content: center; margin: auto; background-color: #666666;">
                <span style="color: white; font-size: 30px;">Select the game</span>
              </div>
              <div class="table-info-area" style="margin-top: 20px">
                <div>
                  Game : {{ gameName }}
                </div>
                <div class="table-wrap" style="display: flex; justify-content: center;">
                  <el-table id="ReportListTable" :data="videoListTableData" :table-layout='auto' style="width: 100%">
                    <el-table-column prop="game_name" label="Game Name"/>
                    <el-table-column prop="game_table_id" label="Game Table"/>
                    <el-table-column label="Video">
                      <template #default="{row}">
                        <button class="btn btn-success viewBtn" @click="fetchListvideo(row)">
                          View
                        </button>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 5px">
          <button class="gray-btn" style="width: 100%" data-bs-dismiss="modal" @click="clearUrl">
            <span class="text">close</span></button>
        </div>
      </div>
    </div>
  </div>

  <!-- Confirm - > Confirm MODAL ( Column : ETC ) -->
  <div id="confirmModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div v-if=(confirmInfo) class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="col-12" style="display: flex; justify-content: space-evenly">
            <div class="col-6" style="border-right: 1px solid #999999; margin: 20px 0; padding: 0 10px">
              <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
                <h2 class="mb-0" style="color: #444444">Report</h2>
              </div>
              <div class="card-body ">
                <div class="text-area">
                  <div class="type-info">
                    Type : {{ reportData.report_type }}
                  </div>
                  <div class="name-date-wrap"
                       style="display: flex; justify-content: space-between; align-items: center">
                    <div class="name-info">
                      Name : {{ reportData.person_report_name }}
                    </div>
                    <div class="date-info">
                      {{ formatDate(reportData.reg_datetime) }}
                    </div>
                  </div>
                </div>
                <div class="report-desc-area">
                  <textarea
                      v-model="reportData.report_type"
                      name="reason" rows="10"
                      style="width: 100%; padding: 10px; box-sizing: border-box;"
                      placeholder="Write a Description"
                      disabled
                  ></textarea>
                  <textarea
                      v-model="reportData.description"
                      name="reason"
                      rows="4"
                      style="width: 100%; padding: 10px; box-sizing: border-box;"
                      placeholder="write the reason for the update"
                      disabled
                  ></textarea>
                </div>
                <div class="table-info-area" style="margin-top: 20px">
                  <div>
                    Table Video
                  </div>
                  <div class="table-wrap" style="display: flex; justify-content: left;">
                    <template v-if="reportTable && reportTable.length > 0">
                      <el-tag
                          v-for="(tableId, index) in reportTable"
                          :key="index"
                          class="table-tag"
                          type="info"
                          style="margin-right: 10px;"
                          disable-transitions
                      >
                        Table {{ tableId }}
                      </el-tag>
                    </template>
                    <div v-else style="flex-grow: 1; text-align: center; color: grey;">
                      No table selected
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-6" style="margin: 20px 0; padding: 0 10px">
              <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
                <h2 class="mb-0" style="color: #444444">Report Confirm</h2>
              </div>
              <div class="card-body">
                <div class="name-date-wrap"
                     style="display: flex; justify-content: space-between; align-items: center; margin-top: 25px">
                  <div class="name-info">
                    Confirmer : {{ confirmInfo.studio_manager_name }}
                  </div>
                  <div class="date-info">
                    {{ confirmInfo.reg_datetime }}
                  </div>
                </div>
                <div class="report-desc-area">
                  <textarea
                      v-model="confirmInfo.description"
                      name="reason"
                      rows="4"
                      style="width: 100%; padding: 10px; box-sizing: border-box;"
                      disabled
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 5px">
          <button class="gray-btn" style="width: 100%" data-bs-dismiss="modal">
            <span class="text">close</span></button>
        </div>
      </div>
    </div>
  </div>

  <!-- GameTableVideoList INFO- > VideoView MODAL ( Column : VIDEO ) -->
  <div id="DeleteModal" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div v-if="(reportType)" class="modal-content" style="border-radius: 5px;">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 30px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Remove</h2>
            </div>
            <div class="card-body ">
              <div class="select-type" style="margin: 10px 0">
                <el-select placeholder="Select a Report Type" v-model="selectedReportType">
                  <el-option
                      v-for="item in reportType"
                      :key="item.type"
                      :label="item.type"
                      :value="item.pit_manager_game_report_delete_types_id">
                  </el-option>
                </el-select>
              </div>
              <div class="report-desc-area">
              <textarea id="description" v-model="description" name="reason" rows="10"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
              </div>
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
            <button class="gray-btn green-btn" style="border-radius: 5px" @click="deleteReport" data-bs-dismiss="modal">
              <span class="text">Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>

<style scoped>
@import 'element-plus/dist/index.css';
/* Button-CSS */
.button-57 {
  width: 7%;
  position: relative;
  overflow: hidden;
  border: 1px solid #777777;
  border-radius: 5px;
  color: #444444;
  display: inline-block;
  font-size: 15px;
  line-height: 15px;
  padding: 15px 10px;
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

.data-table-body {
  padding: 20px;
  border-radius: 10px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}

.table-header {
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
}

.title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/*Search Area*/
.search-section {
  display: flex;
}

.inner-box {
  margin-right: 1.8rem;
}

.search-box {
  margin: 20px 0;
  padding: 20px 30px;
  border-radius: 10px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
}

.search-inner-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.btn-box {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.input-name {
  color: black;
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

.deleteBtn {
  margin-right: 10px;
}

p {
  margin: 0 10px;
}

.el-pagination {
  float: right;
}

/*Modal*/
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
  border-radius: 10px;
}

.gray-btn:hover {
  color: white;
  background-color: #777777;
  transition-duration: .5s;
}

.gray-btn:hover i {
  color: white;
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

/* Dummy CSS  */
.img-box, .name, .game-time {
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>