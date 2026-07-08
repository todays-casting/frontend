import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const sx = SCREEN_WIDTH / 393;
const sy = SCREEN_HEIGHT / 824;
const ms = (value) => value * Math.min(sx, sy);
const vs = (value) => value * sy;

const COPY = {
  hello: "\uC548\uB155\uD558\uC138\uC694, \uC11C\uC5F0\uB2D8 \uD83D\uDC4B",
  question: "\uC624\uB298 \uD558\uB8E8\uB294 \uC5B4\uB5A4 \uC774\uC57C\uAE30\uC778\uAC00\uC694?",
  cardEyebrow: "\u2726  TODAY\u2019S CASTING  \u2726",
  cardTitle: "\uC624\uB298 \uD558\uB8E8\uC758\n\uC8FC\uC778\uACF5\uC774 \uB418\uC5B4\uBCF4\uC138\uC694!",
  cardPrompt: "\uCE74\uB4DC\uC5D0 \uB9C8\uC74C\uC744 \uC801\uC5B4\uBCF4\uBA74",
  cardHelp:
    "AI\uAC00 \uB2F9\uC2E0\uC5D0\uAC8C \uC5B4\uC6B8\uB9AC\uB294 \uBC30\uC5ED\uC744 \uCC3E\uC544\uC918\uC694.",
  cta: "\uC9C0\uAE08 \uAE30\uB85D\uD558\uAE30",
};

export default function HomeScreen({ navigation }) {
  const goInput = () => {
    navigation?.navigate?.("Input");
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

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{COPY.hello}</Text>
              <Text style={styles.question}>{COPY.question}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.75} style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={33} color="#FFD08E" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.topNotch} />

            <View style={styles.cardTextArea}>
              <Text style={styles.cardEyebrow}>{COPY.cardEyebrow}</Text>
              <Text style={styles.cardTitle}>{COPY.cardTitle}</Text>

              <View style={styles.promptRow}>
                <MaterialCommunityIcons
                  name="note-edit-outline"
                  size={25}
                  color="#FFAC66"
                />
                <Text style={styles.cardPrompt}>{COPY.cardPrompt}</Text>
              </View>

              <Text style={styles.cardHelp}>{COPY.cardHelp}</Text>
            </View>

            <Image
              source={require("../../assets/images/home_stage.png")}
              style={styles.stageImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.ctaButton}
              onPress={goInput}
            >
              <MaterialCommunityIcons name="pencil" size={25} color="#FFBF80" />
              <Text style={styles.ctaText}>{COPY.cta}</Text>
              <Ionicons name="arrow-forward" size={27} color="#FFBF80" />
            </TouchableOpacity>
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
    backgroundColor: "#140D2D",
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: ms(27),
    paddingTop: vs(78),
    paddingBottom: vs(184),
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: vs(35),
  },

  greeting: {
    color: "#FFD596",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(24),
    lineHeight: ms(34),
  },

  question: {
    marginTop: 10,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(17),
    lineHeight: ms(25),
  },

  bellButton: {
    width: ms(52),
    height: ms(52),
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  bellDot: {
    position: "absolute",
    right: ms(7),
    top: ms(4),
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    backgroundColor: "#FF7746",
  },

  card: {
    height: vs(470),
    borderWidth: ms(1.4),
    borderColor: "#FFB66F",
    borderRadius: ms(32),
    backgroundColor: "rgba(28, 14, 55, 0.9)",
    overflow: "hidden",
  },

  topNotch: {
    position: "absolute",
    top: -ms(18),
    alignSelf: "center",
    width: ms(86),
    height: ms(36),
    borderBottomLeftRadius: ms(43),
    borderBottomRightRadius: ms(43),
    borderWidth: ms(1.4),
    borderTopWidth: 0,
    borderColor: "#FFB66F",
    backgroundColor: "rgba(28, 14, 55, 0.96)",
    zIndex: 2,
  },

  cardTextArea: {
    position: "absolute",
    top: vs(56),
    left: ms(18),
    right: ms(18),
    alignItems: "center",
    zIndex: 2,
  },

  cardEyebrow: {
    color: "#FFD18F",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(15),
    lineHeight: ms(22),
    letterSpacing: 0,
  },

  cardTitle: {
    marginTop: vs(18),
    color: "#FFD4A1",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(31),
    lineHeight: ms(48),
    textAlign: "center",
  },

  promptRow: {
    marginTop: vs(25),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  cardPrompt: {
    marginLeft: ms(9),
    color: "#FFB16C",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(16),
    lineHeight: ms(23),
  },

  cardHelp: {
    marginTop: vs(10),
    color: "rgba(255, 255, 255, 0.76)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(21),
    textAlign: "center",
  },

  stageImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: vs(66),
    width: "100%",
  },

  ctaButton: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: vs(66),
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 166, 99, 0.6)",
    backgroundColor: "rgba(42, 20, 64, 0.94)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: {
    marginHorizontal: ms(14),
    color: "#FFBF80",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(21),
    lineHeight: ms(30),
  },
});
