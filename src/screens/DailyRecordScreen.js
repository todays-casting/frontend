import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getTodayDateKey,
  getTodayRecordState,
  setResultNoticeHidden,
  setTodayResultReady,
  subscribeTodayRecordState,
} from "../services/todayRecordState";
import recordsApi from "../api/records-api";
import castingsApi from "../api/castings-api";

const CUSTOM_LIMIT = 10;

const COPY = {
  title: "하루 활동 입력",
  save: "임시저장",
  prompt: "오늘은 어떤 이야기가 당신의 하루를 채웠나요?",
  placeholder:
    "오늘 하루의 생각, 순간, 감정을 자유롭게\n기록해보세요...",
  emotions: "오늘의 감정",
  keywords: "키워드 선택",
  mood: "분위기",
  optional: "선택",
  cta: "캐스팅 결과 받기",
  customPlaceholder: "최대 10자로 입력해주세요",
};

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

const EMOTIONS = [
  { icon: require("../../assets/images/daily-record-icons/emotion-heart.png"), label: "설렘" },
  { icon: require("../../assets/images/daily-record-icons/emotion-happy.png"), label: "행복" },
  { icon: require("../../assets/images/daily-record-icons/emotion-calm.png"), label: "평온" },
  { icon: require("../../assets/images/daily-record-icons/emotion-rain.png"), label: "우울" },
  { icon: require("../../assets/images/daily-record-icons/emotion-moon.png"), label: "지침" },
  { icon: require("../../assets/images/daily-record-icons/keyword-other.png"), label: "기타" },
];

const KEYWORDS = [
  { icon: require("../../assets/images/daily-record-icons/keyword-romance.png"), label: "로맨스" },
  { icon: require("../../assets/images/daily-record-icons/keyword-drama.png"), label: "드라마" },
  { icon: require("../../assets/images/daily-record-icons/keyword-growth.png"), label: "성장" },
  { icon: require("../../assets/images/daily-record-icons/keyword-friendship.png"), label: "우정" },
  { icon: require("../../assets/images/daily-record-icons/keyword-family.png"), label: "가족" },
  { icon: require("../../assets/images/daily-record-icons/keyword-daily.png"), label: "일상" },
  { icon: require("../../assets/images/daily-record-icons/keyword-healing.png"), label: "힐링" },
  { icon: require("../../assets/images/daily-record-icons/keyword-memory.png"), label: "추억" },
  { icon: require("../../assets/images/daily-record-icons/keyword-challenge.png"), label: "도전" },
  { icon: require("../../assets/images/daily-record-icons/keyword-travel.png"), label: "여행" },
  { icon: require("../../assets/images/daily-record-icons/keyword-other.png"), label: "기타" },
];

const MOODS = [
  { icon: require("../../assets/images/daily-record-icons/mood-warm.png"), label: "따뜻해요" },
  { icon: require("../../assets/images/daily-record-icons/mood-excited.png"), label: "설레어요" },
  { icon: require("../../assets/images/daily-record-icons/mood-calm.png"), label: "잔잔해요" },
  { icon: require("../../assets/images/daily-record-icons/mood-sad.png"), label: "슬퍼요" },
  { icon: require("../../assets/images/daily-record-icons/mood-fun.png"), label: "신나요" },
  { icon: require("../../assets/images/daily-record-icons/keyword-other.png"), label: "기타" },
];

export default function DailyRecordScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { styles, sizes } = createStyles(width, height, insets);

  const [diary, setDiary] = useState("");
  const [emotion, setEmotion] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [mood, setMood] = useState("");
  const [customEmotion, setCustomEmotion] = useState("");
  const [customKeyword, setCustomKeyword] = useState("");
  const [customMood, setCustomMood] = useState("");
  const [dialog, setDialog] = useState(null);
  const [resultReady, setResultReady] = useState(
    () => getTodayRecordState().resultReady
  );
  const [resultNoticeHidden, setLocalResultNoticeHidden] = useState(
    () => getTodayRecordState().resultNoticeHidden
  );
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [skipConfirmNextTime, setSkipConfirmNextTime] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const count = useMemo(() => diary.length, [diary]);

  useEffect(() => {
    return subscribeTodayRecordState((nextState) => {
      setResultReady(nextState.resultReady);
      setLocalResultNoticeHidden(nextState.resultNoticeHidden);
    });
  }, []);

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
    showDialog("임시저장 되었습니다");
  };

  const goAnalysisLoading = () => {
    const rootNavigation = findNavigationWithRoute(navigation, "AnalysisLoading");

    if (rootNavigation) {
      rootNavigation.navigate("AnalysisLoading");
      return;
    }

    navigation.navigate("AnalysisLoading");
  };

  const confirmAnalysis = () => {
    if (skipConfirmNextTime) {
      setResultNoticeHidden(true);
    }

    setConfirmVisible(false);
    goAnalysisLoading();
  };

  const startAnalysis = async () => {
    const rootNavigation = findNavigationWithRoute(navigation, "Main");

    if (resultReady) {
      try {
        const status = await recordsApi.getTodayStatus();
        const recordId =
          status?.dailyRecordId ??
          status?.recordId ??
          status?.record?.id ??
          status?.dailyRecord?.id ??
          status?.id;

        if (status?.screen === "RESULT" && recordId) {
          const casting = await castingsApi.getCastingByRecordId(recordId);
          const result = normalizeCastingResultForApi(casting, recordId);

          setTodayResultReady(true, result);
          navigateResultForApi(recordId, result);
          return;
        }

        if (status?.screen === "WAITING") {
          goAnalysisLoadingForApi(recordId);
          return;
        }
      } catch (error) {
        console.warn("Failed to open existing result:", error);
      }

      if (rootNavigation) {
        rootNavigation.navigate("Main", {
          screen: "Result",
          params: {
            result: getTodayRecordState().resultData,
          },
        });
        return;
      }

      navigation.navigate("Result", {
        result: getTodayRecordState().resultData,
      });
      return;
    }

    if (!diary.trim()) {
      showDialog("오늘의 기록을 작성해주세요!");
      return;
    }

    if (!resultNoticeHidden) {
      setConfirmVisible(true);
      return;
    }

    goAnalysisLoading();
  };

  const buildTagListForApi = (selected, customValue) => {
    const selectedValues = Array.isArray(selected)
      ? selected
      : selected
        ? [selected]
        : [];
    const custom = customValue.trim();

    return [...selectedValues, custom]
      .filter(Boolean)
      .map((value) => value.slice(0, CUSTOM_LIMIT));
  };

  const buildRecordPayloadForApi = (status) => ({
    recordDate: getTodayDateKey(),
    content: diary.trim(),
    mood: buildTagListForApi(emotion, customEmotion),
    moodTags: buildTagListForApi(mood, customMood).slice(0, 1),
    activityTags: buildTagListForApi(keywords, customKeyword),
    status,
  });

  const saveRecordForApi = async (status) => {
    if (savingRef.current) {
      return null;
    }

    if (!diary.trim()) {
      showDialog("\uC624\uB298 \uAE30\uB85D\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694!");
      return null;
    }

    const payload = buildRecordPayloadForApi(status);

    savingRef.current = true;
    setSaving(true);
    try {
      const savedRecord = await recordsApi.createRecord(payload);

      if (savedRecord?.id) {
        return savedRecord;
      }

      return (await recordsApi.getRecordByDate(payload.recordDate)) ?? savedRecord;
    } catch (error) {
      if (error?.response?.status === 409) {
        try {
          const existingRecord = await recordsApi.getRecordByDate(payload.recordDate);

          if (existingRecord?.id) {
            return await recordsApi.updateRecord(existingRecord.id, payload);
          }
        } catch (recoveryError) {
          error = recoveryError;
        }
      }

      console.warn("Failed to save daily record:", error);
      showDialog(
        error?.response?.data?.message ||
          "\uAE30\uB85D \uC800\uC7A5\uC5D0 \uC2E4\uD328\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694."
      );
      return null;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const pickFirst = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

  const parseJsonTextForApi = (value) => {
    if (typeof value !== "string") {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  const normalizeImageUrlForApi = (value) => {
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

  const normalizeCastingResultForApi = (casting, recordId) => {
    const baseSource =
      casting?.casting ??
      casting?.castingCard ??
      casting?.castingResult ??
      casting?.result ??
      casting ??
      {};
    const source = {
      ...(parseJsonTextForApi(baseSource.rawResponse) ?? {}),
      ...baseSource,
    };

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
      genre: pickFirst(source.genre, source.movieGenre, source.todayGenre),
      role: pickFirst(source.roleName, source.role, source.characterName),
      line: pickFirst(
        source.oneLineComment,
        source.line,
        source.quote,
        source.summary,
        source.description
      ),
      scene: pickFirst(
        source.scenePhrase,
        source.scene,
        source.memorableScene,
        source.sceneDescription,
        source.situation
      ),
      imageUrl: normalizeImageUrlForApi(
        pickFirst(
          source.imageUrl,
          source.imageURL,
          source.image_url,
          source.generatedImageUrl,
          source.generatedImageURL,
          source.generatedImage,
          source.posterUrl,
          source.posterImageUrl,
          source.castingImageUrl,
          source.cardImageUrl,
          source.cardImage,
          source.image,
          source.imagePath,
          source.imageBase64,
          source.base64Image,
          source.imageData
        )
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

  const hasCastingDisplayResult = (result) =>
    typeof result?.title === "string" && result.title.trim().length > 0;

  const getCastingErrorMessage = (error) =>
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "캐스팅 결과를 만들지 못했어요. 잠시 후 다시 시도해주세요.";

  const createCastingForApi = async (recordId) => {
    savingRef.current = true;
    setSaving(true);

    try {
      const createdCasting = await castingsApi.createCasting(recordId);
      let result = normalizeCastingResultForApi(createdCasting, recordId);

      if (!hasCastingDisplayResult(result) || !result.imageUrl) {
        const casting = await castingsApi.getCastingByRecordId(recordId);
        result = normalizeCastingResultForApi(casting, recordId);
      }

      if (!hasCastingDisplayResult(result)) {
        return null;
      }

      return result;
    } catch (error) {
      console.warn("Failed to create casting:", error);
      showDialog(getCastingErrorMessage(error));
      return null;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const navigateResultForApi = (recordId, result) => {
    const rootNavigation = findNavigationWithRoute(navigation, "Main");
    const params = recordId ? { recordId, result } : { result };

    if (rootNavigation) {
      rootNavigation.navigate("Main", {
        screen: "Result",
        params,
      });
      return;
    }

    navigation.navigate("Result", params);
  };

  const goAnalysisLoadingForApi = (recordId, shouldStartGeneration = false) => {
    const rootNavigation = findNavigationWithRoute(navigation, "AnalysisLoading");
    const params = recordId ? { recordId, shouldStartGeneration } : { shouldStartGeneration };

    if (rootNavigation) {
      rootNavigation.navigate("AnalysisLoading", params);
      return;
    }

    navigation.navigate("AnalysisLoading", params);
  };

  const handleSaveForApi = async () => {
    if (saving) {
      return;
    }

    const record = await saveRecordForApi("DRAFT");

    if (record !== null) {
      showDialog("\uC784\uC2DC\uC800\uC7A5\uD588\uC5B4\uC694.");
    }
  };

  const confirmAnalysisForApi = async () => {
    if (saving) {
      return;
    }

    if (skipConfirmNextTime) {
      setResultNoticeHidden(true);
    }

    setConfirmVisible(false);
    const record = await saveRecordForApi("COMPLETED");

    if (record?.id) {
      setTodayResultReady(false);
      goAnalysisLoadingForApi(record.id, true);
    } else if (record) {
      showDialog("\uAE30\uB85D\uC740 \uC800\uC7A5\uB410\uC9C0\uB9CC \uACB0\uACFC \uC870\uD68C\uC5D0 \uD544\uC694\uD55C ID\uB97C \uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694.");
    }
  };

  const startAnalysisForApi = async () => {
    if (saving) {
      return;
    }

    const rootNavigation = findNavigationWithRoute(navigation, "Main");

    if (resultReady) {
      try {
        const status = await recordsApi.getTodayStatus();
        const recordId =
          status?.dailyRecordId ??
          status?.recordId ??
          status?.record?.id ??
          status?.dailyRecord?.id ??
          status?.id;

        if (status?.screen === "RESULT" && recordId) {
          const casting = await castingsApi.getCastingByRecordId(recordId);
          const result = normalizeCastingResultForApi(casting, recordId);

          setTodayResultReady(true, result);
          navigateResultForApi(recordId, result);
          return;
        }

        if (status?.screen === "WAITING") {
          goAnalysisLoadingForApi(recordId);
          return;
        }
      } catch (error) {
        console.warn("Failed to open existing result:", error);
      }

      const storedResult = getTodayRecordState().resultData;

      if (rootNavigation) {
        rootNavigation.navigate("Main", {
          screen: "Result",
          params: {
            result: storedResult,
          },
        });
        return;
      }

      navigation.navigate("Result", {
        result: storedResult,
      });
      return;
    }

    if (!diary.trim()) {
      showDialog("\uC624\uB298 \uAE30\uB85D\uC744 \uC791\uC131\uD574\uC8FC\uC138\uC694!");
      return;
    }

    if (!resultNoticeHidden) {
      setConfirmVisible(true);
      return;
    }

    const record = await saveRecordForApi("COMPLETED");

    if (record?.id) {
      setTodayResultReady(false);
      goAnalysisLoadingForApi(record.id, true);
    } else if (record) {
      showDialog("\uAE30\uB85D\uC740 \uC800\uC7A5\uB410\uC9C0\uB9CC \uACB0\uACFC \uC870\uD68C\uC5D0 \uD544\uC694\uD55C ID\uB97C \uBC1B\uC9C0 \uBABB\uD588\uC5B4\uC694.");
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

      <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.contentFrame}>
            <View style={styles.header}>
              <TouchableOpacity
                activeOpacity={0.74}
                style={styles.headerIconButton}
                onPress={() => navigation?.navigate?.("Home")}
              >
                <Ionicons name="chevron-back" size={sizes.headerIcon} color="#FFB36B" />
              </TouchableOpacity>

              <Text
                style={styles.title}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.82}
              >
                {COPY.title}
              </Text>

              <TouchableOpacity
                activeOpacity={0.78}
                style={styles.saveButton}
                onPress={handleSaveForApi}
                disabled={saving}
              >
                <Text style={styles.saveText} numberOfLines={1}>
                  {COPY.save}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.promptRow}>
              <Text style={styles.promptSparkle}>{"✦"}</Text>
              <Text style={styles.promptText}>{COPY.prompt}</Text>
              <Text style={styles.promptCurl}>{"∿"}</Text>
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
              styles={styles}
              sizes={sizes}
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
              styles={styles}
              sizes={sizes}
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
              styles={styles}
              sizes={sizes}
            />

            <View style={styles.bottomDivider}>
              <View style={styles.dottedLine} />
              <Text style={styles.dividerStar}>{"✦"}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.fixedCtaWrap} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.ctaButton, saving && styles.disabledButton]}
            onPress={startAnalysisForApi}
            disabled={saving}
          >
            <Text style={styles.ctaSparkle}>{"✦"}</Text>
            <MaterialCommunityIcons name="movie-open" size={sizes.ctaIcon} color="#FFFFFF" />
            <Text style={styles.ctaText} numberOfLines={1} adjustsFontSizeToFit>
              {resultReady ? "오늘의 결과 보기" : COPY.cta}
            </Text>
            <Text style={styles.ctaSparkle}>{"✦"}</Text>
          </TouchableOpacity>
        </View>

        <RecordDialog
          visible={!!dialog}
          message={dialog?.message}
          onClose={() => setDialog(null)}
          styles={styles}
        />

        <ResultConfirmDialog
          visible={confirmVisible}
          checked={skipConfirmNextTime}
          onToggleChecked={() => setSkipConfirmNextTime((current) => !current)}
          onCancel={() => setConfirmVisible(false)}
          onConfirm={confirmAnalysisForApi}
          styles={styles}
          sizes={sizes}
        />
      </SafeAreaView>
    </ImageBackground>
  );
}

function ResultConfirmDialog({
  visible,
  checked,
  onToggleChecked,
  onCancel,
  onConfirm,
  styles,
  sizes,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={styles.confirmCard}>
          <Text style={styles.dialogSparkle}>{"✦"}</Text>
          <Text style={styles.confirmTitle}>오늘의 결과를 받을까요?</Text>
          <Text style={styles.confirmMessage}>
            결과를 받으면 오늘의 기록은 수정할 수 없어요.
          </Text>

          <TouchableOpacity
            activeOpacity={0.76}
            style={styles.checkboxRow}
            onPress={onToggleChecked}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && (
                <Ionicons name="checkmark" size={sizes.checkboxIcon} color="#2A1434" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>다시 표시하지 않기</Text>
          </TouchableOpacity>

          <View style={styles.confirmButtons}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={[styles.confirmButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.86}
              style={[styles.confirmButton, styles.acceptButton]}
              onPress={onConfirm}
            >
              <Text style={styles.acceptButtonText}>결과 받기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RecordDialog({ visible, message, onClose, styles }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogSparkle}>{"✦"}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.dialogButton}
            onPress={onClose}
          >
            <Text style={styles.dialogButtonText}>확인</Text>
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
  styles,
  sizes,
}) {
  const customSelected = Array.isArray(selected)
    ? selected.includes("기타")
    : selected === "기타";

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionStar}>{"✦"}</Text>
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
              <Text
                style={[styles.choiceText, active && styles.activeChoiceText]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
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
            size={sizes.smallIcon}
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

const createStyles = (screenWidth, screenHeight, insets) => {
  const scale = Math.min(Math.max(screenWidth / 393, 0.82), 1.12);
  const ms = (value) => value * scale;
  const pagePadding = ms(screenWidth >= 600 ? 22 : 23);
  const contentWidth = Math.min(screenWidth - pagePadding * 2, screenWidth >= 600 ? 520 : 430);
  const tileGap = ms(9);
  const tileWidth = Math.max(ms(50), (contentWidth - tileGap * 5) / 6);
  const tileHeight = ms(65);
  const ctaHeight = ms(56);
  const tabClearance = 116 + Math.max(insets.bottom, ms(16));
  const ctaBottom = tabClearance + ms(10);
  const topPadding = Math.max(insets.top, ms(14)) + ms(18);
  const diaryHeight = Math.min(ms(238), screenHeight * 0.28);

  return {
    sizes: {
      headerIcon: ms(30),
      ctaIcon: ms(23),
      smallIcon: ms(18),
      checkboxIcon: ms(17),
    },
    styles: StyleSheet.create({
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
        paddingHorizontal: pagePadding,
        paddingTop: topPadding,
        paddingBottom: ctaBottom + ctaHeight + ms(52),
        alignItems: "center",
      },
      contentFrame: {
        width: contentWidth,
      },
      header: {
        height: ms(42),
        flexDirection: "row",
        alignItems: "center",
      },
      headerIconButton: {
        width: ms(54),
        height: ms(42),
        alignItems: "flex-start",
        justifyContent: "center",
      },
      title: {
        flex: 1,
        color: "#F5D7B1",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(18),
        lineHeight: ms(27),
        textAlign: "center",
      },
      saveButton: {
        width: ms(74),
        height: ms(42),
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
        marginTop: ms(21),
        flexDirection: "row",
        alignItems: "center",
      },
      promptSparkle: {
        width: ms(30),
        color: "#FFAD62",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(24),
        lineHeight: ms(28),
      },
      promptText: {
        flex: 1,
        color: "#FF9F52",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(22),
        textAlign: "center",
      },
      promptCurl: {
        width: ms(42),
        color: "#C56A51",
        fontFamily: "MaruBuriSemiBold",
        fontSize: ms(27),
        lineHeight: ms(30),
        textAlign: "right",
      },
      diaryBox: {
        marginTop: ms(18),
        height: diaryHeight,
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
        paddingTop: ms(22),
        paddingBottom: ms(42),
        color: "#FFF0D9",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(25),
        zIndex: 1,
      },
      counter: {
        position: "absolute",
        right: ms(17),
        bottom: ms(12),
        color: "rgba(255, 235, 222, 0.62)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(13),
        lineHeight: ms(19),
      },
      section: {
        marginTop: ms(18),
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
        marginTop: ms(10),
        flexDirection: "row",
        flexWrap: "wrap",
      },
      tileWrap: {
        columnGap: tileGap,
        rowGap: ms(10),
      },
      tileChoice: {
        width: tileWidth,
        height: tileHeight,
        borderRadius: ms(11),
        borderWidth: 1,
        borderColor: "rgba(118, 71, 148, 0.62)",
        backgroundColor: "rgba(34, 21, 56, 0.86)",
        alignItems: "center",
        justifyContent: "center",
      },
      chipChoice: {
        minWidth: ms(78),
        height: ms(36),
        marginRight: ms(8),
        marginBottom: ms(9),
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
        width: ms(36),
        height: ms(36),
      },
      chipIconImage: {
        width: ms(20),
        height: ms(20),
      },
      choiceText: {
        marginTop: ms(5),
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
        height: ms(42),
        marginTop: ms(8),
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
        marginTop: ms(16),
        height: ms(22),
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
        left: Math.max(pagePadding, (screenWidth - contentWidth) / 2),
        right: Math.max(pagePadding, (screenWidth - contentWidth) / 2),
        bottom: ctaBottom,
        zIndex: 80,
        elevation: 80,
      },
      ctaButton: {
        height: ctaHeight,
        borderRadius: ctaHeight / 2,
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
      disabledButton: {
        opacity: 0.62,
      },
      ctaText: {
        flex: 1,
        marginHorizontal: ms(10),
        color: "#FFFFFF",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(16),
        lineHeight: ms(24),
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
        paddingHorizontal: pagePadding,
        backgroundColor: "rgba(4, 6, 18, 0.68)",
        alignItems: "center",
        justifyContent: "center",
      },
      dialogCard: {
        width: "100%",
        maxWidth: ms(330),
        minHeight: ms(178),
        borderRadius: ms(20),
        borderWidth: 1,
        borderColor: "rgba(255, 163, 99, 0.76)",
        backgroundColor: "rgba(26, 14, 45, 0.96)",
        paddingHorizontal: ms(24),
        paddingTop: ms(24),
        paddingBottom: ms(18),
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
        marginTop: ms(10),
        color: "#FFE0BE",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(17),
        lineHeight: ms(26),
        textAlign: "center",
      },
      dialogButton: {
        width: "100%",
        height: ms(46),
        marginTop: ms(22),
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
      confirmCard: {
        width: "100%",
        maxWidth: ms(340),
        borderRadius: ms(20),
        borderWidth: 1,
        borderColor: "rgba(255, 163, 99, 0.76)",
        backgroundColor: "rgba(26, 14, 45, 0.97)",
        paddingHorizontal: ms(22),
        paddingTop: ms(24),
        paddingBottom: ms(18),
        alignItems: "center",
        shadowColor: "#FF8C55",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 18,
        elevation: 18,
      },
      confirmTitle: {
        marginTop: ms(9),
        color: "#FFE0BE",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(18),
        lineHeight: ms(27),
        textAlign: "center",
      },
      confirmMessage: {
        marginTop: ms(8),
        color: "rgba(255, 224, 190, 0.78)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(22),
        textAlign: "center",
      },
      checkboxRow: {
        alignSelf: "flex-start",
        marginTop: ms(20),
        minHeight: ms(34),
        flexDirection: "row",
        alignItems: "center",
      },
      checkbox: {
        width: ms(22),
        height: ms(22),
        borderRadius: ms(6),
        borderWidth: 1,
        borderColor: "rgba(255, 196, 153, 0.7)",
        alignItems: "center",
        justifyContent: "center",
      },
      checkboxChecked: {
        backgroundColor: "#FFD1A4",
        borderColor: "#FFD1A4",
      },
      checkboxLabel: {
        marginLeft: ms(10),
        color: "rgba(255, 239, 220, 0.82)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(14),
        lineHeight: ms(21),
      },
      confirmButtons: {
        width: "100%",
        marginTop: ms(20),
        flexDirection: "row",
        columnGap: ms(10),
      },
      confirmButton: {
        flex: 1,
        height: ms(46),
        borderRadius: ms(23),
        alignItems: "center",
        justifyContent: "center",
      },
      cancelButton: {
        borderWidth: 1,
        borderColor: "rgba(255, 196, 153, 0.42)",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
      },
      acceptButton: {
        backgroundColor: "#F56643",
      },
      cancelButtonText: {
        color: "rgba(255, 239, 220, 0.85)",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(15),
        lineHeight: ms(22),
      },
      acceptButtonText: {
        color: "#FFFFFF",
        fontFamily: "NanumSquareNeo",
        fontSize: ms(15),
        lineHeight: ms(22),
      },
    }),
  };
};
