import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";

import LoginScreen from "./src/screens/LoginScreen";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    MaruBuriSemiBold: require("./assets/font/\uB9C8\uB8E8 \uBD80\uB9AC/MaruBuri-SemiBold.ttf"),
    NanumSquareNeo: require("./assets/font/\uB098\uB214\uC2A4\uD018\uC5B4 \uB124\uC624/NanumSquareNeo-bRg.ttf"),
    Mindeulle: require("./assets/font/\uD559\uAD50\uC548\uC2EC \uBBFC\uB4E4\uB808\uD640\uC528/Hakgyoansim_MindeulleholssiR.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
