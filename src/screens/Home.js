import React, {  useContext } from "react";
import { VStack, Box,  Button, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, Image } from "react-native";
import { ImagesEnum } from "../com/evotech/common/constant/BizEnums";

function Home() {
    const navigation = useNavigation();

    const handleUserButtonPress = () => {
       // 调用getUserType接口中的USER值
        navigation.navigate("UserLogin");
    };

    const handleDriverButtonPress = () => {
        // 调用getUserType接口中的DRIVER值
        navigation.navigate("DriverLogin");
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
      <VStack flex={1} space={4} alignItems="center">
        <Box alignItems={"center"} flex={0.6} w="full" mt="5%">
          <Image
            source={{ uri: ImagesEnum.UserOrderCar }}
            style={{ width: '90%', height: '90%' }}
            resizeMode="cover"
          />
        </Box>
        <VStack flex={0.2} w="full" space={1} alignItems="center" px="5%">
          <Text fontWeight="bold">UniEase. Limitless Ease</Text>
          <Text textAlign="center">
            Embrace the simplicity, convenience, and versatility of this all-in-one solution. UniEase: Simplify, Unify, and Ease your digital life.
          </Text>
        </VStack>
        <VStack flex={0.2} w="full" justifyContent="flex-end" pb="15%" alignItems="center" px="5%">
          <Box flexDirection="row" justifyContent="space-between" width="100%">
            <Button size="lg" colorScheme="primary" flexGrow={1} marginRight={2} onPress={handleUserButtonPress}>
              User
            </Button>
            <Button size="lg" colorScheme="secondary" flexGrow={1} marginLeft={2} onPress={handleDriverButtonPress}>
              Driver
            </Button>
          </Box>
        </VStack>
        </VStack>
      </SafeAreaView>
    );
}

// 自定义钩子以在其他组件中获取用户类型
const useUserType = () => useContext(UserTypeContext);

export { useUserType };
export default Home;
