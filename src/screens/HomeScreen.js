import React from "react";
import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  ClipPath,
  Defs,
  Image as SvgImage,
  Line,
  Path,
  Rect,
} from "react-native-svg";

const CARD_PATH =
  "M31 1 H174 C179 14 188 21 202 21 C216 21 225 14 230 1 H373 C383 1 390 8 390 18 C399 19 404 26 404 36 V555 C404 565 398 571 388 571 C388 579 381 583 372 583 H32 C23 583 16 579 16 571 C6 571 0 565 0 555 V36 C0 26 6 20 14 18 C14 8 21 1 31 1 Z";
const STAGE_IMAGE = require("../../assets/images/home_stage.png");

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
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const responsive = createStyles(width, height, insets);
  const { styles } = responsive;
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

      <ScrollView
        style={styles.safeArea}
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{COPY.hello}</Text>
              <Text style={styles.question}>{COPY.question}</Text>
            </View>

            <TouchableOpacity activeOpacity={0.75} style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={33} color="#FFD08E" />
              <View style={styles.bellDot} />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 404 584"
              preserveAspectRatio="none"
              style={styles.cardArtwork}
            >
              <Defs>
                <ClipPath id="homeCardClip">
                  <Path d={CARD_PATH} />
                </ClipPath>
              </Defs>

              <SvgImage
                href={STAGE_IMAGE}
                x="0"
                y="0"
                width="404"
                height="584"
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#homeCardClip)"
              />
              <Rect
                x="0"
                y="512"
                width="404"
                height="72"
                fill="rgba(37, 17, 62, 0.96)"
                clipPath="url(#homeCardClip)"
              />
              <Line
                x1="0"
                y1="512"
                x2="404"
                y2="512"
                stroke="rgba(255, 174, 105, 0.72)"
                strokeWidth="1"
              />
              <Path
                d={CARD_PATH}
                fill="none"
                stroke="#E9AD62"
                strokeWidth="1.4"
                vectorEffect="non-scaling-stroke"
              />
            </Svg>

            <View style={styles.cardTextArea}>
              <Text style={styles.cardEyebrow}>{COPY.cardEyebrow}</Text>
              <Text style={styles.cardTitle}>{COPY.cardTitle}</Text>

              <View style={styles.promptRow}>
                <MaterialCommunityIcons
                  name="note-edit-outline"
                  size={responsive.promptIconSize}
                  color="#FFAC66"
                />
                <Text style={styles.cardPrompt}>{COPY.cardPrompt}</Text>
              </View>

              <Text style={styles.cardHelp}>{COPY.cardHelp}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.ctaButton}
              onPress={goInput}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={responsive.ctaIconSize}
                color="#FFBF80"
              />
              <Text style={styles.ctaText}>{COPY.cta}</Text>
              <Ionicons
                name="arrow-forward"
                size={responsive.arrowIconSize}
                color="#FFBF80"
              />
            </TouchableOpacity>
          </View>
      </ScrollView>
    </ImageBackground>
  );
}

const createStyles = (screenWidth, screenHeight, insets) => {
  const scale = Math.min(Math.max(screenWidth / 393, 0.82), 1.15);
  const ms = (value) => value * scale;
  const vs = ms;
  const cardHorizontalMargin = ms(13);
  const topPadding = Math.max(insets.top, ms(16)) + ms(20);
  const headerHeight = ms(69);
  const headerGap = ms(20);
  const bottomClearance = 132 + Math.max(insets.bottom, ms(16));
  const cardRatio = 584 / 404;
  const availableCardHeight = Math.max(
    120,
    screenHeight - topPadding - headerHeight - headerGap - bottomClearance
  );
  const cardWidth = Math.min(
    screenWidth - cardHorizontalMargin * 2,
    availableCardHeight / cardRatio
  );
  const cardHeight = cardWidth * cardRatio;
  const cardScale = cardWidth / 367;
  const cs = (value) => value * cardScale;
  const ctaHeight = cardHeight * (72 / 584);

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
    flexGrow: 1,
    paddingHorizontal: cardHorizontalMargin,
    paddingTop: topPadding,
    paddingBottom: bottomClearance,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    minHeight: headerHeight,
    marginBottom: headerGap,
  },
  headerText: {
    flex: 1,
    paddingRight: ms(8),
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
    width: cardWidth,
    height: cardHeight,
    position: "relative",
    alignSelf: "center",
  },

  cardArtwork: {
    position: "absolute",
    inset: 0,
  },

  cardTextArea: {
    position: "absolute",
    top: cardHeight * 0.095,
    left: cs(18),
    right: cs(18),
    alignItems: "center",
    zIndex: 2,
  },

  cardEyebrow: {
    color: "#FFD18F",
    fontFamily: "MaruBuriSemiBold",
    fontSize: cs(14),
    lineHeight: cs(22),
    letterSpacing: 0,
  },

  cardTitle: {
    marginTop: cardHeight * 0.025,
    color: "#FFD4A1",
    fontFamily: "MaruBuriSemiBold",
    fontSize: cs(30),
    lineHeight: cs(43),
    textAlign: "center",
  },

  promptRow: {
    marginTop: cardHeight * 0.035,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  cardPrompt: {
    marginLeft: cs(9),
    color: "#FFB16C",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(16),
    lineHeight: cs(23),
  },

  cardHelp: {
    marginTop: cs(10),
    color: "rgba(255, 255, 255, 0.76)",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(13),
    lineHeight: cs(21),
    textAlign: "center",
  },

  ctaButton: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: ctaHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: {
    marginHorizontal: cs(14),
    color: "#FFBF80",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(20),
    lineHeight: cs(30),
  },
  });

  return {
    styles,
    promptIconSize: Math.max(14, cs(23)),
    ctaIconSize: Math.max(14, cs(23)),
    arrowIconSize: Math.max(15, cs(25)),
  };
};
