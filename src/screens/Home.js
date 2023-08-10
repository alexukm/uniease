import React from "react";
import { VStack, Box, Button, Text } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView, Image } from "react-native";

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
        <Box alignItems={"center"} flex={0.8} w="full" mt="5%">
          <Image
            source={require('../picture/home_bcg.png')}
            style={{ width: '90%', height: '120%' }}
            resizeMode="cover"
          />
        </Box>
        <VStack flex={0.1} w="full" space={1} alignItems="center" px="5%" mb="1%">
          <Text fontWeight="bold">UniEase. Limitless Ease</Text>
          <Text textAlign="center">
            Embrace the simplicity, convenience, and versatility of this all-in-one solution. UniEase: Simplify, Unify, and Ease your digital life.
          </Text>
        </VStack>
        <VStack flex={0.2} w="full" justifyContent="flex-end" alignItems="center" px="5%" pb="10%">
          <Box flexDirection="row" justifyContent="space-between" width="100%">
            <Button
              size="lg"
              colorScheme="primary"
              flexGrow={1}
              marginRight={2}
              onPress={handleUserButtonPress}
              backgroundColor="#0055A4">
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


export default Home;
