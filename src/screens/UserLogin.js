import { Alert, Image, Keyboard, Platform, TouchableWithoutFeedback, View } from "react-native";
import { MD5 } from "crypto-js";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  createUserInfoDirectory,
  saveUserAvatar,
  setUserToken,
  userType,
} from "../com/evotech/common/appUser/UserConstant";
import { userLogin, smsSend, checkUserAccount } from "../com/evotech/common/http/BizHttpUtil";
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
  Radio, KeyboardAvoidingView,
} from "native-base";
import { buildUserInfo } from "../com/evotech/common/appUser/UserInfo";
import { UserTypeEnum } from "../com/evotech/common/constant/BizEnums";
import { showDialog, showToast } from "../com/evotech/common/alert/toastHelper";
import {
  isAccountNotFound, isDisabled,
  isLocked,
  isSuccess,
  responseOperation,
} from "../com/evotech/common/http/ResponseOperation";
import { deviceId } from "../com/evotech/common/system/OSUtils";
import { ALERT_TYPE } from "react-native-alert-notification";

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
      userType: "passer",
    };

    checkUserAccount(checkParam)
      .then(data => {
        const checkStatus = data.code;
        //账户存在
        if (isSuccess(checkStatus)) {
          smsSend(phoneNumber, UserTypeEnum.PASSER)
            .then(data => {
              responseOperation(data.code, () => {
                setIsTimerActive(true);
                setIsOtpVisible(true);
                showToast("SUCCESS", "Success", "The SMS has been sent successfully.");
              }, () => {
                showDialog(ALERT_TYPE.WARNING, "Warning", data.message);
                return false;
              });
            })
            .catch(error => {
              showDialog(ALERT_TYPE.DANGER, "Error", "Error: " + error.message);
              return false;
            });
        } else {
          //其他情况

          //账户不存在
          if (isAccountNotFound(checkStatus)) {
            Alert.alert(
              "Account Not Found",
              "We couldn't find your account. Would you like to register?",
              [
                {
                  text: "Yes, Register",
                  onPress: () => {
                    navigation.navigate("UserSignUp"); // 请根据您的路由配置进行调整
                  },
                },
                {
                  text: "No, Thanks",
                  style: "cancel",
                },
              ],
              { cancelable: false },
            );
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
      })
      .catch(err =>{
        showDialog(ALERT_TYPE.WARNING, "Warning", err.message);
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
            createUserInfoDirectory().then(()=>{
              saveUserAvatar(userPhone, loginResult).then();
            })
          }, 0);
          navigation.replace("User");
          showToast("SUCCESS", "Login Successful", "You have successfully logged in!");
        }, () => {
          showToast("WARNING", "Login Failed", data.message);
        });
      })
      .catch(error => {
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <View style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "35%" }}>
            <Image source={require("../picture/user_login_bcg.png")}
                   style={{ width: "70%", height: "70%", resizeMode: "cover", top: "15%", left: "15%" }} />
          </View>
          {/* VStack */}
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
