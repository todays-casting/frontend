import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const COPY = {
  eyebrow: "✦  분석 중이에요  ✦",
  title: "당신의 하루를 분석하고 있어요",
  line1: "입력하신 내용을 바탕으로",
  line2: "감정과 순간들을 정리하고 있어요.",
  loading: "분석 중",
  tipTitle: "TIP",
  tip: "기록할수록 더 정확한 분석을 받을 수 있어요!",
};

export default function AnalysisLoadingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { styles, sizes } = createStyles(width, height, insets);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setActiveDot((current) => (current + 1) % 3);
    }, 420);

    const doneTimer = setTimeout(() => {
      navigation.replace("Main", {
        screen: "Home",
        params: { showResult: true },
      });
    }, 3600);

    return () => {
      clearInterval(dotTimer);
      clearTimeout(doneTimer);
    };
  }, [navigation]);

  return (
    <ImageBackground
      source={require("../../assets/images/analysis_loading_stage.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.topShade} />
      <View style={styles.bottomShade} />

      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={sizes.backIcon} color="#FFB36B" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>{COPY.eyebrow}</Text>
          <Text style={styles.title}>{COPY.title}</Text>
          <Text style={styles.description}>{COPY.line1}</Text>
          <Text style={styles.description}>{COPY.line2}</Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.loadingBlock}>
          <Text style={styles.loadingText}>{COPY.loading}</Text>
          <View style={styles.dotsRow}>
            {[0, 1, 2].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeDot === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipTitleRow}>
            <Text style={styles.tipStar}>{"✦"}</Text>
            <Text style={styles.tipTitle}>{COPY.tipTitle}</Text>
          </View>
          <View style={styles.tipTextRow}>
            <Text style={styles.tipText}>{COPY.tip}</Text>
            <Text style={styles.tipSparkle}>{"✦"}</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const createStyles = (screenWidth, screenHeight, insets) => {
  const scale = Math.min(Math.max(screenWidth / 393, 0.82), 1.12);
  const ms = (value) => value * scale;
  const pagePadding = ms(20);
  const topPadding = Math.max(insets.top, ms(16)) + ms(10);
  const bottomPadding = Math.max(insets.bottom, ms(18)) + ms(16);

  return {
    sizes: {
      backIcon: ms(32),
    },
    styles: StyleSheet.create({
      background: {
        flex: 1,
        width: "100%",
        height: "100%",
        backgroundColor: "#050A1C",
      },
      backgroundImage: {
        opacity: 1,
      },
      topShade: {
        ...StyleSheet.absoluteFillObject,
        bottom: screenHeight * 0.42,
        backgroundColor: "rgba(1, 6, 19, 0.18)",
      },
      bottomShade: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: screenHeight * 0.34,
        backgroundColor: "rgba(1, 6, 19, 0.42)",
      },
      safeArea: {
        flex: 1,
        paddingHorizontal: pagePadding,
        paddingTop: topPadding,
        paddingBottom: bottomPadding,
      },
      backButton: {
        width: ms(44),
        height: ms(44),
        alignItems: "flex-start",
        justifyContent: "center",
      },
      header: {
        marginTop: ms(18),
        alignItems: "center",
      },
      eyebrow: {
        color: "#FFB36B",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(17),
        lineHeight: ms(26),
      },
      title: {
        marginTop: ms(25),
        color: "#FFD8BC",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(28),
        lineHeight: ms(40),
        textAlign: "center",
        letterSpacing: 0,
      },
      description: {
        marginTop: ms(7),
        color: "#F0A982",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(16),
        lineHeight: ms(27),
        textAlign: "center",
      },
      spacer: {
        flex: 1,
        minHeight: screenHeight * 0.36,
      },
      loadingBlock: {
        alignItems: "center",
        marginBottom: ms(28),
      },
      loadingText: {
        color: "#FFD29D",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(21),
        lineHeight: ms(30),
      },
      dotsRow: {
        height: ms(30),
        marginTop: ms(15),
        flexDirection: "row",
        alignItems: "center",
      },
      dot: {
        marginHorizontal: ms(9),
        borderRadius: ms(8),
        backgroundColor: "#FF9C5F",
      },
      activeDot: {
        width: ms(12),
        height: ms(12),
        shadowColor: "#FF9C5F",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.75,
        shadowRadius: 8,
        elevation: 6,
      },
      inactiveDot: {
        width: ms(8),
        height: ms(8),
        opacity: 0.82,
      },
      tipCard: {
        minHeight: ms(76),
        marginHorizontal: ms(4),
        paddingHorizontal: ms(19),
        paddingVertical: ms(13),
        borderRadius: ms(13),
        borderWidth: 1,
        borderColor: "rgba(125, 72, 139, 0.58)",
        backgroundColor: "rgba(22, 14, 42, 0.88)",
      },
      tipTitleRow: {
        flexDirection: "row",
        alignItems: "center",
      },
      tipStar: {
        color: "#FFB36B",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(17),
        lineHeight: ms(21),
      },
      tipTitle: {
        marginLeft: ms(9),
        color: "#F8A66F",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(15),
        lineHeight: ms(22),
      },
      tipTextRow: {
        marginTop: ms(10),
        flexDirection: "row",
        alignItems: "center",
      },
      tipText: {
        flex: 1,
        color: "#ECA47E",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(21),
      },
      tipSparkle: {
        marginLeft: ms(8),
        color: "#FFB36B",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(15),
      },
    }),
  };
};
