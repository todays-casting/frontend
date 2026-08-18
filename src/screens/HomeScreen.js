import React, { useEffect, useMemo, useState } from "react";
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
import NotificationSheet from "../components/NotificationSheet";
import castingsApi from "../api/castings-api";
import { useUser } from "../contexts/UserContext";
import { CastingCardFront } from "./CalendarScreen";
import {
  getNotificationState,
  markAllNotificationsRead,
  subscribeNotificationState,
} from "../services/notificationState";
import {
  getTodayDateKey,
  getTodayRecordState,
  setTodayResultLiked,
  setTodayResultReady,
  subscribeTodayRecordState,
} from "../services/todayRecordState";
import { notifyFavoriteChanged, subscribeFavoriteChanges } from "../services/favoriteState";
import { findNavigationWithRoute } from "../services/flowNavigation";
import {
  hasCompleteCastingImage,
  resolveTodayCastingTarget,
} from "../services/todayCastingResolver";

const CARD_PATH =
  "M31 1 H174 C179 14 188 21 202 21 C216 21 225 14 230 1 H373 C383 1 390 8 390 18 C399 19 404 26 404 36 V555 C404 565 398 571 388 571 C388 579 381 583 372 583 H32 C23 583 16 579 16 571 C6 571 0 565 0 555 V36 C0 26 6 20 14 18 C14 8 21 1 31 1 Z";
const STAGE_IMAGE = require("../../assets/images/home_stage.png");

const COPY = {
  question: "\uC624\uB298 \uD558\uB8E8\uB294 \uC5B4\uB5A4 \uC774\uC57C\uAE30\uC778\uAC00\uC694?",
  cardEyebrow: "\u2726  TODAY\u2019S CASTING  \u2726",
  cardTitle: "\uC624\uB298 \uD558\uB8E8\uC758\n\uC8FC\uC778\uACF5\uC774 \uB418\uC5B4\uBCF4\uC138\uC694!",
  cardPrompt: "\uCE74\uB4DC\uC5D0 \uB9C8\uC74C\uC744 \uC801\uC5B4\uBCF4\uBA74",
  cardHelp:
    "AI\uAC00 \uB2F9\uC2E0\uC5D0\uAC8C \uC5B4\uC6B8\uB9AC\uB294 \uBC30\uC5ED\uC744 \uCC3E\uC544\uC918\uC694.",
  cta: "\uC9C0\uAE08 \uAE30\uB85D\uD558\uAE30",
  resultEyebrow: "\u2726  CASTING RESULT  \u2726",
  resultTitle: "\uB530\uB73B\uD55C \uBC24\uC758\n\uC8FC\uC778\uACF5",
  resultGenre: "\uC624\uB298\uC758 \uC7A5\uB974",
  resultGenreText: "Romance Drama",
  resultRole: "\uC624\uB298\uC758 \uBC30\uC5ED",
  resultRoleText: "\uC870\uC6A9\uD788 \uBE5B\uB098\uB294 \uC8FC\uC778\uACF5",
  resultLine: "\uD55C\uC904 \uCE90\uC2A4\uD305",
  resultLineText:
    "\uC791\uC740 \uC9C4\uC2EC\uC774 \uD558\uB8E8\uB97C \uB530\uB73B\uD558\uAC8C \uBC14\uAFB8\uB294 \uC7A5\uBA74.",
  resultCta: "\uB2E4\uC2DC \uAE30\uB85D\uD558\uAE30",
};

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const formatDisplayDate = (dateKey) => dateKey.replaceAll("-", ".");

const normalizeHomeResult = (casting, fallbackRecordId) => {
  if (!casting || typeof casting !== "object") {
    return null;
  }

  const title = pickFirst(
    casting.title,
    casting.roleName,
    casting.characterName,
    casting.role,
    casting.castingTitle
  );

  if (!title) {
    return null;
  }

  return {
    ...casting,
    recordId: pickFirst(casting.recordId, casting.dailyRecordId, fallbackRecordId),
    dailyRecordId: pickFirst(casting.dailyRecordId, casting.recordId, fallbackRecordId),
    title,
    genre: pickFirst(casting.genre, casting.movieGenre, casting.todayGenre, ""),
    line: pickFirst(casting.oneLineComment, casting.line, casting.quote, ""),
    scene: pickFirst(casting.scenePhrase, casting.scene, casting.memorableScene, ""),
    imageUrl: pickFirst(casting.imageUrl, casting.generatedImageUrl, ""),
    isFavorite: Boolean(casting.isFavorite),
  };
};

export default function HomeScreen({ navigation, route }) {
  const { nickname } = useUser();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const responsive = createStyles(width, height, insets);
  const { styles } = responsive;
  const [todayState, setTodayState] = useState(() => getTodayRecordState());
  const [homeResult, setHomeResult] = useState(null);
  const [todayScreen, setTodayScreen] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationState, setNotificationState] = useState(() =>
    getNotificationState()
  );
  const resultCard = useMemo(
    () =>
      homeResult ??
      normalizeHomeResult(route?.params?.result) ??
      normalizeHomeResult(todayState.resultData),
    [homeResult, route?.params?.result, todayState.resultData]
  );
  const statusAllowsResult =
    todayScreen === null ? todayState.resultReady : todayScreen === "RESULT";
  const hasResultCard =
    statusAllowsResult &&
    Boolean(resultCard) &&
    hasCompleteCastingImage(resultCard);
  const resultRows = useMemo(
    () => [
      { icon: "movie-open-outline", label: "오늘의 장르", text: resultCard?.genre },
      { icon: "pencil-outline", label: "오늘의 한줄 기록", text: resultCard?.line },
      { icon: "image-outline", label: "기억에 남은 장면", text: resultCard?.scene },
    ],
    [resultCard]
  );
  const goInput = async () => {
    const returnTo = { screen: "Home" };

    try {
      const target = await resolveTodayCastingTarget();
      const recordId = target.recordId;
      const recordDate = target.recordDate ?? getTodayDateKey();

      if (target.screen === "RESULT" && target.casting) {
        const normalized = normalizeHomeResult(target.casting, recordId);

        if (normalized) {
          const normalizedResult = { ...normalized, recordDate };

          setHomeResult(normalizedResult);
          setTodayResultReady(true, normalizedResult);
        }

        navigation?.navigate?.("Result", {
          recordId,
          dailyRecordId: recordId,
          recordDate,
          result: normalized
            ? { ...normalized, recordDate }
            : { ...target.casting, recordId, recordDate },
          returnTo,
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
          navigation?.navigate?.("AnalysisLoading", loadingParams);
        }
        return;
      }
    } catch (error) {
      console.warn("[HomeScreen] failed to resolve input target:", {
        statusCode: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
    }

    navigation?.navigate?.("DailyRecord", {
      recordDate: getTodayDateKey(),
      returnTo,
    });
  };

  useEffect(() => subscribeNotificationState(setNotificationState), []);
  useEffect(() => subscribeTodayRecordState(setTodayState), []);
  useEffect(
    () =>
      subscribeFavoriteChanges(({ recordId, isFavorite }) => {
        if (typeof isFavorite !== "boolean") {
          return;
        }

        setHomeResult((current) =>
          String(current?.recordId) === String(recordId)
            ? { ...current, isFavorite }
            : current
        );
      }),
    []
  );

  useEffect(() => {
    let active = true;

    const loadTodayResult = async () => {
      try {
        const target = await resolveTodayCastingTarget();

        if (!active) {
          return;
        }

        setTodayScreen(target.screen ?? null);

        if (target.screen !== "RESULT" || !target.casting) {
          setHomeResult(null);
          return;
        }

        const normalized = normalizeHomeResult(target.casting, target.recordId);

        if (normalized) {
          const normalizedResult = {
            ...normalized,
            recordDate: target.recordDate ?? getTodayDateKey(),
          };

          setHomeResult(normalizedResult);
          setTodayResultReady(true, normalizedResult);
        }
      } catch (error) {
        console.warn("[HomeScreen] failed to load today casting:", {
          statusCode: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        });
      }
    };

    loadTodayResult();
    const unsubscribeFocus = navigation?.addListener?.("focus", loadTodayResult);

    return () => {
      active = false;
      unsubscribeFocus?.();
    };
  }, [navigation]);

  const goResult = () => {
    if (!resultCard) {
      return;
    }

    const recordDate = resultCard.recordDate ?? getTodayDateKey();

    navigation?.navigate?.("Result", {
      recordId: resultCard.recordId,
      dailyRecordId: resultCard.dailyRecordId,
      recordDate,
      result: resultCard,
    });
  };

  const toggleHomeFavorite = async () => {
    if (!resultCard?.recordId) {
      return;
    }

    const nextLiked = !resultCard.isFavorite;

    setTodayResultLiked(nextLiked);
    setHomeResult((current) =>
      current ? { ...current, isFavorite: nextLiked } : current
    );

    try {
      const updated = await castingsApi.toggleFavorite(resultCard.recordId);
      const updatedLiked =
        typeof updated?.isFavorite === "boolean" ? updated.isFavorite : nextLiked;

      setTodayResultLiked(updatedLiked);
      setHomeResult((current) =>
        current ? { ...current, isFavorite: updatedLiked } : current
      );
      notifyFavoriteChanged({
        recordId: resultCard.recordId,
        dateKey: resultCard.recordDate ?? getTodayDateKey(),
        isFavorite: updatedLiked,
      });
    } catch (error) {
      setTodayResultLiked(resultCard.isFavorite);
      setHomeResult((current) =>
        current ? { ...current, isFavorite: resultCard.isFavorite } : current
      );
    }
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
              <Text style={styles.greeting}>
                {nickname ? `안녕하세요, ${nickname}님 👋` : "안녕하세요 👋"}
              </Text>
              <Text style={styles.question}>{COPY.question}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.bellButton}
              onPress={() => setNotificationVisible(true)}
            >
              <Ionicons name="notifications-outline" size={33} color="#FFD08E" />
              {notificationState.hasUnread && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          {hasResultCard ? (
            <TouchableOpacity
              activeOpacity={0.92}
              style={styles.resultCastingCard}
              onPress={goResult}
            >
              <View style={styles.resultCastingCardInner}>
                <CastingCardFront
                  date={formatDisplayDate(resultCard.recordDate ?? getTodayDateKey())}
                  record={resultCard}
                  eyebrow="TODAY’S CASTING"
                  rows={resultRows}
                  isFavorite={resultCard.isFavorite}
                  onToggleFavorite={toggleHomeFavorite}
                  onFlip={() => {}}
                  showInfoPanel={false}
                  showFlipButton={false}
                />
              </View>
            </TouchableOpacity>
          ) : (
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
              <Text style={styles.cardEyebrow}>
                {COPY.cardEyebrow}
              </Text>
              <Text style={styles.cardTitle}>
                {COPY.cardTitle}
              </Text>

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
              <Text style={styles.ctaText}>
                {COPY.cta}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={responsive.arrowIconSize}
                color="#FFBF80"
              />
            </TouchableOpacity>
          </View>
          )}
      </ScrollView>

      <NotificationSheet
        visible={notificationVisible}
        notifications={notificationState.notifications}
        onClose={() => setNotificationVisible(false)}
        onMarkAllRead={markAllNotificationsRead}
      />
    </ImageBackground>
  );
}

const createStyles = (screenWidth, screenHeight, insets) => {
  const scale = Math.min(Math.max(screenWidth / 393, 0.82), 1.15);
  const ms = (value) => value * scale;
  const vs = ms;
  const cardHorizontalMargin = Math.max(ms(20), 20);
  const topPadding = Math.max(insets.top, ms(16)) + ms(20);
  const headerHeight = ms(69);
  const headerGap = ms(50);
  const bottomClearance = 132 + Math.max(insets.bottom, ms(16));
  const cardRatio = 584 / 404;
  const availableCardHeight = Math.max(
    120,
    screenHeight - topPadding - headerHeight - headerGap - bottomClearance - ms(4)
  );
  const cardWidth = Math.min(
    screenWidth - cardHorizontalMargin * 2,
    availableCardHeight / cardRatio
  );
  const cardHeight = cardWidth * cardRatio;
  const cardScale = cardWidth / 367;
  const cs = (value) => value * cardScale;
  const ctaHeight = cardHeight * (72 / 584);
  const resultBaseWidth = ms(284);
  const resultBaseHeight = ms(484);
  const resultCardScale = Math.min(
    cardWidth / resultBaseWidth,
    cardHeight / resultBaseHeight,
    1.18
  );

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
    marginTop: ms(40),
    paddingLeft: ms(12),
    paddingRight: ms(8),
  },

  greeting: {
    color: "#FFD596",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(16),
    lineHeight: ms(19),
  },

  question: {
    marginTop: 5,
    color: "rgba(255, 255, 255, 0.7)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(17),
  },

  bellButton: {
    width: ms(52),
    height: ms(52),
    alignItems: "center",
    justifyContent: "center",
    marginTop: ms(30),
  },

  bellDot: {
    position: "absolute",
    right: ms(13),
    top: ms(10),
    width: ms(6),
    height: ms(6),
    borderRadius: ms(5),
    backgroundColor: "#FF7746",
  },

  card: {
    width: cardWidth,
    height: cardHeight,
    position: "relative",
    alignSelf: "center",
  },

  resultCastingCard: {
    width: resultBaseWidth * resultCardScale,
    height: resultBaseHeight * resultCardScale,
    position: "relative",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  resultCastingCardInner: {
    width: resultBaseWidth,
    height: resultBaseHeight,
    transform: [{ scale: resultCardScale }],
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
    marginLeft: cs(7),
    color: "#FFB16C",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(14),
    lineHeight: cs(20),
  },

  cardHelp: {
    marginTop: cs(8),
    color: "rgba(255, 255, 255, 0.76)",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(11),
    lineHeight: cs(18),
    textAlign: "center",
  },

  resultPanel: {
    width: "100%",
    marginTop: cardHeight * 0.04,
    position: "relative",
    paddingHorizontal: cs(16),
    paddingVertical: cs(8),
    overflow: "hidden",
  },

  resultPanelArtwork: {
    ...StyleSheet.absoluteFillObject,
  },

  resultLineRow: {
    paddingVertical: cs(9),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 211, 195, 0.15)",
  },

  resultLineLast: {
    borderBottomWidth: 0,
  },

  resultLabel: {
    color: "#FFB16C",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(12),
    lineHeight: cs(18),
  },

  resultValue: {
    marginTop: cs(3),
    color: "#FFE0BE",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(14),
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
    marginHorizontal: cs(11),
    color: "#FFBF80",
    fontFamily: "NanumSquareNeo",
    fontSize: cs(17),
    lineHeight: cs(25),
  },
  });

  return {
    styles,
    promptIconSize: Math.max(12, cs(19)),
    ctaIconSize: Math.max(12, cs(19)),
    arrowIconSize: Math.max(13, cs(21)),
  };
};
