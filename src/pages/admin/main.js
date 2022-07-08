import { createApp } from "vue";
import App from "./App.vue";
import "minireset.css";

import BalmUI from "balm-ui";
import BalmUIPlus from "balm-ui-plus";
import "balm-ui-css";

import OpenLayersMap from "vue3-openlayers";
import "vue3-openlayers/dist/vue3-openlayers.css";

const app = createApp(App);

app.use(OpenLayersMap);
app.use(BalmUI);
app.use(BalmUIPlus);

const vm = app.mount("#app");
