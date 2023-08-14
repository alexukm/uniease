import {Keyboard, TouchableWithoutFeedback, View, Image, Platform, Alert } from "react-native";
import {MD5} from "crypto-js";
import React, {useState, useEffect} from "react";
import {checkUserAccount, driverLogin, smsSend} from "../com/evotech/common/http/BizHttpUtil";
import {useNavigation} from "@react-navigation/native";
import {saveUserAvatar, setUserToken, userType} from "../com/evotech/common/appUser/UserConstant";
import {
    FormControl,
    Center,
    Modal,
    VStack,
    Button,
    NativeBaseProvider,
    Input,
    Text,
    HStack, Radio,
} from "native-base";
import {buildUserInfo} from "../com/evotech/common/appUser/UserInfo";
import {
    DriverLoginStatusEnum,
    ImagesEnum,
    UserTypeEnum,
} from "../com/evotech/common/constant/BizEnums";
import {showDialog, showToast} from "../com/evotech/common/alert/toastHelper";
import {ALERT_TYPE} from "react-native-alert-notification";
import {
    isAccountNotFound,
    isDisabled,
    isLocked,
    isSuccess, isUnderReview,
    responseOperation
} from "../com/evotech/common/http/ResponseOperation";
import DeviceInfo from "react-native-device-info";
import {deviceId} from "../com/evotech/common/system/OSUtils";

const countryCodes = {
    my: "60",
    cn: "86",
};

function DriverScreen() {

    const navigation = useNavigation();
    const [selectedValue, setSelectedValue] = useState("my");
    const [showModal, setShowModal] = useState(false);

    const inputWidth = Platform.OS === 'ios' ? '82%' : '84%';


    const handleSelect = (value) => {
        setSelectedValue(value);
        setShowModal(false);
    };

    const buttonText = () => {
        switch (selectedValue) {
            case "my":
                return "+60";
            case "cn":
                return "+86";
            default:
                return "Select Country Code";
        }
    };

    const submitData = () => {
        if (selectedValue === "cn" && value.length !== 11) {
            showDialog("WARNING", "Invalid Input", "Please enter a valid 11-digit phone number for China");
            return false;
        }
        if (selectedValue === "my" && ((value.length !== 9 && value.length !== 10) || (value.startsWith("6") || value.startsWith("0")))) {
            showDialog("WARNING", "Invalid Input", "Please enter a valid 9-digit or 10-digit phone number without including 60 or 0 at the beginning.");
            return false;
        }

        if (!value) {
            showToast("WARNING", "Missing Data", "Please enter a phone number");
            return false;
        }

        if (!selectedValue) {
            showToast("WARNING", "Missing Data", "Please choose a country code");
            return false;
        }

        const prefix = countryCodes[selectedValue];
        const phoneNumber = prefix ? prefix + value : value;

        const checkParam = {
            userPhone: phoneNumber,
            userType: 'driver',
        }

        checkUserAccount(checkParam)
            .then(data => {
                const checkStatus = data.code;
                //账户存在
                if (isSuccess(checkStatus)) {
                    smsSend(phoneNumber, UserTypeEnum.DRIVER)
                        .then(data => {
                            responseOperation(data.code, () => {
                                setIsTimerActive(true);
                                setIsOtpVisible(true);
                                showToast("SUCCESS", "Success", "The SMS has been sent successfully.");
                            }, () => {
                                showDialog(ALERT_TYPE.WARNING, "Warning", data.message);
                                return false;
                            })
                        })
                        .catch(error => {
                            showDialog(ALERT_TYPE.DANGER, "Error", "Error: " + error.message);
                            return false;
                        });
                } else {
                    //其他情况
                    console.log("checkStatus",checkStatus);
                    //账户不存在
                    if (isAccountNotFound(checkStatus)) {
                        Alert.alert(
                          "Account Not Found",
                          "We couldn't find your account. Would you like to register?",
                          [
                              {
                                  text: "Yes, Register",
                                  onPress: () => {
                                      navigation.navigate('DriverSignUp'); // 请根据您的路由配置进行调整
                                  }
                              },
                              {
                                  text: "No, Thanks",
                                  style: "cancel"
                              }
                          ],
                          { cancelable: false }
                        );
                        return;
                    }

                    //账户信息审核中
                    if (isUnderReview(checkStatus)) {
                        showDialog("WARNING", "Login Failed", "Your account information is under review. Please wait until the review is completed.");
                        return;
                    }

                    //账户被锁定
                    if (isLocked(checkStatus)) {
                        showDialog("WARNING", "Login Failed", "Your account has been locked and cannot login. Please email to unieaseapp@gmail.com find help.");
                        return;
                    }

                    //账户被禁用
                    if (isDisabled(checkStatus)) {
                        showDialog("WARNING", "Login Failed", "Your account has been disabled and cannot login. Please email to unieaseapp@gmail.com find help.");
                        return;
                    }
                    showDialog("WARNING", "Login Failed", "Unable to detect valid account information. Please contact customer service at 60-184682878.");
                }
            });

    };

    const [value, setValue] = useState("");
    const [secondsRemaining, setSecondsRemaining] = useState(180);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isResendOtpActive, setIsResendOtpActive] = useState(false);
    const [otp, setOtp] = useState("");
    const [isOtpVisible, setIsOtpVisible] = useState(false);

    useEffect(() => {
        let intervalId;
        if (isTimerActive && secondsRemaining > 0) {
            intervalId = setInterval(() => {
                setSecondsRemaining((prev) => prev - 1);
            }, 1000);
        } else if (secondsRemaining === 0) {
            setIsResendOtpActive(true);
            setIsTimerActive(false);
        }
        return () => clearInterval(intervalId);
    }, [isTimerActive, secondsRemaining]);

    const handleResendOtp = () => {
        setSecondsRemaining(180);
        setIsResendOtpActive(false);
        setOtp("");
        submitData();
    };

    const handleOtpInputChange = (text) => {

        if (!isTimerActive) {
            showToast("WARNING", "Warning", "Please get OTP first before entering it.");
            return;
        }

        setOtp(text);
        if (text.length === 4) {
            const userPhone = countryCodes[selectedValue] + value;
            userLoginWithSmsCode(userPhone, text);
        }
    };

    const driverSupplyInfo = (data, userPhone) => {
        setUserToken(data.token);
        buildUserInfo(data.token, userType.DRIVER, userPhone, data.loginStatus, data.firstName, data.lastName).saveWithLocal();
        navigation.navigate("DriverSupplyInfo");
        showDialog(ALERT_TYPE.SUCCESS, "Action Required", "Please complete your driver information.");
    };

    const driverUnderReview = () => {
        showDialog(ALERT_TYPE.SUCCESS, "Under Review", "Your information is currently under review. Please wait patiently.");
    };
    const driverActive = (data, userPhone) => {
        setUserToken(data.token);
        buildUserInfo(data.token, userType.DRIVER, userPhone, data.loginStatus, data.firstName, data.lastName).saveWithLocal();
        setTimeout(() => {
            saveUserAvatar(userPhone, data).then();
        }, 0);
        navigation.replace("Driver");
    };

    const driverNeedUploadInfo = (data, userPhone) => {
        navigation.replace("DriverRegisterImage", {token: data.token, userPhone: userPhone});
    };


    const userLoginWithSmsCode = (userPhone, code) => {
        const loginParams = {
            "userPhone": userPhone,
            "code": MD5(code).toString(), // 对验证码进行 MD5 加密
            "deviceId": deviceId,
            "platform": 0,
        };
        driverLogin(loginParams)
            .then(data => {
                responseOperation(data.code, () => {
                    const loginResult = data.data;
                    console.log("driver login result: " + loginResult);
                    //审核通过
                    if (DriverLoginStatusEnum.ACTIVE === loginResult.loginStatus) {
                        driverActive(loginResult, userPhone);
                    }
                    if (DriverLoginStatusEnum.NEED_SUPPLY === loginResult.loginStatus) {
                        driverSupplyInfo(loginResult, userPhone)
                    }
                    if (DriverLoginStatusEnum.UNDER_REVIEW === loginResult.loginStatus) {
                        driverUnderReview();
                    }
                    if (DriverLoginStatusEnum.NEED_UPLOAD_IMAGES === loginResult.loginStatus) {
                        driverNeedUploadInfo(loginResult, userPhone);
                    }
                }, () => {
                    showDialog(ALERT_TYPE.WARNING, "Login Failed", "Login failed: " + data.message);
                })
            })
            .catch(error => {
                showDialog(ALERT_TYPE.DANGER, "Login Error", "Login failed.");
            });
    };

    const renderButton = () => {
        if (isTimerActive) {
            return (
                <Button
                    variant="outline"
                    colorScheme="secondary"
                    size="sm"
                    mt="2"
                    isDisabled={true}
                >
                    <Text>{secondsRemaining} s</Text>
                </Button>
            );
        } else if (isResendOtpActive) {
            return (
                <Button
                    variant="outline"
                    colorScheme="secondary"
                    size="sm"
                    mt="2"
                    onPress={handleResendOtp}
                >
                    Resend
                </Button>
            );
        } else {
            return (
                <Button
                    backgroundColor="#0055A4"
                    mt="4"
                    onPress={submitData}
                >
                    Get OTP
                </Button>
            );
        }
    };

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '35%' }}>
                  <Image source={require('../picture/driver_login_bcg.png')} style={{ width: '70%', height: '70%', resizeMode: 'cover', top: '15%', left: '15%' }} />
              </View>
              <VStack space="2.5" px="8">
                  <FormControl isRequired>
                    <FormControl.Label>Please enter your phone number</FormControl.Label>
                    <HStack space={2}>
                        <Button
                            backgroundColor="#0055A4"
                            color="white"
                            onPress={() => setShowModal(true)}
                        >
                            {buttonText()}
                        </Button>
                        <Input
                            placeholder="Phone Number"
                            value={value}
                            onChangeText={(text) => setValue(text)}
                            keyboardType="numeric"
                            size="lg"
                            width={inputWidth}
                        />
                    </HStack>
                    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
                        <Modal.Content maxWidth="350">
                            <Modal.CloseButton/>
                            <Modal.Header>Select Country Code</Modal.Header>
                            <Modal.Body>
                                <Radio.Group defaultValue={selectedValue} name="countryCode" size="sm"
                                             onChange={handleSelect}>
                                    <VStack space={3}>
                                        <Radio
                                            alignItems="flex-start"
                                            _text={{mt: "-1", ml: "2", fontSize: "sm"}}
                                            value="my"
                                            colorScheme="blue"
                                        >
                                            +60 Malaysia
                                        </Radio>
                                        <Radio
                                            alignItems="flex-start"
                                            _text={{mt: "-1", ml: "2", fontSize: "sm"}}
                                            value="cn"
                                            colorScheme="blue"
                                        >
                                            +86 China
                                        </Radio>
                                    </VStack>
                                </Radio.Group>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    flex="1"
                                    onPress={() => {
                                        setShowModal(false);
                                    }}
                                    backgroundColor="#0055A4"
                                    color="white"
                                >
                                    Continue
                                </Button>
                            </Modal.Footer>
                        </Modal.Content>
                    </Modal>
                </FormControl>
                {isOtpVisible && (
                    <Input
                        size="lg"
                        placeholder="Enter OTP"
                        mt="4"
                        value={otp}
                        onChangeText={handleOtpInputChange}
                    />
                )}
                {renderButton()}
                <Text mt="4" textAlign="center">
                    Don't have an account?{" "}
                    <Text
                        onPress={() => navigation.navigate("DriverSignUp")}
                        color="blue.500"
                        _underline={{}}
                    >
                        Sign Up
                    </Text>
                    {" "} Switch to{" "}
                    <Text
                        onPress={() => navigation.navigate("UserLogin")}
                        color="blue.500"
                        _underline={{}}
                    >
                        User
                    </Text>
                </Text>
              </VStack>
          </View>
      </TouchableWithoutFeedback>
    );
}

export default function Driver() {
    return (
        <NativeBaseProvider>
            <Center flex={1}>
                <DriverScreen/>
            </Center>
        </NativeBaseProvider>
    );
}
