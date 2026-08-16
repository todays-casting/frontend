import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import NotificationSheet from "../components/NotificationSheet";
import authApi from "../api/auth-api";
import mypageApi from "../api/mypage-api";

const COPY = {
  title: "\uB9C8\uC774\uD398\uC774\uC9C0",
  heroName: "\uC0AC\uC6A9\uC790\uB2D8, \uC624\uB298\uB3C4",
  loading: "\uB9C8\uC774\uD398\uC774\uC9C0\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC774\uC5D0\uC694.",
  loadFailed: "\uB9C8\uC774\uD398\uC774\uC9C0\uB97C \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694.",
  heroLine: "\uB098\uB9CC\uC758 \uC774\uC57C\uAE30\uB97C \uAE30\uB85D\uD574\uC694",
  heroCopy:
    "\uC9C0\uAE08\uAE4C\uC9C0\uC758 \uC21C\uAC04\uB4E4\uC774, \uB354 \uBE5B\uB098\uB294 \uB0B4\uC77C\uC744 \uB9CC\uB4E4 \uAC70\uC608\uC694.",
  footer1: "\uC791\uC740 \uAE30\uB85D\uC774 \uBAA8\uC5EC,",
  footer2: "\uB2F9\uC2E0\uB9CC\uC758 \uCC2C\uB780\uD55C \uC774\uC57C\uAE30\uAC00 \uB429\uB2C8\uB2E4.",
};

const STATS = [
  {
    key: "totalRecordCount",
    icon: "star-four-points",
    label: "\uAE30\uB85D\uD55C \uB0A0",
    value: "0",
    unit: "\uC77C",
    caption: "",
  },
  {
    key: "continuousRecordDays",
    icon: "fire",
    label: "\uC5F0\uC18D \uAE30\uB85D",
    value: "0",
    unit: "\uC77C",
    caption: "",
  },
  {
    key: "favoriteCastingCardCount",
    icon: "bookmark",
    label: "\uCC1C\uD55C \uCE74\uB4DC",
    value: "0",
    unit: "\uAC1C",
    caption: "",
  },
];

const MENU = [
  {
    icon: "settings-outline",
    title: "\uC124\uC815",
    subtitle: "\uAE30\uB85D \uC54C\uB9BC\uACFC \uC800\uC7A5 \uBC29\uC2DD\uC744 \uAD00\uB9AC\uD574\uC694",
    route: "Settings",
  },
  {
    icon: "help-circle-outline",
    title: "\uBB38\uC758\uD558\uAE30",
    subtitle: "\uB3C4\uC6C0\uC774 \uD544\uC694\uD560 \uB54C \uC5B8\uC81C\uB4E0\uC9C0 \uC5F0\uB77D\uC8FC\uC138\uC694",
    route: "Contact",
  },
  {
    icon: "log-out-outline",
    title: "\uB85C\uADF8\uC544\uC6C3",
    subtitle: "\uACC4\uC815\uC5D0\uC11C \uC548\uC804\uD558\uAC8C \uB85C\uADF8\uC544\uC6C3\uD574\uC694",
    action: "logout",
  },
];

export default function MyPageScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { styles, sizes } = createStyles(width, height, insets);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);

  const rootNavigation = navigation.getParent?.();

  useEffect(() => {
    let active = true;

    mypageApi
      .getMyPage()
      .then((myPage) => {
        if (active) {
          setProfile(myPage);
          setProfileError(false);
        }
      })
      .catch((error) => {
        console.warn("Failed to load my page:", error);
        if (active) {
          setProfileError(true);
        }
      })
      .finally(() => {
        if (active) {
          setProfileLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const heroName = profile?.nickname
    ? `${profile.nickname}\uB2D8, \uC624\uB298\uB3C4`
    : COPY.heroName;
  const profileStatusText = profileLoading
    ? COPY.loading
    : profileError
      ? COPY.loadFailed
      : null;

  const stats = useMemo(
    () => {
      if (!profile || profileError) {
        return STATS.map((item) => ({
          ...item,
          value: "\u2014",
          unit: "",
          caption: "",
        }));
      }

      return STATS.map((item) => {
        if (item.key === "totalRecordCount") {
          return {
            ...item,
            value: String(profile?.totalRecordCount ?? item.value),
            caption: profile?.joinedDays != null
              ? `\uAC00\uC785\uD55C \uC9C0 ${profile.joinedDays}\uC77C`
              : item.caption,
          };
        }

        if (item.key === "continuousRecordDays") {
          return {
            ...item,
            value: String(profile?.continuousRecordDays ?? item.value),
          };
        }

        if (item.key === "favoriteCastingCardCount") {
          return {
            ...item,
            value: String(profile?.favoriteCastingCardCount ?? item.value),
          };
        }

        return item;
      });
    },
    [profile, profileError]
  );

  const openMenu = (item) => {
    if (item.action === "logout") {
      setLogoutVisible(true);
      return;
    }

    if (item.route) {
      rootNavigation?.navigate(item.route);
    }
  };

  const confirmLogout = () => {
    setLogoutVisible(false);
    authApi.logout();
    rootNavigation?.replace("Login");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/login_background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentFrame}>
            <View style={styles.header}>
              <Text style={styles.title}>{COPY.title}</Text>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.bellButton}
                onPress={() => setNotificationVisible(true)}
              >
                <Ionicons
                  name="notifications-outline"
                  size={sizes.bell}
                  color="#FFB36B"
                />
              </TouchableOpacity>
            </View>

            <ImageBackground
              source={require("../../assets/images/home_stage.png")}
              style={styles.heroCard}
              imageStyle={styles.heroImage}
              resizeMode="cover"
            >
              <View style={styles.heroShade} />
              <Text style={styles.heroTitle}>{heroName}</Text>
              <Text style={styles.heroTitleSmall}>{COPY.heroLine}</Text>
              {!!profileStatusText && (
                <Text style={styles.profileStatus}>{profileStatusText}</Text>
              )}
              <Text style={styles.heroCopy}>{COPY.heroCopy}</Text>
              <Ionicons
                name="moon"
                size={sizes.moon}
                color="#FFB36B"
                style={styles.moon}
              />
            </ImageBackground>

            <View style={styles.statsRow}>
              {stats.map((item) => (
                <View key={item.label} style={styles.statCard}>
                  <View style={styles.statLabelRow}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={sizes.statIcon}
                      color="#FFB36B"
                    />
                    <Text
                      style={styles.statLabel}
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
                    >
                      {item.label}
                    </Text>
                  </View>
                  <View style={styles.statValueRow}>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statUnit}>{item.unit}</Text>
                  </View>
                  {!!item.caption && (
                    <Text
                      style={styles.statCaption}
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
                      numberOfLines={1}
                    >
                      {item.caption}
                    </Text>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.menuCard}>
              {MENU.map((item, index) => (
                <TouchableOpacity
                  key={item.title}
                  activeOpacity={0.76}
                  style={[
                    styles.menuItem,
                    index === MENU.length - 1 && styles.lastMenuItem,
                  ]}
                  onPress={() => openMenu(item)}
                >
                  <View style={styles.menuIcon}>
                    <Ionicons
                      name={item.icon}
                      size={sizes.menuIcon}
                      color="#FFB36B"
                    />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text
                      style={styles.menuSubtitle}
                      adjustsFontSizeToFit
                      minimumFontScale={0.82}
                    >
                      {item.subtitle}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={sizes.chevron}
                    color="#E8B17C"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footerCopyWrap}>
              <Text style={styles.footerCopy}>{COPY.footer1}</Text>
              <Text style={styles.footerCopy}>
                {"\u2726 "}
                {COPY.footer2}
                {" \u2726"}
              </Text>
            </View>
          </View>
        </ScrollView>

        <LogoutDialog
          visible={logoutVisible}
          styles={styles}
          onCancel={() => setLogoutVisible(false)}
          onConfirm={confirmLogout}
        />
        <NotificationSheet
          visible={notificationVisible}
          onClose={() => setNotificationVisible(false)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

function LogoutDialog({ visible, styles, onCancel, onConfirm }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogSparkle}>{"\u2726"}</Text>
          <Text style={styles.dialogTitle}>{"\uB85C\uADF8\uC544\uC6C3\uD558\uC2DC\uACA0\uC5B4\uC694?"}</Text>
          <Text style={styles.dialogCopy}>
            {"\uACC4\uC815\uC5D0\uC11C \uC548\uC804\uD558\uAC8C \uB098\uAC08\uAC8C\uC694."}
          </Text>
          <View style={styles.dialogActions}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.dialogButton, styles.dialogGhostButton]}
              onPress={onCancel}
            >
              <Text style={styles.dialogGhostText}>{"\uCDE8\uC18C"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.82}
              style={styles.dialogButton}
              onPress={onConfirm}
            >
              <Text style={styles.dialogButtonText}>{"\uB85C\uADF8\uC544\uC6C3"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (screenWidth, screenHeight, insets) => {
  const sx = screenWidth / 393;
  const sy = screenHeight / 824;
  const scale = Math.min(Math.max(Math.min(sx, sy), 0.82), 1.15);
  const ms = (value) => value * scale;
  const vs = (value) => value * sy;
  const pagePadding = ms(screenWidth >= 600 ? 22 : 27);
  const contentWidth = Math.min(screenWidth - pagePadding * 2, screenWidth >= 600 ? 520 : 393);
  const statGap = ms(screenWidth >= 600 ? 14 : 12);
  const statWidth = (contentWidth - statGap * 2) / 3;
  const isWide = screenWidth >= 600;
  const topPadding = Math.max(insets.top, vs(isWide ? 24 : 28)) + vs(isWide ? 22 : 24);

  return {
    sizes: {
      bell: ms(isWide ? 30 : 31),
      moon: ms(isWide ? 25 : 23),
      statIcon: ms(isWide ? 16 : 15),
      menuIcon: ms(isWide ? 29 : 27),
      chevron: ms(21),
    },
    styles: StyleSheet.create({
      background: {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#070B1F",
      },
      safeArea: {
        flex: 1,
      },
      scrollContent: {
        paddingHorizontal: pagePadding,
        paddingTop: topPadding,
        paddingBottom: vs(isWide ? 192 : 154),
        alignItems: "center",
      },
      contentFrame: {
        width: contentWidth,
      },
      header: {
        height: vs(isWide ? 50 : 43),
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      title: {
        color: "#F7D8B4",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 32 : 29),
        lineHeight: ms(isWide ? 42 : 39),
      },
      bellButton: {
        width: ms(46),
        height: ms(46),
        alignItems: "center",
        justifyContent: "center",
      },
      heroCard: {
        marginTop: vs(isWide ? 18 : 18),
        height: vs(isWide ? 154 : 132),
        borderRadius: ms(17),
        borderWidth: 1,
        borderColor: "rgba(229, 111, 116, 0.78)",
        overflow: "hidden",
        paddingHorizontal: ms(isWide ? 29 : 25),
        paddingTop: vs(isWide ? 22 : 20),
      },
      heroImage: {
        opacity: 0.7,
      },
      heroShade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(20, 9, 43, 0.48)",
      },
      heroTitle: {
        color: "#F7D8B4",
        fontFamily: "Mindeulle",
        fontSize: ms(isWide ? 24 : 23),
        lineHeight: ms(isWide ? 32 : 31),
        zIndex: 1,
      },
      heroTitleSmall: {
        marginTop: vs(2),
        color: "#F6C995",
        fontFamily: "Mindeulle",
        fontSize: ms(isWide ? 18 : 17),
        lineHeight: ms(isWide ? 26 : 24),
        zIndex: 1,
      },
      heroCopy: {
        marginTop: vs(isWide ? 14 : 12),
        color: "rgba(255, 229, 205, 0.74)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 13 : 12),
        lineHeight: ms(isWide ? 20 : 19),
        zIndex: 1,
      },
      profileStatus: {
        marginTop: vs(7),
        color: "rgba(255, 179, 107, 0.86)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 12 : 11),
        lineHeight: ms(isWide ? 18 : 17),
        zIndex: 1,
      },
      moon: {
        position: "absolute",
        right: ms(isWide ? 74 : 66),
        top: vs(isWide ? 58 : 50),
        zIndex: 2,
      },
      statsRow: {
        marginTop: vs(isWide ? 18 : 14),
        flexDirection: "row",
        columnGap: statGap,
      },
      statCard: {
        width: statWidth,
        height: vs(isWide ? 132 : 124),
        borderRadius: ms(14),
        borderWidth: 1,
        borderColor: "rgba(229, 111, 116, 0.78)",
        backgroundColor: "rgba(35, 15, 49, 0.82)",
        paddingHorizontal: ms(isWide ? 13 : 11),
        paddingTop: vs(isWide ? 15 : 14),
      },
      statLabelRow: {
        flexDirection: "row",
        alignItems: "center",
      },
      statLabel: {
        flex: 1,
        marginLeft: ms(6),
        color: "#F4CAA1",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 13 : 12),
        lineHeight: ms(isWide ? 19 : 18),
      },
      statValueRow: {
        marginTop: vs(isWide ? 9 : 8),
        flexDirection: "row",
        alignItems: "flex-end",
      },
      statValue: {
        color: "#FFB26E",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(isWide ? 40 : 36),
        lineHeight: ms(isWide ? 48 : 43),
      },
      statUnit: {
        marginLeft: ms(5),
        marginBottom: vs(5),
        color: "#F0C49B",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(12),
        lineHeight: ms(18),
      },
      statCaption: {
        marginTop: "auto",
        marginBottom: vs(10),
        color: "rgba(255, 224, 197, 0.72)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 11 : 10),
        lineHeight: ms(isWide ? 16 : 15),
      },
      menuCard: {
        marginTop: vs(isWide ? 22 : 20),
        borderRadius: ms(17),
        borderWidth: 1,
        borderColor: "rgba(229, 111, 116, 0.78)",
        backgroundColor: "rgba(34, 14, 48, 0.82)",
        paddingHorizontal: ms(isWide ? 20 : 18),
        paddingVertical: vs(isWide ? 8 : 6),
      },
      menuItem: {
        minHeight: vs(isWide ? 64 : 56),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 211, 195, 0.13)",
        flexDirection: "row",
        alignItems: "center",
      },
      lastMenuItem: {
        borderBottomWidth: 0,
      },
      menuIcon: {
        width: ms(isWide ? 43 : 38),
        alignItems: "flex-start",
      },
      menuTextWrap: {
        flex: 1,
        minWidth: 0,
      },
      menuTitle: {
        color: "#FFC08B",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 16 : 15),
        lineHeight: ms(isWide ? 23 : 22),
      },
      menuSubtitle: {
        marginTop: vs(3),
        color: "rgba(255, 222, 204, 0.64)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 11 : 10),
        lineHeight: ms(isWide ? 17 : 16),
      },
      footerCopyWrap: {
        marginTop: vs(12),
        alignItems: "center",
      },
      footerCopy: {
        color: "#FFB26E",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(isWide ? 12 : 11),
        lineHeight: ms(isWide ? 19 : 18),
        textAlign: "center",
      },
      dialogOverlay: {
        flex: 1,
        paddingHorizontal: pagePadding,
        backgroundColor: "rgba(4, 6, 18, 0.68)",
        alignItems: "center",
        justifyContent: "center",
      },
      dialogCard: {
        width: "100%",
        maxWidth: ms(330),
        borderRadius: ms(20),
        borderWidth: 1,
        borderColor: "rgba(255, 163, 99, 0.76)",
        backgroundColor: "rgba(26, 14, 45, 0.96)",
        paddingHorizontal: ms(23),
        paddingTop: vs(24),
        paddingBottom: vs(18),
        alignItems: "center",
        shadowColor: "#FF8C55",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 18,
        elevation: 18,
      },
      dialogSparkle: {
        color: "#FFB36B",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(23),
        lineHeight: ms(28),
      },
      dialogTitle: {
        marginTop: vs(8),
        color: "#FFE0BE",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(18),
        lineHeight: ms(27),
        textAlign: "center",
      },
      dialogCopy: {
        marginTop: vs(6),
        color: "rgba(255, 222, 204, 0.7)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(13),
        lineHeight: ms(20),
        textAlign: "center",
      },
      dialogActions: {
        width: "100%",
        marginTop: vs(22),
        flexDirection: "row",
        columnGap: ms(10),
      },
      dialogButton: {
        flex: 1,
        height: vs(45),
        borderRadius: ms(23),
        backgroundColor: "#F56643",
        alignItems: "center",
        justifyContent: "center",
      },
      dialogGhostButton: {
        borderWidth: 1,
        borderColor: "rgba(255, 179, 107, 0.54)",
        backgroundColor: "rgba(34, 20, 56, 0.78)",
      },
      dialogButtonText: {
        color: "#FFFFFF",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(21),
      },
      dialogGhostText: {
        color: "#F9CBA4",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(21),
      },
    }),
  };
};
