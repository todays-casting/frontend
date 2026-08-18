import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../screens/HomeScreen";
import CalendarScreen from "../screens/CalendarScreen";
import HistoryScreen from "../screens/HistoryScreen";
import DailyRecordScreen from "../screens/DailyRecordScreen";
import MyPageScreen from "../screens/MyPageScreen";
import ResultScreen from "../screens/ResultScreen";
import {
  getTodayDateKey,
  getTodayRecordState,
  setTodayResultReady,
  subscribeTodayRecordState,
} from "../services/todayRecordState";
import {
  getNavigationUiState,
  subscribeNavigationUiState,
} from "../services/navigationUiState";
import { UserProvider } from "../contexts/UserContext";
import { findNavigationWithRoute } from "../services/flowNavigation";
import { resolveTodayCastingTarget } from "../services/todayCastingResolver";

const Tab = createBottomTabNavigator();

const TAB_LABELS = {
  Home: "\uD648",
  Calendar: "\uB2EC\uB825",
  DailyRecord: "\uC785\uB825",
  History: "\uD788\uC2A4\uD1A0\uB9AC",
  MyPage: "\uB9C8\uC774\uD398\uC774\uC9C0",
};

const VISIBLE_TABS = ["Home", "Calendar", "DailyRecord", "History", "MyPage"];

function TabIcon({ routeName, focused }) {
  const color = focused ? "#FFC17B" : "rgba(255, 255, 255, 0.62)";

  if (routeName === "Home") {
    return <Ionicons name="home" size={21} color={color} />;
  }

  if (routeName === "Calendar") {
    return <Ionicons name="calendar-outline" size={21} color={color} />;
  }

  if (routeName === "History") {
    return (
      <MaterialCommunityIcons
        name="filmstrip"
        size={22}
        color={color}
      />
    );
  }

  if (routeName === "MyPage") {
    return <Ionicons name="person-outline" size={22} color={color} />;
  }

  return null;
}

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [todayState, setTodayState] = useState(() => getTodayRecordState());
  const [navigationUiState, setNavigationUiState] = useState(() =>
    getNavigationUiState()
  );
  const activeRouteName = state.routes[state.index]?.name;

  useEffect(() => subscribeTodayRecordState(setTodayState), []);
  useEffect(() => subscribeNavigationUiState(setNavigationUiState), []);

  if (
    navigationUiState.analysisLoadingVisible ||
    (activeRouteName === "Result" && !todayState.resultReady)
  ) {
    return null;
  }

  return (
    <View
      style={[styles.tabBarWrap, { height: 108 + insets.bottom }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.tabBar,
          {
            height: 94 + insets.bottom,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {state.routes.map((route, index) => {
          if (!VISIBLE_TABS.includes(route.name)) {
            return null;
          }

          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = async () => {
            const activeRoute = state.routes[state.index];
            const returnTo =
              route.name === "DailyRecord"
                ? {
                    screen:
                      activeRoute?.name && activeRoute.name !== "DailyRecord"
                        ? activeRoute.name
                        : "Home",
                  }
                : undefined;
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              return;
            }

            if (route.name === "DailyRecord") {
              try {
                const target = await resolveTodayCastingTarget();
                const recordId = target.recordId;
                const recordDate = target.recordDate ?? getTodayDateKey();

                if (target.screen === "RESULT" && target.casting) {
                  setTodayResultReady(true, {
                    ...target.casting,
                    recordId,
                    recordDate,
                  });

                  navigation.navigate("Result", {
                    recordId,
                    recordDate,
                    returnTo,
                    result: {
                      ...target.casting,
                      recordId,
                      recordDate,
                    },
                  });
                  return;
                }

                if (["WAITING", "RESULT"].includes(target.screen) && recordId) {
                  const rootNavigation = findNavigationWithRoute(
                    navigation,
                    "AnalysisLoading"
                  );
                  const loadingParams = {
                    recordId,
                    recordDate,
                    returnTo,
                  };

                  if (rootNavigation) {
                    rootNavigation.navigate("AnalysisLoading", loadingParams);
                  } else {
                    navigation.navigate("AnalysisLoading", loadingParams);
                  }
                  return;
                }
              } catch (error) {
                console.warn("Failed to check today status:", error);
              }

              navigation.navigate("DailyRecord", {
                recordDate: getTodayDateKey(),
                returnTo,
              });
              return;
            }

            if (!focused) {
              navigation.navigate(route.name, route.params);
            }
          };

          if (route.name === "DailyRecord") {
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
                    size={27}
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
                  {TAB_LABELS.DailyRecord}
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
    <UserProvider>
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
        <Tab.Screen name="DailyRecord" component={DailyRecordScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="MyPage" component={MyPageScreen} />
        <Tab.Screen name="Result" component={ResultScreen} />
      </Tab.Navigator>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 108,
    alignItems: "center",
    zIndex: 100,
    elevation: 100,
  },

  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 94,
    paddingHorizontal: 0,
    paddingTop: 16,
    paddingBottom: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    marginTop: 6,
    color: "rgba(255, 255, 255, 0.62)",
    fontFamily: "NanumSquareNeo",
    fontSize: 9,
    lineHeight: 15,
  },

  activeLabel: {
    color: "#FFC17B",
  },

  centerTab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    marginTop: -24,
  },

  centerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
    top: 13,
    right: 15,
    color: "#FFFFFF",
    fontFamily: "MaruBuriSemiBold",
    fontSize: 11,
  },

  centerLabel: {
    marginTop: 6,
    color: "#FFC17B",
    fontFamily: "NanumSquareNeo",
    fontSize: 10,
    lineHeight: 16,
  },
});
