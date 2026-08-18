import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import {
  getTodayDateKey,
  getTodayRecordState,
  setTodayResultReady,
  setTodayResultLiked,
  subscribeTodayRecordState,
} from "../services/todayRecordState";
import {
  clearAnalysisLoadingVisible,
  setAnalysisLoadingVisible,
} from "../services/navigationUiState";
import {
  navigateToReturnTarget,
  normalizeReturnTo,
} from "../services/flowNavigation";
import castingsApi from "../api/castings-api";
import recordsApi from "../api/records-api";
import { notifyFavoriteChanged, subscribeFavoriteChanges } from "../services/favoriteState";
import { AnalysisLoadingView } from "./AnalysisLoadingScreen";
import { CastingCardFront } from "./CalendarScreen";

const EMPTY_RESULT = {
  userName: "사용자",
  title: "",
  genre: "분석 결과 없음",
  line: "결과를 불러오지 못했어요.",
  scene: "다시 결과 받기를 시도해주세요.",
};

const formatDisplayDate = (dateKey) => dateKey.replaceAll("-", ".");

const formatCardTitle = (value) => {
  if (!value) {
    return EMPTY_RESULT.title;
  }

  const text = String(value).trim();
  return text;
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

const parseJsonText = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

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
  "image_url",
  "generatedImageUrl",
  "generatedImageURL",
  "generatedImage",
  "posterUrl",
  "posterImageUrl",
  "castingImageUrl",
  "cardImageUrl",
  "cardImage",
  "image",
  "imagePath",
  "imageBase64",
  "base64Image",
  "imageData",
];

const hasAnyResultField = (value) =>
  value &&
  typeof value === "object" &&
  FIELD_KEYS.some((key) => value[key] !== undefined && value[key] !== null);

const findResultSource = (value, depth = 0) => {
  if (!value || typeof value !== "object" || depth > 4) {
    return value;
  }

  if (hasAnyResultField(value)) {
    return {
      ...(parseJsonText(value.rawResponse) ?? {}),
      ...value,
    };
  }

  for (const key of RESULT_KEYS) {
    const nested = findResultSource(value[key], depth + 1);

    if (hasAnyResultField(nested)) {
      return nested;
    }
  }

  return value;
};

const normalizeImageUrl = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }

  if (/^[A-Za-z0-9+/=]+$/.test(trimmed) && trimmed.length > 200) {
    return `data:image/png;base64,${trimmed}`;
  }

  if (/^https?:\/\//.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/") && process.env.EXPO_PUBLIC_API_URL) {
    return `${process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")}${trimmed}`;
  }

  return trimmed;
};

const isPlaceholderImageUrl = (value) =>
  typeof value === "string" &&
  /\/default-[^/?#]+\.png(?:[?#].*)?$/i.test(value);

const asImageKey = (value) => (typeof value === "string" ? value : null);

const hasResolvedResult = (result) =>
  Boolean(
    result &&
      result.title &&
      result.title !== EMPTY_RESULT.title
  );

const hasUsableImage = (result) =>
  Boolean(
    result &&
      typeof result.imageUrl === "string" &&
      result.imageUrl.trim().length > 0 &&
      !isPlaceholderImageUrl(result.imageUrl)
  );

const hasGeneratedCastingImage = (result) =>
  Boolean(
    result &&
      hasUsableImage(result) &&
      (result.hasGeneratedImageUrl || result.imageKey)
  );

const hasCompleteCastingResult = (result) =>
  hasResolvedResult(result) && hasGeneratedCastingImage(result);

const normalizeCastingImageUrl = (casting, fallbackImageUrl) =>
  normalizeImageUrl(
    pickFirst(
      casting?.imageUrl,
      casting?.imageURL,
      casting?.image_url,
      casting?.generatedImageUrl,
      casting?.generatedImageURL,
      casting?.castingImageUrl,
      casting?.cardImageUrl,
      fallbackImageUrl
    )
  );

const normalizeCastingImageKey = (casting, fallbackImageKey) =>
  pickFirst(
    casting?.imageKey,
    casting?.image_key,
    casting?.generatedImageKey,
    casting?.generated_image_key,
    casting?.generatedImageId,
    casting?.generated_image_id,
    asImageKey(casting?.castingImageId),
    fallbackImageKey
  );

const applyCastingResult = (
  casting,
  recordId,
  setServerResult,
  shouldPersistTodayResult = true
) => {
  const normalized = normalizeResult(casting);
  const imageUrl = normalizeCastingImageUrl(casting, normalized.imageUrl);
  const imageKey = normalizeCastingImageKey(casting, normalized.imageKey);
  const result = {
    ...normalized,
    imageUrl,
    imageKey,
    hasGeneratedImageUrl: Boolean(
      casting?.hasGeneratedImageUrl ?? normalized.hasGeneratedImageUrl
    ),
    hasResolvedCastingImage: Boolean(
      casting?.hasResolvedCastingImage ?? normalized.hasResolvedCastingImage
    ),
    recordId,
  };

  setServerResult(result);

  if (shouldPersistTodayResult && hasCompleteCastingResult(result)) {
    setTodayResultReady(true, result);
  }

  return result;
};

const normalizeResult = (value) => {
  const source = findResultSource(value) ?? {};
  const rawSource = parseJsonText(source.rawResponse) ?? {};
  const mergedSource = {
    ...rawSource,
    ...source,
  };
  const textResult =
    typeof mergedSource === "string"
      ? mergedSource
      : typeof value === "string"
        ? value
        : "";
  const imageUrl = normalizeImageUrl(
    pickFirst(
      mergedSource.imageUrl,
      mergedSource.imageURL,
      mergedSource.image_url,
      mergedSource.generatedImageUrl,
      mergedSource.generatedImageURL,
      mergedSource.generatedImage,
      mergedSource.posterUrl,
      mergedSource.posterImageUrl,
      mergedSource.castingImageUrl,
      mergedSource.cardImageUrl,
      mergedSource.cardImage,
      mergedSource.image,
      mergedSource.imagePath,
      mergedSource.imageBase64,
      mergedSource.base64Image,
      mergedSource.imageData
    )
  );

  return {
    recordId:
      mergedSource.recordId ??
      mergedSource.dailyRecordId ??
      value?.recordId ??
      value?.dailyRecordId,
    dailyRecordId: mergedSource.dailyRecordId ?? value?.dailyRecordId,
    userName:
      pickFirst(mergedSource.userName, mergedSource.nickname, mergedSource.name) ??
      EMPTY_RESULT.userName,
    title: formatCardTitle(
      pickFirst(
        mergedSource.title,
        mergedSource.roleName,
        mergedSource.role,
        mergedSource.characterName,
        mergedSource.character,
        mergedSource.castingTitle
      )
    ),
    genre:
      pickFirst(mergedSource.genre, mergedSource.movieGenre, mergedSource.todayGenre) ??
      EMPTY_RESULT.genre,
    line:
      pickFirst(
        mergedSource.line,
        mergedSource.oneLineComment,
        mergedSource.quote,
        mergedSource.summary,
        mergedSource.description,
        textResult
      ) ??
      EMPTY_RESULT.line,
    scene:
      pickFirst(
        mergedSource.scene,
        mergedSource.scenePhrase,
        mergedSource.memorableScene,
        mergedSource.sceneDescription,
        mergedSource.situation
      ) ?? EMPTY_RESULT.scene,
    imageUrl,
    imageKey: pickFirst(
      mergedSource.imageKey,
      mergedSource.image_key,
      mergedSource.generatedImageKey,
      mergedSource.generated_image_key,
      mergedSource.generatedImageId,
      mergedSource.generated_image_id,
      asImageKey(mergedSource.castingImageId)
    ),
    hasGeneratedImageUrl: Boolean(mergedSource.hasGeneratedImageUrl),
    hasResolvedCastingImage: Boolean(mergedSource.hasResolvedCastingImage),
    isFavorite: mergedSource.isFavorite,
  };
};

export default function ResultScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { styles, sizes } = createStyles(width, height, insets);
  const [todayState, setTodayState] = useState(() => getTodayRecordState());
  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const [serverResult, setServerResult] = useState(null);
  const [statusRecordId, setStatusRecordId] = useState(null);
  const routeRecordDate = route?.params?.recordDate;
  const returnTo = useMemo(
    () => normalizeReturnTo(route?.params?.returnTo, "Home"),
    [route?.params?.returnTo]
  );
  const resultDateKey = routeRecordDate || todayState.resultDate || getTodayDateKey();
  const isTodayResult = resultDateKey === getTodayDateKey();
  const result = useMemo(() => {
    const storedOrRouteResult =
      serverResult ?? route?.params?.result ?? todayState.resultData;

    return {
      ...normalizeResult(storedOrRouteResult),
      date: formatDisplayDate(resultDateKey),
    };
  }, [route?.params?.result, resultDateKey, serverResult, todayState.resultData]);
  const currentRecordId =
    route?.params?.recordId ??
    route?.params?.dailyRecordId ??
    route?.params?.result?.recordId ??
    route?.params?.result?.dailyRecordId ??
    result.recordId ??
    result.dailyRecordId ??
    todayState.resultData?.recordId ??
    statusRecordId;
  useEffect(() => subscribeTodayRecordState(setTodayState), []);
  useEffect(
    () =>
      subscribeFavoriteChanges(({ recordId, isFavorite }) => {
        if (
          String(recordId) !== String(currentRecordId) ||
          typeof isFavorite !== "boolean"
        ) {
          return;
        }

        setServerResult((current) =>
          current ? { ...current, isFavorite } : current
        );
        setTodayResultLiked(isFavorite);
      }),
    [currentRecordId]
  );

  useEffect(() => {
    const loadingVisible = isFocused && !hasCompleteCastingResult(result);

    setAnalysisLoadingVisible(loadingVisible, "ResultScreen");

    return () => {
      setAnalysisLoadingVisible(false, "ResultScreen");
    };
  }, [isFocused, result]);

  useEffect(() => {
    if (hasCompleteCastingResult(result) || currentRecordId) {
      return;
    }

    let active = true;

    const resolveTodayStatus = async () => {
      try {
        const status = await recordsApi.getTodayStatus();

        if (!active) {
          return;
        }

        const recordId = getStatusRecordId(status);

        if (recordId) {
          setStatusRecordId(recordId);

          try {
            const casting = await castingsApi.getCastingByRecordId(recordId);

            if (!active) {
              return;
            }

            const resolved = applyCastingResult(
              casting,
              recordId,
              setServerResult,
              isTodayResult
            );

            if (hasCompleteCastingResult(resolved)) {
              return;
            }
          } catch (castingError) {
            console.warn("[ResultScreen] casting fetch from status failed:", {
              screen: status?.screen,
              recordId,
              statusCode: castingError?.response?.status,
              data: castingError?.response?.data,
              message: castingError?.message,
            });
          }
        }

        if (status?.screen === "WAITING") {
          const rootNavigation = findNavigationWithRoute(navigation, "AnalysisLoading");

          if (rootNavigation) {
            rootNavigation.navigate("AnalysisLoading", { recordId, returnTo });
          } else if (typeof navigation.replace === "function") {
            navigation.replace("AnalysisLoading", { recordId, returnTo });
          } else {
            navigation.navigate("AnalysisLoading", { recordId, returnTo });
          }
          return;
        }

      } catch (error) {
        console.warn("[ResultScreen] failed to resolve today status:", {
          statusCode: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
        });
      }
    };

    resolveTodayStatus();

    return () => {
      active = false;
    };
  }, [currentRecordId, isTodayResult, navigation, result, returnTo]);

  useEffect(() => {
    if (!currentRecordId) {
      return;
    }

    let active = true;
    let retryTimer = null;
    let attempts = 0;
    const maxAttempts = 20;

    const loadCasting = async () => {
      attempts += 1;

      try {
        const casting = await castingsApi.getCastingByRecordId(currentRecordId);

        if (!active) {
          return;
        }

        const normalized = applyCastingResult(
          casting,
          currentRecordId,
          setServerResult,
          isTodayResult
        );

        if (hasCompleteCastingResult(normalized)) {
          return;
        }

        if (attempts < maxAttempts) {
          retryTimer = setTimeout(loadCasting, 1800);
        }
      } catch (error) {
        if (![404, 409].includes(error?.response?.status)) {
          console.warn("[ResultScreen] casting poll failed:", {
            attempt: attempts,
            recordId: currentRecordId,
            statusCode: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
          });
        }

        if (active && attempts < maxAttempts) {
          retryTimer = setTimeout(loadCasting, 1800);
        }
      }
    };

    loadCasting();

    return () => {
      active = false;
      clearTimeout(retryTimer);
    };
  }, [currentRecordId, isTodayResult]);

  const resultLiked = todayState.resultLiked || Boolean(result.isFavorite);

  const toggleFavorite = async () => {
    if (!currentRecordId || favoriteSaving) {
      return;
    }

    const optimisticLiked = !resultLiked;

    setFavoriteSaving(true);
    setTodayResultLiked(optimisticLiked);

    try {
      const updatedCasting = await castingsApi.toggleFavorite(currentRecordId);
      const updatedLiked =
        typeof updatedCasting?.isFavorite === "boolean"
          ? updatedCasting.isFavorite
          : optimisticLiked;

      setTodayResultLiked(updatedLiked);
      if (isTodayResult) {
        setTodayResultReady(true, {
          ...result,
          recordId: currentRecordId,
          isFavorite: updatedLiked,
        });
      }
      notifyFavoriteChanged({
        recordId: currentRecordId,
        dateKey: resultDateKey,
        isFavorite: updatedLiked,
      });
    } catch (error) {
      setTodayResultLiked(resultLiked);
      Alert.alert(
        "찜 저장 실패",
        error?.response?.data?.message ?? "잠시 후 다시 시도해주세요."
      );
    } finally {
      setFavoriteSaving(false);
    }
  };

  const goBackToReturnTarget = () => {
    navigateToReturnTarget(navigation, returnTo, "Home");
  };

  const downloadCard = () => {
    Alert.alert("다운로드", "결과 카드 다운로드 기능을 준비 중입니다.");
  };
  const rows = [
    { icon: "movie-open-outline", label: "오늘의 장르", text: result.genre },
    { icon: "pencil-outline", label: "오늘의 한줄 기록", text: result.line },
    { icon: "image-outline", label: "기억에 남은 장면", text: result.scene },
  ];
  const cardRecord = {
    ...result,
    title: result.title,
    imageUrl:
      typeof result.imageUrl === "string" && result.imageUrl.trim().length > 0
        ? result.imageUrl
        : "",
  };

  if (!hasCompleteCastingResult(result)) {
    return (
      <AnalysisLoadingView
        navigation={navigation}
        onBack={() => {
          clearAnalysisLoadingVisible();
          navigateToReturnTarget(navigation, returnTo, "Home");
        }}
      />
    );
  }

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
              onPress={goBackToReturnTarget}
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
            <View style={styles.cardInner}>
              <CastingCardFront
                date={result.date}
                record={cardRecord}
                eyebrow="TODAY’S CASTING"
                rows={rows}
                isFavorite={resultLiked}
                onToggleFavorite={toggleFavorite}
                onFlip={() => {}}
                showFlipButton={false}
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

const createStyles = (screenWidth, screenHeight, insets) => {
  const scale = Math.min(Math.max(screenWidth / 393, 0.82), 1.13);
  const ms = (value) => value * scale;
  const pagePadding = ms(28);
  const topPadding = Math.max(insets.top, ms(16)) + ms(18);
  const baseCardWidth = ms(284);
  const baseCardHeight = ms(484);
  const resultCardScale = Math.min(
    (screenWidth - pagePadding * 2) / baseCardWidth,
    (screenHeight * 0.62) / baseCardHeight,
    1.32
  );
  const cardWidth = baseCardWidth * resultCardScale;
  const cardHeight = baseCardHeight * resultCardScale;

  return {
    sizes: {
      backIcon: ms(30),
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
        paddingBottom: Math.max(insets.bottom, ms(18)) + ms(140),
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
        marginLeft: ms(16),
        color: "#E7C779",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(22),
        lineHeight: ms(31),
      },
      messageBlock: {
        marginTop: ms(16),
        alignItems: "center",
      },
      messageTitle: {
        color: "#FFE3A9",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(15),
        lineHeight: ms(24),
        textAlign: "center",
      },
      messageSub: {
        marginTop: ms(4),
        color: "#F08C4B",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(13),
        lineHeight: ms(20),
        textAlign: "center",
      },
      card: {
        width: cardWidth,
        height: cardHeight,
        marginTop: ms(24),
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      },
      cardInner: {
        width: baseCardWidth,
        height: baseCardHeight,
        transform: [{ scale: resultCardScale }],
      },
      downloadButton: {
        width: cardWidth,
        height: ms(56),
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
        marginHorizontal: ms(14),
        color: "#FFE1AD",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(16),
        lineHeight: ms(24),
      },
      downloadSparkle: {
        color: "#FFB36B",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(17),
      },
    }),
  };
};
