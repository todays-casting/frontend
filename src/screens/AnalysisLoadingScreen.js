import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const sx = SCREEN_WIDTH / 393;
const sy = SCREEN_HEIGHT / 824;
const scale = Math.min(sx, sy);
const ms = (value) => value * scale;
const vs = (value) => value * sy;

const COPY = {
  eyebrow: "\u2726  \uBD84\uC11D \uC911\uC774\uC5D0\uC694  \u2726",
  title: "\uB2F9\uC2E0\uC758 \uD558\uB8E8\uB97C \uBD84\uC11D\uD558\uACE0 \uC788\uC5B4\uC694",
  line1: "\uC785\uB825\uD558\uC2E0 \uB0B4\uC6A9\uC744 \uBC14\uD0D5\uC73C\uB85C",
  line2: "\uAC10\uC815\uACFC \uC21C\uAC04\uB4E4\uC744 \uC815\uB9AC\uD558\uACE0 \uC788\uC5B4\uC694.",
  loading: "\uBD84\uC11D \uC911",
  tipTitle: "TIP",
  tip: "\uAE30\uB85D\uD560\uC218\uB85D \uB354 \uC815\uD655\uD55C \uBD84\uC11D\uC744 \uBC1B\uC744 \uC218 \uC788\uC5B4\uC694!",
};

export default function AnalysisLoadingScreen({ navigation }) {
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
      source={require("../../assets/images/login_background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.backdrop} />

      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          activeOpacity={0.75}
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={ms(32)} color="#FFB36B" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.eyebrow}>{COPY.eyebrow}</Text>
          <Text style={styles.title}>{COPY.title}</Text>
          <Text style={styles.description}>{COPY.line1}</Text>
          <Text style={styles.description}>{COPY.line2}</Text>
        </View>

        <View style={styles.stage}>
          <View style={[styles.lightBeam, styles.leftBeam]} />
          <View style={[styles.lightBeam, styles.rightBeam]} />
          <View style={[styles.spotlight, styles.leftSpot]} />
          <View style={[styles.spotlight, styles.rightSpot]} />
          <MaterialCommunityIcons
            name="heart-outline"
            size={ms(56)}
            color="#FF8D6D"
            style={styles.heart}
          />
          <View style={styles.microphoneStand}>
            <MaterialCommunityIcons
              name="microphone-variant"
              size={ms(52)}
              color="#FFB36B"
              style={styles.microphone}
            />
            <View style={styles.standLine} />
            <View style={styles.standBase} />
          </View>
          <View style={styles.floorGlow} />
        </View>

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
            <Text style={styles.tipStar}>{"\u2726"}</Text>
            <Text style={styles.tipTitle}>{COPY.tipTitle}</Text>
          </View>
          <View style={styles.tipTextRow}>
            <Text style={styles.tipText}>{COPY.tip}</Text>
            <Text style={styles.tipSparkle}>{"\u2726"}</Text>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#050A1C",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 7, 21, 0.7)",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: ms(20),
    paddingTop: vs(27),
    paddingBottom: vs(18),
  },
  backButton: {
    width: ms(44),
    height: ms(44),
    alignItems: "flex-start",
    justifyContent: "center",
  },
  header: {
    marginTop: vs(20),
    alignItems: "center",
  },
  eyebrow: {
    color: "#FFB36B",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(19),
    lineHeight: ms(28),
  },
  title: {
    marginTop: vs(28),
    color: "#FFD8BC",
    fontFamily: "Mindeulle",
    fontSize: ms(30),
    lineHeight: ms(43),
    textAlign: "center",
  },
  description: {
    marginTop: vs(6),
    color: "#F0A982",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(17),
    lineHeight: ms(28),
    textAlign: "center",
  },
  stage: {
    flex: 1,
    minHeight: vs(338),
    marginTop: vs(18),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  lightBeam: {
    position: "absolute",
    top: vs(42),
    width: ms(116),
    height: vs(250),
    backgroundColor: "rgba(255, 121, 54, 0.22)",
    borderBottomLeftRadius: ms(60),
    borderBottomRightRadius: ms(60),
  },
  leftBeam: {
    left: ms(28),
    transform: [{ rotate: "-24deg" }],
  },
  rightBeam: {
    right: ms(28),
    transform: [{ rotate: "24deg" }],
  },
  spotlight: {
    position: "absolute",
    top: vs(52),
    width: ms(48),
    height: ms(29),
    borderRadius: ms(15),
    backgroundColor: "#FF9B5F",
    shadowColor: "#FF7D3E",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 8,
  },
  leftSpot: {
    left: ms(18),
    transform: [{ rotate: "22deg" }],
  },
  rightSpot: {
    right: ms(18),
    transform: [{ rotate: "-22deg" }],
  },
  heart: {
    position: "absolute",
    top: vs(165),
    textShadowColor: "#FF583A",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  microphoneStand: {
    position: "absolute",
    top: vs(242),
    alignItems: "center",
  },
  microphone: {
    transform: [{ rotate: "-23deg" }],
  },
  standLine: {
    width: ms(3),
    height: vs(114),
    marginTop: vs(-4),
    backgroundColor: "rgba(255, 186, 124, 0.55)",
  },
  standBase: {
    width: ms(74),
    height: vs(11),
    borderRadius: ms(10),
    backgroundColor: "rgba(255, 159, 91, 0.62)",
  },
  floorGlow: {
    position: "absolute",
    bottom: vs(10),
    width: ms(205),
    height: vs(35),
    borderRadius: ms(102),
    backgroundColor: "rgba(255, 119, 55, 0.38)",
  },
  loadingBlock: {
    alignItems: "center",
    marginBottom: vs(30),
  },
  loadingText: {
    color: "#FFD29D",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(21),
    lineHeight: ms(30),
  },
  dotsRow: {
    height: vs(30),
    marginTop: vs(15),
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
    minHeight: vs(76),
    marginHorizontal: ms(24),
    paddingHorizontal: ms(19),
    paddingVertical: vs(13),
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
    marginTop: vs(10),
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
});
