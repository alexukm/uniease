import React, {useCallback, useState, useRef} from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Image,
    TouchableWithoutFeedback,
    Linking,
    Platform, SafeAreaView,
} from "react-native";
import {Box, HStack, VStack} from 'native-base';
import {carpoolingOrdersQuery, driverAcceptOrder} from "../com/evotech/common/http/BizHttpUtil";
import {useFocusEffect} from "@react-navigation/native";
import ActionSheet from "@alessiocancian/react-native-actionsheet";
import RemixIcon from "react-native-remix-icon";
import {UserChat} from "../com/evotech/common/redux/UserChat";
import {showDialog, showToast} from "../com/evotech/common/alert/toastHelper";
import { responseOperation } from "../com/evotech/common/http/ResponseOperation";
import { formatDate } from "../com/evotech/common/formatDate";
import { userOrderWebsocket } from "../com/evotech/common/websocket/UserChatWebsocket";


const DriverOrderListScreen = () => {
    const [rideOrders, setRideOrders] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState(20);
    const [refreshing, setRefreshing] = useState(false);

    const [updateFlag, setUpdateFlag] = useState(false); // 添加这个状态


    const formatText = (text) => {
        const maxLength = 50; // 可以根据需要设置这个值
        const words = text.split(" ");
        let currentLength = 0;
        let lines = [''];
        for (let word of words) {
            if (currentLength + word.length > maxLength) {
                lines.push('');
                currentLength = 0;
            }
            lines[lines.length - 1] += word + ' ';
            currentLength += word.length + 1;
        }
        return lines.join("\n");
    };

    const handleLoadMore = useCallback(async () => {
        const orderList = await queryOrders(pageSize, page + 1);
        if (orderList.length > 0) {
            setRideOrders(prevOrders => [...prevOrders, ...orderList]);
            setPage(prevPage => prevPage + 1);
        }
    }, [pageSize, page]);

    useFocusEffect(
        React.useCallback(() => {
            handleRefresh().then( );
            const timer = setInterval(() => {
                handleRefresh().then();
            }, 60000); // 每60秒刷新一次

            // 在页面失焦时取消定时器
            return () => clearInterval(timer);
        }, [])
    );

    const openMaps = (address) => {
        const url = Platform.select({
            ios: `http://maps.apple.com/?q=${address}`,
            android: `geo:0,0?q=${address}`,
        });
        Linking.openURL(url);
    }

    const queryOrders = (pageSize, page) => {
        const param = {
            "pageSize": pageSize,
            "page": page
        }
        return carpoolingOrdersQuery(param).then(data => {
            return responseOperation(data.code, () => {
                return data.data.content;
            }, () => {
                showToast('WARNING', 'Warning', data.message);
                return [];
            })
        }).catch(err => {
            showToast('ERROR', 'Error', 'error', err.message);
            console.error(err.message);
            return [];
        })
    }


    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        const orderList = await queryOrders(pageSize, 1);
        setRideOrders(orderList);
        setPage(page + 1);
        setRefreshing(false);
    }, [pageSize, page]); // 更新依赖列表，包括pageSize和page。

    useFocusEffect(
        React.useCallback(() => {
            handleRefresh().then(() => {
            });
           /* handleRefresh().then(() => {});
            let cancelSub;
            setTimeout(async () => {
                await DriverRefreshOrder((body) => {
                    setRideOrders((old) => [JSON.parse(body), ...old])
                    setUpdateFlag(!updateFlag); // 当数据更新时改变 updateFlag 的值
                }).then();
            }, 0)

            // 返回一个清理函数，它将在页面失焦时运行
            return () => {
                if (cancelSub) {
                    cancelSub();
                }
            };*/
        }, [])
    );
    const acceptOrder = (orderId) => {
        const params = {
            userOrderId: orderId,
        }
        console.log(orderId)
        driverAcceptOrder(params).then(data => {
            responseOperation(data.code, () => {
                showDialog('SUCCESS', 'Success', 'Order successfully Accepted');
                // UserChat(false).then();
                userOrderWebsocket((body) => {}).then();
                handleRefresh().then(); //在这里添加代码，接受订单后刷新页面。
            }, () => {
                showToast('WARNING', 'Warning', data.message);
            })
        }).catch(err => {
            console.error(err.message);
            showToast('ERROR', 'Error', 'Accept Order Failed' + err.message);
        })
        //todo 刷新订单广场页
    };
    const renderItem = ({item}) => {
        let actionSheetRef; // 为每个订单项创建一个 ref
        // console.log(item);
        return (
            <Box bg="white" shadow={2} rounded="lg" p={4} my={2}>
                <View style={styles.floatingButtonContainer}>
                    <TouchableWithoutFeedback onPress={() => {
                        // 弹出对应订单项的 ActionSheet
                        actionSheetRef.show();
                    }}>
                        <View style={styles.imageWrapper}>
                            <Image source={require('../picture/navigation.png')} style={styles.iconStyle}/>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <VStack space={1}>
                    <Text style={styles.timeText}> {formatDate(new Date(item.plannedDepartureTime))}</Text>
                    <HStack space={2} alignItems="flex-start">
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="blue" style={{marginTop: 5}}/>
                        <Text>{formatText(item.departureAddress)}</Text>
                    </HStack>
                    <HStack space={2} alignItems="flex-start">
                        <RemixIcon name="checkbox-blank-circle-fill" size={15} color="orange" style={{marginTop: 5}}/>
                        <Text>{formatText(item.destinationAddress)}</Text>
                    </HStack>
                    <HStack space={2} alignItems="center">
                        <RemixIcon name="money-cny-circle-fill" size={15} color="green" style={{marginTop: 5}}/>
                        <Text>
                            Expected Earnings: <Text style={{fontWeight: 'bold'}}>RM {item.expectedEarnings}.00  - {item.paymentType}</Text>
                        </Text>
                    </HStack>
                    {item.remark && <Text>Comment: {item.remark}</Text>}
                    <HStack justifyContent="flex-end">
                        <TouchableOpacity onPress={() => acceptOrder(item.orderId)} style={styles.buttonContainer}>
                            <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>
                    </HStack>
                </VStack>
                <ActionSheet
                    ref={o => actionSheetRef = o}
                    options={['Departure', 'Destination', 'Cancel']}
                    cancelButtonIndex={2}
                    destructiveButtonIndex={2}
                    onPress={(index) => {
                        // 处理对应订单项的地址
                        switch (index) {
                            case 0:
                                openMaps(item.departureAddress);
                                break;
                            case 1:
                                openMaps(item.destinationAddress);
                                break;
                            default:
                                break;
                        }
                    }}
                />
            </Box>
        );
    };

    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.container}>
            <FlatList
                data={rideOrders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => null}
                extraData={updateFlag} // 把 updateFlag 传递给 extraData
                ListHeaderComponent={
                    <Box bg="white" shadow={2} rounded="lg" p={4} my={2} style={{marginTop: 10}}>
                        <Text style={{fontWeight: 'bold', fontSize: 18, color: 'black'}}>Waiting for pick up List</Text>
                        <Text style={{color: 'black'}}>This page displays a list of all orders you can pick up.</Text>
                    </Box>
                }
                // contentContainerStyle={{flexGrow: 1, padding: 10}} // 添加这一行
                contentContainerStyle={{flexGrow: 1, padding: 10}}
                onRefresh={handleRefresh} // 添加下拉刷新处理函数
                refreshing={refreshing} // 添加刷新状态
                onEndReached={handleLoadMore} // 添加滑动到底部时的处理函数
                onEndReachedThreshold={0.5} // 在距离底部还有多少距离时触发加载更多的操作，这里设为 0.5，表示在距离底部还有屏幕的一半距离时就触发加载更多的操作
            />
        </View>
      </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    timeText: {
        fontSize: 10,
        marginBottom: 5,
    },
    buttonContainer: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconStyle: {
        width: 20,
        height: 20,
        marginLeft: 5,
        marginTop: -20,
        transform: [{rotate: '30deg'}] // 这行会将图标旋转30度
    },
    floatingButtonContainer: {
        width: 50,  // 这个值可以根据需要进行调整
        height: 50, // 这个值可以根据需要进行调整
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 10,
        top: 10,
        zIndex: 1,  // 添加这行代码
    },
    imageWrapper: {
        width: 40,
        height: 40,
        borderRadius: 25, // 这将使得 View 具有圆形边框
        backgroundColor: 'transparent', // 设置背景颜色为透明
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default DriverOrderListScreen;
