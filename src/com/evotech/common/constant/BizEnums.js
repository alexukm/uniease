export const OrderStateEnum = {
    AWAITING: "Awaiting",
    PENDING: "Pending",
    IN_TRANSIT: "InTransit",
    DELIVERED: "Delivered",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
}


export const UserTypeEnum = {PASSER: "passer", DRIVER: "passer"}

export const DriverInfoStatusEnum = {
    INCOMPLETE: "Incomplete",
    COMPLETE: "Complete",
}

export const DriverLoginStatusEnum = {
    ACTIVE: 20000, //已激活
    NEED_SUPPLY: 20001, //需要补充额外信息
    NEED_UPLOAD_IMAGES: 20002, //需要上传身份信息
    UNDER_REVIEW: 20003 // 信息审核中
}

export const ImagesEnum = {
    UserRide: "https://unieaseapp.com/uniEaseImages/app/user_ride.png",
    UserService: "https://unieaseapp.com/uniEaseImages/app/user_service.png",
    UserShare: "https://unieaseapp.com/uniEaseImages/app/user_share.png",
    UserUniversity: "https://unieaseapp.com/uniEaseImages/app/user_university.png"
}
