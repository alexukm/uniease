import React, {useEffect, useRef, useState} from 'react';
import {
    SafeAreaView, TouchableWithoutFeedback, Keyboard, ScrollView,  Modal, View, TouchableHighlight
} from 'react-native';
import {
    Box,
    VStack,
    Button,
    FormControl,
    Input,
    NativeBaseProvider,
    Icon,
    Text,
    Flex
} from 'native-base';
import RemixIcon from 'react-native-remix-icon';
import {launchImageLibrary} from 'react-native-image-picker';
import {driverSupplyInfo, driverUpload} from "../com/evotech/common/http/BizHttpUtil";
import {CarType, DriverImageType} from "../com/evotech/common/appUser/UserConstant";
import {getUserInfoWithLocal, removeUserInfo} from "../com/evotech/common/appUser/UserInfo";
import DatePicker from 'react-native-date-picker';
import RBSheet from "react-native-raw-bottom-sheet";
import {format} from "date-fns";
import {useNavigation} from "@react-navigation/native";
import {showDialog, showToast} from "../com/evotech/common/alert/toastHelper";


const DriverSupplyInfo = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [uploadedCarPath, setUploadedCarPath] = useState(false);
    const [chassisNumber, setChassisNumber] = useState("");
    const [carRegistryDate, setCarRegistryDate] = useState(null);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [carColor, setCarColor] = useState("");
    const [carType, setCarType] = useState(0);
    const [carTypeDesc, setCarTypeDesc] = useState('Sedan');
    const [carBrand, setCarBrand] = useState('');
    const [bankAccount, setBankAccount] = useState("");
    const [bankName, setBankName] = useState("");
    const [bankHolderName, setBankHolderName] = useState("");
    const [bankAddress, setBankAddress] = useState("");
    const [emergencyName, setEmergencyName] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("");
    const [emergencyRs, setEmergencyRs] = useState("");
    const [emergencyAddress, setEmergencyAddress] = useState("");
    const refRBSheet = useRef(null);
    const navigation = useNavigation();

    // const carTypes = ['Sedan', 'Sport Utility Vehicle (SUV)', 'Multi-Purpose Vehicle (MPV)', 'Coupé', 'Pickup Truck'];
    const carTypes = Object.values(CarType);
    useEffect(() => {
        setTimeout(async () => {
            console.log("init userinfo")
            setUserInfo(await getUserInfoWithLocal())
            removeUserInfo();
        }, 0);
    }, []);

    const uploadImage = () => {
        const options = {
            quality: 1.0,
            mediaType: 'photo',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        launchImageLibrary(options, async response => {
            if (response.didCancel) {
                showToast('WARNING', 'Action Cancelled', 'User cancelled image picker');
            } else if (response.error) {
                showToast('DANGER', 'Error', 'ImagePicker Error: ' + JSON.stringify(response.error));
            } else {
                const uri = response.assets[0].uri;
                const params = {
                    uploadType: DriverImageType.Car_Path,
                    userPhone: userInfo.userPhone,
                };
                try {
                    driverUpload(uri, params)
                        .then(data => {
                            showToast('SUCCESS', 'Upload Status', "Image upload result: " + data.message);
                            setUploadedCarPath(true);
                        }).catch(err => {
                        showToast('DANGER', 'Upload Exception', "Image upload exception: " + err.message);
                    });
                } catch (error) {
                    showToast('DANGER', 'Upload Failed', 'Failed to upload file: ' + error.message);
                }
            }
        });
    };

    const handleSubmit = async () => {
        const fields = [
            // {name: 'userPhone', value: userPhone},
            {name: 'chassisNumber', value: chassisNumber},
            {name: 'carRegistryDate', value: carRegistryDate},
            {name: 'carColor', value: carColor},
            {name: 'carType', value: carTypeDesc},
            {name: 'carBrand', value: carBrand},
            {name: 'bankAccount', value: bankAccount},
            {name: 'bankName', value: bankName},
            {name: 'bankHolderName', value: bankHolderName},
            {name: 'bankAddress', value: bankAddress},
            {name: 'emergencyName', value: emergencyName},
            {name: 'emergencyPhone', value: emergencyPhone},
            {name: 'emergencyRs', value: emergencyRs},
            {name: 'emergencyAddress', value: emergencyAddress},
        ];

        const missingFields = fields.filter(({name, value}) => !value).map(({name}) => name);

        if (missingFields.length > 0) {
            showDialog('WARNING', 'Missing Information', 'Please fill in the following: ' + missingFields.join(', '));
        } else {
            //获取不到手机号
            if (!userInfo) {

            }
            const uploadParams = {
                userPhone: userInfo.userPhone,
                chassisNumber: chassisNumber,
                carRegistryDate: format(carRegistryDate, 'yyyy-MM-dd HH:mm:ss'),
                carColor: carColor,
                carType: carType,
                carBrand: carBrand,
                bankAccount: bankAccount,
                bankName: bankName,
                bankHolderName: bankHolderName,
                bankAddress: bankAddress,
                emergencyName: emergencyName,
                emergencyPhone: emergencyPhone,
                emergencyRs: emergencyRs,
                emergencyAddress: emergencyAddress,
                // uploadedCarPath: uploadedCarPath,  // Assuming you are also sending the uploaded car image path
            };

            driverSupplyInfo(uploadParams)
                .then(data => {
                    if (data.code === 200) {
                        console.log('Upload successful', data);
                        showToast('SUCCESS', 'Upload Successful', 'Upload successful');
                        userInfo.saveWithLocal();
                        navigation.navigate("Driver");
                    } else {
                        console.log('Upload failed', data.message);
                        showToast('WARNING', 'Upload Failed', 'Upload failed: ' + data.message);
                    }
                })
                .catch(error => {
                    console.log('Upload failed', error);
                    showToast('DANGER', 'Upload Failed', 'Upload failed: ' + error.message);
                });
        }
    };


    return (
        <NativeBaseProvider>
            <SafeAreaView style={{flex: 1}}>
                <ScrollView contentContainerStyle={{paddingBottom: 80}}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <VStack space={4} alignItems="center" safeArea flex={1} p={4} width="100%">
                            <VStack space={1} width="100%">
                                <Box bg='white' p={4} shadow={1} rounded="lg" marginTop={5}>
                                    <Text bold>Driver Supply Information</Text>
                                    <Text pt={4}>
                                        This interface only collects information for verification purposes and will
                                        not disclose any personal details. Once all the information have been
                                        filled, you can submit for verification.
                                    </Text>
                                </Box>

                                <Box bg="white" p={4} shadow={1} rounded="lg" marginTop={5} flexDirection="row"
                                     justifyContent="space-between">
                                    <VStack alignItems="flex-start">
                                        <Text bold>Car Photo</Text>
                                        <Text>Please upload your Car Photo...</Text>
                                    </VStack>
                                    <Button
                                        p={0}
                                        w={10}
                                        h={10}
                                        rounded="full"
                                        bg={uploadedCarPath ? 'green.500' : 'blue.500'}
                                        onPress={uploadImage}
                                    >
                                        <Icon as={RemixIcon}
                                              name={uploadedCarPath ? 'check-line' : 'add-line'}
                                              color="white"/>
                                    </Button>
                                </Box>

                                {/* Car Information */}
                                <Box bg="white" p={4} shadow={1} rounded="lg" marginTop={5}>
                                    <Text bold>Car Information</Text>
                                    {/* Chassis Number */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Chassis Number</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Chassis Number..."
                                                    value={chassisNumber}
                                                    onChangeText={(value) => setChassisNumber(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Car Registry Date */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Car Registry Date</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Car Registry Date..."
                                                    value={carRegistryDate ? carRegistryDate.toISOString().split('T')[0] : ''}
                                                    onFocus={() => setDatePickerVisibility(true)}
                                                    editable={false}
                                                />
                                            </FormControl>
                                        </Box>

                                        <Modal
                                            visible={isDatePickerVisible}
                                            transparent={true}
                                            onRequestClose={() => setDatePickerVisibility(false)}
                                        >
                                            <TouchableWithoutFeedback>
                                                <View style={{
                                                    flex: 1,
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                                }}>
                                                    <View style={{
                                                        backgroundColor: 'white',
                                                        borderRadius: 5,
                                                        padding: 10
                                                    }}>
                                                        <DatePicker
                                                            date={carRegistryDate || new Date()}
                                                            onDateChange={date => setCarRegistryDate(date)}
                                                            mode="date"
                                                        />
                                                        <Button onPress={() => setDatePickerVisibility(false)}>
                                                            Confirm
                                                        </Button>
                                                    </View>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </Modal>
                                    </Flex>
                                    {/* Car Color */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Car Color</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Car Color..."
                                                    value={carColor}
                                                    onChangeText={(value) => setCarColor(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Car Type */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Car Type</Text>
                                        </Box>
                                        <Box flex={0.7} onTouchEnd={() => refRBSheet.current.open()}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Car Type..."
                                                    value={carTypeDesc}
                                                    editable={false}  // 禁止直接编辑，而是弹出选择框
                                                />
                                            </FormControl>
                                        </Box>
                                        <RBSheet
                                            ref={refRBSheet}
                                            height={200}
                                            openDuration={250}
                                            customStyles={{
                                                container: {
                                                    justifyContent: "center",
                                                    alignItems: "center"
                                                }
                                            }}
                                        >
                                            {
                                                carTypes.map(({desc, value}, index) => (
                                                    <TouchableHighlight
                                                        key={index}
                                                        onPress={() => {
                                                            setCarType(value);
                                                            setCarTypeDesc(desc);
                                                            refRBSheet.current.close();
                                                        }}
                                                    >
                                                        <Text style={{ fontSize: 20, margin: 2 }}>{desc}</Text>
                                                    </TouchableHighlight>
                                                ))
                                            }
                                        </RBSheet>
                                    </Flex>

                                    {/* Car Brand */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Car Brand</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Car Brand..."
                                                    value={carBrand.toString()}
                                                    onChangeText={(value) => setCarBrand(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                </Box>

                                {/* Bank Information */}
                                <Box bg="white" p={4} shadow={1} rounded="lg" marginTop={5}>
                                    <Text bold>Bank Information</Text>
                                    {/* Bank Account */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Bank Account</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Bank Account..."
                                                    value={bankAccount}
                                                    onChangeText={(value) => setBankAccount(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Bank Name */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Bank Name</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Bank Name..."
                                                    value={bankName}
                                                    onChangeText={(value) => setBankName(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Bank Holder Name */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Bank Holder Name</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Bank Holder Name..."
                                                    value={bankHolderName}
                                                    onChangeText={(value) => setBankHolderName(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Bank Address */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Bank Address</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Bank Address..."
                                                    value={bankAddress}
                                                    onChangeText={(value) => setBankAddress(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                </Box>

                                {/* Emergency Contact Information */}
                                <Box bg="white" p={4} shadow={1} rounded="lg" marginTop={5}>
                                    <Text bold>Emergency Contact Information</Text>
                                    {/* Emergency Name */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Emergency Name</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Emergency Name..."
                                                    value={emergencyName}
                                                    onChangeText={(value) => setEmergencyName(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Emergency Phone */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Emergency Phone</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Emergency Phone..."
                                                    value={emergencyPhone}
                                                    onChangeText={(value) => setEmergencyPhone(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Emergency Rs */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Emergency Rs</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Emergency Rs..."
                                                    value={emergencyRs}
                                                    onChangeText={(value) => setEmergencyRs(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                    {/* Emergency Address */}
                                    <Flex direction="row" justify="space-between" alignItems="center" marginTop={5}>
                                        <Box flex={0.3}>
                                            <Text fontSize="xs">Emergency Address</Text>
                                        </Box>
                                        <Box flex={0.7}>
                                            <FormControl>
                                                <Input
                                                    variant="underlined"
                                                    fontSize="xs"
                                                    placeholder="Enter Emergency Address..."
                                                    value={emergencyAddress}
                                                    onChangeText={(value) => setEmergencyAddress(value)}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Flex>
                                </Box>
                                <Button
                                    size="lg"
                                    marginTop={5}
                                    colorScheme="primary"
                                    onPress={handleSubmit}
                                >
                                    Submit
                                </Button>
                            </VStack>
                        </VStack>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </SafeAreaView>
        </NativeBaseProvider>
    )
        ;
};

export default DriverSupplyInfo;
