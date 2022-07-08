<script setup>
import { ref, reactive, onMounted, computed, getCurrentInstance } from "vue";

import SingleMap from "./components/Map.vue";

import XlsMapImg from "./assets/img/maps/xinglongshan.jpg";
import ZxMapImg from "./assets/img/maps/zhongxin.jpg";
import BtqMapImg from "./assets/img/maps/baotuquan.jpg";
import HjlMapImg from "./assets/img/maps/hongjialou.jpg";
import QdMapImg from "./assets/img/maps/qingdao.jpg";
import WhMapImg from "./assets/img/maps/weihai.jpg";
import RjyMapImg from "./assets/img/maps/ruanjianyuan.jpg";
import QfsMapImg from "./assets/img/maps/qianfoshan.jpg";

import markersRaw from "./assets/json/markers.json";

import informationList from "./assets/json/information.json";

let internalInstance = getCurrentInstance();
let cookies = internalInstance.appContext.config.globalProperties.$cookies;

const markers = reactive(markersRaw);
const information = reactive(informationList);

//data
const campus = reactive([
    // 校区列表
    {
        id: 1, // 校区编号
        campus: "中心校区", // 校区名称
        status: true, // 校区状态（激活/未激活），默认true为激活，false为未激活。校区状态影响按钮的UI风格
        map: {
            imgUrl: ZxMapImg,
            size: [2751, 3507],
            markers: markers.zhongxin,
        },
    },
    {
        id: 2,
        campus: "趵突泉校区",
        status: true,
        map: {
            imgUrl: BtqMapImg,
            size: [2847, 3507],
            markers: markers.baotuquan,
        },
    },
    {
        id: 3,
        campus: "洪家楼校区",
        status: true,
        map: {
            imgUrl: HjlMapImg,
            size: [3591, 3507],
            markers: markers.hongjialou,
        },
    },
    {
        id: 4,
        campus: "兴隆山校区",
        status: true,
        map: {
            imgUrl: XlsMapImg,
            size: [3582, 3507],
            markers: markers.xinglongshan,
        },
    },
    {
        id: 5,
        campus: "千佛山校区",
        status: true,
        map: {
            imgUrl: QfsMapImg,
            size: [2862, 3507],
            markers: markers.qianfoshan,
        },
    },
    {
        id: 6,
        campus: "软件园校区",
        status: true,
        map: {
            imgUrl: RjyMapImg,
            size: [3645, 3507],
            markers: markers.ruanjianyuan,
        },
    },
    {
        id: 7,
        campus: "青岛校区",
        status: true,
        map: {
            imgUrl: QdMapImg,
            size: [2898, 3507],
            markers: markers.qingdao,
        },
    },
    {
        id: 8,
        campus: "威海校区",
        status: true,
        map: {
            imgUrl: WhMapImg,
            size: [3423, 3093],
            markers: markers.weihai,
        },
    },
]);
let showCampus = ref(false); //是否展示校区选择面板
const types = reactive([
    // 建筑类型列表
    {
        id: 1, // 类型编号
        type: "全部", // 类型名称
        status: true, //类型状态（激活/未激活），同校区状态
    },
    {
        id: 2,
        type: "教学楼",
        status: true,
    },
    {
        id: 3,
        type: "实验楼",
        status: true,
    },
    {
        id: 4,
        type: "宿舍楼",
        status: true,
    },
    {
        id: 5,
        type: "功能区",
        status: true,
    },
    {
        id: 6,
        type: "景观",
        status: true,
    },
]);

let showType = ref(false); // 是否展示建筑类型选择面板
let activeClassForCampus = ref(false); // 是否启用激活后对应的UI class for campus
let activeClassForType = ref(false); // 是否启用激活后对应的UI class for building type
let campusStorage = ref("1"); // 当前激活的校区编号，会从cookies读入
let typeStorage = ref("1"); // 当前激活的建筑类型编号，会从cookies读入
let selectedCampus = ref("中心校区"); // 当前激活的校区
let selectedType = ref("全部"); // 当前激活的建筑类型
let showCampusSelection = ref(true); // 是否显示校区选择按钮（在click搜索框后将隐藏）
let currentActiveBuildingId = ref("-");
let buildingList = ref(); // 建筑列表，【注意！】以下数据是随意填入，之后可从json读入数据
let showBuildingSelectionBoard = ref(false); //是否展示建筑选择弹窗，false为不展示
let showInformation = ref(false); // 是否展示详情弹窗，false为不展示
let active = ref(false); // 当任意弹窗被激活后，此属性被激活，此时可以click页面的任意位置关闭弹窗
let info = ref();
const mapCenter = ref(null);

const infoDisplayType = computed(() => {
    let res = "";
    switch (info.value.type) {
        case "2":
            res = "教学楼";
            break;
        case "3":
            res = "实验楼";
            break;
        case "4":
            res = "宿舍楼";
            break;
        case "5":
            res = "功能区";
            break;
        case "6":
            res = "景观";
            break;
        default:
            res = " 未知";
            break;
    }
    return res;
});

//methods
const changeCampus = () => {
    // 显示或隐藏校区选择弹窗
    showType.value = false;
    activeClassForType.value = false;
    showCampus.value = !showCampus.value;
    if (showCampus.value === true) {
        active.value = true;
    } else {
        active.value = false;
    }
    activeClassForCampus.value = !activeClassForCampus.value;
};

const changeType = () => {
    // 显示或隐藏建筑类型选择弹窗
    showCampus.value = false;
    activeClassForCampus.value = false;
    showType.value = !showType.value;
    if (showType.value === true) {
        active.value = true;
    } else {
        active.value = false;
    }
    activeClassForType.value = !activeClassForType.value;
};

const setCampus = (e) => {
    // 选择了某个校区执行的操作
    active.value = false;
    campusStorage.value = e.target.dataset.id;
    cookies.set("campus", campusStorage.value, -1); //设置cookies
    showCampus.value = false;
    activeClassForCampus.value = false;
    optionalCampus(); // 按照选择初始化校区
};

const setType = (e) => {
    // 选择了某个建筑类型后执行的操作
    active.value = false;
    typeStorage.value = e.target.dataset.id;
    cookies.set("type", typeStorage.value, -1); //设置cookies
    showType.value = false;
    activeClassForType.value = false;
    optionalType(); // 按照选择初始化建筑类型
};

const optionalCampus = () => {
    // 初始化校区，【注意】更改地图的代码可以在此
    for (let i = 0; i < 8; i++) {
        campus[i].status = true;
    }
    let campusStorageFromCookies = cookies.get("campus");
    if (
        campusStorageFromCookies === "" ||
        campusStorageFromCookies === null ||
        campusStorage === undefined
    ) {
        cookies.set("campus", 1, -1);
    } else {
        campusStorage.value = campusStorageFromCookies;
    }
    switch (campusStorage.value) {
        case "1":
            selectedCampus.value = "中心校区";
            campus[0].status = false;
            break;
        case "2":
            selectedCampus.value = "趵突泉校区";
            campus[1].status = false;
            break;
        case "3":
            selectedCampus.value = "洪家楼校区";
            campus[2].status = false;
            break;
        case "4":
            selectedCampus.value = "兴隆山校区";
            campus[3].status = false;
            break;
        case "5":
            selectedCampus.value = "千佛山校区";
            campus[4].status = false;
            break;
        case "6":
            selectedCampus.value = "软件园校区";
            campus[5].status = false;
            break;
        case "7":
            selectedCampus.value = "青岛校区";
            campus[6].status = false;
            break;
        case "8":
            selectedCampus.value = "威海校区";
            campus[7].status = false;
            break;
        default:
            selectedCampus.value = "中心校区";
            campus[0].status = false;
    }
    updateMarkers();
};

const optionalType = () => {
    // 初始化建筑类型
    for (let i = 0; i < 6; i++) {
        types[i].status = true;
    }
    let typeStorageFromCookies = cookies.get("type");
    if (
        typeStorageFromCookies === "" ||
        typeStorageFromCookies === null ||
        typeStorageFromCookies === undefined
    ) {
        cookies.set("type", 1, -1);
    } else {
        typeStorage.value = typeStorageFromCookies;
    }
    switch (typeStorage.value) {
        case "1":
            selectedType.value = "全部";
            types[0].status = false;
            break;
        case "2":
            selectedType.value = "教学楼";
            types[1].status = false;
            break;
        case "3":
            selectedType.value = "实验楼";
            types[2].status = false;
            break;
        case "4":
            selectedType.value = "宿舍楼";
            types[3].status = false;
            break;
        case "5":
            selectedType.value = "功能区";
            types[4].status = false;
            break;
        case "6":
            selectedType.value = "景观";
            types[5].status = false;
            break;
        default:
            selectedType.value = "全部";
            types[6].status = false;
    }
    updateMarkers();
};

const search = () => {
    // 搜索框click
    // blur
    active.value = !active.value;
    // 元素退场
    showCampusSelection.value = !showCampusSelection.value;
    // 改变宽度
    let changeWidth = document.getElementById("searchBox");
    if (showCampusSelection.value === false) {
        changeWidth.style.left = 4 + "vw";
        changeWidth.style.width = 95 + "vw";
    } else {
        changeWidth.style.left = 40 + "vw";
        changeWidth.style.width = 55 + "vw";
    }
    //唤起board
    showBuildingSelectionBoard.value = !showBuildingSelectionBoard.value;
};

const selectOneBuilding = (e) => {
    // 选择了一个建筑
    currentActiveBuildingId.value = e.target.dataset.id;
};

const cancel = () => {
    // 点击了取消按钮
    search();
};

const confirm = () => {
    // 点击了确认按钮
    search();
    for (var i = 0; i < buildingList.value.length; i++) {
        if (buildingList.value[i].id === currentActiveBuildingId.value) {
            mapCenter.value = buildingList.value[i].position;
            break;
        }
    }
};

const deActive = () => {
    // 点击了页面的任意位置，关闭弹窗，回到初始状态
    active.value = false;
    showBuildingSelectionBoard.value = false;
    showInformation.value = false;
    activeClassForCampus.value = false;
    activeClassForType.value = false;
    showType.value = false;
    showCampus.value = false;
    showCampusSelection.value = true;
    let changeWidth = document.getElementById("searchBox");
    changeWidth.style.left = 40 + "vw";
    changeWidth.style.width = 55 + "vw";
};

// 初始化地图
const initMap = () => {};

// 初始化标记
const initMarkers = () => {
    for (let campus in markers) {
        for (let marker of markers[campus]) {
            switch (parseInt(marker.type)) {
                case 2:
                    marker.color = "#B4E08D";
                    break;
                case 3:
                    marker.color = "#71C286";
                    break;
                case 4:
                    marker.color = "#5553A6";
                    break;
                case 5:
                    marker.color = "#FFA3CD";
                    break;
                case 6:
                    marker.color = "#FFEA9E";
                    break;
            }
            marker.hidden =
                typeStorage.value !== "1" &&
                typeStorage.value !== marker.type.toString();
        }
    }
};

// 更新标记显示状态
const updateMarkers = (id) => {
    for (let marker of campus[parseInt(campusStorage.value) - 1].map.markers) {
        marker.hidden =
            typeStorage.value !== "1" &&
            typeStorage.value !== marker.type.toString();
    }
    buildingList.value = campus[
        parseInt(campusStorage.value) - 1
    ].map.markers.filter((marker) => {
        return !marker.hidden;
    });
};

// 点击了标记
const markerClicked = (id) => {
    info.value = information[id];
    if (!info.value.type) {
        for (let x of buildingList.value) {
            if (x.id === id) {
                info.value.type = x.type;
            }
        }
    }
    active.value = !active.value;
    showInformation.value = true;
};

//生命周期钩子
onMounted(() => {
    optionalCampus();
    optionalType();
    initMap();
    initMarkers();
});
</script>

<template>
    <div class="cover" :class="{ coverActive: active }" @click="deActive"></div>
    <div id="container">
        <div id="head">
            <img src="./assets/img/ui/head.png" id="headBackground" />
            <img src="./assets/img/ui/SDUer.png" id="back" />
            <div id="title">{{ selectedCampus }}</div>
            <img src="./assets/img/ui/online.png" id="online" />
        </div>

        <div id="bar">
            <transition name="slide-in-out">
                <div
                    class="selectCampus"
                    :class="{ selectCampusActive: activeClassForCampus }"
                    v-if="showCampusSelection"
                >
                    <div @click="changeCampus">{{ selectedCampus }}</div>
                </div>
            </transition>
            <transition name="slide-fade">
                <div
                    id="selectCampusPanel"
                    class="panel"
                    v-show="showCampus"
                    key="box"
                >
                    <div
                        v-for="item in campus"
                        :key="item.id"
                        :id="'campus' + item.id"
                        @click="setCampus"
                        :data-id="item.id"
                        class="selectCampusPanelDiv"
                        :class="{ selectCampusPanelDivActive: item.status }"
                    >
                        {{ item.campus }}
                    </div>
                </div>
            </transition>

            <transition name="slide-fade">
                <div
                    id="selectBuildingTypePanel"
                    class="panel"
                    v-show="showType"
                    key="box"
                >
                    <div
                        v-for="item in types"
                        :key="item.id"
                        :id="'type' + item.id"
                        @click="setType"
                        :data-id="item.id"
                        class="selectBuildingTypePanelDiv"
                        :class="{
                            selectBuildingTypePanelDivActive: item.status,
                        }"
                    >
                        {{ item.type }}
                    </div>
                </div>
            </transition>

            <div id="searchBox">
                <div
                    class="selectBuildingType"
                    @click="changeType"
                    :class="{ selectBuildingTypeActive: activeClassForType }"
                >
                    {{ selectedType }}
                </div>
                <div id="search" @click="search">
                    <img src="./assets/img/ui/search.png" />
                </div>
            </div>
        </div>
        <transition name="board-in-out">
            <div id="searchBoard" v-if="showBuildingSelectionBoard">
                <div id="buttonGroup">
                    <div class="button" id="cancel" @click="cancel">取消</div>
                    <div class="button" id="confirm" @click="confirm">确定</div>
                </div>
                <div id="buildingGroup">
                    <div
                        class="building"
                        v-for="item in buildingList"
                        :key="item.id"
                        :class="{
                            buildingActive: item.id === currentActiveBuildingId,
                        }"
                        @click="selectOneBuilding"
                        :data-id="item.id"
                    >
                        {{ item.name }}
                    </div>
                </div>
            </div>
        </transition>

        <transition name="board-in-out">
            <div id="information" v-if="showInformation">
                <div id="buildingName">
                    <div id="chineseName">{{ info.ChineseName }}</div>
                    <div id="englishName">{{ info.EnglishName }}</div>
                </div>
                <div id="clock" class="function">
                    <img src="./assets/img/ui/clock.png" />
                    <div>{{ info.time }}</div>
                </div>
                <div id="position" class="function">
                    <img src="./assets/img/ui/location.png" />
                    <div>{{ infoDisplayType }}</div>
                </div>
            </div>
        </transition>

        <div :class="{ blur: active }" id="map">
            <template v-for="i of campus">
                <Transition name="board-in-out">
                    <single-map
                        :center="mapCenter"
                        class="map"
                        v-if="!i.status"
                        :size="i.map.size"
                        :img-url="i.map.imgUrl"
                        :zoom="3"
                        :markers="i.map.markers"
                        @marker-click="markerClicked"
                    >
                    </single-map>
                </Transition>
            </template>
        </div>
    </div>
</template>

<style>
.cover {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: -2000;
    left: 0;
    top: 0;
}

.coverActive {
    width: 100vw;
    height: 100vh;
    position: fixed;
    z-index: 500;
    left: 0;
    top: 0;
}

.blur {
    filter: blur(5px);
}

#head {
    text-align: center;
    /* margin-top: 0.5%; */
    margin-bottom: 0.5%;
    position: fixed;
    top: 0;
    z-index: 1000;
    display: block;
    width: 100%;
    height: 3rem;
}

#headBackground {
    width: 100%;
    height: 100%;
}

#map {
    position: fixed;
    top: 3rem;
    display: block;
    width: 100%;
    height: 100%;
}

#map .map {
    height: 100%;
}

#back {
    position: absolute;
    left: 5%;
    top: 50%;
    transform: translateY(-50%);
    width: 2rem;
}

#online {
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    width: 2rem;
}

#title {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    height: 3rem;
    line-height: 3rem;
    display: inline-block;
}

#bar {
    height: 3rem;
    display: block;
    width: 95%;
    position: fixed;
    top: 3.5rem;
    left: 50%;
    transform: translateX(-50%);
    background-color: white;
    z-index: 1000;
    border-radius: 15px;
}

.selectCampus {
    width: 35%;
    text-align: center;
    background-color: #d3c3a8;
    height: 60%;
    border-radius: 12.5px;
    border-color: #d3c3a8;
    border-width: 2px;
    border-style: solid;
    font-weight: bold;
    color: white;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 3%;
}

.selectCampusActive {
    width: 35%;
    text-align: center;
    background-color: white;
    height: 60%;
    border-radius: 12.5px;
    border-color: #d3c3a8;
    border-width: 2px;
    border-style: solid;
    font-weight: bold;
    color: #d3c3a8;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 3%;
}

.selectCampus div {
    height: 100%;
    line-height: 1.8rem;
    font-size: 1rem;
}

#selectCampusPanel {
    display: grid;
    grid-template-rows: auto auto auto;
    grid-template-columns: auto auto auto;
    grid-gap: 0.5rem;
    position: absolute;
    top: 3.5rem;
    background-color: white;
    width: 95.5%;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    text-align: center;
    border-radius: 15px;
}

.selectCampusPanelDiv {
    width: 100%;
    height: 4rem;
    line-height: 4rem;
    background-color: #d3c3a8;
    border-radius: 15px;
    color: white;
    font-weight: bold;
    /* padding: 0.5rem; */
}

.selectCampusPanelDivActive {
    width: 100%;
    height: 4rem;
    line-height: 4rem;
    background-color: white;
    border-radius: 15px;
    color: #d3c3a8;
    font-weight: bold;
    border-width: 2px;
    border-style: solid;
    border-color: #d3c3a8;
}

#selectBuildingTypePanel {
    display: grid;
    grid-template-rows: auto auto auto;
    grid-template-columns: auto auto;
    grid-gap: 0.5rem;
    position: absolute;
    top: 3.5rem;
    background-color: white;
    width: 95.5%;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    text-align: center;
    border-radius: 15px;
}

.selectBuildingTypePanelDiv {
    width: 100%;
    height: 4rem;
    line-height: 4rem;
    background-color: #d3c3a8;
    border-radius: 15px;
    color: white;
    font-weight: bold;
    /* padding: 0.5rem; */
}

.selectBuildingTypePanelDivActive {
    width: 100%;
    height: 4rem;
    line-height: 4rem;
    background-color: white;
    border-radius: 15px;
    color: #d3c3a8;
    font-weight: bold;
    border-width: 2px;
    border-style: solid;
    border-color: #d3c3a8;
}

#searchBox {
    width: 60%;
    height: 60%;
    position: relative;
    left: 42%;
    top: 50%;
    transform: translateY(-50%);
    transition-duration: 1s;
}

.selectBuildingType {
    width: 33%;
    height: 100%;
    text-align: center;
    line-height: 1.8rem;
    background-color: #d3c3a8;
    color: white;
    font-weight: bold;
    border-radius: 12.5px;
    border-color: #d3c3a8;
    border-width: 2px;
    border-style: solid;
    display: inline-block;
    /* position: absolute; */
}

.selectBuildingTypeActive {
    width: 33%;
    height: 100%;
    text-align: center;
    line-height: 1.8rem;
    background-color: white;
    color: #d3c3a8;
    font-weight: bold;
    border-radius: 12.5px;
    border-color: #d3c3a8;
    border-width: 2px;
    border-style: solid;
    display: inline-block;
    /* position: absolute; */
}

#search {
    display: inline-block;
    height: 100%;
    line-height: 1.8rem;
    width: 90%;
    border-color: #d3c3a8;
    border-width: 2px;
    border-style: solid;
    border-radius: 12.5px;
    position: absolute;
    left: 0;
    z-index: -1;
}

#search img {
    position: absolute;
    left: 60%;
    top: 50%;
    transform: translateY(-50%);
}

#searchBoard {
    width: 90vw;
    height: 40vh;
    background-color: #eee;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 20px;
    bottom: 2vh;
    z-index: 1000;
}

#buttonGroup {
    display: flex;
    justify-content: space-between;
    padding-left: 8vw;
    padding-right: 8vw;
    padding-top: 2vh;
    padding-bottom: 2vh;
}

.button {
    /* background-color: white; */
    width: 5.5rem;
    height: 1.5rem;
    line-height: 1.5rem;
    text-align: center;
    border-radius: 0.75rem;
    color: white;
}

#confirm {
    background-color: #d3c3a8;
}

#cancel {
    background-color: #888;
}

#buildingGroup {
    text-align: center;
    padding-left: 5vw;
    padding-right: 5vw;
    height: 80%;
    overflow: scroll;
}

.building {
    margin-top: 2vh;
    margin-bottom: 2vh;
    background-color: white;
    color: #d3c3a8;
    font-weight: bold;
    height: 3rem;
    line-height: 3rem;
    border-radius: 20px;
    border-width: 2px;
    border-style: solid;
    border-color: #d3c3a8;
}

.buildingActive {
    margin-top: 2vh;
    margin-bottom: 2vh;
    background-color: #d3c3a8;
    color: white;
    font-weight: bold;
    height: 3rem;
    line-height: 3rem;
    border-radius: 20px;
    border-width: 2px;
    border-style: solid;
    border-color: #d3c3a8;
}

#information {
    width: 90vw;
    /* height: 20vh; */
    background-color: #eee;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 20px;
    bottom: 2vh;
    z-index: 1500;
    padding-bottom: 2vh;
    padding-right: 2vh;
}

#buildingName {
    color: #d3c3a8;
    border-left: #d3c3a8 4px solid;
    padding-left: 1rem;
    margin-left: 2rem;
    margin-top: 2vh;
    font-weight: bold;
}

#chineseName {
    font-size: 1.5em;
}

#clock {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}

.function {
    margin-left: 2rem;
}

.function img {
    display: inline-block;
    margin-right: 0.5rem;
}

.function div {
    display: inline-block;
    color: #d3c3a8;
}

.slide-fade-enter-from {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-fade-enter-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.slide-in-out-enter-from,
.slide-in-out-leave-to {
    transform: translateX(-10px);
    opacity: 0;
}

.slide-in-out-enter-active,
.slide-in-out-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.board-in-out-enter-from,
.board-in-out-leave-to {
    transform: translateY(-10px);
    opacity: 0;
}

.board-in-out-enter-active,
.board-in-out-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
</style>
