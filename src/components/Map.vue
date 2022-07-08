<script setup>
import { ref, reactive, onMounted, defineEmits, computed } from "vue";

import Marker from "../components/Marker.vue";

const props = defineProps(["imgUrl", "size", "zoom", "markers", "center"]);

const emit = defineEmits(["markerClick"]);

const view = ref(null);
const rotation = ref(0);
const size = computed(() => {
    return props.size ? props.size : [1920, 1080];
});
const center = computed(() => {
    return props.center ? props.center : [size.value[0] / 2, size.value[1] / 2];
});
const extent = computed(() => {
    return [0, 0, ...size.value];
});
const projection = reactive({
    units: "pixels",
    extent: extent,
});

const onClick = (marker) => {
    emit("markerClick", marker.id);
};

onMounted(() => {});
</script>

<template>
    <ol-map :loadTilesWhileAnimating="true" :loadTilesWhileInteracting="true">
        <ol-view
            ref="view"
            :center="center"
            :rotation="rotation"
            :zoom="zoom"
            :projection="projection"
        />
        <ol-image-layer>
            <ol-source-image-static
                :url="props.imgUrl"
                :imageSize="size"
                :imageExtent="extent"
                :projection="projection"
            >
            </ol-source-image-static>
        </ol-image-layer>

        <template v-for="marker in markers">
            <Marker
                v-if="!marker.hidden"
                :color="marker.color"
                :size="24"
                :position="marker.position"
                :name="marker.name"
                @click.prevent="onClick(marker)"
            >
            </Marker>
        </template>
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
