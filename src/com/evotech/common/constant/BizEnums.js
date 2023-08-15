import { LOCAL_USER_INFO_FILE_PATH } from "../appUser/UserConstant";

export const OrderStateEnum = {
    AWAITING: "Awaiting",
    PENDING: "Pending",
    IN_TRANSIT: "InTransit",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};

export const UserTypeEnum = {PASSER: "passer", DRIVER: "driver"};

export const DriverInfoStatusEnum = {
    INCOMPLETE: "Incomplete",
    COMPLETE: "Complete",
};

export const DriverLoginStatusEnum = {
    ACTIVE: 20000, //已激活
    NEED_SUPPLY: 20001, //需要补充额外信息
    NEED_UPLOAD_IMAGES: 20002, //需要上传身份信息
    UNDER_REVIEW: 20003, // 信息审核中
};

export const ImagesEnum = {
    UserRide: "https://unieaseapp.com/uniEaseImages/app/user_ride.png",
    UserService: "https://unieaseapp.com/uniEaseImages/app/user_service.png",
    UserShare: "https://unieaseapp.com/uniEaseImages/app/user_share.png",
    UserUniversity: "https://unieaseapp.com/uniEaseImages/app/user_university.png",
    DriverRide: "https://unieaseapp.com/uniEaseImages/app/driver_ride.png",
    Logo: "https://unieaseapp.com/uniEaseImages/app/logo.png",
    UserLogin: "https://unieaseapp.com/uniEaseImages/app/user_login.png",
    DriverLogin: "https://unieaseapp.com/uniEaseImages/app/driver_login.png",
    UserOrderCar: "https://unieaseapp.com/uniEaseImages/app/user_order_car.png",
    UserOrderCartoonCar: "https://unieaseapp.com/uniEaseImages/app/user_order_cartoon_car.png",
};

export const LocalImageRequireEnum = {
    UserAD: {
        path: "../../../../picture/userAd.png",
        required: require("../../../../picture/userAd.png"),
    },
    SWA: {
        path: "../../../../picture/swa.png",
        required: require("../../../../picture/swa.png"),
    },
}
export const LocalImageFileEnum = {
    UserAD: `file://${LOCAL_USER_INFO_FILE_PATH}/userAd.png`+'?time=' + new Date().getTime(),
    SWA: `file://${LOCAL_USER_INFO_FILE_PATH}/swa.png`+'?time=' + new Date().getTime(),
}

export const ResponseCodeEnum = {
    SUCCESS: 200,
    ERROR: 500,
    NOT_FOUND: 404,
    TOKEN_ERROR: 201,
    UN_AUTHORIZE: 401,
    DISABLED: 3000,
    LOCKED: 3001,
    UNDER_REVIEW: 3002,
    ACCOUNT_NOT_FOUND: 4000,
};

export const OrderStateDescEnum = {
    "Awaiting": {
        PASSER: "Looking for the UniEase vehicle"
    },
    "Pending": {
        DRIVER: "Order accepted, heading for passenger pickup",
        PASSER: "UniEase driver accepted your order"
    },
    "InTransit": {
        DRIVER: "Passenger onboard, en route to destination",
        PASSER: "On the journey"
    },
    "Delivered": {
        DRIVER: "Passenger arrived, please rate your trip.",
        PASSER: "You've reached your destination",
    },
    "Completed": {
        DRIVER: "Order Completed",
        PASSER: "You've completed your journey"
    },
    "Cancelled": {
        DRIVER: "Order Completed",
        PASSER: "Order Cancelled"
    },
};

