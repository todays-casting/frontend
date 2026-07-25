import React, { useMemo, useRef, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const scale = Math.min(Math.max(SCREEN_WIDTH / 393, 0.82), 1.15);
const ms = (value) => value * scale;
const vs = ms;

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CALENDAR_DAYS = [
  { day: 27, muted: true },
  { day: 28, muted: true },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 1, mark: "dot" },
  { day: 2 },
  { day: 3 },
  { day: 4, accent: true },
  { day: 5 },
  { day: 6 },
  { day: 7 },
  { day: 8 },
  { day: 9 },
  { day: 10 },
  { day: 11 },
  { day: 12 },
  { day: 13, mark: "dot" },
  { day: 14 },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18, accent: true },
  { day: 19 },
  { day: 20 },
  { day: 21, selected: true },
  { day: 22 },
  { day: 23 },
  { day: 24 },
  { day: 25, accent: true },
  { day: 26 },
  { day: 27, mark: "dot" },
  { day: 28 },
  { day: 29 },
  { day: 30, mark: "dot" },
  { day: 31 },
];

const RECORD = {
  date: "2025.05.21",
  title: "첫사랑\n여주인공",
  genre: "로맨스 드라마",
  role: "첫사랑 여주인공",
  scene: "노을이 지는 창가에서\n서로의 마음을 확인하고 미소를 보낸 순간",
  line: "작은 응원이 누군가의 하루를\n바꿀 수 있다는 걸 기억하자.",
  diary:
    "오늘은 작은 말 한마디가 오래 마음에 남은 하루였다. 창밖으로 번지는 노을을 보면서 나도 누군가에게 다정한 장면으로 기억되고 싶다고 생각했다. 서두르지 않아도 괜찮고, 오늘의 마음을 있는 그대로 적어두는 것만으로도 충분히 나다운 기록이 된다.",
};

export default function CalendarScreen() {
  const [selectedDay, setSelectedDay] = useState(null);
  const [isBack, setIsBack] = useState(false);
  const [favoriteDays, setFavoriteDays] = useState(() => new Set([4, 6, 9, 16]));
  const flip = useRef(new Animated.Value(0)).current;

  const frontRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flip.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  const openRecord = (day) => {
    if (day.muted) {
      return;
    }

    setSelectedDay(day.day);
    setIsBack(false);
    flip.setValue(0);
  };

  const closeRecord = () => {
    setSelectedDay(null);
    setIsBack(false);
    flip.setValue(0);
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

  const markedDate = useMemo(() => selectedDay || 21, [selectedDay]);
  const isSelectedFavorite = selectedDay !== null && favoriteDays.has(selectedDay);

  const toggleFavorite = () => {
    if (selectedDay === null) {
      return;
    }

    setFavoriteDays((current) => {
      const next = new Set(current);

      if (next.has(selectedDay)) {
        next.delete(selectedDay);
      } else {
        next.add(selectedDay);
      }

      return next;
    });
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
        <ScrollView
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>안녕하세요, 서연님 👋</Text>
              <Text style={styles.subGreeting}>
                하루를 기록하고, 나의 이야기를 쌓아보세요
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.8} style={styles.writeButton}>
              <Ionicons name="add" size={ms(20)} color="#FFD099" />
              <Text style={styles.writeButtonText}>기록하기</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.screenTitle}>나의 기록 달력</Text>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Ionicons name="chevron-back" size={ms(28)} color="#E0B487" />
              <Text style={styles.monthText}>2025년 5월</Text>
              <Ionicons name="chevron-forward" size={ms(28)} color="#E0B487" />
              <TouchableOpacity activeOpacity={0.75} style={styles.smallCalendar}>
                <Ionicons name="calendar-outline" size={ms(21)} color="#FFD09A" />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {DAYS.map((day) => (
                <Text key={day} style={styles.weekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.monthDivider} />

            <View style={styles.daysGrid}>
              {CALENDAR_DAYS.map((date, index) => (
                <TouchableOpacity
                  key={`${date.day}-${index}`}
                  activeOpacity={0.75}
                  style={styles.dayCell}
                  onPress={() => openRecord(date)}
                >
                  <View
                    style={
                      date.day === markedDate && !date.muted
                        ? styles.selectedDate
                        : null
                    }
                  >
                    <Text
                      style={[
                        styles.dayText,
                        date.muted && styles.mutedDay,
                        date.accent && styles.accentDay,
                        date.day === markedDate &&
                          !date.muted &&
                          styles.selectedDayText,
                      ]}
                    >
                      {date.day}
                    </Text>
                  </View>
                  {favoriteDays.has(date.day) && !date.muted && (
                    <Ionicons name="heart" size={ms(11)} color="#FF514F" />
                  )}
                  {date.mark === "dot" && <View style={styles.dayDot} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.quoteCard}>
            <View style={styles.quoteDate}>
              <Text style={styles.quoteDateText}>5.21</Text>
              <Text style={styles.quoteWeekText}>수요일</Text>
            </View>
            <View style={styles.quoteDivider} />
            <Text style={styles.quoteText}>
              “{"\n"}따뜻한 마음과 깊은 공감으로{"\n"}사랑을 만들어가는 당신
              {"\n"}”
            </Text>
            <Image
              source={require("../../assets/images/home_stage.png")}
              style={styles.quoteImage}
              resizeMode="cover"
            />
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
                onPress={() => openRecord({ day: 21 })}
              >
                <Text style={styles.recordButtonText}>
                  오늘의 기록 보기 / 작성하기
                </Text>
                <Ionicons name="chevron-forward" size={ms(21)} color="#FFD09A" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={selectedDay !== null} transparent animationType="fade">
        <View style={styles.modalLayer}>
          <TouchableOpacity style={styles.dimmedArea} onPress={closeRecord} />

          <View style={styles.sheet}>
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
                  date={markedDate}
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
                <CastingCardBack date={markedDate} onFlip={toggleCardSide} />
              </Animated.View>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

function CastingCardFront({ date, isFavorite, onToggleFavorite, onFlip }) {
  return (
    <>
      <Image
        source={require("../../assets/images/home_stage.png")}
        style={styles.posterImage}
        resizeMode="cover"
      />
      <View style={styles.posterOverlay} />

      <Text style={styles.posterDate}>2025.05.{String(date).padStart(2, "0")}</Text>
      <Text style={styles.posterLabel}>TODAY’S CASTING</Text>
      <Text style={styles.posterTitle}>{RECORD.title}</Text>
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

      <View style={styles.infoPanel}>
        <InfoRow icon="movie-open-outline" label="오늘의 장르" text={RECORD.genre} />
        <InfoRow icon="account-outline" label="오늘의 배역" text={RECORD.role} />
        <InfoRow icon="image-outline" label="기억에 남은 장면" text={RECORD.scene} />
        <InfoRow icon="star-four-points-outline" label="오늘의 한줄 기록" text={`“${RECORD.line}”`} last />

        <TouchableOpacity activeOpacity={0.82} style={styles.flipButton} onPress={onFlip}>
          <Text style={styles.flipButtonText}>뒷면 보기</Text>
          <Ionicons name="arrow-forward" size={ms(22)} color="#FF8D4C" />
        </TouchableOpacity>
      </View>
    </>
  );
}

function CastingCardBack({ date, onFlip }) {
  return (
    <View style={styles.cardBackInner}>
      <Text style={styles.paperDate}>2025.05.{String(date).padStart(2, "0")}</Text>
      <View style={styles.paperDivider}>
        <View style={styles.paperLine} />
        <Text style={styles.paperStar}>✦</Text>
        <View style={styles.paperLine} />
      </View>
      <Text style={styles.backTitle}>오늘의 기록</Text>
      <View style={styles.titleUnderline} />

      <ScrollView
        style={styles.diaryScroll}
        contentContainerStyle={styles.diaryContent}
        showsVerticalScrollIndicator
      >
        <Text style={styles.diaryText}>{RECORD.diary}</Text>
      </ScrollView>

      <View style={styles.bottomPaperDivider}>
        <View style={styles.paperLine} />
        <Text style={styles.paperStar}>✦</Text>
        <View style={styles.paperLine} />
      </View>

      <TouchableOpacity activeOpacity={0.82} style={styles.paperFlipButton} onPress={onFlip}>
        <Text style={styles.flipButtonText}>앞면 보기</Text>
        <Ionicons name="arrow-forward" size={ms(22)} color="#FF8D4C" />
      </TouchableOpacity>
    </View>
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
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: ms(18),
    paddingTop: vs(41),
    paddingBottom: vs(156),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerText: {
    flex: 1,
    paddingRight: ms(10),
  },
  greeting: {
    color: "#D8AD7B",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(18),
    lineHeight: ms(27),
  },
  subGreeting: {
    marginTop: vs(4),
    color: "rgba(219, 160, 174, 0.72)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(12),
    lineHeight: ms(20),
  },
  writeButton: {
    minWidth: ms(86),
    height: vs(34),
    paddingHorizontal: ms(12),
    borderRadius: ms(17),
    borderWidth: 1,
    borderColor: "rgba(255, 83, 80, 0.72)",
    backgroundColor: "rgba(103, 28, 45, 0.62)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  writeButtonText: {
    marginLeft: ms(3),
    color: "#EBC08F",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(18),
  },
  screenTitle: {
    marginTop: vs(25),
    color: "#D9B184",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(36),
    lineHeight: ms(48),
  },
  calendarCard: {
    marginTop: vs(16),
    paddingHorizontal: ms(15),
    paddingTop: vs(19),
    paddingBottom: vs(15),
    borderRadius: ms(19),
    borderWidth: 1,
    borderColor: "rgba(225, 78, 105, 0.72)",
    backgroundColor: "rgba(31, 13, 52, 0.87)",
    overflow: "hidden",
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
    fontFamily: "NanumSquareNeo",
    fontSize: ms(19),
    lineHeight: ms(27),
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
  weekRow: {
    marginTop: vs(20),
    flexDirection: "row",
  },
  weekText: {
    width: `${100 / 7}%`,
    color: "#C79980",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(20),
    textAlign: "center",
  },
  monthDivider: {
    marginTop: vs(8),
    height: 1,
    backgroundColor: "rgba(255, 214, 182, 0.14)",
  },
  daysGrid: {
    marginTop: vs(8),
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: vs(38),
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDate: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(17),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6841",
    shadowColor: "#FF6841",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.72,
    shadowRadius: 12,
    elevation: 12,
  },
  dayText: {
    color: "#EDD8BA",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    lineHeight: ms(21),
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
    width: ms(5),
    height: ms(5),
    borderRadius: ms(2.5),
    backgroundColor: "#FF843D",
    marginTop: vs(1),
  },
  quoteCard: {
    marginTop: vs(14),
    height: vs(102),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "rgba(221, 72, 91, 0.64)",
    backgroundColor: "rgba(58, 18, 46, 0.62)",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  quoteImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.55,
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
    fontFamily: "NanumSquareNeo",
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
    fontSize: ms(13),
    lineHeight: ms(23),
    zIndex: 1,
  },
  recordCard: {
    marginTop: vs(14),
    minHeight: vs(124),
    padding: ms(12),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: "rgba(221, 72, 91, 0.64)",
    backgroundColor: "rgba(28, 13, 45, 0.82)",
    flexDirection: "row",
  },
  recordImage: {
    width: ms(112),
    height: vs(100),
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
    fontSize: ms(13),
    lineHeight: ms(19),
  },
  recordQuestion: {
    marginTop: vs(6),
    color: "#F6D8B7",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(20),
  },
  recordHelp: {
    marginTop: vs(2),
    color: "rgba(255, 230, 211, 0.62)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(17),
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
    fontSize: ms(12),
    lineHeight: ms(17),
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
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: "#F06437",
    backgroundColor: "#1F1234",
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  frontCard: {},
  backCard: {
    transform: [{ rotateY: "180deg" }],
  },
  posterImage: {
    ...StyleSheet.absoluteFillObject,
  },
  posterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(31, 8, 43, 0.22)",
  },
  posterDate: {
    marginTop: vs(28),
    color: "#F6D5A9",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(15),
    lineHeight: ms(22),
    textAlign: "center",
  },
  posterLabel: {
    marginTop: vs(4),
    color: "#EAC6AE",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(8),
    lineHeight: ms(13),
    letterSpacing: 1.7,
    textAlign: "center",
  },
  posterTitle: {
    marginTop: vs(8),
    color: "#FFE0AE",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(25),
    lineHeight: ms(36),
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
    fontSize: ms(10),
    lineHeight: ms(15),
  },
  infoText: {
    color: "#F7DABD",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(10),
    lineHeight: ms(16),
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
    fontSize: ms(12),
    lineHeight: ms(17),
  },
  cardBackInner: {
    flex: 1,
    paddingHorizontal: ms(24),
    paddingTop: vs(39),
    paddingBottom: vs(17),
    backgroundColor: "#F4E9D9",
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
    marginTop: vs(20),
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
  diaryScroll: {
    flex: 1,
    marginTop: vs(17),
    marginRight: ms(-10),
    paddingRight: ms(10),
  },
  diaryContent: {
    paddingRight: ms(12),
    paddingBottom: vs(16),
  },
  diaryText: {
    color: "#2F2925",
    fontFamily: "Mindeulle",
    fontSize: ms(14),
    lineHeight: ms(26),
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
});
