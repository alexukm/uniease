import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet } from "react-native";
import RemixIcon from 'react-native-remix-icon';

import OrderListScreen from "./OrderListScreen";
import AccountScreen from './AccountScreen';
import OrderDetailScreen from './OrderDetailScreen';
import RideOrderScreen from './RideOrderScreen';
import UserOrderDetailScreen from './UserOrderDetailScreen';
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";
import UserHome from "./UserHomeScreen";


const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const OrderStack = createNativeStackNavigator();
const SimpleOrderDetailStack = createNativeStackNavigator();

const OrderStackScreen = () => (
    <OrderStack.Navigator screenOptions={{ headerShown: false }}>
        <OrderStack.Screen name="RideOrderScreen" component={RideOrderScreen} />
        <OrderStack.Screen name="OrderDetailScreen" component={OrderDetailScreen} />
    </OrderStack.Navigator>
);

const SimpleOrderDetailStackScreen = () => (
    <SimpleOrderDetailStack.Navigator screenOptions={{ headerShown: false }}>
        <SimpleOrderDetailStack.Screen name="SimpleOrderDetailScreen" component={UserOrderDetailScreen} />
    </SimpleOrderDetailStack.Navigator>
);

const UserBottomTabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = 'home-line';
                } else if (route.name === 'Activity') {
                    iconName = 'car-line';
                } else if (route.name === 'Messages') {
                    iconName = 'message-2-line';
                } else if (route.name === 'Account') {
                    iconName = 'account-circle-line';
                }

                return <RemixIcon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'orange',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: styles.tabBarStyle,
            tabBarItemStyle: styles.tabBarItemStyle,
            tabBarLabelStyle: styles.tabBarLabelStyle,
            headerShown: false,
        })}
    >
        <Tab.Screen name="Home" component={UserHome} />
        <Tab.Screen name="Activity" component={OrderListScreen} />
        <Tab.Screen name="Messages" component={ChatList}/>
        <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
);

const MainNavigator = () => (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
        <HomeStack.Screen name="Tabs" component={UserBottomTabNavigator} />
        <HomeStack.Screen name="Orders" component={OrderStackScreen} />
        <HomeStack.Screen name="SimpleOrderDetails" component={SimpleOrderDetailStackScreen} />
        <HomeStack.Screen name="ChatRoom" component={ChatRoom}/>
    </HomeStack.Navigator>
);

const styles = StyleSheet.create({
    tabBarStyle: {
        borderTopWidth: 0,
        elevation: 10, // 用于 Android
        shadowOpacity: 0.1, // 用于 iOS
        shadowRadius: 10, // 用于 iOS
        shadowColor: "#000", // 用于 iOS
        shadowOffset: {
            width: 0,
            height: -10
        }, // 用于 iOS
        position: 'absolute',
      height: Platform.OS === 'ios' ? 95 : 65, // 使用平台判断设置不同的值
    },
    tabBarItemStyle: {
        marginTop: 5,
        marginBottom: 15,
    },
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default MainNavigator;
