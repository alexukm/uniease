import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeBaseProvider} from 'native-base';
import {setUserToken} from "./src/com/evotech/common/appUser/UserConstant";
import UserBottomTabNavigator from "./src/screens/UserBottomTabNavigator";
import DriverBottomTabNavigator from "./src/screens/DriverBottomTabNavigator";
import store from "./src/com/evotech/common/redux/store";
import {Provider} from 'react-redux';
import Home from "./src/screens/Home";
import UserLogin from "./src/screens/UserLogin";
import DriverLogin from "./src/screens/DriverLogin";
import UserSignUp from "./src/screens/UserRegisterForm";
import DriverSignUp from "./src/screens/DriverRegisterForm";
import DriverRegisterImage from "./src/screens/DriverRegisterImage";
import DriverSupplyInfo from "./src/screens/DriverSupplyInfoScreen";
import {TextEncoder, TextDecoder} from 'text-encoding';
import {accessToken} from "./src/com/evotech/common/http/BizHttpUtil";
import {userSkipLogin} from "./src/com/evotech/common/appUser/UserInfo";
import DriverAccount from "./src/screens/DriverAccountScreen";
import {AlertNotificationRoot} from "react-native-alert-notification";
import {enableScreens} from 'react-native-screens';
import TermsAndConditions from "./src/screens/TermsAndConditions";

import { DriverLoginStatusEnum } from "./src/com/evotech/common/constant/BizEnums";
import { navigationRef } from "./src/com/evotech/common/navigate/GloableNagivate";
import { enableSystemNotify } from "./src/com/evotech/common/notify/SystemNotify";


enableScreens();


global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Stack = createNativeStackNavigator();


const App = () => {
    const [initialRoute, setInitialRoute] = useState(null);

    // 忽略特定的警告信息
    const originalWarn = console.warn;
    console.warn = (message, ...optionalParams) => {
        if (message.indexOf('SSRProvider') === -1) {
            if (typeof originalWarn === 'function') {
                originalWarn(message, ...optionalParams);
            }
        }
    };

   // useEffect(() => {
   //      AsyncStorage.clear()
   //  }, []);

    const skipOp = (userInfo, skipLogin) => {
        const userSkip = (skipLogin) => {
            return skipLogin ? setInitialRoute("User") : setInitialRoute("UserLogin");
        }
        const driverSkip = (skipLogin) => {
            console.log(userInfo);
            return skipLogin ? DriverLoginStatusEnum.NEED_SUPPLY === userInfo.loginStatus ? setInitialRoute("DriverSupplyInfo"): setInitialRoute("Driver") : setInitialRoute("DriverLogin");
        }
        return userInfo.isUser() ? userSkip(skipLogin) : driverSkip(skipLogin);
    }

    const tokenCheck = async (userInfo) => {
        const checkTokenParam = {
            userPhone: userInfo.userPhone,
        };
        await accessToken(checkTokenParam)
            .then(data => {
                if (data.data){
                    setUserToken(data.data)
                }
                skipOp(userInfo, data.code === 200);
            })
            .catch(err => {
                return setInitialRoute("Home");
            });
    }
    useEffect(() => {
        // AsyncStorage.clear();
        enableSystemNotify();
        const checkTokenAndUserType = async () => {
            await userSkipLogin(setInitialRoute, (userInfo) => tokenCheck(userInfo));
        };
        checkTokenAndUserType().then(r => {
        });
    }, []);

    return (
        <NativeBaseProvider>
            <AlertNotificationRoot>
            <NavigationContainer ref={navigationRef}>
                <Provider store={store}>
                    {initialRoute && <Stack.Navigator
                        initialRouteName={initialRoute}
                        screenOptions={{
                            headerStyle: {backgroundColor: '#FFF'},
                            // cardStyle: {backgroundColor: 'transparent'},
                            headerShown: false // 这里添加这行代码
                        }}
                    >
                        <Stack.Screen name="Home" component={Home}/>
                        <Stack.Screen name="User" component={UserBottomTabNavigator}/>
                        <Stack.Screen name="Driver" component={DriverBottomTabNavigator}/>
                        <Stack.Screen name="UserLogin" component={UserLogin}/>
                        <Stack.Screen name="DriverLogin" component={DriverLogin}/>
                        <Stack.Screen name="DriverSupplyInfo" component={DriverSupplyInfo}/>
                        <Stack.Screen name="UserSignUp" component={UserSignUp}/>
                        <Stack.Screen name="DriverSignUp" component={DriverSignUp}/>
                        <Stack.Screen name="DriverAccount" component={DriverAccount}/>
                        <Stack.Screen name="DriverRegisterImage" component={DriverRegisterImage}/>
                        <Stack.Screen name="TermsAndConditions" component={TermsAndConditions}/>
                    </Stack.Navigator>}
                </Provider>
            </NavigationContainer>
            </AlertNotificationRoot>
        </NativeBaseProvider>
    );
};

export default App;



// import react, { useEffect } from 'react';
// import { View, Button } from 'react-native';
// import analytics from '@react-native-firebase/analytics';
//
// function App() {
//     return (
//         <View>
//             <Button
//                 title="Add To Basket"
//                 onPress={async () =>
//                 {
//                     await analytics().logSelectContent({
//                         content_type: 'clothing',
//                         item_id: 'abcd',
//                     })
//                     console.log("dianji")
//                 }
//                 }
//             />
//         </View>
//     );
// }
// export default App;
