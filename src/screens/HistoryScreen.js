import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import NotificationSheet from "../components/NotificationSheet";
import {
  getNotificationState,
  markAllNotificationsRead,
  subscribeNotificationState,
} from "../services/notificationState";
import { CastingCardBack, CastingCardFront } from "./CalendarScreen";
import calendarApi from "../api/calendar-api";
import castingsApi from "../api/castings-api";
import recordsApi from "../api/records-api";
import { notifyFavoriteChanged, subscribeFavoriteChanges } from "../services/favoriteState";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = Math.min(Math.max(SCREEN_WIDTH / 393, 0.82), 1.15);
const ms = (value) => value * scale;
const vs = ms;

const CARD_WIDTH = ms(250);
const CARD_GAP = -ms(104);
const SNAP = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = Math.max((SCREEN_WIDTH - CARD_WIDTH) / 2, ms(32));

const toDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const formatCardDate = (dateKey) => dateKey.replaceAll("-", ".");

const formatDateRange = (start, end) => {
  const startMonth = String(start.getMonth() + 1).padStart(2, "0");
  const endMonth = String(end.getMonth() + 1).padStart(2, "0");
  const startDay = String(start.getDate()).padStart(2, "0");
  const endDay = String(end.getDate()).padStart(2, "0");

  return `${start.getFullYear()}년 ${startMonth}월 ${startDay}일 ~ ${end.getFullYear()}년 ${endMonth}월 ${endDay}일`;
};

const getCurrentWeek = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  return { start, end };
};

const toYearMonth = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const parseDateInput = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
    ? date
    : null;
};

const getYearMonthsInRange = (start, end) => {
  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= last) {
    months.push(toYearMonth(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return months;
};

const HISTORY_RECORDS = [
  {
    date: "2025.05.18",
    day: "일",
    title: "낯선 도시의\n관찰자",
    genre: "Mystery\nThriller",
    emotion: "호기심 · 긴장 · 집중",
    line: "낯선 길 끝에서 나의 마음을 발견했다.",
    scene: "비 내리는 골목길을 천천히 걸었던 순간",
    liked: false,
  },
  {
    date: "2025.05.19",
    day: "월",
    title: "조용한\n응원자",
    genre: "Warm\nDrama",
    emotion: "다정함 · 안정 · 위로",
    line: "작은 응원이 누군가의 하루를 바꾼다.",
    scene: "친구의 이야기를 오래 들어주던 저녁",
    liked: false,
  },
  {
    date: "2025.05.20",
    day: "화",
    title: "비밀을 좇는\n탐정",
    genre: "Mystery\nThriller",
    emotion: "긴장 · 몰입 · 용기",
    line: "어두운 장면일수록 단서가 선명해진다.",
    scene: "흐린 하늘 아래 혼자 걸었던 길",
    liked: false,
  },
  {
    date: "2025.05.21",
    day: "수",
    title: "삼각관계의\n빌런",
    genre: "Romance\nDrama",
    emotion: "따뜻함 · 설렘 · 위로",
    line: "너와 함께라면, 모든 날이 영화 같아.",
    scene: "해질 무렵, 함께 걸었던 골목길",
    liked: true,
  },
  {
    date: "2025.05.22",
    day: "목",
    title: "느린 밤의\n치유자",
    genre: "Healing\nRelax",
    emotion: "평온 · 회복 · 감사",
    line: "오늘의 속도도 충분히 나답다.",
    scene: "따뜻한 차를 마시며 창밖을 보던 밤",
    liked: false,
  },
  {
    date: "2025.05.23",
    day: "금",
    title: "무대 뒤의\n연출가",
    genre: "Coming\nAge",
    emotion: "기대 · 떨림 · 확신",
    line: "준비한 마음은 언젠가 장면이 된다.",
    scene: "긴 하루 끝에 다시 계획을 적던 순간",
    liked: false,
  },
  {
    date: "2025.05.24",
    day: "토",
    title: "노을 속의\n주인공",
    genre: "Youth\nRomance",
    emotion: "설렘 · 자유 · 미소",
    line: "가장 빛나는 장면은 늘 가까이에 있었다.",
    scene: "노을이 번지는 하늘을 오래 바라본 시간",
    liked: false,
  },
];

const DIARY_TEXT =
  "새벽 일찍 눈이 떠졌다.\n창문을 열자 상쾌한 공기가 얼굴을 스쳤다.\n따뜻한 차 한 잔을 내려 천천히 마시며\n오늘 하루를 어떻게 보내고 싶은지 생각해봤다.\n\n오후엔 도서관에 다녀왔다.\n조용한 공간에서 책을 읽으니\n복잡했던 마음이 차분해졌다.\n새로운 문장을 만나면 마음이 환해지는 기분이었다.\n\n저녁엔 오랜만에 친구와 통화를 했다.\n서로의 이야기를 듣고 나니\n다시 힘을 낼 수 있을 것 같았다.\n\n큰 성과는 없었지만,\n작은 순간들이 모여 의미 있는 하루가 된 것 같다.\n\n오늘도 잘 해냈어, 나 자신.\n내일은 더 멋진 하루가 되길. ✦";

export default function HistoryScreen({ navigation }) {
  const initialWeek = useMemo(getCurrentWeek, []);
  const [week, setWeek] = useState(initialWeek);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [startDateInput, setStartDateInput] = useState(() => toDateKey(initialWeek.start));
  const [endDateInput, setEndDateInput] = useState(() => toDateKey(initialWeek.end));
  const [dateInputError, setDateInputError] = useState("");
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [backVisible, setBackVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationState, setNotificationState] = useState(() =>
    getNotificationState()
  );
  const [favoriteDates, setFavoriteDates] = useState(() => new Set());
  const [favoriteLoadingRecordId, setFavoriteLoadingRecordId] = useState(null);
  const scrollRef = useRef(null);
  const scrollEndTimerRef = useRef(null);
  const lastScrollOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const scrollX = useRef(new Animated.Value(activeIndex * SNAP)).current;
  const flip = useRef(new Animated.Value(0)).current;

  useEffect(() => subscribeNotificationState(setNotificationState), []);
  useEffect(
    () =>
      subscribeFavoriteChanges(({ recordId, dateKey, isFavorite }) => {
        if (typeof isFavorite !== "boolean") {
          return;
        }

        setHistoryRecords((current) =>
          current.map((item) =>
            String(item.recordId) === String(recordId)
              ? { ...item, liked: isFavorite }
              : item
          )
        );

        if (dateKey) {
          setFavoriteDates((current) => {
            const next = new Set(current);

            if (isFavorite) next.add(dateKey);
            else next.delete(dateKey);

            return next;
          });
        }
      }),
    []
  );

  const weekLabel = historyLoading
    ? "히스토리를 불러오는 중..."
    : historyError
      ? historyError
      : formatDateRange(week.start, week.end);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");
        const yearMonths = getYearMonthsInRange(week.start, week.end);
        const markerGroups = await Promise.all(
          yearMonths.map((yearMonth) => calendarApi.getMonthlyMarkers(yearMonth))
        );
        const startKey = toDateKey(week.start);
        const endKey = toDateKey(week.end);
        const recordDates = [...new Set(
          markerGroups
            .flat()
            .filter(
              (marker) =>
                marker.hasRecord &&
                marker.recordDate >= startKey &&
                marker.recordDate <= endKey
            )
            .map((marker) => marker.recordDate)
        )].sort();
        const results = await Promise.allSettled(
          recordDates.map(async (recordDate) => {
            const dailyRecord = await recordsApi.getRecordByDate(recordDate);

            if (!dailyRecord?.id || dailyRecord.status !== "COMPLETED") {
              return null;
            }

            const casting = await castingsApi.getCastingByRecordId(dailyRecord.id);
            const date = new Date(`${recordDate}T00:00:00`);

            return {
              recordId: dailyRecord.id,
              date: formatCardDate(recordDate),
              dateKey: recordDate,
              day: ["일", "월", "화", "수", "목", "금", "토"][date.getDay()],
              title: casting.roleName || casting.characterName || casting.role || casting.castingTitle,
              genre: casting.genre,
              emotion: casting.additionalMood?.join(" · ") || "",
              line: casting.oneLineComment,
              scene: casting.scenePhrase,
              diary: dailyRecord.content,
              imageUrl: casting.imageUrl,
              liked: casting.isFavorite,
            };
          })
        );
        const loadedRecords = results
          .filter((result) => result.status === "fulfilled" && result.value)
          .map((result) => result.value);

        if (!active) return;

        setHistoryRecords(loadedRecords);
        setFavoriteDates(
          new Set(
            loadedRecords.filter((record) => record.liked).map((record) => record.dateKey)
          )
        );
        setActiveIndex(0);
        resetCardSide();
        scrollX.setValue(0);
        scrollRef.current?.scrollTo({ x: 0, animated: false });
      } catch (error) {
        if (!active) return;
        setHistoryRecords([]);
        setFavoriteDates(new Set());
        setHistoryError(
          error.response?.data?.message ?? "히스토리를 불러오지 못했습니다."
        );
      } finally {
        if (active) setHistoryLoading(false);
      }
    };

    loadHistory();
    const unsubscribeFocus = navigation?.addListener?.("focus", loadHistory);

    return () => {
      active = false;
      clearTimeout(scrollEndTimerRef.current);
      unsubscribeFocus?.();
    };
  }, [navigation, week]);

  const frontRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const showFront = () => {
    setBackVisible(false);
    Animated.spring(flip, {
      toValue: 0,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  const showBack = () => {
    setBackVisible(true);
    Animated.spring(flip, {
      toValue: 1,
      friction: 8,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  const resetCardSide = () => {
    setBackVisible(false);
    flip.setValue(0);
  };

  const openDatePicker = () => {
    setStartDateInput(toDateKey(week.start));
    setEndDateInput(toDateKey(week.end));
    setDateInputError("");
    setDatePickerVisible(true);
  };

  const applyDateRange = () => {
    const start = parseDateInput(startDateInput);
    const end = parseDateInput(endDateInput);

    if (!start || !end) {
      setDateInputError("날짜를 YYYY-MM-DD 형식으로 입력해주세요.");
      return;
    }

    if (start > end) {
      setDateInputError("시작일은 종료일보다 늦을 수 없어요.");
      return;
    }

    const rangeDays = Math.floor((end - start) / 86400000) + 1;
    if (rangeDays > 31) {
      setDateInputError("조회 기간은 최대 31일까지 선택할 수 있어요.");
      return;
    }

    setWeek({ start, end });
    setDatePickerVisible(false);
  };

  const toggleFavorite = async (record) => {
    if (!record?.recordId || favoriteLoadingRecordId !== null) return;

    try {
      setFavoriteLoadingRecordId(record.recordId);
      const updatedCasting = await castingsApi.toggleFavorite(record.recordId);

      if (typeof updatedCasting?.isFavorite !== "boolean") {
        throw new Error("즐겨찾기 응답을 확인할 수 없습니다.");
      }

      setHistoryRecords((current) =>
        current.map((item) =>
          item.recordId === record.recordId
            ? { ...item, liked: updatedCasting.isFavorite }
            : item
        )
      );
      setFavoriteDates((current) => {
        const next = new Set(current);
        if (updatedCasting.isFavorite) next.add(record.dateKey);
        else next.delete(record.dateKey);
        return next;
      });
      notifyFavoriteChanged({
        recordId: record.recordId,
        dateKey: record.dateKey,
        isFavorite: updatedCasting.isFavorite,
      });
    } catch (error) {
      setHistoryError(
        error.response?.data?.message ?? error.message ?? "즐겨찾기 변경에 실패했습니다."
      );
    } finally {
      setFavoriteLoadingRecordId(null);
    }
  };

  const scrollToIndex = (index) => {
    const nextIndex = Math.max(0, Math.min(index, historyRecords.length - 1));

    setActiveIndex(nextIndex);
    resetCardSide();
    scrollRef.current?.scrollTo({
      x: nextIndex * SNAP,
      animated: true,
    });
  };

  const snapToNearestCard = (offsetX) => {
    const nextIndex = Math.max(
      0,
      Math.min(Math.round(offsetX / SNAP), historyRecords.length - 1)
    );
    const snappedOffset = nextIndex * SNAP;

    setActiveIndex(nextIndex);
    resetCardSide();

    if (Math.abs(offsetX - snappedOffset) > 0.5) {
      scrollRef.current?.scrollTo({
        x: snappedOffset,
        animated: true,
      });
    }
  };

  const scheduleNearestCardSnap = (offsetX, delay = 110) => {
    clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      if (!isDraggingRef.current) {
        snapToNearestCard(offsetX);
      }
    }, delay);
  };

  const handleMomentumEnd = (event) => {
    snapToNearestCard(event.nativeEvent.contentOffset.x);
  };

  const handleCarouselScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    lastScrollOffsetRef.current = offsetX;

    if (!isDraggingRef.current) {
      scheduleNearestCardSnap(offsetX);
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

      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <ScrollView
          style={styles.screenScroll}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>히스토리 조회</Text>
            <Text
              style={styles.subtitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              지난간 하루의 기록을 다시 살펴보세요.
            </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.bellButton}
              onPress={() => setNotificationVisible(true)}
            >
              <Ionicons name="notifications-outline" size={ms(31)} color="#FFB15D" />
              {notificationState.hasUnread && <View style={styles.bellDot} />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.weekPicker}
            onPress={openDatePicker}
            accessibilityRole="button"
            accessibilityLabel="히스토리 조회 기간 선택"
          >
            <Ionicons name="calendar-outline" size={ms(20)} color="#FFB26D" />
            <Text
              style={styles.weekText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {weekLabel}
            </Text>
            <Ionicons name="chevron-down" size={ms(20)} color="#CE737D" />
          </TouchableOpacity>

          <View style={styles.carouselWrap}>
            <Animated.ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToOffsets={historyRecords.map((_, index) => index * SNAP)}
              snapToAlignment="start"
              disableIntervalMomentum
              decelerationRate="fast"
              bounces={false}
              contentOffset={{ x: activeIndex * SNAP, y: 0 }}
              contentContainerStyle={styles.carouselContent}
              onScrollBeginDrag={() => {
                isDraggingRef.current = true;
                clearTimeout(scrollEndTimerRef.current);
              }}
              onScrollEndDrag={() => {
                isDraggingRef.current = false;
                scheduleNearestCardSnap(lastScrollOffsetRef.current, 80);
              }}
              onMomentumScrollEnd={handleMomentumEnd}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                {
                  useNativeDriver: true,
                  listener: handleCarouselScroll,
                }
              )}
              scrollEventThrottle={16}
            >
              {historyRecords.map((record, index) => {
                const inputRange = [
                  (index - 1) * SNAP,
                  index * SNAP,
                  (index + 1) * SNAP,
                ];
                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.82, 1, 0.82],
                  extrapolate: "clamp",
                });
                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.68, 1, 0.68],
                  extrapolate: "clamp",
                });
                const rotateY = scrollX.interpolate({
                  inputRange,
                  outputRange: ["-38deg", "0deg", "38deg"],
                  extrapolate: "clamp",
                });
                const translateX = scrollX.interpolate({
                  inputRange,
                  outputRange: [-ms(20), 0, ms(20)],
                  extrapolate: "clamp",
                });
                const translateY = scrollX.interpolate({
                  inputRange,
                  outputRange: [vs(15), 0, vs(15)],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View
                    key={record.dateKey}
                    style={[
                      styles.cardSlot,
                      {
                        opacity,
                        zIndex: index === activeIndex ? 3 : 1,
                        elevation: index === activeIndex ? 3 : 1,
                        transform: [
                          { perspective: ms(900) },
                          { translateX },
                          { translateY },
                          { rotateY },
                          { scale },
                        ],
                      },
                    ]}
                  >
                    {index === activeIndex ? (
                      <HistoryFlipCard
                        record={record}
                        isFavorite={favoriteDates.has(record.dateKey)}
                        backVisible={backVisible}
                        frontRotate={frontRotate}
                        backRotate={backRotate}
                        onToggleFavorite={() => toggleFavorite(record)}
                        onShowBack={showBack}
                        onShowFront={showFront}
                      />
                    ) : (
                      <HistoryCardFront
                        record={record}
                        focused={index === activeIndex}
                        isFavorite={favoriteDates.has(record.dateKey)}
                        onToggleFavorite={() => toggleFavorite(record)}
                        onShowBack={() => scrollToIndex(index)}
                      />
                    )}
                  </Animated.View>
                );
              })}
            </Animated.ScrollView>

            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.leftEdge}
              onPress={() => scrollToIndex(activeIndex - 1)}
            />
            <TouchableOpacity
              activeOpacity={0.65}
              style={styles.rightEdge}
              onPress={() => scrollToIndex(activeIndex + 1)}
            />
          </View>

          <View style={styles.pagination}>
            {historyRecords.map((record, index) => (
              <View
                key={`${record.dateKey}-dot`}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </ScrollView>
        <NotificationSheet
          visible={notificationVisible}
          notifications={notificationState.notifications}
          onClose={() => setNotificationVisible(false)}
          onMarkAllRead={markAllNotificationsRead}
        />
        <Modal
          visible={datePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDatePickerVisible(false)}
        >
          <View style={styles.dateModalOverlay}>
            <View style={styles.dateModalCard}>
              <Text style={styles.dateModalTitle}>조회 기간 입력</Text>
              <Text style={styles.dateModalHelp}>YYYY-MM-DD 형식으로 입력해주세요.</Text>

              <View style={styles.dateFieldGroup}>
                <Text style={styles.dateFieldLabel}>시작일</Text>
                <TextInput
                  value={startDateInput}
                  onChangeText={setStartDateInput}
                  placeholder="2026-08-01"
                  placeholderTextColor="rgba(255, 208, 160, 0.4)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={10}
                  style={styles.dateInput}
                />
              </View>

              <View style={styles.dateFieldGroup}>
                <Text style={styles.dateFieldLabel}>종료일</Text>
                <TextInput
                  value={endDateInput}
                  onChangeText={setEndDateInput}
                  placeholder="2026-08-31"
                  placeholderTextColor="rgba(255, 208, 160, 0.4)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={10}
                  style={styles.dateInput}
                />
              </View>

              {dateInputError ? (
                <Text selectable style={styles.dateInputError}>{dateInputError}</Text>
              ) : null}

              <View style={styles.dateModalActions}>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.dateCancelButton}
                  onPress={() => setDatePickerVisible(false)}
                >
                  <Text style={styles.dateCancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.dateApplyButton}
                  onPress={applyDateRange}
                >
                  <Text style={styles.dateApplyText}>조회하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

function HistoryFlipCard({
  record,
  isFavorite,
  backVisible,
  frontRotate,
  backRotate,
  onToggleFavorite,
  onShowBack,
  onShowFront,
}) {
  return (
    <View style={styles.flipCardWrap}>
      <Animated.View
        pointerEvents={backVisible ? "none" : "auto"}
        style={[
          styles.flipFace,
          {
            transform: [{ perspective: 1000 }, { rotateY: frontRotate }],
          },
        ]}
      >
        <HistoryCardFront
          record={record}
          focused
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
          onShowBack={onShowBack}
        />
      </Animated.View>

      <Animated.View
        pointerEvents={backVisible ? "auto" : "none"}
        style={[
          styles.flipFace,
          styles.flipBackFace,
          {
            transform: [{ perspective: 1000 }, { rotateY: backRotate }],
          },
        ]}
      >
        <HistoryCardBack record={record} onShowFront={onShowFront} />
      </Animated.View>
    </View>
  );
}

function HistoryCardFront({
  record,
  focused,
  isFavorite,
  onToggleFavorite,
  onShowBack,
}) {
  const rows = [
    { icon: "movie-open-outline", label: "오늘의 장르", text: record.genre },
    { icon: "pencil-outline", label: "오늘의 한줄 기록", text: record.line },
    { icon: "image-outline", label: "기억에 남은 장면", text: record.scene },
  ];

  return (
    <View style={[styles.sharedCastingCard, !focused && styles.sideCard]}>
      <CastingCardFront
        date={record.date}
        record={record}
        eyebrow="TODAY’S CASTING"
        rows={rows}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onFlip={onShowBack}
      />
    </View>
  );
}

function HistoryCardBack({ record, onShowFront }) {
  return (
    <View style={styles.sharedCastingCard}>
      <CastingCardBack
        date={record.date}
        diary={record.diary ?? ""}
        onFlip={onShowFront}
      />
    </View>
  );
}

function HistoryInfoRow({ icon, label, text, last }) {
  return (
    <View style={[styles.infoRow, last && styles.lastInfoRow]}>
      <MaterialCommunityIcons name={icon} size={ms(27)} color="#FFAF72" />
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
    backgroundColor: "#050A1C",
  },
  backgroundDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  safeArea: {
    flex: 1,
  },
  screenScroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: ms(20),
    paddingBottom: vs(142),
  },
  header: {
    paddingHorizontal: ms(36.5),
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
  title: {
    color: "#D8AD7B",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(16),
    lineHeight: ms(19),
  },
  subtitle: {
    marginTop: 5,
    color: "rgba(219, 160, 174, 0.72)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(17),
  },
  bellButton: {
    width: ms(46),
    height: ms(46),
    alignItems: "center",
    justifyContent: "center",
    marginTop: ms(40),
  },
  bellDot: {
    position: "absolute",
    right: ms(8),
    top: ms(7),
    width: ms(6),
    height: ms(6),
    borderRadius: ms(5),
    backgroundColor: "#FF7746",
  },
  weekPicker: {
    alignSelf: "center",
    marginTop: vs(24),
    width: Math.min(SCREEN_WIDTH - ms(28), ms(334)),
    height: vs(45),
    paddingHorizontal: ms(11),
    borderRadius: ms(24),
    borderWidth: 1,
    borderColor: "rgba(180, 75, 85, 0.65)",
    backgroundColor: "rgba(18, 20, 42, 0.76)",
    flexDirection: "row",
    alignItems: "center",
  },
  weekText: {
    flex: 1,
    marginLeft: ms(8),
    marginRight: ms(5),
    color: "#FFD0A0",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(21),
  },
  dateModalOverlay: {
    flex: 1,
    paddingHorizontal: ms(28),
    backgroundColor: "rgba(5, 8, 25, 0.78)",
    alignItems: "center",
    justifyContent: "center",
  },
  dateModalCard: {
    width: "100%",
    maxWidth: ms(340),
    padding: ms(22),
    borderRadius: ms(22),
    borderWidth: 1,
    borderColor: "rgba(255, 167, 111, 0.55)",
    backgroundColor: "#211637",
    gap: vs(12),
  },
  dateModalTitle: {
    color: "#FFD0A0",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(21),
    lineHeight: ms(29),
    textAlign: "center",
  },
  dateModalHelp: {
    color: "rgba(255, 229, 202, 0.66)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(12),
    lineHeight: ms(18),
    textAlign: "center",
  },
  dateFieldGroup: {
    gap: vs(6),
  },
  dateFieldLabel: {
    color: "#FFB26D",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(12),
  },
  dateInput: {
    height: vs(46),
    paddingHorizontal: ms(14),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: "rgba(206, 115, 125, 0.6)",
    backgroundColor: "rgba(12, 14, 34, 0.82)",
    color: "#FFE4BE",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    fontVariant: ["tabular-nums"],
  },
  dateInputError: {
    color: "#FFAAA7",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(12),
    lineHeight: ms(18),
  },
  dateModalActions: {
    paddingTop: vs(4),
    flexDirection: "row",
    gap: ms(9),
  },
  dateCancelButton: {
    flex: 1,
    height: vs(44),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: "rgba(255, 208, 160, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  dateApplyButton: {
    flex: 1,
    height: vs(44),
    borderRadius: ms(12),
    backgroundColor: "#FF9A5D",
    alignItems: "center",
    justifyContent: "center",
  },
  dateCancelText: {
    color: "rgba(255, 228, 190, 0.76)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(14),
  },
  dateApplyText: {
    color: "#211637",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(14),
  },
  carouselWrap: {
    marginTop: vs(22),
    height: vs(500),
  },
  carouselContent: {
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING - CARD_GAP,
    alignItems: "center",
  },
  cardSlot: {
    width: CARD_WIDTH,
    height: vs(484),
    marginRight: CARD_GAP,
  },
  leftEdge: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: ms(72),
  },
  rightEdge: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: ms(72),
  },
  pagination: {
    marginTop: vs(2),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    marginHorizontal: ms(7),
    backgroundColor: "rgba(112, 82, 168, 0.52)",
    borderWidth: 1,
    borderColor: "rgba(143, 111, 204, 0.42)",
  },
  activeDot: {
    backgroundColor: "#FF944A",
    borderColor: "#FFB06F",
  },
  sharedCastingCard: {
    flex: 1,
    overflow: "hidden",
  },
  historyCard: {
    flex: 1,
    borderRadius: ms(14),
    borderWidth: 1,
    borderColor: "#FF8D3F",
    backgroundColor: "#21133A",
    overflow: "hidden",
  },
  sideCard: {
    borderColor: "rgba(255, 141, 63, 0.72)",
  },
  flipCardWrap: {
    flex: 1,
  },
  flipFace: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  flipBackFace: {
    transform: [{ rotateY: "180deg" }],
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(18, 9, 36, 0.18)",
  },
  cardTopNotch: {
    position: "absolute",
    top: -ms(17),
    alignSelf: "center",
    width: ms(53),
    height: ms(34),
    borderBottomLeftRadius: ms(27),
    borderBottomRightRadius: ms(27),
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#FF8D3F",
    backgroundColor: "#050A1C",
    zIndex: 2,
  },
  cardDate: {
    marginTop: vs(28),
    color: "#FCE0BB",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(18),
    lineHeight: ms(27),
    textAlign: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: vs(21),
    right: ms(18),
    width: ms(46),
    height: ms(46),
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  cardGenreLabel: {
    marginTop: vs(11),
    color: "rgba(255, 215, 204, 0.78)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(19),
    letterSpacing: 1.6,
    textAlign: "center",
  },
  cardTitle: {
    marginTop: vs(7),
    color: "#FFE1B9",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(27),
    lineHeight: ms(36),
    textAlign: "center",
  },
  frontInfoPanel: {
    position: "absolute",
    left: ms(13),
    right: ms(13),
    bottom: vs(13),
    paddingHorizontal: ms(13),
    paddingTop: vs(7),
    paddingBottom: vs(10),
    borderRadius: ms(15),
    borderWidth: 1,
    borderColor: "rgba(255, 142, 88, 0.62)",
    backgroundColor: "rgba(35, 21, 42, 0.82)",
  },
  infoRow: {
    minHeight: vs(49),
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 203, 168, 0.19)",
    flexDirection: "row",
    alignItems: "center",
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoTextWrap: {
    flex: 1,
    marginLeft: ms(18),
  },
  infoLabel: {
    color: "#FFB25F",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(19),
  },
  infoText: {
    marginTop: vs(4),
    color: "#FFE4BE",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(12),
    lineHeight: ms(18),
  },
  flipButton: {
    alignSelf: "center",
    marginTop: vs(8),
    width: ms(167),
    height: vs(34),
    borderRadius: ms(17),
    borderWidth: 1,
    borderColor: "#D25F4D",
    backgroundColor: "rgba(89, 35, 49, 0.42)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  flipText: {
    marginRight: ms(16),
    color: "#FFC076",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    lineHeight: ms(22),
  },
  paperCard: {
    paddingHorizontal: ms(23),
    paddingTop: vs(31),
    paddingBottom: vs(14),
    borderColor: "#D88C4F",
    backgroundColor: "#F7ECDD",
  },
  paperTopNotch: {
    position: "absolute",
    top: -ms(17),
    alignSelf: "center",
    width: ms(53),
    height: ms(34),
    borderBottomLeftRadius: ms(27),
    borderBottomRightRadius: ms(27),
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#D88C4F",
    backgroundColor: "#050A1C",
    zIndex: 2,
  },
  paperDate: {
    color: "#8E5B38",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(16),
    lineHeight: ms(23),
    textAlign: "center",
  },
  paperDivider: {
    alignSelf: "center",
    marginTop: vs(8),
    width: ms(73),
    flexDirection: "row",
    alignItems: "center",
  },
  paperLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(148, 103, 70, 0.24)",
  },
  paperStar: {
    marginHorizontal: ms(7),
    color: "#9B6945",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(12),
    lineHeight: ms(16),
  },
  paperTitle: {
    marginTop: vs(13),
    color: "#1F1B18",
    fontFamily: "Mindeulle",
    fontSize: ms(25),
    lineHeight: ms(33),
  },
  paperTitleLine: {
    marginTop: vs(7),
    width: ms(93),
    height: 1,
    backgroundColor: "rgba(112, 82, 52, 0.22)",
  },
  diaryScroll: {
    flex: 1,
    marginTop: vs(14),
  },
  diaryContent: {
    paddingBottom: vs(16),
  },
  diaryText: {
    color: "#201B17",
    fontFamily: "Mindeulle",
    fontSize: ms(14),
    lineHeight: ms(25),
  },
  paperButton: {
    alignSelf: "center",
    marginTop: vs(10),
    width: ms(164),
    height: vs(39),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: "#9E714E",
    alignItems: "center",
    justifyContent: "center",
  },
  paperButtonText: {
    color: "#8A5433",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(17),
    lineHeight: ms(24),
  },
});
