import XlsMapImg from "@/assets/img/maps/xinglongshan.jpg";
import ZxMapImg from "@/assets/img/maps/zhongxin.jpg";
import BtqMapImg from "@/assets/img/maps/baotuquan.jpg";
import HjlMapImg from "@/assets/img/maps/hongjialou.jpg";
import QdMapImg from "@/assets/img/maps/qingdao.jpg";
import WhMapImg from "@/assets/img/maps/weihai.jpg";
import RjyMapImg from "@/assets/img/maps/ruanjianyuan.jpg";
import QfsMapImg from "@/assets/img/maps/qianfoshan.jpg";

const campusList = [
    {
        id: 1,
        name: "中心校区",
        map: {
            imgUrl: ZxMapImg,
            size: [2751, 3507],
        },
    },
    {
        id: 2,
        name: "趵突泉校区",
        status: true,
        map: {
            imgUrl: BtqMapImg,
            size: [2847, 3507],
        },
    },
    {
        id: 3,
        name: "洪家楼校区",
        status: true,
        map: {
            imgUrl: HjlMapImg,
            size: [3591, 3507],
        },
    },
    {
        id: 4,
        name: "兴隆山校区",
        status: true,
        map: {
            imgUrl: XlsMapImg,
            size: [3582, 3507],
        },
    },
    {
        id: 5,
        name: "千佛山校区",
        status: true,
        map: {
            imgUrl: QfsMapImg,
            size: [2862, 3507],
        },
    },
    {
        id: 6,
        name: "软件园校区",
        status: true,
        map: {
            imgUrl: RjyMapImg,
            size: [3645, 3507],
        },
    },
    {
        id: 7,
        name: "青岛校区",
        status: true,
        map: {
            imgUrl: QdMapImg,
            size: [2898, 3507],
        },
    },
    {
        id: 8,
        name: "威海校区",
        status: true,
        map: {
            imgUrl: WhMapImg,
            size: [3423, 3093],
        },
    },
];

export default campusList;
