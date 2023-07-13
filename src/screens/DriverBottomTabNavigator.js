import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StyleSheet} from 'react-native';
import RemixIcon from 'react-native-remix-icon';

import DriverHomeScreen from './DriverHomeScreen';
import DriverAcceptListScreen from './DriverAcceptListScreen';
import DriverAccountScreen from "./DriverAccountScreen";
import DriverOrderListScreen from './DriverOrderListScreen';
import DriverAcceptDetailScreen from "./DriverAcceptDetailScreen";
import ChatList from "./ChatList";
import ChatRoom from "./ChatRoom";

const DriverAcceptDetailNavigator = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();  // 新增

const DriverBottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                headerShown: false,
                tabBarIcon: ({color, size}) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = 'home-line';
                    } else if (route.name === 'Orders') {
                        iconName = 'user-received-fill';
                    } else if (route.name === 'Messages') {
                        iconName = 'message-2-line';
                    } else if (route.name === 'Account') {
                        iconName = 'account-circle-line';
                    }

                    return <RemixIcon name={iconName} size={size} color={color}/>;
                },
                tabBarActiveTintColor: 'orange',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: styles.tabBarStyle,
                tabBarItemStyle: styles.tabBarItemStyle,
                tabBarLabelStyle: styles.tabBarLabelStyle,
            })}
        >
            <Tab.Screen name="Home" component={DriverHomeScreen} />
            <Tab.Screen name="Orders" component={DriverAcceptListScreen}/>
            <Tab.Screen name="Messages" component={ChatList}/>
            <Tab.Screen name="Account" component={DriverAccountScreen}/>
        </Tab.Navigator>
    );
};

const HomeNavigator = () => (
    <HomeStack.Navigator screenOptions={{headerShown: false}}>
        <HomeStack.Screen name="Tabs" component={DriverBottomTabNavigator}/>
        <HomeStack.Screen name="DriverAcceptDetails" component={DriverAcceptDetailStackScreen}/>
        <HomeStack.Screen name="ChatRoom" component={ChatRoom}/>
    </HomeStack.Navigator>
);

const DriverMainNavigator = () => {
    return (
        <MainStack.Navigator screenOptions={{headerShown: false}}>
            <MainStack.Screen name="Home" component={HomeNavigator}/>
            <MainStack.Screen name="DriverOrderListScreen" component={DriverOrderListScreen}/>
        </MainStack.Navigator>
    );
};

const DriverAcceptDetailStackScreen = () => (
    <DriverAcceptDetailNavigator.Navigator screenOptions={{headerShown: false}}>
        <DriverAcceptDetailNavigator.Screen name="DriverAcceptDetailScreen" component={DriverAcceptDetailScreen}/>
    </DriverAcceptDetailNavigator.Navigator>
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
        height: 95,
    },
    tabBarItemStyle: {
        marginTop: 8,
        marginBottom: 15,
    },
    tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default DriverMainNavigator;
