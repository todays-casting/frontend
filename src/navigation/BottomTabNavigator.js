import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Tab = createBottomTabNavigator();

const TAB_LABELS = {
  Home: "\uD648",
  Calendar: "\uB2EC\uB825",
  Input: "\uC785\uB825",
  History: "\uD788\uC2A4\uD1A0\uB9AC",
  MyPage: "\uB9C8\uC774\uD398\uC774\uC9C0",
};

function EmptyScreen() {
  return (
    <View style={styles.emptyScreen}>
      <Text style={styles.emptyText}>Coming soon</Text>
    </View>
  );
}

function TabIcon({ routeName, focused }) {
  const color = focused ? "#FFC17B" : "rgba(255, 255, 255, 0.62)";

  if (routeName === "Home") {
    return <Ionicons name="home" size={30} color={color} />;
  }

  if (routeName === "Calendar") {
    return <Ionicons name="calendar-outline" size={30} color={color} />;
  }

  if (routeName === "History") {
    return (
      <MaterialCommunityIcons
        name="filmstrip"
        size={31}
        color={color}
      />
    );
  }

  if (routeName === "MyPage") {
    return <Ionicons name="person-outline" size={31} color={color} />;
  }

  return null;
}

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.tabBarWrap, { height: 132 + insets.bottom }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.tabBar,
          {
            height: 116 + insets.bottom,
            paddingTop: 22,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          if (route.name === "Input") {
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                activeOpacity={0.9}
                onPress={onPress}
                style={styles.centerTab}
              >
                <View style={styles.centerCircle}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={38}
                    color="#FFFFFF"
                  />
                  <Text style={styles.centerSparkle}>{"\u2726"}</Text>
                </View>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={styles.centerLabel}
                >
                  {TAB_LABELS.Input}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              activeOpacity={0.75}
              onPress={onPress}
              style={styles.tabItem}
            >
              <TabIcon routeName={route.name} focused={focused} />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[styles.tabLabel, focused && styles.activeLabel]}
              >
                {TAB_LABELS[route.name]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "#160E2A",
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Input" component={EmptyScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="MyPage" component={EmptyScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  emptyScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#160E2A",
  },

  emptyText: {
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: 18,
  },

  tabBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 142,
    alignItems: "center",
    zIndex: 100,
    elevation: 100,
  },

  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 125,
    paddingHorizontal: 0,
    paddingTop: 29,
    paddingBottom: 15,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    borderColor: "rgba(151, 96, 197, 0.55)",
    backgroundColor: "rgba(32, 18, 61, 0.92)",
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 101,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 18,
  },

  tabItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },

  tabLabel: {
    marginTop: 9,
    color: "rgba(255, 255, 255, 0.62)",
    fontFamily: "NanumSquareNeo",
    fontSize: 11,
    lineHeight: 21,
  },

  activeLabel: {
    color: "#FFC17B",
  },

  centerTab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    marginTop: -43,
  },

  centerCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF8150",
    borderWidth: 1.5,
    borderColor: "rgba(255, 198, 152, 0.8)",
    shadowColor: "#FF8150",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.56,
    shadowRadius: 18,
    elevation: 20,
  },

  centerSparkle: {
    position: "absolute",
    top: 20,
    right: 22,
    color: "#FFFFFF",
    fontFamily: "MaruBuriSemiBold",
    fontSize: 16,
  },

  centerLabel: {
    marginTop: 9,
    color: "#FFC17B",
    fontFamily: "NanumSquareNeo",
    fontSize: 14,
    lineHeight: 22,
  },
});
