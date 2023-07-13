import React, {useEffect} from 'react';
import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";
import {Box, AspectRatio, Button, Center, Text} from 'native-base';
import {useNavigation} from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import {initLocalChat,  UserChat} from "../com/evotech/common/redux/UserChat";
import {queryUserOrderStatus} from "../com/evotech/common/http/BizHttpUtil";
import {userOrderWebsocket} from "../com/evotech/common/websocket/UserChatWebsocket";
import {showDialog} from "../com/evotech/common/alert/toastHelper";


const UserHome = () => {
    const navigation = useNavigation();

    //TODO 处理查询失败的情况
    const subscriptionOrderAccept = async (orderStatusInitAfter) => {
        await queryUserOrderStatus().then((data) => {
            if (data.code === 200) {
                //订单状态集
                const orderStatus = data.data;
                //存在待接单的订单
                if (orderStatus.awaiting) {
                    //订阅  订单接单通知
                    setTimeout(async () => {
                        await userOrderWebsocket().then()
                    }, 0);
                }
                return orderStatus;
            }
        }).then(orderStatus => {
            orderStatusInitAfter(orderStatus);
        });
    }

    const initUserChat = (orderStatus) => {
        //在订单状态初始化之后执行
        initLocalChat().then(data => {
                //  本地存储聊天信息记录 且存在待出现和旅途中的订单 则初始化websocket聊天订阅
                if (orderStatus.pending || orderStatus.inTransit) {
                    setTimeout(async () => {
                        await UserChat(true).then();
                    }, 0);
                }
            }
        )
    }

    useEffect(() => {
        setTimeout(() => {
            subscriptionOrderAccept(initUserChat).then();
        }, 0);
    }, []);

    const handlePress = (screen) => {
        if (screen === 'RideOrderScreen') {
            navigation.navigate('Orders', {screen: 'RideOrderScreen'});
        } else if (screen === 'OrderDetailScreen') {
            navigation.navigate('Orders', {screen: 'OrderDetailScreen'});
        } else {
            navigation.navigate(screen);
        }
    };

    const Card = ({imageUri, title, description}) => (
        <Box
            bg="white"
            style={{
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <AspectRatio w="100%" ratio={16 / 9}>
                <Image source={{uri: imageUri}} style={{flex: 1}}/>
            </AspectRatio>
            <Center
                bg="white"
                position="absolute"
                bottom="0"
                left="20%"
                right="20%"
                _text={{color: "black", fontWeight: "700", fontSize: "md"}}
                px="3"
                py="1.5"
                style={{justifyContent: 'flex-end'}} // 将内容对齐到下方
            >
                <Text>
                    {title}
                </Text>
                <Text fontWeight="500">
                    {description}
                </Text>
            </Center>
        </Box>
    );
    const CardWithoutDescription = ({imageUri}) => (
        <View style={{height: 200}}>
            <Box
                rounded="lg"
                overflow="hidden"
                borderColor="coolGray.200"
                borderWidth="1"
                backgroundColor="gray.50"
            >
                <AspectRatio w="100%" ratio={2 / 3}>
                    <Image source={{uri: imageUri}} style={{flex: 1}}/>
                </AspectRatio>
            </Box>
        </View>
    );

    return (
        <View style={{flex: 1, alignItems: 'center', backgroundColor: 'white'}}>
            <View style={{
                width: '100%',
                height: 120,
                justifyContent: 'flex-start',
                alignItems: 'center',
                flexDirection: 'row',
                paddingLeft: 20
            }}>
                <Image source={require('../picture/logo.png')}
                       style={{width: 100, height: 100}}/>
            </View>

            <View style={{height: "40%", width: "100%"}}>
                <Swiper showsButtons={false}>
                    <Box>
                        <Card imageUri="https://images.pexels.com/photos/5507250/pexels-photo-5507250.jpeg"
                              title="Advertisement 1" description="Advertisement 2 Description"/>
                    </Box>
                    <Box>
                        <Card
                            imageUri="https://images.pexels.com/photos/16091030/pexels-photo-16091030.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                            title="Advertisement 2" description="Advertisement 2 Description"/>
                    </Box>
                    <Box>
                        <Card
                            imageUri="https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                            title="Advertisement 3" description="Advertisement 3 Description"/>
                    </Box>
                </Swiper>
            </View>

            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                marginTop: 5,
                paddingHorizontal: 5
            }}>
                <TouchableOpacity onPress={() => handlePress('RideOrderScreen')} style={{width: "47%"}}>
                    <Box>
                        <CardWithoutDescription
                            imageUri="https://images.pexels.com/photos/4701604/pexels-photo-4701604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"/>
                    </Box>
                    <Button onPress={() => handlePress('RideOrderScreen')} style={{backgroundColor: '#3498db'}}>Go to
                        Ride</Button>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => showDialog('WARNING', 'Action Waiting', 'Other features will be available soon, please wait')} style={{width: "47%"}}>
                    <Box>
                        <CardWithoutDescription
                            imageUri="https://images.pexels.com/photos/518244/pexels-photo-518244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"/>
                    </Box>
                    <Button onPress={() => handlePress('ServiceScreen')} style={{backgroundColor: '#3498db'}}>Go to
                        Service</Button>
                </TouchableOpacity>
            </View>
        </View>
    );
};




export default UserHome;
