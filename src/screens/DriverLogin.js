import { Keyboard, TouchableWithoutFeedback, View, Image } from "react-native";
import { MD5 } from "crypto-js";
import React, { useState, useEffect } from "react";
import { driverInfoStatus, driverLogin, smsSend } from "../com/evotech/common/http/BizHttpUtil";
import { useNavigation } from "@react-navigation/native";
import { setUserToken, userType } from "../com/evotech/common/appUser/UserConstant";
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
import { buildUserInfo } from "../com/evotech/common/appUser/UserInfo";
import {
  DriverInfoStatusEnum,
  DriverLoginStatusEnum,
  ImagesEnum,
  UserTypeEnum,
} from "../com/evotech/common/constant/BizEnums";
import { showDialog, showToast } from "../com/evotech/common/alert/toastHelper";
import { ALERT_TYPE } from "react-native-alert-notification";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";

const countryCodes = {
  my: "60",
  cn: "86",
};

function DriverScreen() {

  const navigation = useNavigation();
  const [selectedValue, setSelectedValue] = useState("my");
  const [showModal, setShowModal] = useState(false);

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
    smsSend(phoneNumber, UserTypeEnum.DRIVER)
      .then(data => {
        responseOperation(data.code, () => {
            setIsTimerActive(true);
            console.log(data.code);
            showToast("SUCCESS", "Success", "The SMS has been sent successfully.");
        }, () => {
          showDialog(ALERT_TYPE.WARNING, "Warning", data.message);
          return false;
        })
      })
      .catch(error => {
        console.log(error);
        showDialog(ALERT_TYPE.DANGER, "Error", "Error: " + error.message);
        return false;
      });
  };

  const [value, setValue] = useState("");
  // const [modalVisible, setModalVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isResendOtpActive, setIsResendOtpActive] = useState(false);
  const [otp, setOtp] = useState("");

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
    setSecondsRemaining(30);
    setIsResendOtpActive(false);
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

  const driverSupplyInfo = (data,userPhone) => {
    setUserToken(data.token);
    buildUserInfo(data.token, userType.DRIVER, userPhone,data.loginStatus).saveWithLocal();
    navigation.navigate("DriverSupplyInfo");
    showDialog(ALERT_TYPE.SUCCESS, "Action Required", "Please complete your driver information.");
  };

  const driverUnderReview = () => {
    showDialog(ALERT_TYPE.SUCCESS, "Under Review", "Your information is currently under review. Please wait patiently.");
  };
  const driverActive = (data,userPhone) => {
    setUserToken(data.token);
    buildUserInfo(data.token, userType.DRIVER, userPhone,data.loginStatus).saveWithLocal();
    navigation.navigate("Driver");
  };

  const driverNeedUploadInfo = (data,userPhone) => {
    navigation.replace("DriverRegisterImage",  {token: data.token,userPhone: userPhone});
  };

  const userLoginWithSmsCode = (userPhone, code) => {
    const loginParams = {
      "userPhone": userPhone,
      "code": MD5(code).toString(), // 对验证码进行 MD5 加密
      "deviceId": "12345",
      "platform": 0,
    };
    driverLogin(loginParams)
      .then(data => {
        responseOperation(data.code, () => {
            const loginResult = data.data;
            console.log(JSON.stringify(loginResult));
            //审核通过
            if (DriverLoginStatusEnum.ACTIVE === loginResult.loginStatus ) {
              driverActive(loginResult, userPhone);
            }
            if (DriverLoginStatusEnum.NEED_SUPPLY === loginResult.loginStatus) {
              driverSupplyInfo(loginResult, userPhone)
            }
            if (DriverLoginStatusEnum.UNDER_REVIEW === loginResult.loginStatus) {
              driverUnderReview();
            }
            if (DriverLoginStatusEnum.NEED_UPLOAD_IMAGES === loginResult.loginStatus) {
              driverNeedUploadInfo(loginResult,userPhone);
            }
        }, () => {
            showDialog(ALERT_TYPE.WARNING, "Login Failed", "Login failed: " + data.message);
        })
      })
      .catch(error => {
        console.log(error);
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
      <VStack space="2.5" mt="4" px="8" style={{position: 'relative'}}>
        <View style={{position: 'absolute', top: -180, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', height: '50%'}}>
          <Image source={{ uri: ImagesEnum.DriverLogin }} style={{width: 100, height: 100}} />
        </View>
        <FormControl isRequired>
          <FormControl.Label>Please enter your phone number</FormControl.Label>
          <HStack space={2}>
            <Button onPress={() => setShowModal(true)}>
              {buttonText()}
            </Button>
            <Input
              placeholder="Phone Number"
              value={value}
              onChangeText={(text) => setValue(text)}
              keyboardType="numeric"
              size="lg"
              width="84%"
            />
          </HStack>
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
            <Modal.Content maxWidth="350">
              <Modal.CloseButton />
              <Modal.Header>Select Country Code</Modal.Header>
              <Modal.Body>
                <Radio.Group defaultValue={selectedValue} name="countryCode" size="sm"
                             onChange={handleSelect}>
                  <VStack space={3}>
                    <Radio alignItems="flex-start" _text={{ mt: "-1", ml: "2", fontSize: "sm" }}
                           value="my">
                      +60 Malaysia
                    </Radio>
                    <Radio alignItems="flex-start" _text={{ mt: "-1", ml: "2", fontSize: "sm" }}
                           value="cn">
                      +86 China
                    </Radio>
                  </VStack>
                </Radio.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button flex="1" onPress={() => {
                  setShowModal(false);
                }}>
                  Continue
                </Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        </FormControl>
        <Input
          size="lg"
          placeholder="Enter OTP"
          mt="4"
          onChangeText={handleOtpInputChange}
        />
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
    </TouchableWithoutFeedback>
  );
}

export default function Driver() {
  return (
    <NativeBaseProvider>
      <Center flex={1}>
        <DriverScreen />
      </Center>
    </NativeBaseProvider>
  );
}
