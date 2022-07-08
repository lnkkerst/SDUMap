<script setup>
import { ref, defineProps, onMounted, computed } from "vue";

const props = defineProps(["color", "position", "size", "name", "showName"]);

const color = computed(() => {
    return props.color ? props.color : "black";
});
const position = computed(() => {
    return props.position ? props.position : [0, 0];
});
const size = computed(() => {
    return props.size ? props.size : 24;
});
const offset = computed(() => {
    const height = size.value,
        width = height * 0.7518;
    return [-(width / 2), -height];
});

onMounted(() => {});
</script>

<template>
    <ol-overlay :position="position" :offset="offset" :stop-event="false">
        <div class="marker">
            <svg
                :style="{ color: color, height: size + 'px' }"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
            >
                <path
                    d="M168.3 499.2C116.1 435 0 279.4 0 192C0 85.96 85.96 0 192 0C298 0 384 85.96 384 192C384 279.4 267 435 215.7 499.2C203.4 514.5 180.6 514.5 168.3 499.2H168.3zM192 256C227.3 256 256 227.3 256 192C256 156.7 227.3 128 192 128C156.7 128 128 156.7 128 192C128 227.3 156.7 256 192 256z"
                    fill="currentColor"
                />
            </svg>
            <div class="marker-name" v-if="props.showName">{{ name }}</div>
        </div>
    </ol-overlay>
</template>

<style scoped>
.marker {
    display: flex;
    flex-direction: row;
    align-items: center;
    align-content: center;
}

.marker svg {
    cursor: pointer;
}

.marker-name {
    cursor: pointer;
    font-size: 0.8rem;
    display: inline;
    color: #eff1f5;
    font-family: sans-serif;
    font-weight: bold;
    text-shadow: 1px 1px 1px black;
}
</style>
