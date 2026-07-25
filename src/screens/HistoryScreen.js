import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = Math.min(Math.max(SCREEN_WIDTH / 393, 0.82), 1.15);
const ms = (value) => value * scale;
const vs = ms;

const CARD_WIDTH = ms(250);
const CARD_GAP = -ms(104);
const SNAP = CARD_WIDTH + CARD_GAP;
const SIDE_PADDING = Math.max((SCREEN_WIDTH - CARD_WIDTH) / 2, ms(32));

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
  {
    date: "2025.05.25",
    day: "일",
    title: "다음 장면의\n작가",
    genre: "Life\nStory",
    emotion: "정리 · 희망 · 담담함",
    line: "내일의 문장은 오늘의 기록에서 시작된다.",
    scene: "한 주를 정리하며 조용히 웃었던 밤",
    liked: false,
  },
];

const DIARY_TEXT =
  "새벽 일찍 눈이 떠졌다.\n창문을 열자 상쾌한 공기가 얼굴을 스쳤다.\n따뜻한 차 한 잔을 내려 천천히 마시며\n오늘 하루를 어떻게 보내고 싶은지 생각해봤다.\n\n오후엔 도서관에 다녀왔다.\n조용한 공간에서 책을 읽으니\n복잡했던 마음이 차분해졌다.\n새로운 문장을 만나면 마음이 환해지는 기분이었다.\n\n저녁엔 오랜만에 친구와 통화를 했다.\n서로의 이야기를 듣고 나니\n다시 힘을 낼 수 있을 것 같았다.\n\n큰 성과는 없었지만,\n작은 순간들이 모여 의미 있는 하루가 된 것 같다.\n\n오늘도 잘 해냈어, 나 자신.\n내일은 더 멋진 하루가 되길. ✦";

export default function HistoryScreen() {
  const [activeIndex, setActiveIndex] = useState(3);
  const [backVisible, setBackVisible] = useState(false);
  const [favoriteDates, setFavoriteDates] = useState(
    () => new Set(HISTORY_RECORDS.filter((record) => record.liked).map((record) => record.date))
  );
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(activeIndex * SNAP)).current;
  const flip = useRef(new Animated.Value(0)).current;

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

  const toggleFavorite = (date) => {
    setFavoriteDates((current) => {
      const next = new Set(current);

      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }

      return next;
    });
  };

  const scrollToIndex = (index) => {
    const nextIndex = Math.max(0, Math.min(index, HISTORY_RECORDS.length - 1));

    setActiveIndex(nextIndex);
    resetCardSide();
    scrollRef.current?.scrollTo({
      x: nextIndex * SNAP,
      animated: true,
    });
  };

  const handleMomentumEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / SNAP);

    setActiveIndex(Math.max(0, Math.min(nextIndex, HISTORY_RECORDS.length - 1)));
    resetCardSide();
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
              <Text style={styles.subtitle}>
                지난간 하루의 기록을 다시 살펴보세요.
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.75} style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={ms(31)} color="#FFB15D" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.weekPicker}>
            <Ionicons name="calendar-outline" size={ms(22)} color="#FFB26D" />
            <Text
              style={styles.weekText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              2025년 05월 18일 ~ 2025년 05월 25일
            </Text>
            <Ionicons name="chevron-down" size={ms(22)} color="#CE737D" />
          </TouchableOpacity>

          <View style={styles.carouselWrap}>
            <Animated.ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SNAP}
              decelerationRate="fast"
              bounces={false}
              contentOffset={{ x: activeIndex * SNAP, y: 0 }}
              contentContainerStyle={styles.carouselContent}
              onMomentumScrollEnd={handleMomentumEnd}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            >
              {HISTORY_RECORDS.map((record, index) => {
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
                  outputRange: [0.58, 1, 0.58],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View
                    key={record.date}
                    style={[
                      styles.cardSlot,
                      {
                        opacity,
                        zIndex: index === activeIndex ? 3 : 1,
                        elevation: index === activeIndex ? 3 : 1,
                        transform: [{ scale }],
                      },
                    ]}
                  >
                    {index === activeIndex ? (
                      <HistoryFlipCard
                        record={record}
                        isFavorite={favoriteDates.has(record.date)}
                        backVisible={backVisible}
                        frontRotate={frontRotate}
                        backRotate={backRotate}
                        onToggleFavorite={() => toggleFavorite(record.date)}
                        onShowBack={showBack}
                        onShowFront={showFront}
                      />
                    ) : (
                      <HistoryCardFront
                        record={record}
                        focused={index === activeIndex}
                        isFavorite={favoriteDates.has(record.date)}
                        onToggleFavorite={() => toggleFavorite(record.date)}
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
            {HISTORY_RECORDS.map((record, index) => (
              <View
                key={`${record.date}-dot`}
                style={[styles.dot, activeIndex === index && styles.activeDot]}
              />
            ))}
          </View>
        </ScrollView>
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
  return (
    <View style={[styles.historyCard, !focused && styles.sideCard]}>
      <Image
        source={require("../../assets/images/home_stage.png")}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardShade} />

      <View style={styles.cardTopNotch} />
      <Text style={styles.cardDate}>{record.date}</Text>
      <TouchableOpacity
        activeOpacity={0.72}
        style={styles.favoriteButton}
        onPress={onToggleFavorite}
      >
        <Ionicons
          name={isFavorite ? "heart" : "heart-outline"}
          size={ms(32)}
          color="#FF6D63"
        />
      </TouchableOpacity>
      <Text style={styles.cardGenreLabel}>TODAY’S GENRE</Text>
      <Text style={styles.cardTitle}>{record.title}</Text>

      <View style={styles.frontInfoPanel}>
        <HistoryInfoRow icon="heart-outline" label="오늘의 감정" text={record.emotion} />
        <HistoryInfoRow icon="pencil-outline" label="오늘의 한줄 기록" text={record.line} />
        <HistoryInfoRow icon="image-outline" label="기억에 남은 장면" text={record.scene} last />

        <TouchableOpacity activeOpacity={0.85} style={styles.flipButton} onPress={onShowBack}>
          <Text style={styles.flipText}>뒷면 보기</Text>
          <Ionicons name="arrow-forward" size={ms(22)} color="#FFB062" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HistoryCardBack({ record, onShowFront }) {
  return (
    <View style={[styles.historyCard, styles.paperCard]}>
      <View style={styles.paperTopNotch} />
      <Text style={styles.paperDate}>
        {record.date} ({record.day})
      </Text>
      <View style={styles.paperDivider}>
        <View style={styles.paperLine} />
        <Text style={styles.paperStar}>✦</Text>
        <View style={styles.paperLine} />
      </View>

      <Text style={styles.paperTitle}>오늘의 기록</Text>
      <View style={styles.paperTitleLine} />

      <ScrollView
        style={styles.diaryScroll}
        contentContainerStyle={styles.diaryContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.diaryText}>{DIARY_TEXT}</Text>
      </ScrollView>

      <TouchableOpacity activeOpacity={0.85} style={styles.paperButton} onPress={onShowFront}>
        <Text style={styles.paperButtonText}>앞면 보기</Text>
      </TouchableOpacity>
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
  safeArea: {
    flex: 1,
  },
  screenScroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: vs(62),
    paddingBottom: vs(142),
  },
  header: {
    paddingHorizontal: ms(49),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerText: {
    flex: 1,
    paddingRight: ms(8),
  },
  title: {
    color: "#FFD4A1",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(29),
    lineHeight: ms(39),
  },
  subtitle: {
    marginTop: vs(8),
    color: "rgba(214, 130, 92, 0.78)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    lineHeight: ms(23),
  },
  bellButton: {
    width: ms(46),
    height: ms(46),
    alignItems: "center",
    justifyContent: "center",
    marginTop: vs(6),
  },
  weekPicker: {
    alignSelf: "center",
    marginTop: vs(24),
    width: ms(324),
    height: vs(45),
    paddingHorizontal: ms(15),
    borderRadius: ms(24),
    borderWidth: 1,
    borderColor: "rgba(180, 75, 85, 0.65)",
    backgroundColor: "rgba(18, 20, 42, 0.76)",
    flexDirection: "row",
    alignItems: "center",
  },
  weekText: {
    flex: 1,
    marginLeft: ms(12),
    marginRight: ms(8),
    color: "#FFD0A0",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(21),
  },
  carouselWrap: {
    marginTop: vs(22),
    height: vs(430),
  },
  carouselContent: {
    paddingHorizontal: SIDE_PADDING,
    alignItems: "center",
  },
  cardSlot: {
    width: CARD_WIDTH,
    height: vs(414),
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
