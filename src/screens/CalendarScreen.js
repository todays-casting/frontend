import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, {
  ClipPath,
  Defs,
  Image as SvgImage,
  Path,
  Rect,
} from "react-native-svg";
import calendarApi from "../api/calendar-api";
import castingsApi from "../api/castings-api";
import recordsApi from "../api/records-api";
import { useUser } from "../contexts/UserContext";
import { notifyFavoriteChanged, subscribeFavoriteChanges } from "../services/favoriteState";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = Math.min(Math.max(SCREEN_WIDTH / 393, 0.82), 1.15);
const ms = (value) => value * scale;
const vs = ms;
const QUOTE_BACKGROUND = require("../../assets/images/calendar-quote-background-v2.jpg");
const CALENDAR_CARD_PATH =
  "M31 1 H373 C383 1 390 8 390 18 C399 19 404 26 404 36 V555 C404 565 398 571 388 571 C388 579 381 583 372 583 H32 C23 583 16 579 16 571 C6 571 0 565 0 555 V36 C0 26 6 20 14 18 C14 8 21 1 31 1 Z";
const CASTING_CARD_PATH =
  "M31 1 H174 C179 14 188 21 202 21 C216 21 225 14 230 1 H373 C383 1 390 8 390 18 C399 19 404 26 404 36 V555 C404 565 398 571 388 571 C388 579 381 583 372 583 H32 C23 583 16 579 16 571 C6 571 0 565 0 555 V36 C0 26 6 20 14 18 C14 8 21 1 31 1 Z";
const CASTING_CARD_BACKGROUND = require("../../assets/images/casting-card-sunset-background-v2.jpg");
const EMPTY_PAST_DAY_QUOTE = "아직 이 날의 장면은 비어 있어요.";
const EMPTY_FUTURE_DAY_QUOTE = "다가올 캐스팅을 기다려주세요.";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const getUserTodayKey = () => toDateKey(new Date());

const isFutureDateKey = (dateKey) => dateKey > getUserTodayKey();

const formatFullDate = (date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;

const isPlaceholderImageUrl = (value) =>
  typeof value === "string" &&
  /\/default-[^/?#]+\.png(?:[?#].*)?$/i.test(value);

const hasCompleteCastingImage = (casting) =>
  Boolean(
    casting &&
      typeof casting.imageUrl === "string" &&
      casting.imageUrl.trim().length > 0 &&
      !isPlaceholderImageUrl(casting.imageUrl) &&
      (casting.hasGeneratedImage || casting.hasGeneratedImageUrl || casting.imageKey)
  );

const createCalendarDays = (year, month, today) => {
  const firstDay = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index
    );

    return {
      date,
      key: toDateKey(date),
      day: date.getDate(),
      muted: date.getMonth() !== month,
      accent: date.getDay() === 0,
      isToday: toDateKey(date) === toDateKey(today),
    };
  });
};

const RECORD = {
  date: "2025.05.21",
  title: "첫사랑\n여주인공",
  genre: "로맨스 드라마",
  role: "첫사랑 여주인공",
  scene: "노을이 지는 창가에서\n서로의 마음을 확인하고 미소를 보낸 순간",
  line: "작은 응원이 누군가의 하루를\n바꿀 수 있다는 걸 기억하자.",
  diary:
    "오늘은 작은 말 한마디가 오래 마음에 남은 하루였다. 창밖으로 번지는 노을을 보면서 나도 누군가에게 다정한 장면으로 기억되고 싶다고 생각했다. 서두르지 않아도 괜찮고, 오늘의 마음을 있는 그대로 적어두는 것만으로도 충분히 나다운 기록이 된다. 오늘은 작은 말 한마디가 오래 마음에 남은 하루였다. 창밖으로 번지는 노을을 보면서 나도 누군가에게 다정한 장면으로 기억되고 싶다고 생각했다. 서두르지 않아도 괜찮고, 오늘의 마음을 있는 그대로 적어두는 것만으로도 충분히 나다운 기록이 된다.",
    
};

export default function CalendarScreen({ navigation }) {
  const { nickname } = useUser();
  const insets = useSafeAreaInsets();
  const today = useMemo(() => new Date(), []);
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.getFullYear());
  const [pickerMonth, setPickerMonth] = useState(today.getMonth());
  const [activeDate, setActiveDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isBack, setIsBack] = useState(false);
  const [monthlyMarkers, setMonthlyMarkers] = useState([]);
  const [calendarError, setCalendarError] = useState("");
  const [recordError, setRecordError] = useState("");
  const [futureDateModalVisible, setFutureDateModalVisible] = useState(false);
  const [activeDateOneLineComment, setActiveDateOneLineComment] = useState("");
  const [activeDateImageUrl, setActiveDateImageUrl] = useState("");
  const [recordLoading, setRecordLoading] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedCasting, setSelectedCasting] = useState(null);
  const [favoriteDates, setFavoriteDates] = useState(() => new Set());
  const flip = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(vs(560))).current;
  const yearScrollRef = useRef(null);

  const calendarDays = useMemo(
    () =>
      createCalendarDays(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth(),
        today
      ),
    [today, visibleMonth]
  );
  const yearMonth = `${visibleMonth.getFullYear()}-${String(
    visibleMonth.getMonth() + 1
  ).padStart(2, "0")}`;
  const recordDates = useMemo(
    () =>
      new Set(
        monthlyMarkers
          .filter((marker) => marker.hasRecord)
          .map((marker) => marker.recordDate)
      ),
    [monthlyMarkers]
  );
  const monthLabel = `${visibleMonth.getFullYear()}년 ${visibleMonth.getMonth() + 1}월`;
  const pickerYears = useMemo(
    () =>
      Array.from(
        { length: today.getFullYear() - 1900 + 1 },
        (_, index) => 1900 + index
      ),
    [today]
  );
  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : null;
  const activeDateKey = toDateKey(activeDate);
  const activeDateHasRecord = recordDates.has(activeDateKey);
  const emptyDayQuote = isFutureDateKey(activeDateKey)
    ? EMPTY_FUTURE_DAY_QUOTE
    : EMPTY_PAST_DAY_QUOTE;
  const quoteImageSource =
    activeDateHasRecord && activeDateImageUrl
      ? { uri: activeDateImageUrl }
      : QUOTE_BACKGROUND;
  const markedDateKey =
    visibleMonth.getFullYear() === activeDate.getFullYear() &&
    visibleMonth.getMonth() === activeDate.getMonth()
      ? activeDateKey
      : null;
  const selectedCardRecord = selectedCasting
    ? {
        title:
          selectedCasting.roleName ||
          selectedCasting.characterName ||
          selectedCasting.role ||
          selectedCasting.castingTitle,
        genre: selectedCasting.genre,
        role: selectedCasting.roleName,
        scene: selectedCasting.scenePhrase,
        line: selectedCasting.oneLineComment,
        imageUrl: selectedCasting.imageUrl,
      }
    : RECORD;
  const calendarReturnTo = useMemo(() => ({ screen: "Calendar" }), []);

  const loadMonthlyMarkers = useCallback(async (isActive = () => true) => {
    try {
      setCalendarError("");
      const markers = await calendarApi.getMonthlyMarkers(yearMonth);

      if (!isActive()) {
        return;
      }

      setMonthlyMarkers(markers);
      setFavoriteDates(
        new Set(
          markers
            .filter((marker) => marker.hasRecord && marker.isFavorite)
            .map((marker) => marker.recordDate)
        )
      );
    } catch (error) {
      if (!isActive()) {
        return;
      }

      setMonthlyMarkers([]);
      setFavoriteDates(new Set());
      setCalendarError(
        error.response?.data?.message ?? "달력 기록을 불러오지 못했습니다."
      );
    }
  }, [yearMonth]);

  useEffect(() => {
    let active = true;

    loadMonthlyMarkers(() => active);
    const unsubscribeFocus = navigation?.addListener?.("focus", () => {
      loadMonthlyMarkers(() => active);
    });

    return () => {
      active = false;
      unsubscribeFocus?.();
    };
  }, [loadMonthlyMarkers, navigation]);

  useEffect(() => {
    let active = true;

    const loadActiveDateComment = async () => {
      if (!activeDateHasRecord) {
        setActiveDateOneLineComment("");
        setActiveDateImageUrl("");
        return;
      }

      try {
        const record = await recordsApi.getRecordByDate(activeDateKey);

        if (!record?.id || record.status !== "COMPLETED") {
          if (active) {
            setActiveDateOneLineComment("");
            setActiveDateImageUrl("");
          }
          return;
        }

        const casting = await castingsApi.getCastingByRecordId(record.id);

        if (active) {
          setActiveDateOneLineComment(casting?.oneLineComment ?? "");
          setActiveDateImageUrl(hasCompleteCastingImage(casting) ? casting.imageUrl : "");
        }
      } catch {
        if (active) {
          setActiveDateOneLineComment("");
          setActiveDateImageUrl("");
        }
      }
    };

    loadActiveDateComment();

    return () => {
      active = false;
    };
  }, [activeDateHasRecord, activeDateKey]);

  useEffect(
    () =>
      subscribeFavoriteChanges(({ recordId, dateKey, isFavorite }) => {
        if (!dateKey || typeof isFavorite !== "boolean") {
          return;
        }

        setFavoriteDates((current) => {
          const next = new Set(current);

          if (isFavorite) {
            next.add(dateKey);
          } else {
            next.delete(dateKey);
          }

          return next;
        });
        setMonthlyMarkers((current) =>
          current.map((marker) =>
            marker.recordDate === dateKey ? { ...marker, isFavorite } : marker
          )
        );
        setSelectedCasting((current) => {
          const currentRecordId = current?.dailyRecordId ?? selectedRecord?.id;

          return String(currentRecordId) === String(recordId)
            ? { ...current, isFavorite }
            : current;
        });
      }),
    [selectedRecord?.id]
  );

  const frontRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const openRecord = async (day) => {
    if (day.muted) {
      return;
    }

    let recordIdForLoading = null;

    setActiveDate(day.date);
    setIsBack(false);
    flip.setValue(0);
    setRecordError("");

    if (!recordDates.has(day.key ?? toDateKey(day.date))) {
      setSelectedDate(null);
      setSelectedRecord(null);
      setSelectedCasting(null);
      return;
    }

    try {
      setRecordLoading(true);
      const record = await recordsApi.getRecordByDate(day.key);

      if (!record) {
        setRecordError("해당 날짜의 기록이 없습니다.");
        return;
      }

      if (record.status !== "COMPLETED") {
        setRecordError("작성 완료된 기록만 캐스팅 카드를 볼 수 있습니다.");
        return;
      }

      recordIdForLoading = record.id;
      const casting = await castingsApi.getCastingByRecordId(record.id);

      if (!hasCompleteCastingImage(casting)) {
        const rootNavigation = navigation?.getParent?.();
        const loadingParams = {
          recordId: record.id,
          recordDate: day.key,
          returnTo: calendarReturnTo,
        };

        if (rootNavigation) {
          rootNavigation.navigate("AnalysisLoading", loadingParams);
        } else {
          navigation?.navigate?.("AnalysisLoading", loadingParams);
        }
        return;
      }

      setSelectedRecord(record);
      setSelectedCasting(casting);
      setFavoriteDates((current) => {
        const next = new Set(current);

        if (casting.isFavorite) {
          next.add(day.key);
        } else {
          next.delete(day.key);
        }

        return next;
      });
      sheetTranslateY.setValue(vs(560));
      setSelectedDate(day.date);
      requestAnimationFrame(() => {
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }).start();
      });
    } catch (error) {
      if ([404, 409].includes(error?.response?.status)) {
        const rootNavigation = navigation?.getParent?.();
        const loadingParams = {
          recordId: recordIdForLoading,
          recordDate: day.key,
          returnTo: calendarReturnTo,
        };

        if (loadingParams.recordId) {
          if (rootNavigation) {
            rootNavigation.navigate("AnalysisLoading", loadingParams);
          } else {
            navigation?.navigate?.("AnalysisLoading", loadingParams);
          }
          return;
        }
      }

      setRecordError(
        error.response?.data?.message ?? "선택한 날짜의 카드를 불러오지 못했습니다."
      );
    } finally {
      setRecordLoading(false);
    }
  };

  const closeRecord = () => {
    if (selectedDate === null) {
      setIsBack(false);
      flip.setValue(0);
      return;
    }

    Animated.timing(sheetTranslateY, {
      toValue: vs(560),
      duration: 220,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setSelectedDate(null);
        setSelectedRecord(null);
        setSelectedCasting(null);
        setIsBack(false);
        flip.setValue(0);
      }
    });
  };

  const toggleCardSide = () => {
    const next = !isBack;
    setIsBack(next);
    Animated.spring(flip, {
      toValue: next ? 1 : 0,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  const isSelectedFavorite =
    selectedDateKey !== null && favoriteDates.has(selectedDateKey);

  const changeMonth = (offset) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)
    );
    closeRecord();
  };

  const goToToday = () => {
    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setActiveDate(today);
    setSelectedDate(null);
    setIsMonthPickerOpen(false);
  };

  const toggleMonthPicker = () => {
    if (!isMonthPickerOpen) {
      setPickerYear(today.getFullYear());
      setPickerMonth(today.getMonth());
    }

    setIsMonthPickerOpen((current) => !current);
  };

  const applyPickedMonth = () => {
    setVisibleMonth(new Date(pickerYear, pickerMonth, 1));
    closeRecord();
    setIsMonthPickerOpen(false);
  };

  const goToRecordInput = async () => {
    const dateKey = activeDateKey;

    if (isFutureDateKey(dateKey)) {
      setRecordError("");
      setFutureDateModalVisible(true);
      return;
    }

    if (!recordDates.has(dateKey)) {
      navigation?.navigate?.("DailyRecord", {
        recordDate: dateKey,
        returnTo: calendarReturnTo,
      });
      return;
    }

    try {
      setRecordLoading(true);
      setRecordError("");
      const record = await recordsApi.getRecordByDate(dateKey);

      if (!record?.id || record.status !== "COMPLETED") {
        navigation?.navigate?.("DailyRecord", {
          recordDate: dateKey,
          returnTo: calendarReturnTo,
        });
        return;
      }

      let casting = null;

      try {
        casting = await castingsApi.getCastingByRecordId(record.id);
      } catch (error) {
        const statusCode = error?.response?.status;

        if ([400, 404, 409].includes(statusCode)) {
          const rootNavigation = navigation?.getParent?.();
          const loadingParams = {
            recordId: record.id,
            recordDate: dateKey,
            returnTo: calendarReturnTo,
            shouldStartGeneration: true,
          };

          if (rootNavigation) {
            rootNavigation.navigate("AnalysisLoading", loadingParams);
          } else {
            navigation?.navigate?.("AnalysisLoading", loadingParams);
          }
          return;
        }

        throw error;
      }

      const params = {
        recordId: record.id,
        recordDate: dateKey,
        returnTo: calendarReturnTo,
        result: {
          ...casting,
          recordId: record.id,
          recordDate: dateKey,
        },
      };
      const rootNavigation = navigation?.getParent?.();

      if (rootNavigation) {
        rootNavigation.navigate("Main", {
          screen: "Result",
          params,
        });
      } else {
        navigation?.navigate?.("Result", params);
      }
    } catch (error) {
      setRecordError(
        error.response?.data?.message ?? "선택한 날짜의 결과를 불러오지 못했습니다."
      );
    } finally {
      setRecordLoading(false);
    }
  };

  const toggleFavorite = async () => {
    const recordId = selectedRecord?.id ?? selectedCasting?.dailyRecordId;

    if (selectedDateKey === null || !recordId || favoriteLoading) {
      return;
    }

    try {
      setFavoriteLoading(true);
      setRecordError("");
      const updatedCasting = await castingsApi.toggleFavorite(recordId);

      if (typeof updatedCasting?.isFavorite !== "boolean") {
        throw new Error("즐겨찾기 응답을 확인할 수 없습니다.");
      }

      setSelectedCasting(updatedCasting);
      setFavoriteDates((current) => {
        const next = new Set(current);

        if (updatedCasting.isFavorite) {
          next.add(selectedDateKey);
        } else {
          next.delete(selectedDateKey);
        }

        return next;
      });
      notifyFavoriteChanged({
        recordId,
        dateKey: selectedDateKey,
        isFavorite: updatedCasting.isFavorite,
      });
    } catch (error) {
      setRecordError(
        error.response?.data?.message ??
          error.message ??
          "즐겨찾기 변경에 실패했습니다."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/login_background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View pointerEvents="none" style={styles.backgroundDim} />

      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: Math.max(ms(16) - insets.top, 0) + ms(20),
            },
          ]}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>
                {nickname ? `안녕하세요, ${nickname}님 👋` : "안녕하세요 👋"}
              </Text>
              <Text
                style={styles.subGreeting}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                하루를 기록하고, 나의 이야기를 쌓아보세요
              </Text>
            </View>

          </View>

          <Text style={styles.screenTitle}>나의 기록 달력</Text>

            <View style={styles.calendarCard}>
              <Svg
                pointerEvents="none"
                width="100%"
                height="100%"
                viewBox="0 0 404 584"
                preserveAspectRatio="none"
                style={styles.calendarFrame}
              >
                <Path
                  d={CALENDAR_CARD_PATH}
                  fill="rgba(31, 13, 52, 0.87)"
                  stroke="rgba(225, 78, 105, 0.72)"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
              </Svg>
              <View style={styles.calendarHeader}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={ms(26)} color="#E0B487" />
              </TouchableOpacity>
              <Text style={styles.monthText}>{monthLabel}</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={ms(26)} color="#E0B487" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.75}
                style={styles.smallCalendar}
                onPress={toggleMonthPicker}
              >
                <Ionicons name="calendar-outline" size={ms(21)} color="#FFD09A" />
              </TouchableOpacity>
            </View>

            {isMonthPickerOpen && (
              <View style={styles.monthPicker}>
                <Text style={styles.pickerLabel}>연도</Text>
                <ScrollView
                  ref={yearScrollRef}
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.yearOptions}
                  onContentSizeChange={() =>
                    yearScrollRef.current?.scrollToEnd({ animated: false })
                  }
                >
                  {pickerYears.map((year) => (
                    <TouchableOpacity
                      key={year}
                      activeOpacity={0.75}
                      style={[
                        styles.pickerOption,
                        pickerYear === year && styles.pickerOptionSelected,
                      ]}
                      onPress={() => setPickerYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          pickerYear === year && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {year}년
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.pickerLabel}>월</Text>
                <View style={styles.monthOptions}>
                  {Array.from({ length: 12 }, (_, month) => (
                    <TouchableOpacity
                      key={month}
                      activeOpacity={0.75}
                      style={[
                        styles.monthOption,
                        pickerMonth === month && styles.pickerOptionSelected,
                      ]}
                      onPress={() => setPickerMonth(month)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          pickerMonth === month && styles.pickerOptionTextSelected,
                        ]}
                      >
                        {month + 1}월
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.pickerActions}>
                  <TouchableOpacity activeOpacity={0.75} onPress={goToToday}>
                    <Text style={styles.todayPickerText}>오늘</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.applyPickerButton}
                    onPress={applyPickedMonth}
                  >
                    <Text style={styles.applyPickerText}>선택</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.weekRow}>
              {DAYS.map((day) => (
                <Text key={day} style={styles.weekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.monthDivider} />

            {calendarError ? (
              <Text selectable style={styles.calendarError}>{calendarError}</Text>
            ) : null}
            {recordLoading ? (
              <Text style={styles.calendarError}>카드를 불러오는 중...</Text>
            ) : null}
            {recordError ? (
              <Text selectable style={styles.calendarError}>{recordError}</Text>
            ) : null}

            <View style={styles.daysGrid}>
              {calendarDays.map((date) => (
                <TouchableOpacity
                  key={date.key}
                  activeOpacity={0.75}
                  style={styles.dayCell}
                  onPress={() => openRecord(date)}
                >
                  <View
                    style={
                      date.key === markedDateKey && !date.muted
                        ? styles.selectedDate
                        : null
                    }
                  >
                    <Text
                      style={[
                        styles.dayText,
                        date.muted && styles.mutedDay,
                        date.accent && !date.muted && styles.accentDay,
                        date.key === markedDateKey &&
                          !date.muted &&
                          styles.selectedDayText,
                      ]}
                    >
                      {date.day}
                    </Text>
                  </View>
                  {favoriteDates.has(date.key) && !date.muted && (
                    <Ionicons
                      name="heart"
                      size={ms(8)}
                      color="#FF514F"
                      style={styles.calendarHeart}
                    />
                  )}
                  {recordDates.has(date.key) &&
                    !favoriteDates.has(date.key) &&
                    !date.muted && (
                    <View style={styles.dayDot} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

            <View style={styles.quoteCard}>
              <Image
                source={quoteImageSource}
                style={styles.quoteImage}
                resizeMode="cover"
              />
              <View style={styles.quoteScrim} />
              <View style={styles.quoteDate}>
              <Text style={styles.quoteDateText}>
                {activeDate.getMonth() + 1}.{activeDate.getDate()}
              </Text>
              <Text style={styles.quoteWeekText}>
                {DAYS[activeDate.getDay()]}요일
              </Text>
            </View>
            <View style={styles.quoteDivider} />
            <Text style={styles.quoteText}>
              {activeDateHasRecord && activeDateOneLineComment
                ? `“${activeDateOneLineComment}”`
                : emptyDayQuote}
            </Text>
            </View>

          <View style={styles.recordCard}>
            <Image
              source={require("../../assets/images/inputbox_background.png")}
              style={styles.recordImage}
              resizeMode="cover"
            />
            <View style={styles.recordInfo}>
              <Text style={styles.recordEyebrow}>✦ 오늘의 기록</Text>
              <Text style={styles.recordQuestion}>
                오늘은 어떤 영화 같은 하루였나요?
              </Text>
              <Text style={styles.recordHelp}>
                나의 감정과 순간을 기록해보세요
              </Text>
              <TouchableOpacity
                activeOpacity={0.88}
                style={styles.recordButton}
                onPress={goToRecordInput}
              >
                <Text style={styles.recordButtonText}>
                  오늘의 기록 보기 / 작성하기
                </Text>
                <Ionicons name="chevron-forward" size={ms(18)} color="#FFD09A" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={selectedDate !== null} transparent animationType="none">
        <View style={styles.modalLayer}>
          <TouchableOpacity style={styles.dimmedArea} onPress={closeRecord} />

          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: sheetTranslateY }] },
            ]}
          >
            <View style={styles.sheetHandle} />
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.closeButton}
              onPress={closeRecord}
            >
              <Ionicons name="close" size={ms(29)} color="#F2D7E8" />
            </TouchableOpacity>

            <View style={styles.flipWrap}>
              <Animated.View
                pointerEvents={isBack ? "none" : "auto"}
                style={[
                  styles.castingCard,
                  styles.frontCard,
                  { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
                ]}
              >
                <CastingCardFront
                  date={selectedDate ? formatFullDate(selectedDate) : ""}
                  record={selectedCardRecord}
                  isFavorite={isSelectedFavorite}
                  onToggleFavorite={toggleFavorite}
                  onFlip={toggleCardSide}
                />
              </Animated.View>

              <Animated.View
                pointerEvents={isBack ? "auto" : "none"}
                style={[
                  styles.castingCard,
                  styles.backCard,
                  { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
                ]}
              >
                <CastingCardBack
                  date={selectedDate ? formatFullDate(selectedDate) : ""}
                  diary={selectedRecord?.content ?? ""}
                  onFlip={toggleCardSide}
                />
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </Modal>
      <Modal
        visible={futureDateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFutureDateModalVisible(false)}
      >
        <View style={styles.futureModalOverlay}>
          <View style={styles.futureModalCard}>
            <Text style={styles.futureModalTitle}>
              아직 캐스팅 기간이 아니에요!
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.futureModalButton}
              onPress={() => setFutureDateModalVisible(false)}
            >
              <Text style={styles.futureModalButtonText}>확인했어요</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

export function CastingCardFront({
  date,
  isFavorite,
  onToggleFavorite,
  onFlip,
  record = RECORD,
  eyebrow = "TODAY’S CASTING",
  rows,
  showInfoPanel = true,
  showFlipButton = true,
}) {
  const reactId = useId();
  const clipPathId = useMemo(
    () => `castingCardClip-${String(reactId).replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [reactId]
  );
  const [remoteImageFailed, setRemoteImageFailed] = useState(false);
  const imageUrl =
    typeof record.imageUrl === "string" ? record.imageUrl.trim() : "";

  useEffect(() => {
    setRemoteImageFailed(false);
  }, [imageUrl]);
  const cardImageSource =
    imageUrl && !remoteImageFailed ? imageUrl : CASTING_CARD_BACKGROUND;

  const infoRows = rows ?? [
    { icon: "movie-open-outline", label: "오늘의 장르", text: record.genre },
    { icon: "pencil-outline", label: "오늘의 한줄 기록", text: record.line },
    { icon: "image-outline", label: "기억에 남은 장면", text: record.scene },
  ];

  return (
    <>
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 404 584"
        preserveAspectRatio="none"
        style={styles.frontArtwork}
      >
        <Defs>
          <ClipPath id={clipPathId}>
            <Path d={CASTING_CARD_PATH} />
          </ClipPath>
        </Defs>
        <SvgImage
          href={cardImageSource}
          x="0"
          y="0"
          width="404"
          height="584"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipPathId})`}
          onError={() => setRemoteImageFailed(true)}
        />
        <Rect
          x="0"
          y="0"
          width="404"
          height="584"
          fill="rgba(25, 9, 43, 0.12)"
          clipPath={`url(#${clipPathId})`}
        />
        <Path
          d={CASTING_CARD_PATH}
          fill="none"
          stroke="rgba(214, 115, 92, 0.82)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
      <Text style={styles.posterDate}>{date}</Text>
      <Text style={styles.posterLabel}>{eyebrow}</Text>
      <Text style={styles.posterTitle}>{record.title}</Text>
      <TouchableOpacity
        activeOpacity={0.75}
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={ms(34)}
          color="#FF554F"
        />
      </TouchableOpacity>

      {showInfoPanel && (
        <View style={styles.infoPanel}>
          {infoRows.map((row, index) => (
            <InfoRow
              key={`${row.label}-${index}`}
              {...row}
              last={index === infoRows.length - 1}
            />
          ))}

          {showFlipButton && (
            <TouchableOpacity activeOpacity={0.82} style={styles.flipButton} onPress={onFlip}>
              <Text style={styles.flipButtonText}>뒷면 보기</Text>
              <Ionicons name="arrow-forward" size={ms(22)} color="#FF8D4C" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );
}

export function CastingCardBack({ date, onFlip, diary = RECORD.diary }) {
  const [scrollMetrics, setScrollMetrics] = useState({
    contentHeight: 0,
    viewportHeight: 0,
    scrollY: 0,
  });
  const { contentHeight, viewportHeight, scrollY } = scrollMetrics;
  const hasOverflow = contentHeight > viewportHeight + 1;
  const scrollThumbHeight = hasOverflow
    ? Math.max(ms(24), (viewportHeight * viewportHeight) / contentHeight)
    : viewportHeight;
  const scrollTravel = Math.max(viewportHeight - scrollThumbHeight, 0);
  const scrollThumbTop = hasOverflow
    ? Math.min(
        (scrollY / Math.max(contentHeight - viewportHeight, 1)) * scrollTravel,
        scrollTravel
      )
    : 0;

  return (
    <>
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 404 584"
        preserveAspectRatio="none"
        style={styles.backArtwork}
      >
        <Path
          d={CASTING_CARD_PATH}
          fill="#F4E9D9"
          stroke="rgba(184, 121, 84, 0.95)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
      <View style={styles.cardBackInner}>
      <Text style={styles.paperDate}>{date}</Text>
      <View style={styles.paperDivider}>
        <View style={styles.paperLine} />
        <Text style={styles.paperStar}>✦</Text>
        <View style={styles.paperLine} />
      </View>
      <Text style={styles.backTitle}>오늘의 기록</Text>
      <View style={styles.titleUnderline} />

      <View
        style={styles.diaryViewport}
        onLayout={({ nativeEvent }) =>
          setScrollMetrics((current) => ({
            ...current,
            viewportHeight: nativeEvent.layout.height,
          }))
        }
      >
        <ScrollView
          style={styles.diaryScroll}
          contentContainerStyle={styles.diaryContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onContentSizeChange={(_, height) =>
            setScrollMetrics((current) => ({
              ...current,
              contentHeight: height,
            }))
          }
          onScroll={({ nativeEvent }) =>
            setScrollMetrics((current) => ({
              ...current,
              scrollY: nativeEvent.contentOffset.y,
            }))
          }
        >
          <Text style={styles.diaryText}>{diary}</Text>
        </ScrollView>
        {hasOverflow && (
          <View pointerEvents="none" style={styles.diaryScrollTrack}>
            <View
              style={[
                styles.diaryScrollThumb,
                {
                  height: scrollThumbHeight,
                  transform: [{ translateY: scrollThumbTop }],
                },
              ]}
            />
          </View>
        )}
      </View>

      <View style={styles.bottomPaperDivider}>
        <View style={styles.paperLine} />
        <Text style={styles.paperStar}>✦</Text>
        <View style={styles.paperLine} />
      </View>

      <TouchableOpacity activeOpacity={0.82} style={styles.paperFlipButton} onPress={onFlip}>
        <Text style={styles.paperFlipButtonText}>앞면 보기</Text>
        <Ionicons name="arrow-forward" size={ms(22)} color="#8B5738" />
      </TouchableOpacity>
      </View>
    </>
  );
}

function InfoRow({ icon, label, text, last }) {
  return (
    <View style={[styles.infoRow, last && styles.lastInfoRow]}>
      <View style={styles.infoIcon}>
        <MaterialCommunityIcons name={icon} size={ms(20)} color="#FFB363" />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#070B1D",
  },
  backgroundDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: ms(36.5),
    paddingBottom: vs(156),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerText: {
    flex: 1,
    marginTop: ms(40),
    marginLeft: ms(-1),
    paddingRight: ms(8),
  },
  greeting: {
    color: "#D8AD7B",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(16),
    lineHeight: ms(19),
  },
  subGreeting: {
    marginTop: 5,
    color: "rgba(219, 160, 174, 0.72)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(17),
  },
  screenTitle: {
    marginTop: vs(25),
    color: "#D9B184",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(25),
    lineHeight: ms(34),
  },
  calendarCard: {
    position: "relative",
    marginTop: vs(16),
    marginHorizontal: ms(-4),
    paddingHorizontal: ms(15),
    paddingTop: vs(19),
    paddingBottom: vs(15),
    backgroundColor: "transparent",
  },
  calendarFrame: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  calendarHeader: {
    height: vs(34),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  monthText: {
    marginHorizontal: ms(24),
    color: "#E7C393",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(17),
    lineHeight: ms(25),
  },
  smallCalendar: {
    position: "absolute",
    right: 0,
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    borderWidth: 1,
    borderColor: "rgba(215, 108, 140, 0.48)",
    alignItems: "center",
    justifyContent: "center",
  },
  monthPicker: {
    marginTop: vs(10),
    padding: ms(12),
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: "rgba(215, 108, 140, 0.38)",
    backgroundColor: "rgba(18, 10, 35, 0.96)",
  },
  pickerLabel: {
    marginBottom: vs(6),
    color: "rgba(231, 195, 147, 0.72)",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(11),
    lineHeight: ms(16),
  },
  yearOptions: {
    paddingBottom: vs(10),
    gap: ms(6),
  },
  pickerOption: {
    minWidth: ms(58),
    height: vs(28),
    paddingHorizontal: ms(8),
    borderRadius: ms(8),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(91, 55, 102, 0.42)",
  },
  pickerOptionSelected: {
    borderWidth: 1,
    borderColor: "#FF8A56",
    backgroundColor: "rgba(165, 65, 69, 0.68)",
  },
  pickerOptionText: {
    color: "rgba(237, 216, 186, 0.72)",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(11),
    lineHeight: ms(15),
  },
  pickerOptionTextSelected: {
    color: "#FFD09A",
  },
  monthOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ms(5),
  },
  monthOption: {
    width: "15%",
    height: vs(27),
    borderRadius: ms(8),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(91, 55, 102, 0.42)",
  },
  pickerActions: {
    marginTop: vs(12),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: ms(14),
  },
  todayPickerText: {
    color: "rgba(255, 208, 154, 0.76)",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(11),
  },
  applyPickerButton: {
    minWidth: ms(50),
    height: vs(28),
    borderRadius: ms(14),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B95349",
  },
  applyPickerText: {
    color: "#FFE0B8",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(11),
  },
  weekRow: {
    marginTop: vs(20),
    flexDirection: "row",
  },
  weekText: {
    width: `${100 / 7}%`,
    color: "#C79980",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(13),
    lineHeight: ms(20),
    textAlign: "center",
  },
  monthDivider: {
    marginTop: vs(8),
    height: 1,
    backgroundColor: "rgba(255, 214, 182, 0.14)",
  },
  calendarError: {
    marginTop: vs(8),
    color: "#FFB0B0",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(16),
    textAlign: "center",
  },
  daysGrid: {
    marginTop: vs(8),
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    position: "relative",
    width: `${100 / 7}%`,
    height: vs(38),
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDate: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6841",
    shadowColor: "#FF6841",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 9,
    elevation: 9,
  },
  dayText: {
    color: "#EDD8BA",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(13),
    lineHeight: ms(19),
    fontVariant: ["tabular-nums"],
  },
  calendarHeart: {
    position: "absolute",
    top: vs(31),
    left: "50%",
    transform: [{ translateX: ms(-4) }],
    zIndex: 2,
  },
  mutedDay: {
    color: "rgba(229, 201, 185, 0.26)",
  },
  accentDay: {
    color: "#FF853C",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  dayDot: {
    position: "absolute",
    top: vs(34),
    left: "50%",
    width: ms(5),
    height: ms(5),
    borderRadius: ms(2.5),
    backgroundColor: "#FF843D",
    transform: [{ translateX: ms(-2.5) }],
    zIndex: 1,
  },
  quoteCard: {
    position: "relative",
    marginTop: vs(14),
    marginHorizontal: ms(-4),
    height: vs(102),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "rgba(221, 72, 91, 0.64)",
    backgroundColor: "transparent",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  quoteImage: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  quoteScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 10, 48, 0.34)",
    zIndex: 0,
  },
  quoteDate: {
    width: ms(84),
    alignItems: "center",
    zIndex: 1,
  },
  quoteDateText: {
    color: "#FF9450",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(28),
    lineHeight: ms(36),
  },
  quoteWeekText: {
    color: "#F3D9BA",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(13),
  },
  quoteDivider: {
    width: 1,
    height: vs(66),
    backgroundColor: "rgba(244, 199, 170, 0.38)",
    zIndex: 1,
  },
  quoteText: {
    flex: 1,
    paddingHorizontal: ms(18),
    color: "#FFD5A6",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(21),
    zIndex: 1,
  },
  recordCard: {
    marginTop: vs(14),
    marginHorizontal: ms(-4),
    minHeight: vs(124),
    padding: ms(12),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "rgba(221, 72, 91, 0.64)",
    backgroundColor: "rgba(28, 13, 45, 0.82)",
    flexDirection: "row",
  },
  recordImage: {
    width: ms(100),
    height: vs(90),
    borderRadius: ms(12),
  },
  recordInfo: {
    flex: 1,
    marginLeft: ms(14),
    justifyContent: "center",
  },
  recordEyebrow: {
    color: "#FFD19B",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(12),
    lineHeight: ms(18),
  },
  recordQuestion: {
    marginTop: vs(6),
    color: "#F6D8B7",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(12),
    lineHeight: ms(18),
  },
  recordHelp: {
    marginTop: vs(2),
    color: "rgba(255, 230, 211, 0.62)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(10),
    lineHeight: ms(15),
  },
  recordButton: {
    marginTop: vs(10),
    height: vs(31),
    paddingHorizontal: ms(12),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "#E36D45",
    backgroundColor: "rgba(136, 55, 44, 0.58)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonText: {
    color: "#FFD09A",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(10),
    lineHeight: ms(15),
  },
  futureModalOverlay: {
    flex: 1,
    paddingHorizontal: ms(32),
    backgroundColor: "rgba(4, 5, 18, 0.72)",
    alignItems: "center",
    justifyContent: "center",
  },
  futureModalCard: {
    width: "100%",
    maxWidth: ms(320),
    paddingHorizontal: ms(22),
    paddingTop: vs(28),
    paddingBottom: vs(20),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: "rgba(255, 160, 100, 0.58)",
    backgroundColor: "rgba(31, 18, 49, 0.98)",
    alignItems: "center",
  },
  futureModalTitle: {
    color: "#FFE0B8",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(18),
    lineHeight: ms(28),
    textAlign: "center",
  },
  futureModalButton: {
    marginTop: vs(22),
    minWidth: ms(132),
    height: vs(43),
    paddingHorizontal: ms(20),
    borderRadius: ms(22),
    backgroundColor: "#FF8150",
    alignItems: "center",
    justifyContent: "center",
  },
  futureModalButtonText: {
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(14),
    lineHeight: ms(20),
  },
  modalLayer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(4, 5, 18, 0.64)",
  },
  dimmedArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    height: vs(548),
    borderTopLeftRadius: ms(31),
    borderTopRightRadius: ms(31),
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(150, 86, 178, 0.58)",
    backgroundColor: "rgba(31, 18, 49, 0.97)",
    alignItems: "center",
    paddingTop: vs(24),
  },
  sheetHandle: {
    position: "absolute",
    top: vs(10),
    width: ms(40),
    height: vs(4),
    borderRadius: ms(2),
    backgroundColor: "rgba(224, 193, 221, 0.58)",
  },
  closeButton: {
    position: "absolute",
    right: ms(20),
    top: vs(18),
    width: ms(43),
    height: ms(43),
    borderRadius: ms(22),
    borderWidth: 1,
    borderColor: "rgba(241, 216, 233, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  flipWrap: {
    width: ms(250),
    height: vs(484),
  },
  castingCard: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    backfaceVisibility: "hidden",
  },
  frontCard: {
    overflow: "hidden",
  },
  backCard: {
    overflow: "hidden",
    transform: [{ rotateY: "180deg" }],
  },
  frontArtwork: {
    ...StyleSheet.absoluteFillObject,
  },
  backArtwork: {
    ...StyleSheet.absoluteFillObject,
  },
  posterDate: {
    marginTop: vs(28),
    color: "#E8D3C9",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(13),
    lineHeight: ms(20),
    textAlign: "center",
  },
  posterLabel: {
    marginTop: vs(4),
    color: "#D7C0C3",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(6),
    lineHeight: ms(11),
    letterSpacing: 1.7,
    textAlign: "center",
  },
  posterTitle: {
    marginTop: vs(8),
    color: "#EED5C7",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(23),
    lineHeight: ms(34),
    textAlign: "center",
  },
  favoriteButton: {
    position: "absolute",
    right: ms(14),
    top: vs(20),
    width: ms(44),
    height: ms(44),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  infoPanel: {
    position: "absolute",
    left: ms(13),
    right: ms(13),
    bottom: vs(12),
    paddingHorizontal: ms(10),
    paddingTop: vs(7),
    paddingBottom: vs(9),
    borderRadius: ms(13),
    borderWidth: 1,
    borderColor: "rgba(238, 102, 63, 0.55)",
    backgroundColor: "rgba(42, 21, 45, 0.88)",
  },
  infoRow: {
    minHeight: vs(42),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(235, 167, 126, 0.18)",
    flexDirection: "row",
    alignItems: "center",
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoIcon: {
    width: ms(31),
    height: ms(31),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "rgba(238, 102, 63, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
    marginLeft: ms(10),
  },
  infoLabel: {
    color: "#FFAB5D",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(9),
    lineHeight: ms(14),
  },
  infoText: {
    color: "#F7DABD",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(9),
    lineHeight: ms(15),
  },
  flipButton: {
    alignSelf: "center",
    marginTop: vs(7),
    width: ms(153),
    height: vs(31),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "#B9514E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flipButtonText: {
    marginRight: ms(12),
    color: "#FF9B58",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(16),
  },
  cardBackInner: {
    flex: 1,
    paddingHorizontal: ms(24),
    paddingTop: vs(39),
    paddingBottom: vs(17),
    backgroundColor: "transparent",
  },
  paperDate: {
    color: "#9A633E",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(15),
    lineHeight: ms(22),
    textAlign: "center",
  },
  paperDivider: {
    marginTop: vs(8),
    alignSelf: "center",
    width: ms(78),
    flexDirection: "row",
    alignItems: "center",
  },
  bottomPaperDivider: {
    marginTop: vs(8),
    flexDirection: "row",
    alignItems: "center",
  },
  paperLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(155, 110, 72, 0.24)",
  },
  paperStar: {
    marginHorizontal: ms(8),
    color: "#A56E45",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(12),
    lineHeight: ms(16),
  },
  backTitle: {
    marginTop: vs(10),
    color: "#2A2523",
    fontFamily: "Mindeulle",
    fontSize: ms(23),
    lineHeight: ms(31),
  },
  titleUnderline: {
    marginTop: vs(7),
    width: ms(86),
    height: 1,
    backgroundColor: "rgba(112, 82, 52, 0.2)",
  },
  diaryViewport: {
    flex: 1,
    marginTop: vs(17),
    position: "relative",
  },
  diaryScroll: {
    flex: 1,
    paddingRight: ms(12),
  },
  diaryContent: {
    paddingRight: ms(12),
    paddingBottom: vs(16),
  },
  diaryText: {
    color: "#2F2925",
    fontFamily: "Mindeulle",
    fontSize: ms(14),
    lineHeight: ms(22),
  },
  diaryScrollTrack: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: ms(2),
    borderRadius: ms(1),
    backgroundColor: "rgba(154, 99, 62, 0.22)",
  },
  diaryScrollThumb: {
    position: "absolute",
    right: ms(-1),
    width: ms(4),
    borderRadius: ms(2),
    backgroundColor: "#9A633E",
  },
  paperFlipButton: {
    alignSelf: "center",
    marginTop: vs(13),
    width: ms(161),
    height: vs(34),
    borderRadius: ms(18),
    borderWidth: 1,
    borderColor: "#B87954",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  paperFlipButtonText: {
    marginRight: ms(12),
    color: "#8B5738",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(16),
  },
});
