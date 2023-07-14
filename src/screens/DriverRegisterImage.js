import React, {useState, useEffect} from 'react';
import {SafeAreaView, TouchableWithoutFeedback, Keyboard, ScrollView, Linking} from 'react-native';
import {Center, Box, VStack, Button, FormControl, NativeBaseProvider, Icon, Text} from 'native-base';
import RemixIcon from 'react-native-remix-icon';
import {launchImageLibrary} from 'react-native-image-picker';
import {driverLogout, driverUpload} from "../com/evotech/common/http/BizHttpUtil";
import {DriverImageType, removeUserToken} from "../com/evotech/common/appUser/UserConstant";
import {getUserInfoWithLocal} from "../com/evotech/common/appUser/UserInfo";
import {useNavigation} from "@react-navigation/native";
import {showDialog, showToast, systemAlert} from "../com/evotech/common/alert/toastHelper";
import {
    checkPhotoLibraryPermission,
    requestPhotoLibraryPermission
} from "../com/evotech/permissions/PermissionsSupport";
import { openSettings } from "react-native-permissions";

import {isIOS} from "../com/evotech/common/system/OSUtils";
import { defaultHeaders } from "../com/evotech/common/http/HttpUtil";


const ImageUploadPage = ({route}) => {
    const { token,userPhone } = route.params;
    const [uploadedSelfie, setUploadedSelfie] = useState(false);
    const [uploadedCarInsurance, setUploadedCarInsurance] = useState(false);
    const [uploadedLicense, setUploadedLicense] = useState(false);
    const [uploadedIdCardFront, setUploadedIdCardFront] = useState(false);
    const [uploadedIdCardBack, setUploadedIdCardBack] = useState(false);
    const [uploadedPassport, setUploadedPassport] = useState(false);
    const [documentType, setDocumentType] = useState('ID');
    const navigation = useNavigation();

    const uploadTemplate = [
        {
            index: 0,
            label: "Selfie",
            desc: "Please upload your selfie...",
            handler: () => uploadImage(setUploadedSelfie, DriverImageType.Selfie),
            uploadStatus: uploadedSelfie,
        },
        {
            index: 1,
            label: "Car Insurance",
            desc: "Please upload your Car Insurance...",
            handler: () => uploadImage(setUploadedCarInsurance, DriverImageType.Vehicle_Insurance),
            uploadStatus: uploadedCarInsurance,
        },
        {
            index: 5,
            label: "License",
            desc: "Please upload your License...",
            handler: () => uploadImage(setUploadedLicense, DriverImageType.License),
            uploadStatus: uploadedLicense,
        },
    ];

    useEffect(() => {
        if (
          uploadedSelfie &&
          uploadedCarInsurance &&
          uploadedLicense &&
          (documentType === 'ID' ? (uploadedIdCardFront && uploadedIdCardBack) : uploadedPassport)
        ) {
            showDialog('SUCCESS', 'Success', 'All documents uploaded successfully! Please waiting fou us view, we will contact you within 2 working days. Thanks! ');
            navigation.replace("DriverLogin");

            //司机退出登录
            driverLogout().then();
            //清空本地司机信息
            removeUserToken();
            // 这里可以进行页面跳转或其他操作
        }
    }, [uploadedSelfie, uploadedCarInsurance, uploadedLicense, uploadedIdCardFront, uploadedIdCardBack, uploadedPassport, documentType]);


    const uploadImage = (setUploadStatus, uploadType) => {
        const options = {
            quality: 1.0,
            mediaType: 'photo',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        //第一次 请求获取相册权限
        requestPhotoLibraryPermission(()=>{},()=>{},()=>{})
        checkPhotoLibraryPermission((status) => {
            //允许访问
            launchImageLibrary(options, async response => {
                if (response.didCancel) {
                    showToast('WARNING', 'Action Cancelled', 'User cancelled image picker');
                } else if (response.error) {
                    showToast('DANGER', 'Error', 'ImagePicker Error: ' + JSON.stringify(response.error));
                } else {
                    const uri = response.assets[0].uri;
                    const params = {
                        uploadType: uploadType,
                        userPhone: userPhone
                    }
                    const header = defaultHeaders.getAuthentication(token);
                    try {
                        driverUpload(uri, params, { headers: header })
                            .then(data => {
                                showToast('SUCCESS', 'Upload Status', "Image upload result: " + data.message);
                                setUploadStatus(true);
                            }).catch(err => {
                            showDialog('DANGER', 'Upload Exception', "Image upload exception: " + err.message);
                        });
                    } catch (error) {
                        showDialog('DANGER', 'Upload Failed', 'Failed to upload file: ' + error.message);
                    }
                }
            }).then();
        },  () => {
            systemAlert('Action denied','Please enable access to the file',()=>{},()=>{
                if (isIOS()){
                    Linking.openURL('app-settings:');
                }else {
                    openSettings().catch(() => console.warn('cannot open settings'));
                }
            })
        }, (err) => {
            systemAlert('Action denied','Please enable access to the file',()=>{},()=>{
                if (isIOS()){
                    Linking.openURL('app-settings:');
                }else {
                    openSettings().catch(() => console.warn('cannot open settings'));
                }
            })
        });
    }


    const handleTabChange = (value) => {
        setDocumentType(value);
    };

    return (
      <NativeBaseProvider>
          <SafeAreaView style={{flex: 1}}>
              <ScrollView>
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                      <Center flex={1}>
                          <Box flex={1} p={4} width="100%">
                              <VStack space={4} width="100%">
                                  <Box bg='white' p={4} shadow={1} rounded="lg" marginTop={5}>
                                      <Text bold>Mention</Text>
                                      <Text pt={4}>
                                          This interface only collects information for verification purposes and will
                                          not disclose any personal details. Once all the document images have been
                                          uploaded, you will be automatically redirected to the next page.
                                      </Text>
                                  </Box>

                                  {uploadTemplate.map(form => (
                                    <Box key={form.label} bg="white" p={4} shadow={1} rounded="lg" marginTop={5}
                                         flexDirection="row" justifyContent="space-between">
                                        <VStack alignItems="flex-start">
                                            <Text bold>{form.label}</Text>
                                            <Text>{form.desc}</Text>
                                        </VStack>
                                        <Button
                                          p={0}
                                          w={10}
                                          h={10}
                                          rounded="full"
                                          bg={form.uploadStatus ? 'green.500' : 'blue.500'}
                                          onPress={form.handler}
                                        >
                                            <Icon as={RemixIcon}
                                                  name={form.uploadStatus ? 'check-line' : 'add-line'}
                                                  color="white"/>
                                        </Button>
                                    </Box>
                                  ))}

                                  <FormControl width="100%">
                                      <FormControl.Label>ID/PASSPORT</FormControl.Label>
                                      <VStack space={2}>
                                          <Button.Group variant="solid" isAttached space={2} borderColor="gray.200">
                                              <Button
                                                onPress={() => handleTabChange('ID')}
                                                colorScheme={documentType === 'ID' ? 'blue' : 'gray'}
                                                flex={1}
                                              >
                                                  ID
                                              </Button>
                                              <Button
                                                onPress={() => handleTabChange('Passport')}
                                                colorScheme={documentType === 'Passport' ? 'blue' : 'gray'}
                                                flex={1}
                                              >
                                                  Passport
                                              </Button>
                                          </Button.Group>
                                      </VStack>
                                  </FormControl>
                                  {documentType === 'ID' ?
                                    [
                                        {
                                            label: "ID Card Front",
                                            desc: "Please upload your ID Card Front...",
                                            handler: () => uploadImage(setUploadedIdCardFront, DriverImageType.NRIC_FRONT),
                                            uploadStatus: uploadedIdCardFront,
                                        },
                                        {
                                            label: "ID Card Back",
                                            desc: "Please upload your ID Card Back...",
                                            handler: () => uploadImage(setUploadedIdCardBack, DriverImageType.NRIC_BACK),
                                            uploadStatus: uploadedIdCardBack,
                                        }
                                    ].map(form => (
                                      <Box key={form.label} bg="white" p={4} shadow={1} rounded="lg" marginTop={5}
                                           flexDirection="row" justifyContent="space-between">
                                          <VStack alignItems="flex-start">
                                              <Text bold>{form.label}</Text>
                                              <Text>{form.desc}</Text>
                                          </VStack>
                                          <Button
                                            p={0}
                                            w={10}
                                            h={10}
                                            rounded="full"
                                            bg={form.uploadStatus ? 'green.500' : 'blue.500'}
                                            onPress={form.handler}
                                          >
                                              <Icon as={RemixIcon}
                                                    name={form.uploadStatus ? 'check-line' : 'add-line'}
                                                    color="white"/>
                                          </Button>
                                      </Box>
                                    )) :
                                    [
                                        {
                                            label: "Passport",
                                            desc: "Please upload your Passport...",
                                            handler: () => uploadImage(setUploadedPassport, DriverImageType.Passport),
                                            uploadStatus: uploadedPassport,
                                        }
                                    ].map(form => (
                                      <Box key={form.label} bg="white" p={4} shadow={1} rounded="lg" marginTop={5}
                                           flexDirection="row" justifyContent="space-between">
                                          <VStack alignItems="flex-start">
                                              <Text bold>{form.label}</Text>
                                              <Text>{form.desc}</Text>
                                          </VStack>
                                          <Button
                                            p={0}
                                            w={10}
                                            h={10}
                                            rounded="full"
                                            bg={form.uploadStatus ? 'green.500' : 'blue.500'}
                                            onPress={form.handler}
                                          >
                                              <Icon as={RemixIcon}
                                                    name={form.uploadStatus ? 'check-line' : 'add-line'}
                                                    color="white"/>
                                          </Button>
                                      </Box>
                                    ))
                                  }
                              </VStack>
                          </Box>
                      </Center>
                  </TouchableWithoutFeedback>
              </ScrollView>
          </SafeAreaView>
      </NativeBaseProvider>
    );
};

export default ImageUploadPage;
