<script setup>
import {onBeforeMount, onBeforeUnmount, onMounted, ref, computed} from "vue";
import { useStore } from "vuex";
import 'video.js/dist/video-js.css'
import axios from "axios";
import security from "@/security";
import querystring from "querystring";
import router from '@/router';
import { StageEvents, Stage, SubscribeType } from "amazon-ivs-web-broadcast";
import { ElOption, ElPagination, ElSelect, ElTable, ElTableColumn} from "element-plus";

const pitManagerId = computed(() => store.state.pitManagerInfo.pit_managers_id);

//API응답 값 저장 (나중에 총 4개의 데이터를 받게되면 배열 형태로 변경해야함)
const video_info= ref([])

//GameIdInfo
const gameId = ref('')


//Video Token fetch----------------------------------------------------------------------------------------------------->
//비디오 토큰을 가져오는 API
const fetchData = async () => {
  try {
    const data = {
      pitManagerId: pitManagerId.value
    }
    const response = await axios.post("https://v8test.com/pit/manager/game/live/monitoring/list", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('liveMonitoringList',response)
      video_info.value = response.data.message
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


//Live Video Info----------------------------------------------------------------------------------------------------->
//Info 버튼을 눌렀을때 양쪽 끝 Info box에 나오는 정보를 가져오는 API

// fetchLiveVideo함수의 api 응답값을 저장 할 변수
const DealerInfo = ref([])
const UserInfo = ref([])
const GameTableInfo = ref([])
const fetchLiveVideoInfo = async () => {
  try {
    const data = {
      gameId: gameId.value
    }
    console.log(gameId.value)
    const response = await axios.post("https://v8test.com/game/video/live/info", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('Live Video Info : ', response)
      DealerInfo.value = response.data.message.DealerInfo
      UserInfo.value = response.data.message.UserInfo
      GameTableInfo.value = response.data.message.GameTableInfo

    } else {
      console.error('fetchLiveVideoInfo Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
const handleInfoClick = async (index) => {
  if (video_info.value[index] && video_info.value[index].games_id) {
    gameId.value = video_info.value[index].games_id;
    await fetchLiveVideoInfo();
  } else {
    console.error("No games_id available for index", index);
  }
};

//Live Video Play-Back Info------------------------------------------------------------------------------------------->
//Play/Back 버튼을 눌렀을 때 보여지는 테이블 데이터를 가져오는 API
const Page = ref(1);
const length = ref(10);
//Pagination
const totalPages = ref(0);
const tableData = ref([]);
const total = ref(0);
const perPageOptions = [5, 10, 20, 30];
const fetchLiveVideoPlayBackInfo = async () => {
  try {
    const data = {
      page : Page.value,
      length : length.value,
      gameId: gameId.value
    }

    const response = await axios.post("https://v8test.com/game/video/play/back/list", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {

      totalPages.value = Math.ceil(response.data.message.RecordTotalCount / parseInt(length.value));
      total.value = response.data.message.RecordTotalCount;
      tableData.value = response.data.message.Info;
      // console.log(tableData.value[0])

    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
const handleTableClick = async (index) => {
  if (video_info.value[index] && video_info.value[index].games_id) {
    gameId.value = video_info.value[index].games_id;
    await fetchLiveVideoPlayBackInfo();
  } else {
    console.error("No games_id available for index", index);
  }
};
const handlePageChange = (newPage) => {
  Page.value = newPage;
  fetchLiveVideoPlayBackInfo();
};

//save Video Modal
function addTable(event) {
  const newTableId = event;
  if (!gameTableIds.value.includes(newTableId)) {
    gameTableIds.value.push(newTableId)
  }
  console.log(gameTableIds.value)
}

function removeTable(index) {
  gameTableIds.value.splice(index, 1)
  console.log(gameTableIds.value)
}

//Video View ---------------------------------------------------------------------------------------------------------->
//Play/Back버튼의 모달창에서 나오는 테이블의 View 버튼을 눌렀을때 재생 할 수 있는 비디오의 URL을 받아오는 API
const gameTableId = ref()
const videoUrl = ref('')
const fetchVideoView = async ( TableId ) => {
  gameTableId.value = TableId
  try {
    const data = {
      gameId: gameId.value,
      gameTableId : gameTableId.value,
      viewerId : pitManagerId.value,
      viewerType : 'pitManager'
    }
    console.log(gameId.value)
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


//Dealer Info --------------------------------------------------------------------------------------------------------->
//Dealer 버튼을 눌렀을 때 딜러 정보를 가져오는 API
const dealerInfo = ref('')
const dealerId = ref('')
const fetchDealerInfo = async () => {
  try {
    const data = {
      // gameId: gameId.value,
      gameId : 19
    }
    console.log(gameId.value)
    const response = await axios.post("https://v8test.com/game/dealer/info", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('DealerInfo', response)
      dealerInfo.value = response.data.message.Info
      dealerId.value = response.data.message.Info.dealers_id
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
const handleDealerInfo = async (index) => {
  if (video_info.value[index] && video_info.value[index].games_id) {
    gameId.value = video_info.value[index].games_id;
    await fetchDealerInfo();
  } else {
    console.error("No games_id available for index", index);
  }
};

//Video Description --------------------------------------------------------------------------------------------------->
//비디오 우측 하단의 저장 버튼을 눌렀을 때 나오는 모달의 리포트를 작성해서 보내는 API
const description = ref('')
const gameTableIds = ref([])
const SendVideoDescription = async () => {
  gameTableIds.value = gameTableIds.value.map(id => parseInt(id));
  console.log('send description : ', gameTableIds.value);
  try {
    const data = {
      pitManagerId : pitManagerId.value,
      description : description.value,
      gameTableIds : JSON.stringify(gameTableIds.value)
    }
    console.log(gameId.value)
    const response = await axios.post("https://v8test.com/pit/manager/game/video/store", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('Video Description : ',response)
      gameTableIds.value = []
      description.value = ''
    } else {
      console.error('Response error', response.data.message);
      gameTableIds.value = []
      description.value = ''
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

//Game Report ---------------------------------------------------------------------------------------------------->
//Dealer/player 버튼을 누르면 나오는 모달의 리포트를 작성해서 보내는 API
const reportTarget = ref('')
const setReportTarget = (target) => {
  reportTarget.value = target;
}
const sendDealerReport = async () => {
  gameTableIds.value = gameTableIds.value.map(id => parseInt(id));
  console.log(reportTarget.value,description.value,gameId.value,selectedReportType.value,pitManagerId.value,gameTableIds.value)
  try {
    const data = {
      reportTarget: reportTarget.value,
      description: description.value,
      gameId : gameId.value,
      reportTypeId : selectedReportType.value,
      pitManagerId : pitManagerId.value,
      gameTableIds : JSON.stringify(gameTableIds.value),
      reporterId: dealerId.value
    }
    console.log(gameId.value)
    const response = await axios.post("https://v8test.com/pit/manager/game/report", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('Report Sending Success')
      gameTableIds.value = [];
      description.value = '';
      selectedReportType.value = '';
    } else {
      console.error('Response error', response.data.message);
      gameTableIds.value = [];
      description.value = '';
      selectedReportType.value = '';
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
  gameTableIds.value = gameTableIds.value.map(id => parseInt(id));
  console.log(reportTarget.value,description.value,gameId.value,selectedReportType.value,pitManagerId.value,gameTableIds.value)
  try {
    const data = {
      reportTarget: reportTarget.value,
      description: description.value,
      gameId : gameId.value,
      reportTypeId : selectedReportType.value,
      pitManagerId : pitManagerId.value,
      gameTableIds : JSON.stringify(gameTableIds.value),
      reporterId: playerId.value
    }
    console.log(gameId.value)
    const response = await axios.post("https://v8test.com/pit/manager/game/report", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log('Report Sending Success')
      gameTableIds.value = [];
      description.value = '';
      selectedReportType.value = '';
    } else {
      console.error('Response error', response.data.message);
      gameTableIds.value = [];
      description.value = '';
      selectedReportType.value = '';
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

const playerIndex = ref()
const setIndex = (index) =>{
  playerIndex.value = index
}

//Participant Player List --------------------------------------------------------------------------------------------->
//Player 버튼을 누르면 나오는 테이블의 테이블 데이터를 받아오는 API
const playerTableData = ref([])
const playerSearch =ref('')
const fetchPlayerList = async () => {
  console.log(Page.value,length.value,gameId.value)
  try {
    const data = {
      page : Page.value,
      length : length.value,
      searchoption : "name",
      search : playerSearch.value,
      gameId : gameId.value
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
const handlePlayerInfo = async (index) => {
  if (video_info.value[index] && video_info.value[index].games_id) {
    gameId.value = video_info.value[index].games_id;
    await fetchPlayerList();
  } else {
    console.error("No games_id available for index", index);
  }
};

//Live Monitoring Close Button ---------------------------------------------------------------------------------------->
const CloseLiveMonitoring = async () => {
  try {
    const data = {
      pitManagerId: pitManagerId.value
    }
    console.log(gameId.value)
    const response = await axios.post("https://v8test.com/pit/manager/game/live/monitoring/close", {
      data: security.encrypt(querystring.stringify(data)),
    });
    if (response.data.status === 'success') {
      console.log("Close Success")
      gameId.value = '';
      router.push({ name: 'MainPage' });
    } else {
      console.error('Response error', response.data.message);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// window.addEventListener('beforeunload', async (event) => {
//   event.preventDefault();
//   await CloseLiveMonitoring();
// });

//Report Type List ---------------------------------------------------------------------------------------------------->
const reportType = ref([])
const selectedReportType = ref('')
const fetchReportType = async () => {
  try {
    const data = {}
    console.log(gameId.value)
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



//Live Video Streaming ----------------------------------------------------------------------------------------------->
let stages = []; //여러개 생성해야 해서 수정
let joining = []; //여러개 생성해야 해서 수정
let connected = []; //여러개 생성해야 해서 수정
async function joinStage(index) {
  console.log("START : Video" + (index + 1));
  if (connected[index] || joining[index]) {
    console.log("FAIL: Video" + (index + 1));
    return;
  }

  joining[index] = true;

  const token = video_info.value[index].subscribe_token;
  if (!token) {
    window.alert("Please enter a participant token for video " + (index + 1));
    joining[index] = false;
    return;
  }

  const strategy = {
    stageStreamsToPublish() {
      return [];
    },
    shouldPublishParticipant() {
      return true;
    },
    shouldSubscribeToParticipant() {
      return SubscribeType.AUDIO_VIDEO;
    }
  };

  stages[index] = new Stage(token, strategy);

  stages[index].on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (participant, streams) => {
    let streamsToDisplay = streams;
    const videoEl = document.getElementById(`ivsRealStreamingVideoView${index + 1}`);
    videoEl.srcObject = new MediaStream();
    videoEl.muted = true;
    streamsToDisplay.forEach(stream => videoEl.srcObject.addTrack(stream.mediaStreamTrack));
  });

  try {
    await stages[index].join();
    connected[index] = true;
  } catch (err) {
    joining[index] = false;
    connected[index] = false;
    console.error(err.message);
  } finally {
    joining[index] = false;
  }
}

async function reJoinStage(index) {
  console.log("START : Video" + (index + 1));
  if (connected[index] || joining[index]) {
    console.log("FAIL: Video" + (index + 1));
    return;
  }

  joining[index] = true;

  const token = video_info.value[index].subscribe_token;
  if (!token) {
    window.alert("Please enter a participant token for video " + (index + 1));
    joining[index] = false;
    return;
  }

  const strategy = {
    stageStreamsToPublish() {
      return [];
    },
    shouldPublishParticipant() {
      return true;
    },
    shouldSubscribeToParticipant() {
      return SubscribeType.AUDIO_VIDEO;
    }
  };

  stages[index] = new Stage(token, strategy);

  stages[index].on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (participant, streams) => {
    let streamsToDisplay = streams;
    const videoEl = document.getElementById(`ivsRealStreamingVideoView${index + 5}`);
    videoEl.srcObject = new MediaStream();
    videoEl.muted = true;
    streamsToDisplay.forEach(stream => videoEl.srcObject.addTrack(stream.mediaStreamTrack));
  });

  try {
    await stages[index].join();
    connected[index] = true;
  } catch (err) {
    joining[index] = false;
    connected[index] = false;
    console.error(err.message);
  } finally {
    joining[index] = false;
  }
}


const leaveStage = async (index) => {
  stages[index].leave();
  joining[index] = false;
  connected[index] = false;
}


// fetchData 함수가 실행 되고 난 뒤에 받아온 토큰의 개수만큼 라이브 비디오 재생 함수 실행 -> 객체 생성
async function initiateAllStreams() {
  await fetchData();

  for (let i = 0; i < video_info.value.length; i++) {
    joining[i] = false;
    connected[i] = false;
    await joinStage(i);
  }
}

const toggleFullscreen = async (index) => {
  await leaveStage(index);
  await reJoinStage(index);
}

const closeFullscreen = async (index) => {
  await leaveStage(index);
  await joinStage(index)
}
//macro -------------------------------------------------------------------------------------------------------------->
const dealerMacro = async (index) => {
  await fetchDealerInfo();
  await handleDealerInfo(index);
  await handleTableClick(index);
  setReportTarget('DEALER');
}

const playerMacro = async (index) => {
  await handlePlayerInfo(index);
  setReportTarget('USER');
  setIndex(index)
}

// Debounce ---------------------------------------------------------------------------------------------------------->
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

onMounted(() => {
  fetchReportType();
  initiateAllStreams();
});


const store = useStore();
const toggleDefaultLayout = () => store.commit("toggleDefaultLayout");
onBeforeMount(() => {
  store.state.hideConfigButton = true;
  toggleDefaultLayout();
  document.getElementsByTagName("body")[0].classList.remove("bg-gray-100");
});
onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  toggleDefaultLayout();
});

const clearReportData = () => {
  gameTableIds.value = [];
  description.value = '';
  selectedReportType.value = '';
}
</script>

<template>
  <div class="container-fluid" style="margin: 0">
    <button class="btn gray-btn" @click="CloseLiveMonitoring()">
      Close Video
    </button>
  </div>
  <main class="main-content mt-0 main-content-bg" style="background-color: #222222">
    <div class="container-fluid min-vh-100 page-header">
      <section class="layout">
        <div class="left-up">
          <div class="title">
            Dealer Info
          </div>
          <div class="inner-info">
            <div class="form-group">
              <label for="dealerName" style="color: white">Dealer Name</label>
              <input
                  id="dealerName" v-model="DealerInfo.dealer_name" type="text" class="form-control"
                  disabled>
            </div>
            <div class="form-group">
              <label for="win-loss-rate" style="color: white">Win/Loss Rate</label>
              <input
                  id="win-loss-rate" v-model="DealerInfo.dealer_win_loss_rate" type="text" class="form-control"
                  disabled>
            </div>
            <div class="form-group">
              <label for="tableCount" style="color: white">GameTable Count</label>
              <input
                  id="tableCount" v-model="DealerInfo.dealer_game_table_count" type="text" class="form-control"
                  disabled>
            </div>
          </div>
        </div>

        <div class="center-up-left video-container">
          <div class="video-wrapper">
            <video id="ivsRealStreamingVideoView1" style="width: 100%; height: 100%" class="videoTag" autoplay muted></video>
            <div class="video-controls">
              <div class="video-mode">
                <button class="video-button play-back" @click="handleTableClick(0)" data-bs-toggle="modal" data-bs-target="#playBackModal">Play/Back</button>
                <button class="video-button dealer" @click="dealerMacro(0)" data-bs-toggle="modal" data-bs-target="#dealerModal">Dealer</button>
                <button class="video-button player" @click="playerMacro(0)" data-bs-toggle="modal" data-bs-target="#playerModal">Player</button>
                <button class="video-button report">Report(no-usage)</button>
              </div>
              <div class="video-info">
                <button class="video-button info1" @click="handleInfoClick(0)">
                  <i class="fa-solid fa-circle-info"></i>
                </button>
              </div>
            </div>
            <div class="video-footer">
              <button class="footer-button save" @click="handleTableClick(0)" data-bs-toggle="modal" data-bs-target="#saveVideoModal">
                <i class="fa-regular fa-floppy-disk"></i>
              </button>
              <button class="footer-button fullscreen" @click="toggleFullscreen(0)" data-bs-toggle="modal" data-bs-target="#videoLarge1">
                <i class="fa-solid fa-up-right-and-down-left-from-center" style="color: #ffffff;"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="center-up-right video-container">
          <div class="video-wrapper">
            <video id="ivsRealStreamingVideoView2" style="width: 100%; height: 100%" class="videoTag" autoplay muted></video>
            <div class="video-controls">
              <div class="video-mode">
                <button class="video-button play-back" @click="handleTableClick(1)" data-bs-toggle="modal" data-bs-target="#playBackModal">Play/Back</button>
                <button class="video-button dealer" @click="dealerMacro(1)" data-bs-toggle="modal" data-bs-target="#dealerModal">Dealer</button>
                <button class="video-button player" @click="playerMacro(1)" data-bs-toggle="modal" data-bs-target="#playerModal">Player</button>
                <button class="video-button report">Report(no-usage)</button>
              </div>
              <div class="video-info2">
                <button class="video-button info" @click="handleInfoClick(1)">
                  <i class="fa-solid fa-circle-info"></i>
                </button>
              </div>
            </div>
            <div class="video-footer">
              <button class="footer-button save" @click="handleTableClick(1)" data-bs-toggle="modal" data-bs-target="#saveVideoModal">
                <i class="fa-regular fa-floppy-disk"></i>
              </button>
              <button class="footer-button fullscreen" @click="toggleFullscreen(1)" data-bs-toggle="modal" data-bs-target="#videoLarge2">
                <i class="fa-solid fa-up-right-and-down-left-from-center" style="color: #ffffff;"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="right-up">
          <div class="title">
            Margin
          </div>
          <div class="inner-info">
            <div v-for="(table, index) in GameTableInfo" :key="index" class="card info-lot" style="color: black; padding: 10px">
              <p>Table: {{ table.game_tables_id }}</p>
              <p>Margin: {{ table.game_table_margin }} ({{(table.game_table_margin_coin).toLocaleString()}})</p>
            </div>
          </div>
        </div>
        <div class="left-down">
          <div class="title">
            Player Info
          </div>
          <div class="inner-info">
            <div v-for="(user, index) in UserInfo" :key="index" class="card info-lot" style="color: black">
              <p>User Name: {{ user.user_name }}</p>
              <p>Betting Count: {{ user.user_betting_count }}</p>
              <p>Loss Rate: {{ user.user_loss_rate }}</p>
              <p>Margin: {{ user.user_margin }}</p>
              <p>Margin Cash: {{ (user.user_margin_cash).toLocaleString() }}</p>
              <p>Win Rate: {{ user.user_win_rate }}</p>
            </div>
          </div>
        </div>
        <div class="center-down-left video-container">
          <div class="video-wrapper">
            <video id="ivsRealStreamingVideoView3" style="width: 100%; height: 100%" class="videoTag" autoplay
                   muted></video>
            <div class="video-controls">
              <div class="video-mode">
                <button class="video-button play-back" @click="handleTableClick(2)" data-bs-toggle="modal"
                        data-bs-target="#playBackModal">Play/Back
                </button>
                <button class="video-button dealer" @click="dealerMacro(2)" data-bs-toggle="modal" data-bs-target="#dealerModal">Dealer</button>
                <button class="video-button player" @click="playerMacro(2)" data-bs-toggle="modal" data-bs-target="#playerModal">Player</button>
                <button class="video-button report">Report(no-usage)</button>
              </div>
              <div class="video-info3" @click="handleInfoClick(2)">
                <button class="video-button info">
                  <i class="fa-solid fa-circle-info"></i>
                </button>
              </div>
            </div>
            <div class="video-footer">
              <button class="footer-button save" @click="handleTableClick(2)" data-bs-toggle="modal" data-bs-target="#saveVideoModal">
                <i class="fa-regular fa-floppy-disk"></i>
              </button>
              <button class="footer-button fullscreen" @click="toggleFullscreen(2)" data-bs-toggle="modal" data-bs-target="#videoLarge3">
                <i class="fa-solid fa-up-right-and-down-left-from-center" style="color: #ffffff;"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="center-down-right video-container">
          <div class="video-wrapper">
            <video id="ivsRealStreamingVideoView4" style="width: 100%; height: 100%" class="videoTag" autoplay muted></video>
            <div class="video-controls">
              <div class="video-mode">
                <button class="video-button play-back" @click="handleTableClick(3)" data-bs-toggle="modal" data-bs-target="#playBackModal">Play/Back</button>
                <button class="video-button dealer" @click="dealerMacro(3)" data-bs-toggle="modal" data-bs-target="#dealerModal">Dealer</button>
                <button class="video-button player" @click="playerMacro(3)" data-bs-toggle="modal" data-bs-target="#playerModal">Player</button>
                <button class="video-button report">Report(no-usage)</button>
              </div>
              <div class="video-info4" @click="handleInfoClick(3)">
                <button class="video-button info">
                  <i class="fa-solid fa-circle-info"></i>
                </button>
              </div>
            </div>
            <div class="video-footer">
              <button class="footer-button save" @click="handleTableClick(3)" data-bs-toggle="modal" data-bs-target="#saveVideoModal">
                <i class="fa-regular fa-floppy-disk"></i>
              </button>
              <button class="footer-button fullscreen" @click="toggleFullscreen(3)" data-bs-toggle="modal" data-bs-target="#videoLarge4">
                <i class="fa-solid fa-up-right-and-down-left-from-center" style="color: #ffffff;"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="right-down">
          <div class="title">
            Win/Loss History
          </div>
          <div class="inner-info">
            <div v-for="(table, index) in GameTableInfo" :key="index" class="card info-lot" style="color: black; padding: 10px">
              <p>Table: {{ table.game_tables_id }}</p>
              <p>Win: {{ table.game_table_win_rate }}</p>
              <p>Loss: {{ table.game_table_loss_rate }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>


  <!-- ----- ----- ----- ----- ----- ----- ----- ----- MODALS ----- ----- ----- ----- ----- ----- ----- ----- ----- -->

  <!--  Video Size Up Modal-->
  <div id="videoLarge1" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <video id="ivsRealStreamingVideoView5" style="width: 100%; height: 100%" class="videoTag" autoplay muted></video>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn bg-gradient-secondary btn-sm" @click="closeFullscreen(0)" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  <div id="videoLarge2" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <video id="ivsRealStreamingVideoView6" style="width: 100%; height: 100%" class="videoTag" autoplay muted></video>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn bg-gradient-secondary btn-sm" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  <div id="videoLarge3" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <video id="ivsRealStreamingVideoView7" style="width: 100%; height: 100%" class="videoTag" autoplay muted></video>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn bg-gradient-secondary btn-sm" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  <div id="videoLarge4" class="modal fade" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl  modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-body">
          <video id="ivsRealStreamingVideoView8" style="width: 100%; height: 100%" class="videoTag" autoplay muted></video>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn bg-gradient-secondary btn-sm" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!--  PlayBack Modal -->
  <div id="playBackModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl-custom  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Play Back Game Video List</h2>
            </div>
            <div class="data-table-body">
              <div class="table-area">
                <div class="table-header">
                  <div class="dropdownMenu">
                    <el-select v-model="length" size="large" placeholder="Select rows per page" @change="fetchLiveVideoPlayBackInfo">
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
                  <el-table-column prop="game_name" label="Game Name"></el-table-column>
                  <el-table-column prop="game_tables_id" label="Game Table"></el-table-column>
                  <el-table-column label="Dealer">
                    <template v-slot="{row}">
                      {{ row.total_betting_user_count }}명
                    </template>
                  </el-table-column>
                  <el-table-column label="ETC">
                    <template #default="{row}">
                      <button class="btn btn-success videoBtn" @click="fetchVideoView(row.game_tables_id)"
                              data-bs-toggle="modal" data-bs-target="#videoViewModal">
                        View
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
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 5px">
          <button class="gray-btn red-btn" style="width: 100%" data-bs-dismiss="modal">
            <span class="text">Close</span></button>
        </div>
      </div>
    </div>
  </div>

  <div id="videoViewModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl-custom  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Video</h2>
            </div>
            <div class="card-body">
              <video :src=videoUrl controls width="100%"></video>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" @click="clearReportData()" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn green-btn" style=" border-radius: 5px" data-bs-toggle="modal" data-bs-target="#videoDescModal">
              <span class="text">Description</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="videoDescModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Save Video</h2>
            </div>
            <div class="card-body">
              <textarea id="reason" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" @click="clearReportData()" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn green-btn" style=" border-radius: 5px" @click="SendVideoDescription()" data-bs-toggle="modal" data-bs-target="#playBackModal">
              <span class="text">Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!--  SaveVideo Modal -->
  <div id="saveVideoModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Save Video</h2>
            </div>
            <div class="card-body">
              <div class="name">
                Game Name : {{tableData.game_name}}
              </div>
              <div class="select-game">
                <el-select placeholder="Select a game table" @change="addTable">
                  <el-option
                      v-for="item in tableData"
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
              <div class="description-area">
              <textarea id="reason" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="width: 100%; padding: 5px" >
          <button class="gray-btn green-btn" style=" border-radius: 5px" @click="SendVideoDescription(), description = ''" data-bs-dismiss="modal">
            <span class="text">Send</span></button>
        </div>
      </div>
    </div>
  </div>


  <!--  Dealer Modal -->
  <div id="dealerModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Dealer</h2>
            </div>
            <div class="card-body" style="display: flex; justify-content: center">
              <div class="dealer-info">
                <img src="../../assets/Dummyfolder/dealer_img.jpg" alt="dealer_img" style="width: 300px">
                <div style="margin-top: 10px">
                  Name : {{dealerInfo.dealer_name}}
                </div>
                <div>
                  Win/Loss : {{dealerInfo.dealer_total_game_table_win_rate}}% / {{dealerInfo.dealer_total_game_table_loss_rate}}%
                </div>
                <div>
                  Table : {{dealerInfo.dealer_total_game_table_count}}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn green-btn" style=" border-radius: 5px"  data-bs-toggle="modal" data-bs-target="#dealerReportModal">
              <span class="text">Report</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="dealerReportModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Report</h2>
            </div>
            <div class="card-body">
              <div class="name" v-if="tableData.length > 0" >
                Game Name : {{tableData[0].game_name}}
              </div>
              <div class="name" v-if="tableData.length > 0 " >
                Dealer Name : {{tableData[0].dealer_name}}
              </div>
              <div class="name" v-if="playerName" >
                User Name : {{playerName}}
              </div>
              <div class="select-type" style="margin: 10px 0">
                <el-select placeholder="Select a Report Type" v-model="selectedReportType">
                  <el-option
                      v-for="item in reportType"
                      :key="item.type"
                      :label="item.type"
                      :value="item.pit_manager_game_report_types_id">
                  </el-option>
                </el-select>
              </div>
              <div class="select-game" style="margin: 10px 0">
                <el-select placeholder="Select a game table" @change="addTable">
                  <el-option
                      v-for="item in tableData"
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
              <div class="description-area" style="margin: 10px 0">
              <textarea id="reason" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" @click="clearReportData()" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn green-btn" style=" border-radius: 5px" @click="sendDealerReport(),playerName =''" data-bs-dismiss="modal" >
              <span class="text">Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="playerModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl-custom  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Participant Player List</h2>
            </div>
            <div class="data-table-body">
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
                      <button class="btn btn-success " data-bs-toggle="modal" data-bs-target="#PlayerReportModal" @click="setPlayerInfo(row.users_id, row.user_name),handleTableClick(playerIndex)">
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
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 5px">
          <button class="gray-btn red-btn" style="width: 100%" data-bs-dismiss="modal">
            <span class="text">Close</span></button>
        </div>
      </div>
    </div>
  </div>

  <div id="PlayerReportModal" class="modal fade" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-md  modal-dialog-centered">
      <div class="modal-content">
        <div class="body">
          <div class="card">
            <div class="modal-header" style="display: flex; justify-content: center; padding: 10px 0 20px 0;">
              <h2 class="mb-0" style="color: #444444">Report</h2>
            </div>
            <div class="card-body">
              <div class="name" v-if="tableData.length > 0" >
                Game Name : {{tableData[0].game_name}}
              </div>
              <div class="name" v-if="playerName" >
                User Name : {{playerName}}
              </div>
              <div class="select-type" style="margin: 10px 0">
                <el-select placeholder="Select a Report Type" v-model="selectedReportType">
                  <el-option
                      v-for="item in reportType"
                      :key="item.type"
                      :label="item.type"
                      :value="item.pit_manager_game_report_types_id">
                  </el-option>
                </el-select>
              </div>
              <div class="select-game" style="margin: 10px 0">
                <el-select placeholder="Select a game table" @change="addTable">
                  <el-option
                      v-for="item in tableData"
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
              <div class="description-area" style="margin: 10px 0">
              <textarea id="reason" v-model="description" name="reason" rows="6"
                        style="width: 100%; padding: 10px; box-sizing: border-box;"
                        placeholder="Write a Description"></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="mf" style="display: flex">
          <div class="modal-footer" style="width: 50%; padding: 5px; border-right: 0.5px solid #999999; border-bottom-right-radius: 0;">
            <button class="gray-btn" style="border-radius: 5px" @click="clearReportData()" data-bs-dismiss="modal">
              <span class="text">close</span></button>
          </div>
          <div class="modal-footer" style="width: 50%; padding: 5px" >
            <button class="gray-btn green-btn" style=" border-radius: 5px" @click="sendPlayerReport(),playerName =''" data-bs-dismiss="modal">
              <span class="text">Send</span></button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.main-content{
  display: flex;
  justify-content: center;
  align-items: center;
}
.container-fluid{
  margin-top:5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.layout {
  width: 2000px;
  height: 1210px;

  display: grid;
  grid:
    "left-up center-up-left center-up-right right-up" 1fr
    "left-down center-down-left center-down-right right-down" 1fr
    / 1.5fr 3.5fr 3.5fr 1.5fr;
  gap: 8px;
}

.left-up {
  grid-area: left-up;
  background-color: #777777;
  padding: 0 10px;
  position: relative;
}
.center-up-left {
  grid-area: center-up-left;
  background-color: #444444;
}
.center-up-right {
  grid-area: center-up-right;
  background-color: #444444;
}
.right-up {
  grid-area: right-up;
  background-color: #777777;
  padding: 0 10px;
  overflow-y: scroll;
  position: relative;
}
.left-down {
  grid-area: left-down;
  background-color: #777777;
  padding: 0 10px;
  overflow-y: scroll;
  position: relative;
}
.center-down-left {
  grid-area: center-down-left;
  background-color: #444444;
}
.center-down-right {
  grid-area: center-down-right;
  background-color: #444444;
}
.right-down {
  grid-area: right-down;
  background-color: #777777;
  padding: 0 10px;
  overflow-y: scroll;
  position: relative;
}

.modal-xl-custom {
  max-width: 800px;
  width: 90%;
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

}
.el-pagination{
  float: right;
}

.container-fluid{
  margin: 5rem;
}
.title{
  text-align: center;
  color: white;
  font-size: 1.2rem;
  position: sticky;
  top: 0;
  background: #777777;
  z-index: 10;
  padding: 10px;
}

.info-lot{
  margin: 10px 0;
  padding: 10px;
  background-color: whitesmoke;
}

.first-row{
  margin-bottom: 10px;
}
/*Video-Overlay*/
.video-container {
  position: relative;
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-controls {
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: space-between;
  pointer-events: auto;
  background-color: rgba(0, 0, 0, 0.5);

}
.video-footer{
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: right;
  pointer-events: auto;
  background-color: rgba(0, 0, 0, 0.5);
}


.video-controls {
  top: 3px;
}

.video-footer {
  bottom: 3px;
}

.video-button {
  background-color: rgba(0, 0, 0, 0);
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: bold;
  font-size: 0.9rem;
}
.footer-button{
  background-color: rgba(0, 0, 0, 0);
  color: white;
  border: none;
  padding: 8px 16px;
  font-weight: bold;
  font-size: 0.9rem;
}
.video-button:hover, .footer-button:hover {
  background-color: rgba(0, 0, 0, 1);
  color: #e60000;
  font-weight: bold;
  transition-duration: .5s;
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
.blue-btn {
  color: #1E90FF;
  background-color: #FFFFFF;
}

.blue-btn:hover {
  color: #FFFFFF;
  background-color: #1E90FF;
}
.red-btn {
  color: crimson;
  background-color: #FFFFFF;
}

.red-btn:hover {
  color: #FFFFFF;
  background-color: crimson;
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