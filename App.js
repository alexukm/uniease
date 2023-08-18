import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider } from "native-base";
import { setUserToken } from "./src/com/evotech/common/appUser/UserConstant";
import UserBottomTabNavigator from "./src/screens/UserBottomTabNavigator";
import DriverBottomTabNavigator from "./src/screens/DriverBottomTabNavigator";
import store from "./src/com/evotech/common/redux/store";
import { Provider } from "react-redux";
import Home from "./src/screens/Home";
import UserLogin from "./src/screens/UserLogin";
import DriverLogin from "./src/screens/DriverLogin";
import UserSignUp from "./src/screens/UserRegisterForm";
import DriverSignUp from "./src/screens/DriverRegisterForm";
import DriverRegisterImage from "./src/screens/DriverRegisterImage";
import DriverSupplyInfo from "./src/screens/DriverSupplyInfoScreen";
import { TextEncoder, TextDecoder } from "text-encoding";
import { accessToken } from "./src/com/evotech/common/http/BizHttpUtil";
import {  reBuildUserInfoWithToken, userSkipLogin } from "./src/com/evotech/common/appUser/UserInfo";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { enableScreens } from "react-native-screens";

import { DriverLoginStatusEnum } from "./src/com/evotech/common/constant/BizEnums";
import { navigationRef } from "./src/com/evotech/common/navigate/GloableNagivate";
import RNBootSplash from "react-native-bootsplash";
import DeleteAccount from "./src/screens/DeleteAccount";
import EditProfile from "./src/screens/EditProfileScreen";
import  {firebase} from "@react-native-firebase/messaging";
import {  setDeviceId } from "./src/com/evotech/common/system/OSUtils";
import { AppState } from "react-native";
import { retrySocketConn } from "./src/com/evotech/common/websocket/SingletonWebSocketClient";

enableScreens();


global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const Stack = createNativeStackNavigator();


const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  const refAppState = useRef(appState);
  // 忽略特定的警告信息
  const originalWarn = console.warn;
  console.warn = (message, ...optionalParams) => {
    if (message.indexOf("SSRProvider") === -1) {
      if (typeof originalWarn === "function") {
        originalWarn(message, ...optionalParams);
      }
    }
  };


  useEffect(() => {
    refAppState.current = appState;  // 在此处，每次appState变化时，我们更新previousAppState的值
  }, [appState]);
  // useEffect(() => {
  //      AsyncStorage.clear()
  //  }, []);
  useEffect(() => {
    RNBootSplash.hide({ fade: true }); // 隐藏启动屏
  }, []);
  const skipOp = (userInfo, skipLogin) => {
    const userSkip = (skipLogin) => {
      return skipLogin ? setInitialRoute("User") : setInitialRoute("UserLogin");
    };
    const driverSkip = (skipLogin) => {
      return skipLogin ? DriverLoginStatusEnum.NEED_SUPPLY === userInfo.loginStatus ? setInitialRoute("DriverSupplyInfo") : setInitialRoute("Driver") : setInitialRoute("DriverLogin");
    };
    return userInfo.isUser() ? userSkip(skipLogin) : driverSkip(skipLogin);
  };

  const tokenCheck = async (userInfo) => {
    const checkTokenParam = {
      userPhone: userInfo.userPhone,
    };
    await accessToken(checkTokenParam)
      .then(data => {
        if (data.data) {
          setUserToken(data.data);
          userInfo = reBuildUserInfoWithToken(data.data, userInfo);
          userInfo.saveWithLocal();
        }
        skipOp(userInfo, data.code === 200);
      })
      .catch(err => {
        return setInitialRoute("Home");
      });
  };

  const handleAppStateChange = (nextAppState) => {
    if (refAppState.current === "background" && nextAppState === "active") {
      setTimeout(async () => {
        await retrySocketConn();
      }, 0);
    }
    setAppState(nextAppState);
  };
  useEffect(() => {
  const appSateHandler =   AppState.addEventListener("change", handleAppStateChange);

    setTimeout(async () => {
      await setDeviceId();
      // saveLocalStaticPicture().then();
    }, 0);
    if (!firebase.apps.length) {
      const firebaseConfig = {
        apiKey: "AIzaSyDjMhlXb0cwPafFs37XQUBgYHQ5NVJ6TDE",
        authDomain: "notification-5ab36.firebaseapp.com", // 这通常是 PROJECT_ID.firebaseapp.com
        databaseURL: "https://notification-5ab36.firebaseio.com", // 这通常是 https://PROJECT_ID.firebaseio.com
        projectId: "notification-5ab36",
        storageBucket: "notification-5ab36.appspot.com",
        messagingSenderId: "33115311534",
        appId: "1:33115311534:ios:f76867d2c950e6fb67cc3f"
      };
      firebase.initializeApp(firebaseConfig).then();
    }
    const checkTokenAndUserType = async () => {
      await userSkipLogin(setInitialRoute, (userInfo) => tokenCheck(userInfo));
    };
    checkTokenAndUserType().then(r => {
    });
    return () => {
      appSateHandler.remove();
    };
  }, []);

  return (
    <NativeBaseProvider>
      <AlertNotificationRoot>
        <NavigationContainer ref={navigationRef}>
          <Provider store={store}>
            {initialRoute && <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{
                headerStyle: { backgroundColor: "#FFF" },
                // cardStyle: {backgroundColor: 'transparent'},
                headerShown: false, // 这里添加这行代码
              }}
            >
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="User" component={UserBottomTabNavigator} />
              <Stack.Screen name="Driver" component={DriverBottomTabNavigator} />
              <Stack.Screen name="UserLogin" component={UserLogin} />
              <Stack.Screen name="DriverLogin" component={DriverLogin} />
              <Stack.Screen name="DriverSupplyInfo" component={DriverSupplyInfo} />
              <Stack.Screen name="UserSignUp" component={UserSignUp} />
              <Stack.Screen name="DriverSignUp" component={DriverSignUp} />
              {/*<Stack.Screen name="DriverAccount" component={DriverAccount} />*/}
              {/*<Stack.Screen name="UserAccount" component={AccountScreen} />*/}
              <Stack.Screen name="DriverRegisterImage" component={DriverRegisterImage} />
              <Stack.Screen name="DeleteAccount" component={DeleteAccount} />
              <Stack.Screen name="EditProfile" component={EditProfile} />


            </Stack.Navigator>}
          </Provider>
        </NavigationContainer>
      </AlertNotificationRoot>
    </NativeBaseProvider>
  );
};

export default App;
