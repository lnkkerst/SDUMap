<script setup>
import {
    ref,
    onMounted,
    reactive
} from "vue";
import Map from "../../components/Map.vue";
import XlsImg from "../../assets/img/maps/xinglongshan.jpg";
import markersRaw from "../../assets/json/markers/xinglongshan.json";

const markers = reactive(markersRaw);

onMounted(() => {
    for (let marker of markers) {
        marker.hidden = false;
        marker.color = "#329cc";
    }
})

</script>

<template>
    <Map id="map" :imgUrl="XlsImg" :zoom="2" :size="[3582, 3507]" :markers="markers"></Map>
</template>

<style scoped>
#map {
    height: 100%;
    width: 100%;
}
</style>
