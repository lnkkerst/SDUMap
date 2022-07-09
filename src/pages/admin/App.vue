<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import axios from "@/utils/axios";
import { useAlert } from "balm-ui";

import SingleMap from "@/components/Map.vue";

import campusList from "@/assets/js/campus.js";
import oldMarkers from "@/assets/js/oldMarkers.js";

const $alert = useAlert();

const uiState = reactive({
    title: computed(() => {
        return campusList[mapState.currentMapId - 1].name;
    }),
    dialog: {
        changeToken: {
            open: false,
            token: "",
            onConfirm: (res) => {
                if (res) {
                    localStorage.setItem(
                        "sdumap_admin_token",
                        uiState.dialog.changeToken.token
                    );
                    setTimeout(() => {
                        location.reload();
                    }, 200);
                } else {
                    setTimeout(() => {
                        uiState.dialog.changeToken.open = true;
                    }, 200);
                }
            },
        },
        settings: {
            open: false,
        },
        modifyMarker: {
            open: false,
            loading: false,
            withDeleteAction: false,
            marker: {
                name: "",
                englishName: "",
                type: 2,
                openTime: "",
                belongTo: computed(() => {
                    return mapState.currentMapId;
                }),
                position: [0, 0],
                extraInfo: "{}",
                tips: undefined,
            },
            markerId: "",
            typeOptions: [
                { label: "教学楼", value: 2 },
                { label: "实验楼", value: 3 },
                { label: "宿舍楼", value: 4 },
                { label: "功能区", value: 5 },
                { label: " 景观", value: 6 },
            ],
            onAdd: async () => {
                for (let x of ["name", "englishName", "openTime"]) {
                    if (uiState.dialog.modifyMarker.marker[x].length === 0) {
                        $alert("请完整填写信息！");
                        return;
                    }
                }
                uiState.dialog.modifyMarker.loading = true;
                const submitMarker = { ...uiState.dialog.modifyMarker.marker };
                submitMarker.position = JSON.stringify(submitMarker.position);
                try {
                    if (!uiState.dialog.modifyMarker.withDeleteAction) {
                        const res = await axios.put("/marker", submitMarker);
                    } else {
                        const res = await axios.post("/marker", {
                            id: uiState.dialog.modifyMarker.markerId,
                            data: submitMarker,
                        });
                    }
                    uiState.dialog.modifyMarker.open = false;
                    await updateMarkers();
                } catch (_e) {
                    $alert(`Error : ${_e.message}`);
                }
            },
            onDelete: async () => {
                uiState.dialog.modifyMarker.loading = true;
                try {
                    const res = await axios.delete("/marker", {
                        data: { id: uiState.dialog.modifyMarker.markerId },
                    });
                    uiState.dialog.modifyMarker.open = false;
                    await updateMarkers();
                } catch (_e) {
                    $alert(`Error : ${_e.message}`);
                }
            },
            onCancel: () => {
                uiState.dialog.modifyMarker.open = false;
            },
            onClose: () => {
                uiState.dialog.modifyMarker.withDeleteAction = false;
                uiState.dialog.modifyMarker.loading = false;
            },
        },
    },
    toolBarButton: {
        settings: {
            open: false,
            onClick: () => {
                uiState.dialog.settings.open = true;
            },
        },
        contact: {
            onClick: () => {
                $alert({
                    message: "呜呜",
                    buttonText: "去羞辱",
                    callback: () => {
                        window.open("mailto:1593510417@qq.com");
                    },
                });
            },
        },
        github: {
            onClick: () => {
                window.open("https://github.com/lnkkerst/SDUMap");
            },
        },
    },
});

const mapState = reactive({
    currentMapId: 1,
    currentMarkers: [],
    zoom: 4,
    size: computed(() => {
        return campusList[mapState.currentMapId - 1].map.size;
    }),
    markers: [],
    diffMarkers: [],
    showName: true,
    onlyDiff: false,
    loading: true,
    loadedMapImg: [],
    currentMarkers: computed(() => {
        if (mapState.loading) {
            return [];
        }
        if (mapState.onlyDiff) {
            return mapState.diffMarkers;
        }
        return mapState.markers;
    }),
});

const contextMenuItems = reactive([
    {
        text: "添加标记",
        callback: (val) => {
            uiState.dialog.modifyMarker.marker.position = val.coordinate;
            uiState.dialog.modifyMarker.open = true;
        },
    },
    "-",
]);

const updateMarkers = async () => {
    const res = await axios.get("/marker", {
        params: {
            belongTo: mapState.currentMapId,
        },
    });
    const markers = res.data.data;
    for (let x of markers) {
        x.position = JSON.parse(x.position);
    }
    mapState.markers = markers;
    const diffMarkers = [];
    const bn = new Map(),
        bo = new Map();
    for (let x of markers) {
        bn.set(x.id, x);
    }
    for (let x of oldMarkers[mapState.currentMapId]) {
        bo.set(x.id, x);
    }
    for (let x of bn.keys()) {
        if (!bo.has(x)) {
            diffMarkers.push({
                color: "green",
                ...bn.get(x),
            });
        }
    }
    for (let x of bo.keys()) {
        if (!bn.has(x)) {
            diffMarkers.push({
                color: "red",
                ...bo.get(x),
            });
        } else {
            let mo = bo.get(x),
                mn = bn.get(x);
            if (
                mo.name != mn.name ||
                mo.englishName != mn.englishName ||
                mo.extraInfo != mn.extraInfo ||
                mo.openTime != mn.openTime
            ) {
                let diff = "修改了什么呢？\n";
                if (mo.name !== mn.name) {
                    diff = diff.concat(`名称: ${mo.name} => ${mn.name}\n`);
                }
                if (mo.englishName !== mn.englishName) {
                    diff = diff.concat(
                        `英文名称: ${mo.englishName} => ${mn.englishName}\n`
                    );
                }
                if (mo.openTime !== mn.openTime) {
                    diff = diff.concat(
                        `开放时间: ${mo.openTime} => ${mn.openTime}\n`
                    );
                }
                if (mo.extraInfo !== mn.extraInfo) {
                    diff = diff.concat(
                        `附加信息: ${mo.extraInfo} => ${mn.extraInfo}\n`
                    );
                }
                diffMarkers.push({
                    color: "yellow",
                    ...bn.get(x),
                    tips: diff,
                });
            }
        }
    }
    mapState.diffMarkers = diffMarkers;
};

watch(
    () => mapState.currentMapId,
    async (newVal) => {
        mapState.loading = true;
        await updateMarkers();
        mapState.loading = false;
    }
);

watch(
    () => mapState.onlyDiff,
    (newVal) => {
        if (newVal) {
            $alert("提示: 红色为删除，绿色为新增，黄色为修改");
        }
    }
);

const onClickMarker = (id) => {
    uiState.dialog.modifyMarker.markerId = id;
    const curMarkers = mapState.onlyDiff
        ? mapState.diffMarkers
        : mapState.markers;
    for (let x of curMarkers) {
        if (x.id === id) {
            uiState.dialog.modifyMarker.marker.name = x.name;
            uiState.dialog.modifyMarker.marker.englishName = x.englishName;
            uiState.dialog.modifyMarker.marker.extraInfo = x.extraInfo;
            uiState.dialog.modifyMarker.marker.openTime = x.openTime;
            uiState.dialog.modifyMarker.marker.type = x.type;
            uiState.dialog.modifyMarker.marker.position = x.position;
            uiState.dialog.modifyMarker.marker.tips = x.tips;
            uiState.dialog.modifyMarker.withDeleteAction = true;
            uiState.dialog.modifyMarker.open = true;
            return;
        }
    }
};

onMounted(async () => {
    if (localStorage.getItem("sdumap_admin_token") === null) {
        uiState.dialog.changeToken.open = true;
    } else {
        await updateMarkers();
        campusList.forEach((campus) => {
            const img = new Image();
            img.src = campus.map.imgUrl;
            img.onload = () => {
                mapState.loadedMapImg.push(campus.name);
                if (mapState.loadedMapImg.length == campusList.length) {
                    mapState.loading = false;
                }
            };
        });
    }
});
</script>

<template>
    <ui-top-app-bar :type="2" nav-id="demo-menu" :title="uiState.title">
        <template #toolbar="{ toolbarItemClass }">
            <ui-icon-button
                v-tooltip="'修改设置'"
                aria-describedby="tooltip-demo-2"
                :class="toolbarItemClass"
                icon="settings"
                @click.prevent="uiState.toolBarButton.settings.onClick"
            ></ui-icon-button>
            <ui-icon-button
                v-tooltip="'去羞辱开发者'"
                aria-describedby="tooltip-demo-2"
                :class="toolbarItemClass"
                icon="contact_phone"
                @click.prevent="uiState.toolBarButton.contact.onClick"
            ></ui-icon-button>
            <ui-icon-button
                v-tooltip="'踩 github'"
                aria-describedby="tooltip-1"
                :class="toolbarItemClass"
                @click.prevent="uiState.toolBarButton.github.onClick"
            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
                    <path
                        d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
                    />
                </svg>
            </ui-icon-button>
        </template>
    </ui-top-app-bar>
    <ui-drawer nav-id="demo-menu" type="modal">
        <ui-drawer-header>
            <ui-drawer-title>选择校区</ui-drawer-title>
            <ui-drawer-subtitle>目前只收录了这些</ui-drawer-subtitle>
        </ui-drawer-header>
        <ui-drawer-content>
            <ui-nav>
                <template v-for="campus of campusList">
                    <ui-nav-item
                        @click.prevent="mapState.currentMapId = campus.id"
                        :active="mapState.currentMapId == campus.id"
                        >{{ campus.name }}</ui-nav-item
                    >
                </template>
                <ui-nav-item>{{ mapState.center }}</ui-nav-item>
            </ui-nav>
        </ui-drawer-content></ui-drawer
    >

    <ui-dialog
        v-model="uiState.dialog.changeToken.open"
        @confirm="uiState.dialog.changeToken.onConfirm"
    >
        <ui-dialog-title>请设置 Token</ui-dialog-title>
        <ui-dialog-content>
            <p :class="$tt('body2')">大概是和密码差不多的东西？:P</p>
            <ui-textfield fullwidth v-model="uiState.dialog.changeToken.token">
                Token
            </ui-textfield>
        </ui-dialog-content>
        <ui-dialog-actions></ui-dialog-actions>
    </ui-dialog>

    <ui-dialog
        v-model="uiState.dialog.settings.open"
        @confirm="uiState.dialog.settings.onConfirm"
    >
        <ui-dialog-title>修改设置</ui-dialog-title>
        <ui-dialog-content>
            <ui-divider style="margin-bottom: 1rem"></ui-divider>
            <div class="settings-item">
                <label for="basic-switch">只显示差异</label>
                <ui-switch
                    v-model="mapState.onlyDiff"
                    input-id="basic-switch"
                    :true-value="true"
                    :false-value="false"
                >
                </ui-switch>
            </div>
            <div class="settings-item">
                <label for="basic-switch">显示名称</label>
                <ui-switch
                    v-model="mapState.showName"
                    input-id="basic-switch"
                    :true-value="true"
                    :false-value="false"
                >
                </ui-switch>
            </div>
            <div
                style="display: flex; justify-content: center; margin-top: 1rem"
            >
                <ui-button
                    raised
                    @click.prevent="uiState.dialog.settings.open = false"
                >
                    确认
                </ui-button>
            </div>
        </ui-dialog-content>
    </ui-dialog>

    <ui-dialog
        v-model="uiState.dialog.modifyMarker.open"
        @confirm="uiState.dialog.modifyMarker.onConfirm"
        scrollable
        @close="uiState.dialog.modifyMarker.onClose"
        fullscreen
    >
        <ui-dialog-title>标记</ui-dialog-title>
        <ui-dialog-content>
            <ui-form type="|" item-margin-bottom="16" action-align="center">
                <template #default="{ subitemClass, actionClass }">
                    <ui-form-field class="required">
                        <label>名称</label>
                        <ui-textfield
                            fullwidth
                            v-model="uiState.dialog.modifyMarker.marker.name"
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field class="required">
                        <label>英文名称</label>
                        <ui-textfield
                            fullwidth
                            v-model="
                                uiState.dialog.modifyMarker.marker.englishName
                            "
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field class="required">
                        <label>坐标</label>
                        <ui-textfield fullwidth disabled>{{
                            uiState.dialog.modifyMarker.marker.position.map(
                                (x) => parseInt(x)
                            )
                        }}</ui-textfield>
                    </ui-form-field>
                    <ui-form-field>
                        <label>类型</label>
                        <ui-select
                            fullwidth
                            :options="uiState.dialog.modifyMarker.typeOptions"
                            v-model="uiState.dialog.modifyMarker.marker.type"
                        ></ui-select>
                    </ui-form-field>
                    <ui-form-field class="required">
                        <label>开放时间</label>
                        <ui-textfield
                            fullwidth
                            v-model="
                                uiState.dialog.modifyMarker.marker.openTime
                            "
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field>
                        <label>附加信息</label>
                        <ui-textfield
                            fullwidth
                            input-type="textarea"
                            rows="5"
                            v-model="
                                uiState.dialog.modifyMarker.marker.extraInfo
                            "
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field
                        v-show="uiState.dialog.modifyMarker.marker.tips"
                    >
                        <label>其它</label>
                        <ui-textfield
                            fullwidth
                            disabled
                            input-type="textarea"
                            rows="5"
                            v-model="uiState.dialog.modifyMarker.marker.tips"
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field
                        :class="actionClass"
                        v-show="
                            !uiState.dialog.modifyMarker.loading &&
                            !mapState.onlyDiff
                        "
                    >
                        <ui-button
                            raised
                            @click.prevent="uiState.dialog.modifyMarker.onAdd"
                            >提交</ui-button
                        >
                        <ui-button
                            outlined
                            @click.prevent="
                                uiState.dialog.modifyMarker.onCancel
                            "
                            >取消</ui-button
                        >
                        <ui-button
                            raised
                            @click.prevent="
                                uiState.dialog.modifyMarker.onDelete
                            "
                            v-show="
                                uiState.dialog.modifyMarker.withDeleteAction
                            "
                            >删除此标记</ui-button
                        >
                    </ui-form-field>
                    <ui-form-field
                        :class="actionClass"
                        v-show="
                            !uiState.dialog.modifyMarker.loading &&
                            mapState.onlyDiff
                        "
                    >
                        <ui-button
                            outlined
                            @click.prevent="
                                uiState.dialog.modifyMarker.onCancel
                            "
                            >取消</ui-button
                        >
                    </ui-form-field>
                    <ui-progress
                        active
                        v-show="uiState.dialog.modifyMarker.loading"
                    ></ui-progress>
                </template>
            </ui-form>
        </ui-dialog-content>
    </ui-dialog>
    <div id="content-box">
        <div v-if="mapState.loading" id="loading-box">
            <ui-spinner active></ui-spinner>
        </div>
        <template v-for="campus in campusList">
            <single-map
                v-if="campus.id == mapState.currentMapId"
                class="map"
                :img-url="campus.map.imgUrl"
                :zoom="4"
                :size="campus.map.size"
                :markers="mapState.currentMarkers"
                @marker-click="onClickMarker"
                :show-name="mapState.showName"
            >
                <ol-context-menu :items="contextMenuItems" />
            </single-map>
        </template>
    </div>
</template>

<style scope>
.map {
    height: 100%;
    width: 100%;
}

#content-box {
    height: 100%;
    width: 100%;
}

#loading-box {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: rgba(0, 0, 0, 0.36);
    z-index: 1;
}

.settings-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
}
</style>

<style>
#app {
    height: 100vh;
    width: 100%;
}
</style>
