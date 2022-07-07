<script setup>
import {
    ref,
    reactive,
    onMounted,
    defineEmits,
    computed
} from "vue";

import Marker from "../components/Marker.vue";

const props = defineProps([
    "imgUrl",
    "size",
    "zoom",
    "markers",
    "center"
]);

const emit = defineEmits([
    "markerClick"
])

const view = ref(null);
const rotation = ref(0);
const size = computed(() => {
    return props.size ? props.size : [1920, 1080];
})
const center = computed(() => {
    return props.center ? props.center : [size.value[0] / 2, size.value[1] / 2];
})
const extent = computed(() => {
    return [0, 0, ...size.value]
})
const projection = reactive({
    units: 'pixels',
    extent: extent,
});
const isDev = import.meta.env.DEV;

const onClick = (marker) => {
    // view.value.setCenter(marker.position);
    emit("markerClick", marker.id);
}

const contextMenuItems = ref([]);

contextMenuItems.value = [
    {
        text: '添加标记',
        callback: (val) => {
            const newMarker = {};
            newMarker.id = prompt("请输入 id: ", "none");
            newMarker.name = prompt("请输入名称: ", "none");
            newMarker.type = prompt("请输入类型: ", "none");
            newMarker.position = val.coordinate;
            props.markers.push(newMarker);
        }
    },
    {
        text: '导出当前标记',
        callback: (val) => {
            console.log(JSON.stringify(props.markers));
        }
    },
    '-'
]

onMounted(() => {
})
</script>

<template>
    <ol-map :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true">
        <ol-view ref="view" :center="center" :rotation="rotation" :zoom="zoom" :projection="projection" />
        <ol-image-layer>
            <ol-source-image-static :url="props.imgUrl" :imageSize="size" :imageExtent="extent"
                :projection="projection">
            </ol-source-image-static>
        </ol-image-layer>

        <template v-for="marker in markers">
            <Marker v-if="!marker.hidden" :color="marker.color" :size="24" :position="marker.position" :name="marker.name"
                @click.prevent="onClick(marker)">
            </Marker>
        </template>

        <ol-mouseposition-control v-if="isDev" class="mouse" />
        <ol-context-menu :items="contextMenuItems" v-if="isDev" />
        <slot></slot>
    </ol-map>
</template>

<style scoped>
ol-map {
    width: 100%;
    height: 100%;
}

.marker svg {
    height: 2rem;
    color: red;
}

.mouse {
    background-color: white;
}
</style>
