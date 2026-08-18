import React, { useEffect, useMemo, useState } from "react";
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
import { getTodayDateKey, setTodayResultReady } from "../services/todayRecordState";
import {
  clearAnalysisLoadingVisible,
  setAnalysisLoadingVisible,
} from "../services/navigationUiState";
import {
  navigateToReturnTarget,
  normalizeReturnTo,
} from "../services/flowNavigation";
import analysesApi from "../api/analyses-api";
import castingsApi from "../api/castings-api";
import recordsApi from "../api/records-api";
import { addNotification } from "../services/notificationState";

const COPY = {
  eyebrow: "✦  분석 중이에요  ✦",
  title: "당신의 하루를 분석하고 있어요",
  line1: "입력하신 내용을 바탕으로",
  line2: "감정과 순간들을 정리하고 있어요.",
  loading: "분석 중",
  tipTitle: "TIP",
  tip: "자세히 기록할수록 더 정확한 분석을 받을 수 있어요!",
};

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const findNavigationWithRoute = (navigation, routeName) => {
  let currentNavigation = navigation;

  while (currentNavigation) {
    if (currentNavigation.getState?.().routeNames?.includes(routeName)) {
      return currentNavigation;
    }

    currentNavigation = currentNavigation.getParent?.();
  }

  return null;
};

const getStatusRecordId = (status) =>
  pickFirst(
    status?.dailyRecordId,
    status?.recordId,
    status?.record?.id,
    status?.dailyRecord?.id,
    status?.id
  );

const RESULT_KEYS = [
  "casting",
  "castingCard",
  "castingResult",
  "analysis",
  "analysisResult",
  "aiResult",
  "result",
  "data",
];

const FIELD_KEYS = [
  "title",
  "highlight",
  "characterPhrase",
  "castingTitle",
  "roleName",
  "role",
  "characterName",
  "genre",
  "movieGenre",
  "todayGenre",
  "oneLineComment",
  "line",
  "quote",
  "summary",
  "scenePhrase",
  "scene",
  "memorableScene",
  "sceneDescription",
  "imageUrl",
  "imageURL",
  "posterUrl",
  "posterImageUrl",
  "castingImageUrl",
  "cardImageUrl",
  "imageKey",
  "generatedImageKey",
  "generated_image_key",
];

const hasAnyResultField = (value) =>
  value &&
  typeof value === "object" &&
  FIELD_KEYS.some((key) => value[key] !== undefined && value[key] !== null);

const hasDisplayResult = (value) =>
  value &&
  typeof value === "object" &&
  typeof value.title === "string" &&
  value.title.trim().length > 0;

const isPlaceholderImageUrl = (value) =>
  typeof value === "string" &&
  /\/default-[^/?#]+\.png(?:[?#].*)?$/i.test(value);

const hasGeneratedCastingImage = (value) =>
  Boolean(
    value &&
      typeof value.imageUrl === "string" &&
      value.imageUrl.trim().length > 0 &&
      !isPlaceholderImageUrl(value.imageUrl) &&
      (value.hasGeneratedImageUrl || value.imageKey)
  );

const hasCompleteCastingResult = (value) =>
  hasDisplayResult(value) && hasGeneratedCastingImage(value);

const getRecordIdForLoading = async (routeRecordId) => {
  if (routeRecordId) {
    return routeRecordId;
  }

  const status = await recordsApi.getTodayStatus();
  return getStatusRecordId(status);
};

const findResultSource = (value, depth = 0) => {
  if (!value || typeof value !== "object" || depth > 4) {
    return value;
  }

  if (hasAnyResultField(value)) {
    return value;
  }

  for (const key of RESULT_KEYS) {
    const nested = findResultSource(value[key], depth + 1);

    if (hasAnyResultField(nested)) {
      return nested;
    }
  }

  return value;
};

const normalizeCastingResult = (casting, recordId) => {
  const source = findResultSource(casting) ?? {};
  const textResult =
    typeof source === "string"
      ? source
      : typeof casting === "string"
        ? casting
        : "";

  return {
    recordId:
      pickFirst(source.dailyRecordId, source.recordId, casting?.dailyRecordId, casting?.recordId) ??
      recordId,
    userName: pickFirst(source.userName, source.nickname, source.name),
    title: pickFirst(
      source.title,
      source.roleName,
      source.role,
      source.characterName,
      source.character,
      source.castingTitle
    ),
    highlight: pickFirst(
      source.highlight,
      source.characterPhrase,
      source.character
    ),
    genre: pickFirst(source.genre, source.movieGenre, source.todayGenre),
    role: pickFirst(source.roleName, source.role, source.characterName),
    line: pickFirst(
      source.oneLineComment,
      source.line,
      source.quote,
      source.summary,
      source.description,
      textResult
    ),
    scene: pickFirst(
      source.scenePhrase,
      source.scene,
      source.memorableScene,
      source.sceneDescription,
      source.situation
    ),
    imageUrl: pickFirst(
      source.imageUrl,
      source.imageURL,
      source.image_url,
      source.generatedImageUrl,
      source.generatedImageURL,
      source.generatedImage,
      source.posterUrl,
      source.posterImageUrl,
      source.castingImageUrl,
      source.cardImageUrl
    ),
    imageKey: pickFirst(
      source.imageKey,
      source.image_key,
      source.generatedImageKey,
      source.generated_image_key,
      source.generatedImageId,
      source.generated_image_id,
      typeof source.castingImageId === "string" ? source.castingImageId : null,
      casting?.imageKey,
      casting?.image_key,
      casting?.generatedImageKey,
      casting?.generated_image_key,
      casting?.generatedImageId,
      casting?.generated_image_id,
      typeof casting?.castingImageId === "string" ? casting.castingImageId : null
    ),
    hasGeneratedImageUrl: Boolean(source.hasGeneratedImageUrl ?? casting?.hasGeneratedImageUrl),
    hasResolvedCastingImage: Boolean(
      source.hasResolvedCastingImage ?? casting?.hasResolvedCastingImage
    ),
    isFavorite: Boolean(source.isFavorite),
  };
};

const navigateResult = (
  navigation,
  recordId,
  result = null,
  recordDate = null,
  returnTo = null
) => {
  const params = {
    ...(result ? { result } : {}),
    ...(recordId ? { recordId } : {}),
    ...(recordDate ? { recordDate } : {}),
    ...(returnTo ? { returnTo } : {}),
  };
  const mainNavigation = findNavigationWithRoute(navigation, "Main");

  clearAnalysisLoadingVisible();

  if (mainNavigation) {
    mainNavigation.navigate("Main", {
      screen: "Result",
      params,
    });
    return;
  }

  if (navigation.getState?.().routeNames?.includes("Main")) {
    navigation.navigate("Main", {
      screen: "Result",
      params,
    });
    return;
  }

  if (navigation.getState?.().routeNames?.includes("Result")) {
    navigation.navigate("Result", params);
    return;
  }

  navigateToReturnTarget(navigation, returnTo, "Home");
};

export function AnalysisLoadingView({ navigation, onBack }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { styles, sizes } = createStyles(width, height, insets);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => {
      setActiveDot((current) => (current + 1) % 3);
    }, 420);

    return () => clearInterval(dotTimer);
  }, []);

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
          onPress={onBack ?? (() => navigation.goBack())}
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

export default function AnalysisLoadingScreen({ navigation, route }) {
  const routeRecordId = route?.params?.recordId;
  const routeRecordDate = route?.params?.recordDate;
  const returnTo = useMemo(
    () => normalizeReturnTo(route?.params?.returnTo, "Home"),
    [route?.params?.returnTo]
  );
  const shouldStartGeneration = route?.params?.shouldStartGeneration === true;
  const isTodayRecord = !routeRecordDate || routeRecordDate === getTodayDateKey();

  useEffect(() => {
    setAnalysisLoadingVisible(true, "AnalysisLoadingScreen");

    return () => setAnalysisLoadingVisible(false, "AnalysisLoadingScreen");
  }, []);

  useEffect(() => {
    let active = true;
    let retryTimer = null;
    let attempts = 0;
    let creationStarted = !shouldStartGeneration;
    const maxAttempts = 120;

    const ensureCastingRequested = async (recordId) => {
      if (creationStarted) {
        return;
      }

      creationStarted = true;

      try {
        await analysesApi.createAnalysis(recordId);
      } catch (error) {
        if (![400, 409].includes(error?.response?.status)) {
          console.warn("Failed to request analysis:", error);
        }
      }

      try {
        await castingsApi.createCasting(recordId);
      } catch (error) {
        if (![400, 404, 409].includes(error?.response?.status)) {
          console.warn("Failed to request casting generation:", error);
        }
      }
    };

    const runAnalysis = async () => {
      attempts += 1;
      let recordId = null;

      try {
        if (routeRecordId) {
          recordId = routeRecordId;
        } else {
          const status = await recordsApi.getTodayStatus();
          const statusRecordId = getStatusRecordId(status);

          recordId = statusRecordId;

          if (status?.screen === "RESULT" && recordId) {
            try {
              const casting = await castingsApi.getCastingByRecordId(recordId);
              const result = normalizeCastingResult(casting, recordId);

              if (hasCompleteCastingResult(result)) {
                setTodayResultReady(true, result);
                navigateResult(navigation, recordId, result, routeRecordDate, returnTo);
                return;
              }
            } catch (error) {
              if (![404, 409].includes(error?.response?.status)) {
                console.warn("[AnalysisLoading] RESULT status but casting fetch failed:", error);
              }
            }
          }
        }
      } catch (error) {
        console.warn("[AnalysisLoading] failed to load today status:", error);

        try {
          recordId = await getRecordIdForLoading(routeRecordId);
        } catch (recordIdError) {
          console.warn("[AnalysisLoading] failed to resolve recordId:", recordIdError);
        }

        if (active && attempts < maxAttempts) {
          retryTimer = setTimeout(runAnalysis, 1800);
        }
        return;
      }

      if (!recordId) {
        if (attempts < maxAttempts) {
          retryTimer = setTimeout(runAnalysis, 1800);
        }
        return;
      }

      if (shouldStartGeneration) {
        ensureCastingRequested(recordId);
      }

      try {
        const casting = await castingsApi.getCastingByRecordId(recordId);

        if (!active) {
          return;
        }

        const result = normalizeCastingResult(casting, recordId);

        if (!hasCompleteCastingResult(result)) {
          if (attempts < maxAttempts) {
            retryTimer = setTimeout(runAnalysis, 1800);
            return;
          }

          return;
        }

        if (isTodayRecord) {
          setTodayResultReady(true, result);
        }
        addNotification({
          id: `casting-ready-${recordId}`,
          dedupeKey: `casting-ready-${recordId}`,
          title: "캐스팅 카드 준비됨",
          body: "오늘의 캐스팅 카드가 완성되었어요.",
          time: `${String(new Date().getHours()).padStart(2, "0")}:${String(
            new Date().getMinutes()
          ).padStart(2, "0")}`,
          icon: "movie-open-star-outline",
          unread: true,
          data: { dedupeKey: `casting-ready-${recordId}`, recordId },
        });
        navigateResult(navigation, recordId, result, routeRecordDate, returnTo);
      } catch (error) {
        if (![404, 409].includes(error?.response?.status)) {
          console.warn("[AnalysisLoading] casting poll failed:", {
            attempt: attempts,
            recordId,
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
          });
        }

        if (!active) {
          return;
        }

        if (attempts < maxAttempts) {
          retryTimer = setTimeout(runAnalysis, 1800);
        }
      }
    };

    runAnalysis();

    return () => {
      active = false;
      clearTimeout(retryTimer);
    };
  }, [navigation, routeRecordDate, routeRecordId, shouldStartGeneration, isTodayRecord, returnTo]);

  const goBack = () => {
    clearAnalysisLoadingVisible();
    navigateToReturnTarget(navigation, returnTo, "Home");
  };

  return <AnalysisLoadingView navigation={navigation} onBack={goBack} />;
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
