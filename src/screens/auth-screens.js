import React, { useState } from "react";
import {
  ImageBackground,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import authApi from "../api/auth-api";

const BACKGROUND = require("../../assets/images/login_background.png");
const BASE_WIDTH = 393;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function AuthScreenLayout({ navigation, step, title, description, children }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(width, insets);

  return (
    <ImageBackground source={BACKGROUND} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="chevron-back" size={28} color="#FFF2CB" />
        </TouchableOpacity>

        <View style={styles.heading}>
          {step ? <Text style={styles.step}>{step}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.form}>{children(styles)}</View>
      </ScrollView>
    </ImageBackground>
  );
}

function Field({
  styles,
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
  onToggleSecureTextEntry,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, error && styles.inputBoxError]}>
        <Ionicons name={icon} size={22} color="#756A7C" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#887C8A"
          style={styles.input}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {onToggleSecureTextEntry ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onToggleSecureTextEntry}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={secureTextEntry ? "비밀번호 보기" : "비밀번호 숨기기"}
          >
            <Ionicons
              name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#756A7C"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function FeedbackMessage({ styles, children, type = "error", selectable }) {
  const isSuccess = type === "success";

  return (
    <View style={[styles.feedbackBox, isSuccess && styles.feedbackBoxSuccess]}>
      <Ionicons
        name={isSuccess ? "checkmark-circle-outline" : "alert-circle-outline"}
        size={18}
        color={isSuccess ? "#B8FFD1" : "#FFB4B4"}
      />
      <Text
        selectable={selectable}
        style={[styles.feedbackText, isSuccess && styles.feedbackTextSuccess]}
      >
        {children}
      </Text>
    </View>
  );
}

function PrimaryButton({ styles, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.primaryButton, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

function CompletionModal({ visible, title, message, onConfirm }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(width, insets);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onConfirm}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalIcon}>
            <Ionicons name="checkmark" size={30} color="#211923" />
          </View>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.modalButton} onPress={onConfirm}>
            <Text style={styles.modalButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function SignUpStepOneScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordSecure, setPasswordSecure] = useState(true);
  const [passwordConfirmSecure, setPasswordConfirmSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const trimmedEmail = email.trim();
  const emailIsValid = EMAIL_PATTERN.test(trimmedEmail);
  const showEmailError = trimmedEmail.length > 0 && !emailIsValid;
  const canContinue =
    emailIsValid && password.length >= 8 && password === passwordConfirm;

  const handleContinue = async () => {
    if (!emailIsValid) {
      setErrorMessage("올바른 이메일을 입력해 주십시오.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      const { userId } = await authApi.signUpStepOne({
        email: trimmedEmail,
        password,
        passwordConfirm,
      });
      navigation.navigate("SignUpStepTwo", { userId });
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ?? "회원가입 요청에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      navigation={navigation}
      step="STEP 1 OF 2"
      title="회원가입"
      description="로그인에 사용할 이메일과 비밀번호를 설정해주세요."
    >
      {(styles) => (
        <>
          <Field styles={styles} label="이메일" icon="mail-outline" value={email} onChangeText={setEmail} placeholder="이메일을 입력해주세요" keyboardType="email-address" error={showEmailError || !!errorMessage} />
          {showEmailError ? (
            <FeedbackMessage styles={styles}>올바른 이메일을 입력해 주십시오.</FeedbackMessage>
          ) : null}
          <Field
            styles={styles}
            label="비밀번호"
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            placeholder="8자 이상 입력해주세요"
            secureTextEntry={passwordSecure}
            onToggleSecureTextEntry={() => setPasswordSecure((current) => !current)}
          />
          <Field
            styles={styles}
            label="비밀번호 확인"
            icon="shield-checkmark-outline"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            placeholder="비밀번호를 다시 입력해주세요"
            secureTextEntry={passwordConfirmSecure}
            onToggleSecureTextEntry={() => setPasswordConfirmSecure((current) => !current)}
            error={passwordConfirm.length > 0 && password !== passwordConfirm}
          />
          {passwordConfirm.length > 0 && password !== passwordConfirm ? (
            <FeedbackMessage styles={styles}>비밀번호가 일치하지 않습니다.</FeedbackMessage>
          ) : null}
          {errorMessage ? <FeedbackMessage selectable styles={styles}>{errorMessage}</FeedbackMessage> : null}
          <PrimaryButton
            styles={styles}
            label={loading ? "처리 중..." : "다음"}
            disabled={!canContinue || loading}
            onPress={handleContinue}
          />
        </>
      )}
    </AuthScreenLayout>
  );
}

export function SignUpStepTwoScreen({ navigation, route }) {
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const userId = route.params?.userId;
  const numericAge = Number(age);
  const canSubmit =
    nickname.trim().length > 0 &&
    numericAge > 0 &&
    numericAge < 120 &&
    gender.length > 0;

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      await authApi.signUpStepTwo({
        userId,
        nickname: nickname.trim(),
        age: numericAge,
        gender: gender === "남자" ? "MALE" : "FEMALE",
      });
      setCompleted(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ?? "회원가입 완료 요청에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      navigation={navigation}
      step="STEP 2 OF 2"
      title="회원 정보"
      description="닉네임, 나이, 성별을 입력하면 가입이 완료돼요."
    >
      {(styles) => (
        <>
          <Field styles={styles} label="닉네임" icon="person-circle-outline" value={nickname} onChangeText={setNickname} placeholder="사용할 닉네임을 입력해주세요" />
          <Field
            styles={styles}
            label="나이"
            icon="calendar-outline"
            value={age}
            onChangeText={(value) => setAge(value.replace(/[^0-9]/g, "").slice(0, 3))}
            placeholder="나이를 입력해주세요"
            keyboardType="number-pad"
          />
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>성별</Text>
            <View style={styles.genderOptions}>
              {["남자", "여자"].map((option) => {
                const selected = gender === option;

                return (
                  <TouchableOpacity
                    key={option}
                    activeOpacity={0.8}
                    style={[styles.genderButton, selected && styles.selectedGenderButton]}
                    onPress={() => setGender(option)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                  >
                    <Text style={[styles.genderText, selected && styles.selectedGenderText]}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <PrimaryButton
            styles={styles}
            label={loading ? "처리 중..." : "가입 완료"}
            disabled={!canSubmit || !userId || loading}
            onPress={handleSignUp}
          />
          {errorMessage ? <FeedbackMessage selectable styles={styles}>{errorMessage}</FeedbackMessage> : null}
          <CompletionModal
            visible={completed}
            title="회원가입 완료"
            message="회원가입이 완료되었습니다."
            onConfirm={() => navigation.popToTop()}
          />
        </>
      )}
    </AuthScreenLayout>
  );
}

export function FindPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [newPasswordSecure, setNewPasswordSecure] = useState(true);
  const [passwordConfirmSecure, setPasswordConfirmSecure] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const canSend = email.includes("@");
  const canChange =
    otp.trim().length > 0 &&
    newPassword.length >= 8 &&
    newPassword === passwordConfirm;

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      await authApi.requestPasswordReset({ email: email.trim() });
      setSent(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ?? "인증코드 발송에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      await authApi.confirmPasswordReset({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setCompleted(true);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ?? "비밀번호 변경에 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      navigation={navigation}
      title="비밀번호 찾기"
      description={
        sent
          ? "메일로 받은 인증코드와 새 비밀번호를 입력해주세요."
          : "가입한 이메일로 인증코드를 보내드려요."
      }
    >
      {(styles) => (
        <>
          {!sent ? (
            <>
              <Field
                styles={styles}
                label="이메일"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="가입한 이메일을 입력해주세요"
                keyboardType="email-address"
                error={!!errorMessage}
              />
              <PrimaryButton
                styles={styles}
                label={loading ? "발송 중..." : "인증코드 받기"}
                disabled={!canSend || loading}
                onPress={handleSendOtp}
              />
              {errorMessage ? <FeedbackMessage selectable styles={styles}>{errorMessage}</FeedbackMessage> : null}
            </>
          ) : (
            <>
              <FeedbackMessage selectable styles={styles} type="success">{email}로 인증코드를 전송했습니다.</FeedbackMessage>
              <Field
                styles={styles}
                label="인증코드"
                icon="key-outline"
                value={otp}
                onChangeText={setOtp}
                placeholder="메일로 받은 인증코드"
              />
              <Field
                styles={styles}
                label="새 비밀번호"
                icon="lock-closed-outline"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="8자 이상 입력해주세요"
                secureTextEntry={newPasswordSecure}
                onToggleSecureTextEntry={() => setNewPasswordSecure((current) => !current)}
              />
              <Field
                styles={styles}
                label="새 비밀번호 확인"
                icon="shield-checkmark-outline"
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="새 비밀번호를 다시 입력해주세요"
                secureTextEntry={passwordConfirmSecure}
                onToggleSecureTextEntry={() => setPasswordConfirmSecure((current) => !current)}
                error={passwordConfirm.length > 0 && newPassword !== passwordConfirm}
              />
              {passwordConfirm.length > 0 && newPassword !== passwordConfirm ? (
                <FeedbackMessage selectable styles={styles}>새 비밀번호가 일치하지 않습니다.</FeedbackMessage>
              ) : null}
              <PrimaryButton
                styles={styles}
                label={loading ? "변경 중..." : "비밀번호 변경"}
                disabled={!canChange || loading}
                onPress={handleChangePassword}
              />
              {errorMessage ? <FeedbackMessage selectable styles={styles}>{errorMessage}</FeedbackMessage> : null}
              <CompletionModal
                visible={completed}
                title="비밀번호 변경 완료"
                message="비밀번호가 변경되었습니다."
                onConfirm={() => navigation.popToTop()}
              />
            </>
          )}
        </>
      )}
    </AuthScreenLayout>
  );
}

const createStyles = (screenWidth, insets) => {
  const scale = Math.min(Math.max(screenWidth / BASE_WIDTH, 0.86), 1.12);
  const ms = (value) => value * scale;

  return StyleSheet.create({
    background: {
      flex: 1,
      width: "100%",
      height: "100%",
      overflow: "hidden",
      backgroundColor: "#160E2A",
    },
    scrollView: { flex: 1 },
    container: {
      flexGrow: 1,
      paddingTop: Math.max(insets.top, ms(12)) + ms(4),
      paddingBottom: Math.max(insets.bottom, ms(16)),
      paddingHorizontal: ms(30),
    },
    backButton: {
      width: ms(40),
      height: ms(40),
      borderRadius: ms(20),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.08)",
    },
    heading: { paddingTop: ms(24), gap: ms(7) },
    step: { color: "#FFB978", fontFamily: "NanumSquareNeo", fontSize: ms(12), letterSpacing: 1.4 },
    title: { color: "#FFF2CB", fontFamily: "MaruBuriSemiBold", fontSize: ms(30), lineHeight: ms(38) },
    description: { color: "rgba(255,255,255,0.72)", fontFamily: "NanumSquareNeo", fontSize: ms(13), lineHeight: ms(20) },
    form: { paddingTop: ms(28), gap: ms(13) },
    fieldGroup: { gap: ms(6) },
    label: { color: "#FFD1A4", fontFamily: "NanumSquareNeo", fontSize: ms(13) },
    inputBox: {
      height: ms(50),
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.38)",
      backgroundColor: "rgba(255,244,239,0.88)",
      paddingHorizontal: ms(16),
      flexDirection: "row",
      alignItems: "center",
      gap: ms(14),
    },
    inputBoxError: {
      borderColor: "rgba(255, 134, 134, 0.95)",
      backgroundColor: "rgba(255,244,239,0.94)",
    },
    input: { flex: 1, color: "#2D2432", fontFamily: "NanumSquareNeo", fontSize: ms(15) },
    genderOptions: { flexDirection: "row", gap: ms(9) },
    genderButton: {
      flex: 1,
      height: ms(44),
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: "rgba(255, 209, 164, 0.42)",
      backgroundColor: "rgba(255,255,255,0.08)",
      alignItems: "center",
      justifyContent: "center",
    },
    selectedGenderButton: { borderColor: "#FFD1A4", backgroundColor: "#FFD1A4" },
    genderText: { color: "rgba(255,255,255,0.72)", fontFamily: "NanumSquareNeo", fontSize: ms(14) },
    selectedGenderText: { color: "#211923" },
    primaryButton: {
      height: ms(52),
      borderRadius: ms(12),
      marginTop: ms(8),
      backgroundColor: "#FFD1A4",
      alignItems: "center",
      justifyContent: "center",
    },
    disabledButton: { opacity: 0.4 },
    primaryButtonText: { color: "#211923", fontFamily: "NanumSquareNeo", fontSize: ms(17) },
    helperText: { color: "#FFFFFF", fontFamily: "NanumSquareNeo", fontSize: ms(13), lineHeight: ms(21) },
    feedbackBox: {
      minHeight: ms(42),
      borderRadius: ms(12),
      borderWidth: 1,
      borderColor: "rgba(255, 134, 134, 0.62)",
      backgroundColor: "rgba(111, 27, 45, 0.36)",
      paddingHorizontal: ms(13),
      paddingVertical: ms(10),
      flexDirection: "row",
      alignItems: "flex-start",
      gap: ms(8),
    },
    feedbackBoxSuccess: {
      borderColor: "rgba(184, 255, 209, 0.52)",
      backgroundColor: "rgba(33, 105, 66, 0.3)",
    },
    feedbackText: {
      flex: 1,
      color: "#FFFFFF",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(14),
      lineHeight: ms(21),
    },
    feedbackTextSuccess: {
      color: "#FFFFFF",
    },
    errorText: { color: "#FFFFFF", fontFamily: "NanumSquareNeo", fontSize: ms(14), lineHeight: ms(21) },
    successText: { color: "#FFFFFF", fontFamily: "NanumSquareNeo", fontSize: ms(14), lineHeight: ms(21) },
    modalOverlay: {
      flex: 1,
      paddingHorizontal: ms(30),
      backgroundColor: "rgba(10, 6, 22, 0.72)",
      alignItems: "center",
      justifyContent: "center",
    },
    modalCard: {
      width: "100%",
      maxWidth: ms(330),
      borderRadius: ms(22),
      borderWidth: 1,
      borderColor: "rgba(255, 209, 164, 0.55)",
      padding: ms(25),
      backgroundColor: "#26183D",
      alignItems: "center",
    },
    modalIcon: {
      width: ms(54),
      height: ms(54),
      borderRadius: ms(27),
      backgroundColor: "#FFD1A4",
      alignItems: "center",
      justifyContent: "center",
    },
    modalTitle: {
      paddingTop: ms(17),
      color: "#FFF2CB",
      fontFamily: "MaruBuriSemiBold",
      fontSize: ms(22),
    },
    modalMessage: {
      paddingTop: ms(9),
      color: "rgba(255,255,255,0.72)",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(14),
    },
    modalButton: {
      width: "100%",
      height: ms(48),
      borderRadius: ms(12),
      marginTop: ms(23),
      backgroundColor: "#FFD1A4",
      alignItems: "center",
      justifyContent: "center",
    },
    modalButtonText: { color: "#211923", fontFamily: "NanumSquareNeo", fontSize: ms(16) },
  });
};
