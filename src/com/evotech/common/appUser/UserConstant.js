import {asyncDelKey, getValue, setKeyValue} from "./LocalStorageUtil";
import {defaultHeaders} from "../http/HttpUtil";
import {getUserInfoWithLocal, removeUserInfo} from "./UserInfo";

export const UserOrigin = {APP: 0}
export const UserPlatform = {Android: 1, IOS: 2,}

export const userType = {USER: 0, DRIVER: 1}

export const CarType = {
    Sedan: {desc: 'Sedan', value: 0},
    SUV: {desc: 'Sport Utility Vehicle (SUV)', value: 1},
    Coupe: {desc: 'Coupe',value: 2},
    MPV: {desc: 'Multi-Purpose Vehicle (MPV)',value: 3},
    Pickup_Truck: {desc: 'Pickup Truck',value: 4},
}

export const DriverImageType = {
    //自拍
    Selfie: 0,
    //车保信息
    Vehicle_Insurance: 1,
    //身份证 正面
    NRIC_FRONT: 2,
    //身份证 反面
    NRIC_BACK: 3,
    //护照
    Passport: 4,
    //驾照
    License: 5,
    Car_Path: 6,
}

export function getUserID() {
    return "123";
}

export function getUserType() {
    return 0;
}

export function setUserToken(token) {
    setKeyValue(defaultHeaders.TOKEN, token).then();
}

export function removeUserToken() {
    asyncDelKey(defaultHeaders.TOKEN).then();
}

export function userLogOut() {
    //删除token
    asyncDelKey(defaultHeaders.TOKEN).then();
    //删除用户信息
    removeUserInfo();
}

export async function getUserToken() {
    return await getValue(defaultHeaders.TOKEN);
}


export async function setChatMessages(messages) {
    const userInfo = await getUserInfoWithLocal();
    setKeyValue('@chatMessages:' + userInfo.userPhone, JSON.stringify(messages)).then();
}

export async function setChatList(chatList) {
    const userInfo = await getUserInfoWithLocal();
    setKeyValue('@chatList:' + userInfo.userPhone, JSON.stringify(chatList)).then();
}

export async function getChatMessages() {
    const userInfo = await getUserInfoWithLocal();
    return getValue('@chatMessages:' + userInfo.userPhone).then(data => {
        return data ? JSON.parse(data) : null;
    });
}

export async function getChatList() {
    const userInfo = await getUserInfoWithLocal();
    return userInfo ? getValue('@chatList:' + userInfo.userPhone).then(data => {
        return data ? JSON.parse(data) : null;
    }) : userInfo;

}

