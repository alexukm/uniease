import { Image, Keyboard, Platform, TouchableWithoutFeedback, View } from "react-native";
import { MD5 } from "crypto-js";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  getUserID,
  LOCAL_USER_INFO_FILE_PATH,
  saveLocalImage, saveUserAvatar,
  setUserToken, USER_AVATAR_FILE_NAME,
  userType,
} from "../com/evotech/common/appUser/UserConstant";
import {userLogin, smsSend, downloadUserAvatar, checkUserAccount} from "../com/evotech/common/http/BizHttpUtil";
import {
  FormControl,
  Center,
  Modal,
  VStack,
  Button,
  NativeBaseProvider,
  Input,
  Text,
  HStack,
  Radio,
} from "native-base";
import { buildUserInfo } from "../com/evotech/common/appUser/UserInfo";
import { ImagesEnum, UserTypeEnum } from "../com/evotech/common/constant/BizEnums";
import {showDialog, showToast} from "../com/evotech/common/alert/toastHelper";
import {
  isAccountNotFound, isDisabled, isLocked,
  isSuccess,
  isUnderReview,
  responseOperation
} from "../com/evotech/common/http/ResponseOperation";
import DeviceInfo from "react-native-device-info";
import { deviceId } from "../com/evotech/common/system/OSUtils";
import * as RNFS from "react-native-fs";
import { requestPrefix } from "../com/evotech/common/http/HttpUtil";
import {ALERT_TYPE} from "react-native-alert-notification";

const countryCodes = {
  my: "60",
  cn: "86",
};

function UserScreen() {
  const navigation = useNavigation();

  const [otp, setOtp] = useState("");
  const [selectedValue, setSelectedValue] = useState("my");
  const [showModal, setShowModal] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(true);

  const [value, setValue] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isResendOtpActive, setIsResendOtpActive] = useState(false);
  const [isOtpVisible, setIsOtpVisible] = useState(false);


  const inputWidth = Platform.OS === "ios" ? "82%" : "84%";


  const handleSelect = (value) => {
    setSelectedValue(value);
    setIsPhoneNumberValid(true);
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
    if (!value) {
      showToast("WARNING", "Warning", "Please enter a phone number");
      return;
    }

    if (!selectedValue) {
      showToast("WARNING", "Warning", "Please choose a country code");
      return;
    }

    if (!isPhoneNumberValid) {
      showToast("WARNING", "Warning", "Please enter a valid number.");
      return;
    }

    const prefix = countryCodes[selectedValue];
    const phoneNumber = prefix ? prefix + value : value;

    const checkParam = {
      userPhone: phoneNumber,
      userType: 'passer',
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

            //账户不存在
            if (isAccountNotFound(checkStatus)) {
              //TODO 弹窗提示是否跳转注册页
            }


            //账户被锁定
            if (isLocked(checkStatus)) {
              //TODO 账户被锁定无法登录 弹窗提示
            }

            //账户被禁用
            if (isDisabled(checkStatus)) {
              //TODO 账户被禁用无法登录 弹窗提示

            }

            //TODO 其他情况 弹窗提示 无法检测到有效的账户信息 请联系客服xxxx
          }
        });

    smsSend(phoneNumber, UserTypeEnum.PASSER)
      .then(data => {
        responseOperation(data.code, () => {
          setIsTimerActive(true);
          setIsOtpVisible(true);
          showToast("SUCCESS", "Success", "The SMS has been sent successfully.");
        }, () => {
          showToast("WARNING", "Warning", data.message);
        });
      })
      .catch(error => {
        console.log(error);
        showToast("DANGER", "Error", "There was an error submitting your data. Please try again.");
      });
  };


  const setValueAndCheckLength = (text) => {
    setValue(text);

    if (selectedValue === "cn") {
      if (text.length !== 11) {
        setIsPhoneNumberValid(false);
        return;
      }
    }

    if (selectedValue === "my") {
      const phonePattern = /^(?!60|0)\d{9,10}$/;
      if (!phonePattern.test(text)) {
        setIsPhoneNumberValid(false);
        return;
      }
    }

    setIsPhoneNumberValid(true);
  };

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

  // useEffect(() => {
  //   const fetchDeviceId = async () => {
  //     let deviceId = await DeviceInfo.getUniqueId();
  //     console.log('User Login Device ID:', deviceId);
  //   };
  //
  //   fetchDeviceId();
  // }, []);


  const handleOtpInputChange = (text) => {
    if (!isTimerActive) {
      showToast("WARNING", "Warning", "Please get OTP first before entering it.");
      return;
    }
    setOtp(text);
    if (text.length === 4) {
      const userPhone = countryCodes[selectedValue] + value;
      userLoginWithSmsCode(userPhone, text).then();
    }
  };


  const userLoginWithSmsCode = async (userPhone, code) => {
    const loginParams = {
      "userPhone": userPhone,
      "code": MD5(code).toString(), // 对验证码进行 MD5 加密
      "deviceId": deviceId,
      "platform": 0,
    };
    userLogin(loginParams)
      .then(data => {
        responseOperation(data.code, () => {
          const loginResult = data.data;
          setUserToken(loginResult.token);
          buildUserInfo(loginResult.token, userType.USER, userPhone, "", loginResult.firstName, loginResult.lastName).saveWithLocal();
          setTimeout(() => {
            saveUserAvatar(userPhone, loginResult);
          }, 0);
          navigation.replace("User");
          showToast("SUCCESS", "Login Successful", "You have successfully logged in!");
        }, () => {
          showToast("WARNING", "Login Failed", data.message);
        });
      })
      .catch(error => {
        console.log(error);
        showToast("WARNING", "Login Error", "Error: " + error.message);
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
      <View style={{ flex: 1 }}>
        {/* Image */}
        <Image source={require('../picture/login_bcg.png')} style={{ width: '100%', height: '30%', position: "absolute", top: 0, left: 0 }} />
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', justifyContent: 'center' }}>
          <Text style={{ marginLeft: 10, color: 'white', fontWeight: 'bold', fontSize: 18 }}>
            Sign in to your account
          </Text>
        </View>
        {/* VStack */}
        <VStack space="2.5" mt="280" px="8">
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
              onChangeText={setValueAndCheckLength}
              keyboardType="numeric"
              size="lg"
              width={inputWidth}
            />
          </HStack>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
            <Modal.Content maxWidth="350">
              <Modal.CloseButton />
              <Modal.Header>Select Country Code</Modal.Header>
              <Modal.Body>
                <Radio.Group defaultValue={selectedValue} name="countryCode" size="sm" onChange={handleSelect}>
                  <VStack space={3}>
                    <Radio
                      alignItems="flex-start"
                      _text={{ mt: "-1", ml: "2", fontSize: "sm" }}
                      value="my"
                      colorScheme="blue"
                    >
                      +60 Malaysia
                    </Radio>
                    <Radio
                      alignItems="flex-start"
                      _text={{ mt: "-1", ml: "2", fontSize: "sm" }}
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
        {!isPhoneNumberValid && (
          <Text color="orange.500" mt="1" fontSize="sm">
            {selectedValue === "cn" ? "Enter 11-digit phone number for China" : "Enter phone number. Not allowed 60 or 0 in the beginning."}
          </Text>
        )}
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
            onPress={() => navigation.navigate("UserSignUp")}
            color="blue.500"
            _underline={{}}
          >
            Sign Up
          </Text>
          {" "}. Switch to{" "}
          <Text
            onPress={() => navigation.navigate("DriverLogin")}
            color="blue.500"
            _underline={{}}
          >
            Driver
          </Text>
        </Text>

      </VStack>
      </View>
    </TouchableWithoutFeedback>
  );
}

export default function User() {
  return (
    <NativeBaseProvider>
      <Center flex={1}>
        <UserScreen />
      </Center>
    </NativeBaseProvider>
  );
}
