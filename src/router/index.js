import { createRouter, createWebHashHistory } from "vue-router";

import XinglongshanMap from "../views/maps/XinglongshanMap.vue";

const routes = [
    {
        path: "/xinglongshan",
        component: XinglongshanMap,
    },
];

export default createRouter({
    history: createWebHashHistory(),
    routes,
});
