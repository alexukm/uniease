import {Dialog, Toast} from "react-native-alert-notification";

export const showToast = (type, title, body) => {
    Toast.show({
        type: type,
        title: title,
        textBody: body,
    });
};

export const showDialog = (type, title, body) => {
    Dialog.show({
        type: type,
        title: title,
        textBody: body,
        button: 'close',
    });
};

