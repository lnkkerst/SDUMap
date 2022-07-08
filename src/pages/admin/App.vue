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
                } else {
                    setTimeout(() => {
                        uiState.dialog.changeToken.open = true;
                    }, 200);
                }
            },
        },
        addMarker: {
            open: false,
            loading: false,
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
            typeOptions: [
                { label: "教学楼", value: 2 },
                { label: "实验楼", value: 3 },
                { label: "宿舍楼", value: 4 },
                { label: "功能区", value: 5 },
                { label: " 景观", value: 6 },
            ],
            onSubmit: async() => {
                for (let x of ["name", "englishName", "openTime"]) {
                    if (uiState.dialog.addMarker.marker[x].length === 0) {
                        $alert("请完整填写信息！");
                        return;
                    }
                }
                const submitMarker = {...uiState.dialog.addMarker.marker};
                submitMarker.position = JSON.stringify(submitMarker.position);
                try {
                    const res = await axios.put("/marker", submitMarker);
                    uiState.dialog.addMarker.open = false;
                    updateMarkers();
                } catch (_e) {
                    $alert(`Error code : ${_e.message}`)
                }
            },
            onCancel: () => {
                uiState.dialog.addMarker.open = false;
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
            uiState.dialog.addMarker.marker.position = val.coordinate;
            uiState.dialog.addMarker.open = true;
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

onMounted(async () => {
    if (localStorage.getItem("sdumap_admin_token") === null) {
        uiState.dialog.changeToken.open = true;
    }
    await updateMarkers();
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
        v-model="uiState.dialog.addMarker.open"
        @confirm="uiState.dialog.addMarker.onConfirm"
        scrollable
    >
        <ui-dialog-title>添加</ui-dialog-title>
        <ui-dialog-content>
            <ui-form type="|" item-margin-bottom="16" action-align="center">
                <template #default="{ subitemClass, actionClass }">
                    <ui-form-field class="required">
                        <label>名称</label>
                        <ui-textfield
                            fullwidth
                            v-model="uiState.dialog.addMarker.marker.name"
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field class="required">
                        <label>英文名称</label>
                        <ui-textfield
                            fullwidth
                            v-model="
                                uiState.dialog.addMarker.marker.englishName
                            "
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field class="required">
                        <label>坐标</label>
                        <ui-textfield fullwidth disabled>{{
                            uiState.dialog.addMarker.marker.position.map(
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
                            :options="uiState.dialog.addMarker.typeOptions"
                            v-model="uiState.dialog.addMarker.marker.type"
                        ></ui-select>
                    </ui-form-field>
                    <ui-form-field class="required">
                        <label>开放时间</label>
                        <ui-textfield
                            fullwidth
                            v-model="uiState.dialog.addMarker.marker.openTime"
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field>
                        <label>附加信息</label>
                        <ui-textfield
                            fullwidth
                            input-type="textarea"
                            rows="5"
                            v-model="uiState.dialog.addMarker.marker.extraInfo"
                        ></ui-textfield>
                    </ui-form-field>
                    <ui-form-field :class="actionClass">
                        <ui-button
                            raised
                            @click.prevent="uiState.dialog.addMarker.onSubmit"
                            >提交</ui-button
                        >
                        <ui-button
                            outlined
                            @click.prevent="uiState.dialog.addMarker.onCancel"
                            >取消</ui-button
                        >
                    </ui-form-field>
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
