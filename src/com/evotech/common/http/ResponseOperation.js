import {ResponseCodeEnum} from "../constant/BizEnums";
import {skipLoginPage, useSkipLoginPage} from "../navigate/UserNagivation";
import {showDialog} from "../alert/toastHelper";
import {removeUserToken} from "../appUser/UserConstant";
import {closeWebsocket} from "../websocket/SingletonWebSocketClient";


//账户不存在
export const isAccountNotFound = (code) => {
    return ResponseCodeEnum.ACCOUNT_NOT_FOUND === code;
}


//账户审核中
export const isUnderReview = (code) => {
    return ResponseCodeEnum.UNDER_REVIEW === code;
}

//账户被锁定
export const isLocked = (code) => {
    return ResponseCodeEnum.LOCKED === code;
}
//账户被禁用
export const isDisabled = (code) => {
    return ResponseCodeEnum.DISABLED === code;
}

export const isSuccess = (code) => {
    return ResponseCodeEnum.SUCCESS === code;
};
export const isError = (code) => {
    return ResponseCodeEnum.ERROR === code;
};

const isTokenError = (code) => {
    return ResponseCodeEnum.TOKEN_ERROR === code;
};

const isNoAuthorize = (code) => {
    return ResponseCodeEnum.UN_AUTHORIZE === code;
};
export const responseOperation = (data, success, error) => {
    if (isSuccess(data)) {
        return success();
    }
    if (isError(data)) {
        return error();
    }
    // 可能被其他设备登录 刷新了token
    if (isTokenError(data)) {
        showDialog("WARNING", "Session expired", "Please log in again.");
        removeUserToken();
        closeWebsocket();
        skipLoginPage().then();
        return error();
    }

    if (isNoAuthorize(data)) {
        showDialog("WARNING", "Action Denied", "You are not authorized to access this resource");
        return error();
    }
};
