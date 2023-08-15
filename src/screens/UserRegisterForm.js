import React, { useState, useRef, useEffect } from "react";
import { Keyboard, TouchableWithoutFeedback, SafeAreaView } from "react-native";
import {
  Box,
  Button,
  Center,
  FormControl,
  HStack,
  Input,
  NativeBaseProvider,
  VStack,
  Text, Modal, Radio,
} from "native-base";
import { MD5 } from "crypto-js";
import { smsSend, userRegistry } from "../com/evotech/common/http/BizHttpUtil";
import { saveUserAvatar, setUserToken, userType } from "../com/evotech/common/appUser/UserConstant";
import { useNavigation } from "@react-navigation/native";
import { buildUserInfo } from "../com/evotech/common/appUser/UserInfo";
import { UserTypeEnum } from "../com/evotech/common/constant/BizEnums";
import { showDialog, showToast } from "../com/evotech/common/alert/toastHelper";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";
import { deviceId } from "../com/evotech/common/system/OSUtils";


const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isResendOtpActive, setIsResendOtpActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  //验证码获取之前灰度
  const [isCodeRequested, setIsCodeRequested] = useState(false);

  const [isCodeInputVisible, setIsCodeInputVisible] = useState(false);

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
        return "MY +60";
      case "cn":
        return "CHN +86";
      default:
        return "Select Country Code";
    }
  };

  // 创建一个ref
  const firstNameInputRef = useRef(null);

  // 使用useEffect，在组件挂载完成后聚焦在firstName输入框
  useEffect(() => {
    if (firstNameInputRef.current) {
      firstNameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    listenVerificationCode();
  }, [verificationCode]);


  const sendSmsSuccessAfterAgain = () => {
    setIsTimerActive(true);
    setIsResendOtpActive(false);
    let counter = 180;
    setSecondsRemaining(counter);
    const timer = setInterval(() => {
      counter--;
      setSecondsRemaining(counter);
      if (counter === 0) {
        clearInterval(timer);
        setIsTimerActive(false);
        setIsResendOtpActive(true);
      }
    }, 1000);
    showToast("SUCCESS", "Success", "SMS sent successfully!");

  };

  const sendSmsSuccessAfter = () => {
    setIsTimerActive(true);
    setIsResendOtpActive(false);
    //当验证码发送成功后，把 isCodeRequested 设为 true
    setIsCodeRequested(true);
    setIsCodeInputVisible(true);
    let counter = 180;
    setSecondsRemaining(counter);
    const timer = setInterval(() => {
      counter--;
      setSecondsRemaining(counter);
      if (counter === 0) {
        clearInterval(timer);
        setIsTimerActive(false);
        setIsResendOtpActive(true);
      }
    }, 1000);
    showToast("SUCCESS", "Success", "SMS sent successfully!");
  };

  const submitData = () => {
    // 检查所有输入框都已填写
    if (!firstName || !lastName || !email || !phoneNumber) {
      showToast("WARNING", "Missing Data", "Please fill in all the fields.");
      return;
    }

    if ((firstName.length + lastName.length) > 23) {
      showDialog('WARNING', 'Invalid Input', 'The combined length of your first name and last name should not exceed 24 characters.');
      return;
    }

    // 验证电子邮件格式
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showToast("WARNING", "Invalid Email", "Please enter a valid email address.");
      return;
    }

    // 验证电话号码不以60或0开头
    if (phoneNumber.startsWith("60") || phoneNumber.startsWith("0")) {
      showDialog("WARNING", "Invalid Input", "Please enter a valid phone number without including 60 or 0 at the beginning.");
      return;
    }

    // 根据选择的国家代码，验证电话号码
    let phonePattern;
    if (selectedValue === "60") {
      phonePattern = /^(?!60|0)\d{9,10}$/;
      if (!phonePattern.test(phoneNumber)) {
        showDialog("WARNING", "Invalid Input", "Please enter a valid 9-digit or 10-digit phone number without including 60 or 6 at the beginning.");
        return;
      }
    } else if (selectedValue === "86") {
      phonePattern = /^\d{11}$/;
      if (!phonePattern.test(phoneNumber)) {
        showDialog("WARNING", "Invalid Input", "Please enter a valid 11-digit phone number");
        return;
      }
    }

    // 调用后端函数发送验证码
    const userPhone = selectedValue === "my" ? "60" + phoneNumber : "86" + phoneNumber;
    smsSend(userPhone, UserTypeEnum.PASSER)
      .then(data => {
        responseOperation(data.code, () => {
          sendSmsSuccessAfter();
        }, () => {
          showDialog("WARNING", "Error", data.message);
        });
      })
      .catch(error => {
        showDialog("DANGER", "Error", error.message);
      });
  };

  const handleResendOtp = () => {
    // 再次发送验证码
    const userPhone = selectedValue === "my" ? "60" + phoneNumber : "86" + phoneNumber;
    smsSend(userPhone, UserTypeEnum.PASSER)
      .then(data => {
        responseOperation(data.code, () => {
          sendSmsSuccessAfterAgain();
        }, () => {
          showDialog("WARNING", "Error", data.message);
        });
      })
      .catch(error => {
        showDialog("DANGER", "Error", "Error: " + error.message);
      });
  };

  const listenVerificationCode = () => {
    if (verificationCode.length === 4) { // 当验证码长度为4时，提交验证
      doUserRegistry();
    }
  };

  const doUserRegistry = () => {
    const userPhone = selectedValue === "my" ? "60" + phoneNumber : "86" + phoneNumber;

    const md5VerificationCode = MD5(verificationCode).toString();

    const registryParams = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      userPhone: userPhone,
      deviceId: deviceId,
      platform: 0,
      // code: verificationCode,
      code: md5VerificationCode, // 使用加密后的验证码

    };
    userRegistry(registryParams)
      .then(data => {
        responseOperation(data.code, () => {
          showToast("SUCCESS", "Registration Success", "Registration was successful");
          setUserToken(data.data);
          buildUserInfo(data.data, userType.USER, userPhone, "",registryParams.firstName,registryParams.lastName).saveWithLocal();
          setTimeout(() => {
            saveUserAvatar(userPhone, null).then();
          }, 0);
          navigation.navigate("User");
        }, () => {
          showDialog("WARNING", "Registration Failed", data.message);
        });
      })
      .catch(error => {
        showDialog("DANGER", "Error", "Error: " + error.message);
      });
    setVerificationCode("");
  };

  const renderButton = () => {
    if (isTimerActive) {
      return (
        <Button variant="outline" colorScheme="secondary" size="sm" mt="2" isDisabled={true}>
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
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Center flex={1}>
          <Box flex={1} p={4} width="100%">
            <VStack space={4} width="100%">
              <HStack space={4} width="100%">
                <FormControl flex={1}>
                  <FormControl.Label>First Name</FormControl.Label>
                  <Input
                    size="lg"
                    ref={firstNameInputRef}
                    placeholder="Enter first name"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </FormControl>
                <FormControl flex={1}>
                  <FormControl.Label>Last Name</FormControl.Label>
                  <Input
                    size="lg"
                    placeholder="Enter last name"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </FormControl>
              </HStack>
              <FormControl width="100%">
                <FormControl.Label>Email</FormControl.Label>
                <Input
                  size="lg"
                  placeholder="Enter email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </FormControl>
              <FormControl width="100%">
                <FormControl.Label>Phone Number</FormControl.Label>
                <HStack space={2} width="100%">
                  <Button
                    backgroundColor="#0055A4"
                    color="white"
                    onPress={() => setShowModal(true)}
                  >
                    {buttonText()}
                  </Button>
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
                  <Input
                    placeholder={selectedValue === "my" ? "Enter 9 or 10 digit number" : "Enter 11 digit number"}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="numeric"
                    flex={7}
                    size="lg"
                  />
                </HStack>
              </FormControl>
              {
                isCodeInputVisible && (
                  <FormControl width="100%">
                    <FormControl.Label>Verification Code</FormControl.Label>
                    <Input
                      size="lg"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      keyboardType="numeric"
                      maxLength={4}
                      isDisabled={!isCodeRequested} // 当 isCodeRequested 为 false 时，输入框被禁用
                    />
                  </FormControl>
                )
              }
              {renderButton()}
            </VStack>
          </Box>
        </Center>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default function UserSignUp() {
  return (
    <NativeBaseProvider>
      <RegisterScreen />
    </NativeBaseProvider>
  );
}
