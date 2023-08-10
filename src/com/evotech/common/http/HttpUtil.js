import axios from "axios";
import { getUserID, getUserToken} from "../appUser/UserConstant";

// const defaultRequestAddress = "unieaseapp.com"
// 测试环境
const defaultRequestAddress = "35.197.128.231"


const contextPath = "/uniEase";


export const requestPrefix = {
    // httpPrefix: "https://" + defaultRequestAddress,
    // 测试环境
    httpPrefix: "http://" + defaultRequestAddress,
}

// 默认请求头
export const defaultHeaders = {

    USER_TYPE: 'User-Type',
    USER_ID: 'User-Identifier',
    TOKEN: 'Authentication',


    //用户类型
    getUserType(type) {
        return {[this.USER_TYPE]: type}
    },
    //用户设备id
    getUserIdentifier(identifier) {
        return {[this.USER_ID]: identifier}
    },
    //请求token
    getAuthentication(authentication) {
        return {[this.TOKEN]: authentication}
    },
};

export const ContextType = {
    support: 'Content-Type',

    getSupportHeader(contextType) {
        return {[this.support]: contextType}

    },
}


export const SupportContextType = {
    //JSON
    APPLICATION_JSON: 'application/json;charset=utf-8',

    //from 表单
    APPLICATION_FROM: 'application/x-www-form-urlencoded',

    //atom+xml
    APPLICATION_ATOM_XML: 'application/atom+xml',

    //stream
    APPLICATION_STREAM: 'application/octet-stream',

    //文件格式表单
    MULTIPART_FROM: 'multipart/form-data',

}

async function headerMap({supportContextType = null, header = {}},) {
    const token = await getUserToken()
    header = Object.assign(header, defaultHeaders.getUserIdentifier(getUserID()));
    if (!header[defaultHeaders.TOKEN]) {
        header = Object.assign(header,defaultHeaders.getAuthentication(token));
    }
    if (supportContextType) {
        Object.assign(header, ContextType.getSupportHeader(supportContextType));
    }
    return header;
}

export class HttpUtil {
    constructor(timeOut, http = true) {
        this.requestBaseURL = requestPrefix.httpPrefix + contextPath;
        this.http = http;
        this.instance = axios.create({
            baseURL: this.requestBaseURL,
            timeout: timeOut
        });
    }

    async get(url, params = {}, header = {}) {
        const requestURL = this.getRequestURI(url);
        console.log(requestURL);
        const headers = await headerMap({header: header});
        return new Promise((resolve, catchException) => {
            this.instance.get(requestURL, {
                params: params,
                headers: headers
            }).then(response => {
                resolve(response.data)
            }).catch(e => {
                catchException(e)
            });
        });
    }

    async post(uri, supportContextType2, {params = null, header = {}}) {
        const requestBody = JSON.stringify(params);
        const requestURL = this.getRequestURI(uri);
        const headers = await headerMap({supportContextType: supportContextType2, header: header});
        return new Promise((resolve, catchException) => {
            this.instance.post(requestURL, requestBody, {headers})
                .then(response => {
                    resolve(response.data)
                })
                .catch(e => {
                    console.log(e)
                    catchException(e)
                })
        });
    }

    async postFromData(uri, supportContextType2, {formData, header}) {
        const requestURL = this.getRequestURI(uri);
        const headers = await headerMap({supportContextType: supportContextType2, header: header});
        return new Promise((resolve, catchException) => {
            this.instance.post(requestURL, formData, {headers})
                .then(response => {
                    resolve(response.data)
                })
                .catch(e => {
                    catchException(e)
                })
        });
    }


    getRequestURI(URI) {
        return this.requestBaseURL + URI;
    }
}
