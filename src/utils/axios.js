import axiosRoot from "axios";

const axios = axiosRoot.create();
axios.defaults.baseURL = import.meta.env.VITE_API_ADDRESS;
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("sdumap_admin_token");
        if (token !== null) {
            config.headers.Authorization = token;
        } else {
            
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios;
