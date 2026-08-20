import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import authApi from "../api/auth-api";

WebBrowser.maybeCompleteAuthSession();

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;
const KAKAO_DISCOVERY = {
  authorizationEndpoint: "https://kauth.kakao.com/oauth/authorize",
  tokenEndpoint: "https://kauth.kakao.com/oauth/token",
};

const BASE_WIDTH = 393;
const BASE_HEIGHT = 824;
const UI_SCALE = 0.9;
const TEXT_SCALE = 0.88;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const COPY = {
  subtitle1: "\uD558\uB8E8\uB97C \uAE30\uB85D\uD558\uACE0,",
  subtitle2:
    "\uB2F9\uC2E0\uB9CC\uC758 \uC601\uD654 \uC18D \uBC30\uC5ED\uC744 \uB9CC\uB098\uBCF4\uC138\uC694.",
  idPlaceholder: "\uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694",
  passwordPlaceholder:
    "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
  login: "\uB85C\uADF8\uC778",
  or: "\uB610\uB294",
  kakaoLogin: "\uCE74\uCE74\uC624 \uB85C\uADF8\uC778",
  signUp: "\uD68C\uC6D0\uAC00\uC785",
  findPassword: "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30",
  loginFailed: "\uC774\uBA54\uC77C\uC774\uB098 \uBE44\uBC00\uBC88\uD638\uB97C \uD655\uC778\uD574\uC8FC\uC138\uC694.",
  invalidEmail: "\uC62C\uBC14\uB978 \uC774\uBA54\uC77C\uC744 \uC785\uB825\uD574 \uC8FC\uC2ED\uC2DC\uC624.",
};

export default function LoginScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const trimmedEmail = email.trim();
  const hasLoginError = !!errorMessage;
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "todayscasting",
    path: "oauth/kakao",
  });
  const [kakaoRequest, kakaoResponse, promptKakaoLogin] = AuthSession.useAuthRequest(
    {
      clientId: KAKAO_REST_API_KEY || "missing-kakao-rest-api-key",
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    KAKAO_DISCOVERY
  );
  const styles = createStyles(width, height, insets);
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT) * UI_SCALE;
  const iconSize = (value) => value * scale;

  const handleLogin = async () => {
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMessage(COPY.invalidEmail);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");
      await authApi.login({ email: trimmedEmail, password });
      navigation.replace("Main");
    } catch (error) {
      const status = error.response?.status;
      setErrorMessage([400, 401, 403, 404, 409].includes(status)
        ? COPY.loginFailed
        : error.response?.data?.message ?? COPY.loginFailed
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!kakaoResponse) return;

    if (kakaoResponse.type === "error") {
      setKakaoLoading(false);
      setErrorMessage(
        kakaoResponse.error?.message ?? "카카오 로그인 인증에 실패했습니다."
      );
      return;
    }

    if (kakaoResponse.type !== "success") {
      setKakaoLoading(false);
      return;
    }

    const completeKakaoLogin = async () => {
      try {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: KAKAO_REST_API_KEY,
            code: kakaoResponse.params.code,
            redirectUri,
            extraParams: {
              code_verifier: kakaoRequest.codeVerifier,
            },
          },
          KAKAO_DISCOVERY
        );
        const result = await authApi.kakaoLogin({
          accessToken: tokenResponse.accessToken,
        });

        if (result.isNewUser) {
          if (!result.userId) {
            throw new Error("신규 카카오 회원의 userId가 없습니다.");
          }
          navigation.navigate("SignUpStepTwo", { userId: result.userId });
          return;
        }

        if (!result.accessToken) {
          throw new Error("카카오 로그인 응답에 accessToken이 없습니다.");
        }
        navigation.replace("Main");
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ??
            error.message ??
            "카카오 로그인에 실패했습니다. 다시 시도해주세요."
        );
      } finally {
        setKakaoLoading(false);
      }
    };

    completeKakaoLogin();
  }, [kakaoResponse]);

  const handleKakaoLogin = async () => {
    if (!KAKAO_REST_API_KEY) {
      setErrorMessage("카카오 REST API 키가 설정되지 않았습니다.");
      return;
    }

    try {
      setKakaoLoading(true);
      setErrorMessage("");
      await promptKakaoLogin();
    } catch (error) {
      setKakaoLoading(false);
      setErrorMessage(error.message ?? "카카오 로그인 창을 열지 못했습니다.");
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.brandArea}>
            <MaterialCommunityIcons
              name="movie-open-star-outline"
              size={iconSize(28)}
              color="#FFD2A5"
            />

            <View style={styles.titleWrap}>
              <Text style={styles.titleTop}>Today's</Text>
              <Text style={styles.titleBottom}>Casting</Text>
              <Text style={styles.sparkle}>{"\u2726"}</Text>
            </View>

            <View style={styles.brandDividerArea}>
              <View style={styles.brandDivider} />
              <Text style={styles.brandDividerStar}>{"\u2726"}</Text>
              <View style={styles.brandDivider} />
            </View>

            <Text style={styles.subtitle}>{COPY.subtitle1}</Text>
            <Text style={styles.subtitle}>{COPY.subtitle2}</Text>
          </View>

          <View style={styles.loginArea}>
            <View style={[styles.inputBox, hasLoginError && styles.inputBoxError]}>
              <Ionicons
                name="person-outline"
                size={iconSize(24)}
                color="#6F6878"
              />

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={COPY.idPlaceholder}
                placeholderTextColor="#827683"
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={[styles.inputBox, hasLoginError && styles.inputBoxError]}>
              <Ionicons
                name="lock-closed-outline"
                size={iconSize(23)}
                color="#6F6878"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={COPY.passwordPlaceholder}
                placeholderTextColor="#827683"
                style={styles.input}
                secureTextEntry={secure}
                autoCapitalize="none"
              />

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSecure(!secure)}
                hitSlop={10}
              >
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={iconSize(23)}
                  color="#6F6878"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading || trimmedEmail.length === 0 || password.length === 0}
            >
              <Text style={styles.loginButtonText}>{loading ? "로그인 중..." : COPY.login}</Text>
            </TouchableOpacity>

            {errorMessage ? (
              <View style={styles.loginErrorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={iconSize(18)}
                  color="#FFB4B4"
                />
                <Text selectable style={styles.loginError}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.dividerArea}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>{COPY.or}</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.kakaoButton}
              onPress={handleKakaoLogin}
              disabled={!kakaoRequest || kakaoLoading}
              accessibilityRole="button"
              accessibilityLabel={COPY.kakaoLogin}
            >
              <Image
                source={require("../../assets/icon/kakao_login.png")}
                style={styles.kakaoLoginImage}
                resizeMode="contain"
              />
              {kakaoLoading ? (
                <View style={styles.kakaoLoadingOverlay}>
                  <Text style={styles.kakaoLoadingText}>카카오 로그인 중...</Text>
                </View>
              ) : null}
            </TouchableOpacity>

            <View style={styles.bottomLinks}>
              <TouchableOpacity onPress={() => navigation.navigate("SignUpStepOne")}>
                <Text style={styles.bottomLinkText}>{COPY.signUp}</Text>
              </TouchableOpacity>

              <Text style={styles.bottomDivider}>|</Text>

              <TouchableOpacity onPress={() => navigation.navigate("FindPassword")}>
                <Text style={styles.bottomLinkText}>{COPY.findPassword}</Text>
              </TouchableOpacity>
            </View>
          </View>
      </ScrollView>
    </ImageBackground>
  );
}

const createStyles = (screenWidth, screenHeight, insets) => {
  const horizontalScale =
    Math.min(Math.max(screenWidth / BASE_WIDTH, 0.82), 1.15) * UI_SCALE;
  const verticalScale =
    Math.min(
      horizontalScale,
      Math.min(Math.max(screenHeight / BASE_HEIGHT, 0.72), 1.05) * UI_SCALE
    );
  const ms = (value) => value * horizontalScale;
  const vs = (value) => value * verticalScale;
  const fs = (value) => value * verticalScale * TEXT_SCALE;

  return StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "#160E2A",
  },

  safeArea: {
    flex: 1,
  },

  container: {
    flexGrow: 1,
    minHeight: screenHeight,
    paddingHorizontal: ms(32),
    paddingTop: Math.max(insets.top, ms(20)) + ms(38),
    paddingBottom: Math.max(insets.bottom, ms(16)),
  },

  brandArea: {
    alignItems: "center",
  },

  titleWrap: {
    marginTop: vs(16),
    alignItems: "center",
  },

  titleTop: {
    color: "#FFF2CB",
    fontFamily: "MaruBuriSemiBold",
    fontSize: fs(54),
    lineHeight: fs(59),
  },

  titleBottom: {
    color: "#FFF2CB",
    fontFamily: "MaruBuriSemiBold",
    fontSize: fs(54),
    lineHeight: fs(59),
    marginTop: vs(-6),
  },

  sparkle: {
    position: "absolute",
    right: ms(-24),
    top: vs(52),
    color: "#FFD8BD",
    fontFamily: "MaruBuriSemiBold",
    fontSize: fs(30),
    lineHeight: fs(32),
  },

  brandDividerArea: {
    width: ms(205),
    marginTop: vs(15),
    marginBottom: vs(17),
    flexDirection: "row",
    alignItems: "center",
  },

  brandDivider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 232, 214, 0.44)",
  },

  brandDividerStar: {
    marginHorizontal: ms(10),
    color: "#FFF1CA",
    fontFamily: "MaruBuriSemiBold",
    fontSize: fs(17),
    lineHeight: fs(19),
  },

  subtitle: {
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: fs(16),
    lineHeight: fs(24),
    textAlign: "center",
  },

  loginArea: {
    width: "94%",
    maxWidth: 704,
    alignSelf: "center",
    marginTop: "auto",
  },

  inputBox: {
    height: vs(57),
    borderRadius: ms(13),
    paddingHorizontal: ms(17),
    marginBottom: vs(14),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 244, 239, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.42)",
  },

  inputBoxError: {
    borderColor: "rgba(255, 134, 134, 0.95)",
    backgroundColor: "rgba(255, 244, 239, 0.92)",
  },

  input: {
    flex: 1,
    marginLeft: ms(20),
    fontFamily: "NanumSquareNeo",
    fontSize: fs(17),
    color: "#2D2432",
  },

  loginButton: {
    height: vs(57),
    borderRadius: ms(13),
    backgroundColor: "#FFD1A4",
    justifyContent: "center",
    alignItems: "center",
    marginTop: vs(3),
  },

  loginButtonText: {
    fontFamily: "NanumSquareNeo",
    fontSize: fs(18),
    color: "#151216",
  },

  loginErrorBox: {
    marginTop: vs(12),
    minHeight: vs(46),
    borderRadius: ms(12),
    borderWidth: 1,
    borderColor: "rgba(255, 134, 134, 0.62)",
    backgroundColor: "rgba(111, 27, 45, 0.36)",
    paddingHorizontal: ms(13),
    paddingVertical: vs(9),
    flexDirection: "row",
    alignItems: "center",
  },

  loginError: {
    flex: 1,
    marginLeft: ms(8),
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: fs(15),
    lineHeight: fs(22),
  },

  dividerArea: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: vs(19),
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
  },

  dividerText: {
    marginHorizontal: ms(22),
    fontFamily: "NanumSquareNeo",
    fontSize: fs(15),
    color: "rgba(255, 255, 255, 0.72)",
  },

  kakaoButton: {
    width: "100%",
    aspectRatio: 183 / 45,
    justifyContent: "center",
    alignItems: "center",
  },

  kakaoLoginImage: {
    width: "100%",
    height: "100%",
  },

  kakaoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ms(13),
    backgroundColor: "rgba(254, 229, 0, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },

  kakaoLoadingText: {
    color: "#191919",
    fontFamily: "NanumSquareNeo",
    fontSize: fs(15),
  },

  bottomLinks: {
    marginTop: vs(29),
    marginBottom: vs(18),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomLinkText: {
    color: "rgba(255, 255, 255, 0.65)",
    fontFamily: "NanumSquareNeo",
    fontSize: fs(15),
  },

  bottomDivider: {
    color: "rgba(255, 255, 255, 0.52)",
    fontSize: fs(16),
    marginHorizontal: ms(27),
  },
  });
};
