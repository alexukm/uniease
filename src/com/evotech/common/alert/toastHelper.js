import {Dialog, Toast} from "react-native-alert-notification";
import {Alert} from "react-native";

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

export const systemAlert = (title,message,whenCancel,whenOk)=>{
    Alert.alert(
        title,
       message,
        [
            {
                text: "Cancel", onPress: () => {
                  whenCancel();
                }
            },
            {
                text: "OK", onPress: () => {
                  whenOk();
                }
            }
        ]
    );
}



