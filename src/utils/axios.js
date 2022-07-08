import axiosRoot from "axios";
import { useAlert } from "balm-ui";

const $alert = useAlert();

const axios = axiosRoot.create();
axios.defaults.baseURL = import.meta.env.VITE_API_ADDRESS;
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("sdumap_admin_token");
        if (token !== null) {
            config.headers.Authorization = token;
        } else {
            // location.reload();
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
axios.interceptors.response.use(
    function (res) {
        return res;
    },
    function (err) {
        if (err.response.status === 401) {
            localStorage.clear();
            $alert("token 失效，请重新输入").then(() => {
                location.reload();
            });
        }
        return Promise.reject(err);
    }
);

export default axios;
