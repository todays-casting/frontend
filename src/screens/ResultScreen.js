import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
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
import {
  getTodayDateKey,
  getTodayRecordState,
  setTodayResultLiked,
  subscribeTodayRecordState,
} from "../services/todayRecordState";

// TODO(api-result): Replace this placeholder with the generated result returned
// from the analysis API or shared result store once backend integration lands.
const PLACEHOLDER_RESULT = {
  userName: "서연",
  title: "첫사랑\n여주인공",
  genre: "로맨스 드라마",
  line: "너와 함께라면, 모든 날이 영화 같아.",
  scene: "해질 무렵, 함께 걸었던 골목길",
};

const formatDisplayDate = (dateKey) => dateKey.replaceAll("-", ".");

export default function ResultScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { styles, sizes } = createStyles(width, height, insets);
  const [todayState, setTodayState] = useState(() => getTodayRecordState());
  const result = useMemo(() => {
    const date = todayState.resultDate || getTodayDateKey();

    return {
      ...PLACEHOLDER_RESULT,
      date: formatDisplayDate(date),
      ...route?.params?.result,
    };
  }, [route?.params?.result, todayState.resultDate]);

  useEffect(() => subscribeTodayRecordState(setTodayState), []);

  const goBackHome = () => {
    navigation.navigate("Main", {
      screen: "Home",
    });
  };

  const downloadCard = () => {
    Alert.alert("다운로드", "결과 카드 다운로드 기능을 준비 중입니다.");
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
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.72}
              style={styles.backButton}
              onPress={goBackHome}
            >
              <Ionicons name="arrow-back" size={sizes.backIcon} color="#FF934F" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>오늘의 결과</Text>
          </View>

          <View style={styles.messageBlock}>
            <Text style={styles.messageTitle}>
              ✦ {result.userName}님, 오늘의 기록이 완성되었어요
            </Text>
            <Text style={styles.messageSub}>당신만의 감성이 담긴 하루였어요.</Text>
          </View>

          <View style={styles.card}>
            <Image
              source={require("../../assets/images/home_stage.png")}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <View style={styles.cardShade} />
            <View style={styles.cardTopNotch} />

            <Text style={styles.cardDate}>{result.date}</Text>
            <Text style={styles.cardEyebrow}>TODAY'S CASTING</Text>
            <Text style={styles.cardTitle}>{result.title}</Text>

            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.likeButton}
              onPress={() => setTodayResultLiked(!todayState.resultLiked)}
            >
              <Ionicons
                name={todayState.resultLiked ? "heart" : "heart-outline"}
                size={sizes.likeIcon}
                color="#FFD69A"
              />
            </TouchableOpacity>

            <View style={styles.infoPanel}>
              <ResultRow
                icon="heart-outline"
                label="오늘의 장르"
                value={result.genre}
                styles={styles}
                sizes={sizes}
              />
              <ResultRow
                icon="pencil-outline"
                label="오늘의 한줄 기록"
                value={result.line}
                styles={styles}
                sizes={sizes}
              />
              <ResultRow
                icon="image-outline"
                label="기억에 남은 장면"
                value={result.scene}
                styles={styles}
                sizes={sizes}
                last
              />
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.downloadButton}
            onPress={downloadCard}
          >
            <Ionicons name="download-outline" size={sizes.downloadIcon} color="#FFE1AD" />
            <Text style={styles.downloadText}>오늘의 카드 다운로드</Text>
            <Text style={styles.downloadSparkle}>✦</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function ResultRow({ icon, label, value, styles, sizes, last }) {
  return (
    <View style={[styles.resultRow, last && styles.resultRowLast]}>
      <View style={styles.resultIcon}>
        <MaterialCommunityIcons name={icon} size={sizes.rowIcon} color="#FFD68D" />
      </View>
      <View style={styles.resultTextWrap}>
        <Text style={styles.resultLabel}>{label}</Text>
        <Text style={styles.resultValue}>{value}</Text>
      </View>
    </View>
  );
}

const createStyles = (screenWidth, screenHeight, insets) => {
  const scale = Math.min(Math.max(screenWidth / 393, 0.82), 1.13);
  const ms = (value) => value * scale;
  const pagePadding = ms(28);
  const topPadding = Math.max(insets.top, ms(16)) + ms(18);
  const cardWidth = Math.min(screenWidth - pagePadding * 2, ms(492));
  const cardHeight = Math.max(ms(550), Math.min(ms(690), screenHeight * 0.68));

  return {
    sizes: {
      backIcon: ms(30),
      likeIcon: ms(48),
      rowIcon: ms(27),
      downloadIcon: ms(31),
    },
    styles: StyleSheet.create({
      background: {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#030713",
      },
      safeArea: {
        flex: 1,
      },
      scrollContent: {
        minHeight: screenHeight,
        paddingHorizontal: pagePadding,
        paddingTop: topPadding,
        paddingBottom: Math.max(insets.bottom, ms(18)) + ms(30),
        alignItems: "center",
      },
      header: {
        width: "100%",
        height: ms(48),
        flexDirection: "row",
        alignItems: "center",
      },
      backButton: {
        width: ms(44),
        height: ms(44),
        alignItems: "flex-start",
        justifyContent: "center",
      },
      headerTitle: {
        marginLeft: ms(20),
        color: "#E7C779",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(25),
        lineHeight: ms(34),
      },
      messageBlock: {
        marginTop: ms(20),
        alignItems: "center",
      },
      messageTitle: {
        color: "#FFE3A9",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(18),
        lineHeight: ms(28),
        textAlign: "center",
      },
      messageSub: {
        marginTop: ms(4),
        color: "#F08C4B",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(15),
        lineHeight: ms(23),
        textAlign: "center",
      },
      card: {
        width: cardWidth,
        height: cardHeight,
        marginTop: ms(24),
        borderRadius: ms(18),
        borderWidth: 1,
        borderColor: "#F18845",
        backgroundColor: "#1B1131",
        overflow: "hidden",
      },
      cardImage: {
        ...StyleSheet.absoluteFillObject,
      },
      cardShade: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(22, 8, 38, 0.12)",
      },
      cardTopNotch: {
        position: "absolute",
        top: -ms(17),
        alignSelf: "center",
        width: ms(58),
        height: ms(34),
        borderBottomLeftRadius: ms(29),
        borderBottomRightRadius: ms(29),
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: "#F18845",
        backgroundColor: "#030713",
      },
      cardDate: {
        marginTop: ms(44),
        color: "#FFE7BC",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(27),
        lineHeight: ms(38),
        textAlign: "center",
      },
      cardEyebrow: {
        marginTop: ms(12),
        color: "#F1D6C0",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(13),
        lineHeight: ms(19),
        letterSpacing: 0,
        textAlign: "center",
      },
      cardTitle: {
        marginTop: ms(12),
        color: "#FFE2A8",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(43),
        lineHeight: ms(58),
        textAlign: "center",
      },
      likeButton: {
        position: "absolute",
        top: ms(52),
        right: ms(24),
        width: ms(58),
        height: ms(58),
        alignItems: "center",
        justifyContent: "center",
      },
      infoPanel: {
        position: "absolute",
        left: ms(18),
        right: ms(18),
        bottom: ms(28),
        paddingHorizontal: ms(18),
        paddingVertical: ms(12),
        borderRadius: ms(15),
        borderWidth: 1,
        borderColor: "rgba(241, 136, 69, 0.58)",
        backgroundColor: "rgba(27, 16, 37, 0.88)",
      },
      resultRow: {
        minHeight: ms(78),
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 202, 159, 0.18)",
        flexDirection: "row",
        alignItems: "center",
      },
      resultRowLast: {
        borderBottomWidth: 0,
      },
      resultIcon: {
        width: ms(48),
        height: ms(48),
        borderRadius: ms(24),
        borderWidth: 1,
        borderColor: "rgba(255, 214, 141, 0.28)",
        alignItems: "center",
        justifyContent: "center",
      },
      resultTextWrap: {
        flex: 1,
        marginLeft: ms(18),
      },
      resultLabel: {
        color: "#FFE29B",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(21),
      },
      resultValue: {
        marginTop: ms(6),
        color: "#FFF1D0",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(17),
        lineHeight: ms(25),
      },
      downloadButton: {
        width: cardWidth,
        height: ms(65),
        marginTop: ms(14),
        borderRadius: ms(14),
        borderWidth: 1,
        borderColor: "rgba(255, 159, 86, 0.78)",
        backgroundColor: "rgba(73, 28, 51, 0.92)",
        shadowColor: "#FF8D4C",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.36,
        shadowRadius: 14,
        elevation: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },
      downloadText: {
        marginHorizontal: ms(18),
        color: "#FFE1AD",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(19),
        lineHeight: ms(28),
      },
      downloadSparkle: {
        color: "#FFB36B",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(17),
      },
    }),
  };
};
