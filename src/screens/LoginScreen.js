import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const BASE_WIDTH = 393;
const BASE_HEIGHT = 824;

const COPY = {
  subtitle1: "\uD558\uB8E8\uB97C \uAE30\uB85D\uD558\uACE0,",
  subtitle2:
    "\uB2F9\uC2E0\uB9CC\uC758 \uC601\uD654 \uC18D \uBC30\uC5ED\uC744 \uB9CC\uB098\uBCF4\uC138\uC694.",
  idPlaceholder: "\uC544\uC774\uB514\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
  passwordPlaceholder:
    "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
  login: "\uB85C\uADF8\uC778",
  or: "\uB610\uB294",
  kakaoLogin: "\uCE74\uCE74\uC624 \uB85C\uADF8\uC778",
  signUp: "\uD68C\uC6D0\uAC00\uC785",
  findId: "\uC544\uC774\uB514 \uCC3E\uAE30",
  findPassword: "\uBE44\uBC00\uBC88\uD638 \uCC3E\uAE30",
};

export default function LoginScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const styles = createStyles(width, height);
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  const iconSize = (value) => value * scale;

  const handleLogin = () => {
    navigation.replace("Main");
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
        <View style={styles.container}>
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
            <View style={styles.inputBox}>
              <Ionicons
                name="person-outline"
                size={iconSize(24)}
                color="#6F6878"
              />

              <TextInput
                value={id}
                onChangeText={setId}
                placeholder={COPY.idPlaceholder}
                placeholderTextColor="#827683"
                style={styles.input}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputBox}>
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
            >
              <Text style={styles.loginButtonText}>{COPY.login}</Text>
            </TouchableOpacity>

            <View style={styles.dividerArea}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>{COPY.or}</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.kakaoButton}>
              <View style={styles.kakaoIcon}>
                <Text style={styles.kakaoIconText}>TALK</Text>
              </View>

              <Text style={styles.kakaoButtonText}>{COPY.kakaoLogin}</Text>
            </TouchableOpacity>

            <View style={styles.bottomLinks}>
              <TouchableOpacity>
                <Text style={styles.bottomLinkText}>{COPY.signUp}</Text>
              </TouchableOpacity>

              <Text style={styles.bottomDivider}>|</Text>

              <TouchableOpacity>
                <Text style={styles.bottomLinkText}>{COPY.findId}</Text>
              </TouchableOpacity>

              <Text style={styles.bottomDivider}>|</Text>

              <TouchableOpacity>
                <Text style={styles.bottomLinkText}>{COPY.findPassword}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const createStyles = (screenWidth, screenHeight) => {
  const sx = screenWidth / BASE_WIDTH;
  const sy = screenHeight / BASE_HEIGHT;
  const ms = (value) => value * sx;
  const vs = (value) => value * sy;
  const fs = (value) => value * Math.min(sx, sy);

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
    flex: 1,
    paddingHorizontal: ms(32),
    paddingTop: vs(74),
    paddingBottom: vs(29),
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
    width: "100%",
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
    backgroundColor: "rgba(255, 244, 239, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.42)",
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
    fontSize: fs(20),
    color: "#151216",
  },

  dividerArea: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: vs(24),
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
    height: vs(57),
    borderRadius: ms(13),
    backgroundColor: "#FFE182",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  kakaoIcon: {
    width: ms(43),
    height: vs(31),
    borderRadius: ms(16),
    backgroundColor: "#221D1F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: ms(49),
  },

  kakaoIconText: {
    color: "#FFE182",
    fontFamily: "NanumSquareNeo",
    fontSize: fs(10),
  },

  kakaoButtonText: {
    fontFamily: "NanumSquareNeo",
    fontSize: fs(20),
    color: "#151216",
  },

  bottomLinks: {
    marginTop: vs(29),
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
