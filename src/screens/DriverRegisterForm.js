import React, {useState, useRef, useEffect} from 'react';
import {Keyboard, TouchableWithoutFeedback, SafeAreaView,View} from 'react-native';
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
import {MD5} from 'crypto-js';
import {smsSend, driverRegister} from "../com/evotech/common/http/BizHttpUtil";
import {getUserID, setUserToken, userType} from "../com/evotech/common/appUser/UserConstant";
import {useNavigation} from '@react-navigation/native';
import {buildUserInfo} from "../com/evotech/common/appUser/UserInfo";
import {UserTypeEnum} from "../com/evotech/common/constant/BizEnums";
import {showDialog, showToast} from "../com/evotech/common/alert/toastHelper";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";


const RegisterScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    // const [selectedValue, setSelectedValue] = useState('60');
    const [verificationCode, setVerificationCode] = useState('');
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isResendOtpActive, setIsResendOtpActive] = useState(false);
    const [secondsRemaining, setSecondsRemaining] = useState(0);
    //验证码获取之前灰度
    const [isCodeRequested, setIsCodeRequested] = useState(false);

    const [showVerificationCode, setShowVerificationCode] = useState(false);


    //页面跳转
    const navigation = useNavigation();

    const [selectedValue, setSelectedValue] = useState('my');
    const [showModal, setShowModal] = useState(false);

    const handleSelect = (value) => {
        setSelectedValue(value);
        setShowModal(false);
    };

    const buttonText = () => {
        switch (selectedValue) {
            case 'my':
                return 'MY +60';
            case 'cn':
                return 'CHN +86';
            default:
                return 'Select Country Code';
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
        listenVerificationCode()
    }, [verificationCode]);

    const submitData = () => {
        // 检查所有输入框都已填写
        if (!firstName || !lastName || !email || !phoneNumber) {
            showToast('WARNING', 'Missing Data', 'Please fill in all the fields.');
            return;
        }

        // 验证电子邮件格式
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showToast('WARNING', 'Invalid Email', 'Please enter a valid email address.');
            return;
        }

        // 根据选择的国家代码，验证电话号码
        let phonePattern;

        if (selectedValue === '60') {
            phonePattern = /^(?!60|0)\d{9,10}$/;
            if (!phonePattern.test(phoneNumber)) {
                showDialog('WARNING', 'Invalid Input', 'Please enter a valid 9-digit or 10-digit phone number without including 60 or 6 at the beginning.');
                return;
            }
        } else if (selectedValue === '86') {
            phonePattern = /^\d{11}$/;
            if (!phonePattern.test(phoneNumber)) {
                showDialog('WARNING', 'Invalid Input', 'Please enter a valid 11-digit phone number');
                return;
            }
        }
        // 调用后端函数发送验证码
        const userPhone = selectedValue === 'my' ? '60' + phoneNumber : '86' + phoneNumber;

        smsSend(userPhone,UserTypeEnum.DRIVER)
            .then(data => {
                if (data.code === 200) {
                    setIsTimerActive(true);
                    setIsResendOtpActive(false);
                    //当验证码发送成功后，把 isCodeRequested 设为 true
                    setIsCodeRequested(true);
                    setShowVerificationCode(true);
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
                    showToast('SUCCESS', 'Success', 'SMS sent successfully!');
                } else {
                    showDialog('WARNING', 'Warning', data.message);
                }
            })
            .catch(error => {
                console.log(error);
                showDialog('DANGER', 'Error', 'Error', error.message);
            });
    };

    const handleResendOtp = () => {
        // 再次发送验证码
        const userPhone = selectedValue === 'my' ? '60' + phoneNumber : '86' + phoneNumber;
        smsSend(userPhone,UserTypeEnum.DRIVER)
            .then(data => {
                responseOperation(data.code, () => {
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
                        showToast('SUCCESS', 'Success', 'SMS resent successfully!');
                }, () => {
                    showDialog('WARNING', 'Warning', data.message);
                })
            })
            .catch(error => {
                console.log(error);
                showDialog('DANGER', 'Error', 'Error', error.message);
            });
    };

    const listenVerificationCode = () => {
        if (verificationCode.length === 4) { // 当验证码长度为4时，提交验证
            doUserRegistry();
        }
    }
    const doUserRegistry = () => {
        const userPhone = selectedValue === 'my' ? '60' + phoneNumber : '86' + phoneNumber;

        const md5VerificationCode = MD5(verificationCode).toString();

        const registryParams = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            userPhone: userPhone,
            deviceId: getUserID(),
            platform: 0,
            // code: verificationCode,
            code: md5VerificationCode, // 使用加密后的验证码

        };
        driverRegister(registryParams)
            .then(data => {
                if (data.code === 200) {
                    showDialog('SUCCESS', 'Success', 'Registration successful! Please upload documents for us review');
                    navigation.replace("DriverRegisterImage",  {token: data.data});
                    setShowVerificationCode(false);
                    return data.data;
                } else {
                    showDialog('WARNING', 'Warning', data.message);
                }
            }).then((token) => {
            saveUserInfo('', userType.DRIVER, userPhone, getUserID(),"DRIVER")
            })
            .catch(error => {
                showDialog('DANGER', 'Error', 'Error', error.message);
            });
        setVerificationCode('');
    };

    const saveUserInfo = (token, userType, userPhone, identifier,userName) => {
        const userInfo = buildUserInfo(token, userType, userPhone, identifier,userName);
        userInfo.saveWithLocal();
    }

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
                <Button mt="4" onPress={submitData}>
                    Get OTP
                </Button>
            );
        }
    };

    return (
        <SafeAreaView style={{flex: 1}}>
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
                                    <Button flex={3} onPress={() => setShowModal(true)}>
                                        {buttonText()}
                                    </Button>
                                    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
                                        <Modal.Content maxWidth="350">
                                            <Modal.CloseButton />
                                            <Modal.Header>Select Country Code</Modal.Header>
                                            <Modal.Body>
                                                <Radio.Group defaultValue={selectedValue} name="countryCode" size="sm" onChange={handleSelect}>
                                                    <VStack space={3}>
                                                        <Radio alignItems="flex-start" _text={{ mt: "-1", ml: "2", fontSize: "sm" }} value="my">
                                                            +60 Malaysia
                                                        </Radio>
                                                        <Radio alignItems="flex-start" _text={{ mt: "-1", ml: "2", fontSize: "sm" }} value="cn">
                                                            +86 China
                                                        </Radio>
                                                    </VStack>
                                                </Radio.Group>
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button flex="1" onPress={() => { setShowModal(false); }}>
                                                    Continue
                                                </Button>
                                            </Modal.Footer>
                                        </Modal.Content>
                                    </Modal>
                                    <Input
                                      placeholder={selectedValue === 'my' ? 'Enter 9 or 10 digit number' : 'Enter 11 digit number'}
                                      value={phoneNumber}
                                      onChangeText={setPhoneNumber}
                                      keyboardType="numeric"
                                      flex={7}
                                      size="lg"
                                    />
                                </HStack>
                            </FormControl>
                            {showVerificationCode && (
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
                            )}
                            {renderButton()}
                        </VStack>
                    </Box>
                </Center>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
};

export default function DriverSignUp() {
    return (
        <NativeBaseProvider>
            <RegisterScreen/>
        </NativeBaseProvider>
    );
}
