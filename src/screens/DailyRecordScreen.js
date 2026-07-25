import React, { useMemo, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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

const PAGE_PADDING = ms(23);
const CONTENT_WIDTH = SCREEN_WIDTH - PAGE_PADDING * 2;
const TILE_GAP = ms(9);
const TILE_WIDTH = (CONTENT_WIDTH - TILE_GAP * 5) / 6;
const TILE_HEIGHT = vs(67);
const CTA_BOTTOM = vs(124);
const CUSTOM_LIMIT = 10;

const COPY = {
  title: "\uD558\uB8E8 \uD65C\uB3D9 \uC785\uB825",
  save: "\uC784\uC2DC\uC800\uC7A5",
  prompt: "\uC624\uB298\uC740 \uC5B4\uB5A4 \uC774\uC57C\uAE30\uAC00 \uB2F9\uC2E0\uC758 \uD558\uB8E8\uB97C \uCC44\uC6E0\uB098\uC694?",
  placeholder:
    "\uC624\uB298 \uD558\uB8E8\uC758 \uC0DD\uAC01, \uC21C\uAC04, \uAC10\uC815\uC744 \uC790\uC720\uB86D\uAC8C\n\uAE30\uB85D\uD574\uBCF4\uC138\uC694...",
  emotions: "\uC624\uB298\uC758 \uAC10\uC815",
  keywords: "\uD0A4\uC6CC\uB4DC \uC120\uD0DD",
  mood: "\uBD84\uC704\uAE30",
  optional: "\uC120\uD0DD",
  cta: "\uCE90\uC2A4\uD305 \uACB0\uACFC \uBC1B\uAE30",
  customPlaceholder: "\uCD5C\uB300 10\uC790\uB85C \uC785\uB825\uD574\uC8FC\uC138\uC694",
};

const EMOTIONS = [
  { icon: require("../../assets/images/daily-record-icons/emotion-heart.png"), label: "\uC124\uB818" },
  { icon: require("../../assets/images/daily-record-icons/emotion-happy.png"), label: "\uD589\uBCF5" },
  { icon: require("../../assets/images/daily-record-icons/emotion-calm.png"), label: "\uD3C9\uC628" },
  { icon: require("../../assets/images/daily-record-icons/emotion-rain.png"), label: "\uC6B0\uC6B8" },
  { icon: require("../../assets/images/daily-record-icons/emotion-moon.png"), label: "\uC9C0\uCE68" },
  { icon: require("../../assets/images/daily-record-icons/emotion-star.png"), label: "\uAE30\uD0C0" },
];

const KEYWORDS = [
  { icon: require("../../assets/images/daily-record-icons/keyword-romance.png"), label: "\uB85C\uB9E8\uC2A4" },
  { icon: require("../../assets/images/daily-record-icons/keyword-drama.png"), label: "\uB4DC\uB77C\uB9C8" },
  { icon: require("../../assets/images/daily-record-icons/keyword-growth.png"), label: "\uC131\uC7A5" },
  { icon: require("../../assets/images/daily-record-icons/keyword-friendship.png"), label: "\uC6B0\uC815" },
  { icon: require("../../assets/images/daily-record-icons/keyword-family.png"), label: "\uAC00\uC871" },
  { icon: require("../../assets/images/daily-record-icons/keyword-daily.png"), label: "\uC77C\uC0C1" },
  { icon: require("../../assets/images/daily-record-icons/keyword-healing.png"), label: "\uD790\uB9C1" },
  { icon: require("../../assets/images/daily-record-icons/keyword-memory.png"), label: "\uCD94\uC5B5" },
  { icon: require("../../assets/images/daily-record-icons/keyword-challenge.png"), label: "\uB3C4\uC804" },
  { icon: require("../../assets/images/daily-record-icons/keyword-travel.png"), label: "\uC5EC\uD589" },
  { icon: require("../../assets/images/daily-record-icons/keyword-other.png"), label: "\uAE30\uD0C0" },
];

const MOODS = [
  { icon: require("../../assets/images/daily-record-icons/mood-warm.png"), label: "\uB530\uB73B\uD574\uC694" },
  { icon: require("../../assets/images/daily-record-icons/mood-excited.png"), label: "\uC124\uB808\uC5B4\uC694" },
  { icon: require("../../assets/images/daily-record-icons/mood-calm.png"), label: "\uC794\uC794\uD574\uC694" },
  { icon: require("../../assets/images/daily-record-icons/mood-sad.png"), label: "\uC2AC\uD37C\uC694" },
  { icon: require("../../assets/images/daily-record-icons/mood-fun.png"), label: "\uC2E0\uB098\uC694" },
  { icon: require("../../assets/images/daily-record-icons/mood-other.png"), label: "\uAE30\uD0C0" },
];

export default function DailyRecordScreen({ navigation }) {
  const [diary, setDiary] = useState("");
  const [emotion, setEmotion] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [mood, setMood] = useState("");
  const [customEmotion, setCustomEmotion] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [dialog, setDialog] = useState(null);

  const count = useMemo(() => diary.length, [diary]);

  const toggleListItem = (setter) => (label) => {
    setter((current) => {
      if (current.includes(label)) {
        return current.filter((item) => item !== label);
      }

      return [...current, label];
    });
  };

  const toggleMood = (label) => {
    setMood((current) => (current === label ? "" : label));
  };

  const showDialog = (message) => {
    setDialog({ message });
  };

  const handleSave = () => {
    showDialog("\uC784\uC2DC\uC800\uC7A5 \uB418\uC5C8\uC2B5\uB2C8\uB2E4");
  };

  const startAnalysis = () => {
    if (!diary.trim()) {
      showDialog("\uC624\uB298\uC758 \uAE30\uB85D\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694!");
      return;
    }

    const rootNavigation = navigation.getParent?.();

    if (rootNavigation) {
      rootNavigation.navigate("AnalysisLoading");
      return;
    }

    navigation.navigate("AnalysisLoading");
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentFrame}>
            <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.74}
              style={styles.headerIconButton}
              onPress={() => navigation?.navigate?.("Home")}
            >
              <Ionicons name="chevron-back" size={ms(30)} color="#FFB36B" />
            </TouchableOpacity>

            <Text style={styles.title}>{COPY.title}</Text>

            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>{COPY.save}</Text>
            </TouchableOpacity>
            </View>

            <View style={styles.promptRow}>
            <Text style={styles.promptSparkle}>{"\u2726"}</Text>
            <Text style={styles.promptText}>{COPY.prompt}</Text>
            <Text style={styles.promptCurl}>{"\u223F"}</Text>
            </View>

            <ImageBackground
            source={require("../../assets/images/inputbox_background.png")}
            style={styles.diaryBox}
            imageStyle={styles.diaryImage}
            resizeMode="cover"
          >
            <View style={styles.diaryShade} />
            <TextInput
              value={diary}
              onChangeText={(value) => setDiary(value.slice(0, 800))}
              placeholder={COPY.placeholder}
              placeholderTextColor="rgba(242, 214, 218, 0.48)"
              multiline
              textAlignVertical="top"
              style={styles.diaryInput}
            />
            <Text style={styles.counter}>{count} / 800</Text>
            </ImageBackground>

            <ChoiceSection
            title={COPY.emotions}
            hint={COPY.optional}
            items={EMOTIONS}
            selected={emotion}
            onSelect={toggleListItem(setEmotion)}
            customValue={customEmotion}
            onCustomChange={setCustomEmotion}
            customPlaceholder={COPY.customPlaceholder}
            tile
            />

            <ChoiceSection
            title={COPY.keywords}
            hint={COPY.optional}
            items={KEYWORDS}
            selected={keywords}
            onSelect={toggleListItem(setKeywords)}
            customValue={customKeyword}
            onCustomChange={setCustomKeyword}
            customPlaceholder={COPY.customPlaceholder}
            />

            <ChoiceSection
            title={COPY.mood}
            hint={COPY.optional}
            items={MOODS}
            selected={mood}
            onSelect={toggleMood}
            customValue={customMood}
            onCustomChange={setCustomMood}
            customPlaceholder={COPY.customPlaceholder}
            tile
            />

            <View style={styles.bottomDivider}>
              <View style={styles.dottedLine} />
              <Text style={styles.dividerStar}>{"\u2726"}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.fixedCtaWrap} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.ctaButton}
            onPress={startAnalysis}
          >
            <Text style={styles.ctaSparkle}>{"\u2726"}</Text>
            <MaterialCommunityIcons name="movie-open" size={ms(23)} color="#FFFFFF" />
            <Text style={styles.ctaText}>{COPY.cta}</Text>
            <Text style={styles.ctaSparkle}>{"\u2726"}</Text>
          </TouchableOpacity>
        </View>

        <RecordDialog
          visible={!!dialog}
          message={dialog?.message}
          onClose={() => setDialog(null)}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

function RecordDialog({ visible, message, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogSparkle}>{"\u2726"}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.dialogButton}
            onPress={onClose}
          >
            <Text style={styles.dialogButtonText}>{"\uD655\uC778"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function ChoiceSection({
  title,
  hint,
  items,
  selected,
  onSelect,
  customValue,
  onCustomChange,
  customPlaceholder,
  tile,
}) {
  const customSelected = Array.isArray(selected)
    ? selected.includes("\uAE30\uD0C0")
    : selected === "\uAE30\uD0C0";

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionStar}>{"\u2726"}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        {hint && <Text style={styles.sectionHint}>({hint})</Text>}
      </View>

      <View style={[styles.choiceWrap, tile && styles.tileWrap]}>
        {items.map((item) => {
          const active = Array.isArray(selected)
            ? selected.includes(item.label)
            : selected === item.label;

          return (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.78}
              style={[
                tile ? styles.tileChoice : styles.chipChoice,
                active && styles.activeChoice,
              ]}
              onPress={() => onSelect(item.label)}
            >
              <Image
                source={item.icon}
                style={tile ? styles.tileIconImage : styles.chipIconImage}
                resizeMode="contain"
              />
              <Text style={[styles.choiceText, active && styles.activeChoiceText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {customSelected && (
        <View style={styles.customInputBox}>
          <MaterialCommunityIcons
            name="pencil-outline"
            size={ms(18)}
            color="#FFB36B"
          />
          <TextInput
            value={customValue}
            onChangeText={(value) => onCustomChange(value.slice(0, CUSTOM_LIMIT))}
            placeholder={customPlaceholder}
            placeholderTextColor="rgba(255, 225, 205, 0.45)"
            maxLength={CUSTOM_LIMIT}
            style={styles.customInput}
          />
          <Text style={styles.customCounter}>
            {customValue.length}/{CUSTOM_LIMIT}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#060A1D",
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: vs(45),
    paddingBottom: CTA_BOTTOM + vs(112),
  },
  contentFrame: {
    width: "100%",
  },
  header: {
    height: vs(39),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconButton: {
    width: ms(38),
    height: vs(39),
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    color: "#F5D7B1",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(20),
    lineHeight: ms(29),
  },
  saveButton: {
    width: ms(75),
    height: vs(39),
    alignItems: "flex-end",
    justifyContent: "center",
  },
  saveText: {
    color: "#FF9F52",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    lineHeight: ms(22),
  },
  promptRow: {
    marginTop: vs(22),
    flexDirection: "row",
    alignItems: "center",
  },
  promptSparkle: {
    width: ms(28),
    color: "#FFAD62",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(28),
    lineHeight: ms(31),
  },
  promptText: {
    flex: 1,
    color: "#FF9F52",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    lineHeight: ms(24),
    textAlign: "center",
  },
  promptCurl: {
    width: ms(43),
    color: "#C56A51",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(27),
    lineHeight: ms(30),
    textAlign: "right",
  },
  diaryBox: {
    marginTop: vs(18),
    height: Math.min(vs(248), SCREEN_HEIGHT * 0.34),
    borderRadius: ms(17),
    borderWidth: 1,
    borderColor: "#E18C4C",
    overflow: "hidden",
  },
  diaryImage: {
    opacity: 0.82,
  },
  diaryShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16, 9, 39, 0.34)",
  },
  diaryInput: {
    flex: 1,
    paddingHorizontal: ms(22),
    paddingTop: vs(22),
    paddingBottom: vs(42),
    color: "#FFF0D9",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    lineHeight: ms(27),
    zIndex: 1,
  },
  counter: {
    position: "absolute",
    right: ms(17),
    bottom: vs(12),
    color: "rgba(255, 235, 222, 0.62)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(19),
  },
  section: {
    marginTop: vs(18),
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionStar: {
    color: "#FFB36B",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(18),
    lineHeight: ms(22),
  },
  sectionTitle: {
    marginLeft: ms(7),
    color: "#F7D6AC",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(16),
    lineHeight: ms(24),
  },
  sectionHint: {
    marginLeft: ms(5),
    color: "rgba(255, 225, 205, 0.54)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(17),
  },
  choiceWrap: {
    marginTop: vs(10),
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tileWrap: {
    columnGap: TILE_GAP,
    rowGap: vs(10),
  },
  tileChoice: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: ms(11),
    borderWidth: 1,
    borderColor: "rgba(118, 71, 148, 0.62)",
    backgroundColor: "rgba(34, 21, 56, 0.86)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipChoice: {
    minWidth: ms(78),
    height: vs(36),
    marginRight: ms(8),
    marginBottom: vs(9),
    paddingHorizontal: ms(12),
    borderRadius: ms(11),
    borderWidth: 1,
    borderColor: "rgba(118, 71, 148, 0.62)",
    backgroundColor: "rgba(34, 21, 56, 0.86)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  activeChoice: {
    borderColor: "#FF985C",
    backgroundColor: "rgba(104, 42, 70, 0.76)",
  },
  tileIconImage: {
    width: ms(37),
    height: ms(37),
  },
  chipIconImage: {
    width: ms(20),
    height: ms(20),
  },
  choiceText: {
    marginTop: vs(5),
    color: "#F1D7C7",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(12),
    lineHeight: ms(17),
    textAlign: "center",
  },
  activeChoiceText: {
    color: "#FFE2BC",
  },
  customInputBox: {
    height: vs(42),
    marginTop: vs(8),
    paddingHorizontal: ms(13),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: "rgba(255, 152, 92, 0.62)",
    backgroundColor: "rgba(30, 18, 49, 0.88)",
    flexDirection: "row",
    alignItems: "center",
  },
  customInput: {
    flex: 1,
    marginLeft: ms(8),
    color: "#FFE8C8",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(13),
    lineHeight: ms(19),
  },
  customCounter: {
    marginLeft: ms(8),
    color: "rgba(255, 225, 205, 0.56)",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(11),
    lineHeight: ms(17),
  },
  bottomDivider: {
    marginTop: vs(16),
    height: vs(22),
    justifyContent: "center",
  },
  dottedLine: {
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255, 204, 176, 0.22)",
  },
  dividerStar: {
    position: "absolute",
    alignSelf: "center",
    paddingHorizontal: ms(12),
    color: "#FFD09D",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(18),
    backgroundColor: "transparent",
  },
  fixedCtaWrap: {
    position: "absolute",
    left: PAGE_PADDING,
    right: PAGE_PADDING,
    bottom: CTA_BOTTOM,
    zIndex: 80,
    elevation: 80,
  },
  ctaButton: {
    height: vs(56),
    borderRadius: ms(28),
    backgroundColor: "#F56643",
    borderWidth: 1,
    borderColor: "rgba(255, 197, 159, 0.75)",
    shadowColor: "#FF6A45",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.46,
    shadowRadius: 16,
    elevation: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ms(23),
  },
  ctaText: {
    flex: 1,
    marginHorizontal: ms(10),
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(18),
    lineHeight: ms(26),
    textAlign: "center",
  },
  ctaSparkle: {
    color: "#FFE2B7",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(18),
    lineHeight: ms(20),
  },
  dialogOverlay: {
    flex: 1,
    paddingHorizontal: PAGE_PADDING,
    backgroundColor: "rgba(4, 6, 18, 0.68)",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogCard: {
    width: "100%",
    maxWidth: ms(330),
    minHeight: vs(178),
    borderRadius: ms(20),
    borderWidth: 1,
    borderColor: "rgba(255, 163, 99, 0.76)",
    backgroundColor: "rgba(26, 14, 45, 0.96)",
    paddingHorizontal: ms(24),
    paddingTop: vs(24),
    paddingBottom: vs(18),
    alignItems: "center",
    shadowColor: "#FF8C55",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 18,
  },
  dialogSparkle: {
    color: "#FFB36B",
    fontFamily: "MaruBuriSemiBold",
    fontSize: ms(23),
    lineHeight: ms(28),
  },
  dialogMessage: {
    marginTop: vs(10),
    color: "#FFE0BE",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(17),
    lineHeight: ms(26),
    textAlign: "center",
  },
  dialogButton: {
    width: "100%",
    height: vs(46),
    marginTop: vs(22),
    borderRadius: ms(23),
    backgroundColor: "#F56643",
    alignItems: "center",
    justifyContent: "center",
  },
  dialogButtonText: {
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: ms(15),
    lineHeight: ms(22),
  },
});
