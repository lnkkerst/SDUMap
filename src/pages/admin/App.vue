<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import axios from "@/utils/axios";
import { useAlert } from "balm-ui";

import SingleMap from "@/components/Map.vue";

import campusList from "@/assets/js/campus.js";

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
});

const mapState = reactive({
    currentMapId: 1,
    currentMarkers: [],
    zoom: 4,
    size: computed(() => {
        return campusList[mapState.currentMapId - 1].map.size;
    }),
    markers: [],
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
};

watch(
    () => mapState.currentMapId,
    (newVal) => {
        updateMarkers();
    }
);

const onClickMarker = (id) => {
    uiState.dialog.modifyMarker.markerId = id;
    for (let x of mapState.markers) {
        if (x.id === id) {
            uiState.dialog.modifyMarker.marker.name = x.name;
            uiState.dialog.modifyMarker.marker.englishName = x.englishName;
            uiState.dialog.modifyMarker.marker.extraInfo = x.extraInfo;
            uiState.dialog.modifyMarker.marker.openTime = x.extraInfo;
            uiState.dialog.modifyMarker.marker.type = x.type;
            uiState.dialog.modifyMarker.withDeleteAction = true;
            uiState.dialog.modifyMarker.open = true;
            return;
        }
    }
    console.log("notfound");
};

onMounted(async () => {
    if (localStorage.getItem("sdumap_admin_token") === null) {
        uiState.dialog.changeToken.open = true;
    } else {
        await updateMarkers();
    }
});
</script>

<template>
    <ui-top-app-bar
        :type="2"
        nav-id="demo-menu"
        :title="uiState.title"
        content-selector="map"
    ></ui-top-app-bar>
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
        v-model="uiState.dialog.modifyMarker.open"
        @confirm="uiState.dialog.modifyMarker.onConfirm"
        scrollable
        @close="uiState.dialog.modifyMarker.onClose"
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
                                (x) => {
                                    return parseInt(x);
                                }
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
                        :class="actionClass"
                        v-show="!uiState.dialog.modifyMarker.loading"
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
                            v-if="uiState.dialog.modifyMarker.withDeleteAction"
                            >删除此标记</ui-button
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

    <single-map
        id="map"
        :img-url="campusList[mapState.currentMapId - 1].map.imgUrl"
        :zoom="4"
        :size="mapState.size"
        :markers="mapState.markers"
        @marker-click="onClickMarker"
    >
        <ol-context-menu :items="contextMenuItems" />
    </single-map>
</template>

<style scope>
#map {
    height: 100%;
    width: 100%;
}
</style>

<style>
#app {
    height: 100vh;
    width: 100%;
}
</style>
