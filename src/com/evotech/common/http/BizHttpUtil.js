import {HttpUtil, SupportContextType} from "./HttpUtil";

const request = new HttpUtil(5000, true);


const supportRequestMethod = {
    POST: 'POST',
    GET: 'GET'
}

const featureAndPath = {

    //用户登录
    USER_LOGIN: {method: supportRequestMethod.POST, path: '/v1/ums/api/user/login'},

    //用户注册
    USER_REGISTER: {method: supportRequestMethod.POST, path: '/v1/ums/api/user/register'},

    //用户登出
    USER_LOGOUT: {method: supportRequestMethod.POST, path: '/v1/ums/api/user/logOut'},
    //用户注销账号
    USER_DELETE_ACCOUNT: {method: supportRequestMethod.POST, path: '/v1/ums/api/user/deleteAccount'},

    //司机证件上传
    DRIVER_UPLOAD: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/upload'},

    // 司机信息补全
    DRIVER_SUPPLY_INFO: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/supplyInfo'},

    //司机注册
    DRIVER_REGISTER: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/register'},

    //司机登录
    DRIVER_LOGIN: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/login'},

    //司机注销
    DRIVER_LOGOUT: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/logOut'},
    //司机注销账号
    DRIVER_DELETE_ACCOUNT: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/deleteAccount'},

    //发送短信验证码
    SMS_SEND: {method: supportRequestMethod.POST, path: '/v1/sys/api/sms/send'},

    //刷新token
    ACCESS_TOKEN: {method: supportRequestMethod.POST, path: '/v1/auth/api/token/access_token'},

    // 用户下单校验
    ORDER_CHECK: {method: supportRequestMethod.GET, path: '/v1/oms/api/user/order/confirmCheck'},

    // 计算价格
    PRICE_CHECK: {method: supportRequestMethod.GET, path: '/v1/oms/api/user/order/calOrderPrice'},

    USER_SUBMIT_ORDER: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/submit'},

    USER_CANCEL_ORDER: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/cancel'},

    USER_ORDER_PAGE: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/page'},

    USER_ORDER_INFO: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/orderInfo'},

    USER_REVIEW_ORDER: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/reviewOrder'},

    DRIVER_ACCEPT_ORDER: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/accept'},

    CARPOOLING_ORDERS_QUERY: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/query'},

    DRIVER_ORDER_PAGE: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/page'},

    DRIVER_ORDER_INFO: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/orderInfo'},

    DRIVER_GET_PASSER_CODE: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/queryUserCode'},

    PASSER_GET_DRIVER_CODE: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/queryUserCode'},

    DRIVER_ORDER_START: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/start'},

    DRIVER_ORDER_COMPLETED: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/traveled'},

    DRIVER_CANCEL_ORDER: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/cancel'},

    DRIVER_REVIEW_ORDER: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/reviewOrder'},

    DRIVER_INFO_STATUS: {method: supportRequestMethod.GET, path: '/v1/ums/api/driver/driverInfoStatus'},

    QUERY_USER_ORDER_STATUS: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/queryUserOrderStatus'},

    QUERY_DRIVER_ORDER_STATUS: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/queryDriverOrderStatus'},

    DRIVER_QUERY_USER_PHONE: {method: supportRequestMethod.POST, path: '/v1/oms/api/driver/order/queryUserPhone'},

    USER_QUERY_DRIVER_PHONE: {method: supportRequestMethod.POST, path: '/v1/oms/api/user/order/queryUserPhone'},

    SYNC_USER_FIREBASE_TOKEN: {method: supportRequestMethod.GET, path: '/v1/auth/api/token/syncFireBaseToken'},

    DRIVER_UPLOAD_AVATAR: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/uploadAvatar'},

    USER_UPLOAD_AVATAR: {method: supportRequestMethod.POST, path: '/v1/ums/api/user/uploadAvatar'},

    DRIVER_MODIFY_USER_INFO: {method: supportRequestMethod.POST, path: '/v1/ums/api/driver/modifyUserInfo'},

    USER_MODIFY_USER_INFO: {method: supportRequestMethod.POST, path: '/v1/ums/api/user/auditUserInfo'},
}

export function driverModifyUserInfo(params = {}) {
    return request.post(featureAndPath.DRIVER_MODIFY_USER_INFO.path, SupportContextType.APPLICATION_JSON, {params: params});
}
export function userModifyUserInfo(params = {}) {
    return request.post(featureAndPath.USER_MODIFY_USER_INFO.path, SupportContextType.APPLICATION_JSON, {params: params});
}

export function driverUploadAvatar(file, params,{headers}) {
    const formData = new FormData();
    formData.append('file', {
        name: 'image.jpg',
        type: 'image/jpeg',
        uri: file
    });
    const requestURL = featureAndPath.DRIVER_UPLOAD_AVATAR.path + `?userPhone=${params['userPhone']}`;
    return request.postFromData(requestURL, SupportContextType.MULTIPART_FROM, {formData: formData,header: headers});
}
export function userUploadAvatar(file, params,{headers}) {
    const formData = new FormData();
    formData.append('file', {
        name: 'image.jpg',
        type: 'image/jpeg',
        uri: file
    });
    const requestURL = featureAndPath.USER_UPLOAD_AVATAR.path + `?userPhone=${params['userPhone']}`;
    return request.postFromData(requestURL, SupportContextType.MULTIPART_FROM, {formData: formData,header: headers});
}
export function syncUserFirebaseToken(params = {}) {
    return request.get(featureAndPath.SYNC_USER_FIREBASE_TOKEN.path, params);
}
export function driverSupplyInfo(params = {}) {
    return request.post(featureAndPath.DRIVER_SUPPLY_INFO.path, SupportContextType.APPLICATION_JSON, {params: params});
}
export function driverQueryUserPhone(params = {}) {
    return request.post(featureAndPath.DRIVER_QUERY_USER_PHONE.path, SupportContextType.APPLICATION_JSON, {params: params});
}
export function userQueryDriverPhone(params = {}) {
    return request.post(featureAndPath.USER_QUERY_DRIVER_PHONE.path, SupportContextType.APPLICATION_JSON, {params: params});
}
export function queryDriverOrderStatus() {
    return request.post(featureAndPath.QUERY_DRIVER_ORDER_STATUS.path, SupportContextType.APPLICATION_JSON, {});
}
export function queryUserOrderStatus() {
    return request.post(featureAndPath.QUERY_USER_ORDER_STATUS.path, SupportContextType.APPLICATION_JSON,{});
}

export function driverInfoStatus() {
    return request.get(featureAndPath.DRIVER_INFO_STATUS.path)
}
export function driverReviewOrder(params = {}) {
    return request.post(featureAndPath.DRIVER_REVIEW_ORDER.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverCancelOrder(params = {}) {
    return request.post(featureAndPath.DRIVER_CANCEL_ORDER.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverOrderCompleted(params = {}) {
    return request.post(featureAndPath.DRIVER_ORDER_COMPLETED.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverOrderStart(params = {}) {
    return request.post(featureAndPath.DRIVER_ORDER_START.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverOrderInfo(params = {}) {
    return request.post(featureAndPath.DRIVER_ORDER_INFO.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverGetPasserCode(params = {}) {
    return request.post(featureAndPath.DRIVER_GET_PASSER_CODE.path, SupportContextType.APPLICATION_JSON, {params: params})
}
export function passerGetDriverCode(params = {}) {
    return request.post(featureAndPath.PASSER_GET_DRIVER_CODE.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverOrderPage(params = {}) {
    return request.post(featureAndPath.DRIVER_ORDER_PAGE.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function carpoolingOrdersQuery(params = {}) {
    return request.post(featureAndPath.CARPOOLING_ORDERS_QUERY.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function userReviewOrder(params = {}) {
    return request.post(featureAndPath.USER_REVIEW_ORDER.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverAcceptOrder(params = {}) {
    return request.post(featureAndPath.DRIVER_ACCEPT_ORDER.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function userOrderInfo(params = {}) {
    return request.post(featureAndPath.USER_ORDER_INFO.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function userOrderPage(params = {}) {
    return request.post(featureAndPath.USER_ORDER_PAGE.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function userCancelOrder(params = {}) {
    return request.post(featureAndPath.USER_CANCEL_ORDER.path, SupportContextType.APPLICATION_JSON, {params: params})
}


export function userSubmitOrder(params = {}) {
    return request.post(featureAndPath.USER_SUBMIT_ORDER.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function orderPriceCheck(travelTime, distance) {
    const params = {
        travelTime: travelTime,
        distance: distance,
    }
    return request.get(featureAndPath.PRICE_CHECK.path, params);
}

export function userOrderCheck() {
    return request.get(featureAndPath.ORDER_CHECK.path);
}

export function userRegistry(params = {}) {
    return request.post(featureAndPath.USER_REGISTER.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverRegister(params = {}) {
    return request.post(featureAndPath.DRIVER_REGISTER.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function userLogin(params = {}) {
    return request.post(featureAndPath.USER_LOGIN.path, SupportContextType.APPLICATION_JSON, {params: params})
}


export function smsSend(userPhone, userType) {
    const params = {
        userPhone: userPhone,
        userType: userType,
    }
    return request.post(featureAndPath.SMS_SEND.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverLogout() {
    return request.post(featureAndPath.DRIVER_LOGOUT.path, SupportContextType.APPLICATION_JSON, {})
}
export function driverDeleteAccount() {
    return request.post(featureAndPath.DRIVER_DELETE_ACCOUNT.path, SupportContextType.APPLICATION_JSON, {})
}
export function userLogoutIt() {
    return request.post(featureAndPath.USER_LOGOUT.path, SupportContextType.APPLICATION_JSON, {})
}
export function userDeleteAccount() {
    return request.post(featureAndPath.USER_DELETE_ACCOUNT.path, SupportContextType.APPLICATION_JSON, {})
}

export function accessToken(params = {}) {
    return request.post(featureAndPath.ACCESS_TOKEN.path, SupportContextType.APPLICATION_JSON, {params: params})
}

export function driverUpload(file, params,{headers}) {
    // let formData = new FormData();
    const formData = new FormData();
    formData.append('file', {
        name: 'image.jpg',
        type: 'image/jpeg',
        uri: file
    });
    const requestURL = featureAndPath.DRIVER_UPLOAD.path + `?uploadType=${params['uploadType']}&userPhone=${params['userPhone']}`;
    return request.postFromData(requestURL, SupportContextType.MULTIPART_FROM, {formData: formData,header: headers});
}

export function driverLogin(params = {}) {
    return request.post(featureAndPath.DRIVER_LOGIN.path, SupportContextType.APPLICATION_JSON, {params: params})
}
