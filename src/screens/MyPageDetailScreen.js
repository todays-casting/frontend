import React, { useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COPY = {
  settingsTitle: "\uC124\uC815",
  settingsEyebrow: "\uAE30\uB85D \uD658\uACBD",
  settingsLead: "\uD558\uB8E8 \uAE30\uB85D\uC744 \uC774\uC5B4\uAC00\uAE30 \uD3B8\uD558\uB3C4\uB85D \uC54C\uB9BC\uACFC \uC800\uC7A5 \uBC29\uC2DD\uC744 \uC870\uC815\uD574\uC694.",
  recordReminder: "\uAE30\uB85D \uC54C\uB9BC",
  recordReminderCopy: "\uD558\uB8E8\uB97C \uC815\uB9AC\uD560 \uC2DC\uAC04\uC744 \uC54C\uB824\uC918\uC694.",
  recordReminderTime: "\uC54C\uB9BC \uC2DC\uAC04",
  recordReminderPlaceholder: "21:30",
  notificationGroup: "\uC54C\uB9BC \uC124\uC815",
  pushNotification: "\uD478\uC2DC \uC54C\uB9BC",
  pushNotificationCopy: "\uC911\uC694\uD55C \uAE30\uB85D \uC18C\uC2DD\uC744 \uBC1B\uC544\uC694.",
  draftNotice: "\uC784\uC2DC\uC800\uC7A5 \uC548\uB0B4",
  draftNoticeCopy: "\uC800\uC7A5\uB418\uC9C0 \uC54A\uC740 \uAE30\uB85D\uC774 \uC788\uC744 \uB54C \uC54C\uB824\uC918\uC694.",
  contactTitle: "\uBB38\uC758\uD558\uAE30",
  contactEyebrow: "\uB3C4\uC6C0 \uC13C\uD130",
  contactLead: "\uD544\uC694\uD55C \uB3C4\uC6C0\uC744 \uD655\uC778\uD560 \uC218 \uC788\uB3C4\uB85D \uBB38\uC758 \uD56D\uBAA9\uC744 \uC900\uBE44\uD588\uC5B4\uC694.",
  accountHelp: "\uACC4\uC815 \uBB38\uC758",
  recordHelp: "\uAE30\uB85D \uBB38\uC758",
  cardHelp: "\uCE74\uB4DC \uBB38\uC758",
  send: "\uBB38\uC758 \uBCF4\uB0B4\uAE30",
};

const CONTACT_ROWS = [
  { icon: "person-circle-outline", label: COPY.accountHelp },
  { icon: "create-outline", label: COPY.recordHelp },
  { icon: "albums-outline", label: COPY.cardHelp },
];

export function SettingsScreen({ navigation }) {
  const [recordReminder, setRecordReminder] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);
  const [draftNotice, setDraftNotice] = useState(true);
  const [alertTime, setAlertTime] = useState("21:30");

  return (
    <DetailShell
      navigation={navigation}
      title={COPY.settingsTitle}
      eyebrow={COPY.settingsEyebrow}
      lead={COPY.settingsLead}
    >
      <View style={detailStyles.card}>
        <Text style={detailStyles.groupTitle}>{COPY.notificationGroup}</Text>

        <View style={detailStyles.settingHeader}>
          <View style={detailStyles.settingTextWrap}>
            <Text style={detailStyles.rowTitle}>{COPY.recordReminder}</Text>
            <Text style={detailStyles.rowCopy}>{COPY.recordReminderCopy}</Text>
          </View>
          <ToneSwitch value={recordReminder} onValueChange={setRecordReminder} />
        </View>

        <View style={[detailStyles.timeInputRow, !recordReminder && detailStyles.disabledWrap]}>
          <View style={detailStyles.timeLabelRow}>
            <Ionicons name="time-outline" size={21} color="#FFB36B" />
            <Text style={detailStyles.timeLabel}>{COPY.recordReminderTime}</Text>
          </View>
          <TextInput
            value={alertTime}
            onChangeText={(value) => setAlertTime(value.slice(0, 5))}
            editable={recordReminder}
            placeholder={COPY.recordReminderPlaceholder}
            placeholderTextColor="rgba(255, 222, 204, 0.45)"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            style={detailStyles.timeInput}
          />
        </View>

        <SettingRow
          icon="notifications-outline"
          title={COPY.pushNotification}
          copy={COPY.pushNotificationCopy}
          right={<ToneSwitch value={pushNotification} onValueChange={setPushNotification} />}
        />
        <SettingRow
          icon="save-outline"
          title={COPY.draftNotice}
          copy={COPY.draftNoticeCopy}
          right={<ToneSwitch value={draftNotice} onValueChange={setDraftNotice} />}
          last
        />
      </View>
    </DetailShell>
  );
}

export function ContactScreen({ navigation }) {
  return (
    <DetailShell
      navigation={navigation}
      title={COPY.contactTitle}
      eyebrow={COPY.contactEyebrow}
      lead={COPY.contactLead}
    >
      <View style={detailStyles.card}>
        {CONTACT_ROWS.map((item, index) => (
          <SettingRow
            key={item.label}
            icon={item.icon}
            title={item.label}
            right={<Ionicons name="chevron-forward" size={21} color="#E8B17C" />}
            last={index === CONTACT_ROWS.length - 1}
          />
        ))}
      </View>

      <TouchableOpacity activeOpacity={0.86} style={detailStyles.primaryButton}>
        <Ionicons name="send-outline" size={18} color="#FFFFFF" />
        <Text style={detailStyles.primaryButtonText}>{COPY.send}</Text>
      </TouchableOpacity>
    </DetailShell>
  );
}

function DetailShell({ navigation, title, eyebrow, lead, children }) {
  const { width, height } = useWindowDimensions();
  const shell = createShellStyles(width, height);

  return (
    <ImageBackground
      source={require("../../assets/images/login_background.png")}
      style={shell.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={shell.safeArea}>
        <ScrollView
          contentContainerStyle={shell.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={shell.contentFrame}>
            <View style={shell.header}>
              <TouchableOpacity
                activeOpacity={0.76}
                style={shell.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={30} color="#FFB36B" />
              </TouchableOpacity>
              <Text style={shell.title}>{title}</Text>
              <View style={shell.headerSpacer} />
            </View>

            <View style={shell.heroCard}>
              <Text style={shell.eyebrow}>{"\u2726  "}{eyebrow}</Text>
              <Text style={shell.lead}>{lead}</Text>
            </View>

            {children}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

function SettingRow({ icon, title, copy, right, last }) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      style={[detailStyles.settingRow, last && detailStyles.lastRow]}
    >
      <View style={detailStyles.rowIcon}>
        <Ionicons name={icon} size={23} color="#FFB36B" />
      </View>
      <View style={detailStyles.rowTextWrap}>
        <Text style={detailStyles.rowTitle}>{title}</Text>
        {!!copy && <Text style={detailStyles.rowCopy}>{copy}</Text>}
      </View>
      {right}
    </TouchableOpacity>
  );
}

function ToneSwitch(props) {
  return (
    <Switch
      {...props}
      trackColor={{ false: "rgba(255, 211, 195, 0.18)", true: "#F56643" }}
      thumbColor="#FFE0BE"
    />
  );
}

const createShellStyles = (screenWidth, screenHeight) => {
  const sx = screenWidth / 393;
  const sy = screenHeight / 824;
  const scale = Math.min(sx, sy);
  const ms = (value) => value * scale;
  const vs = (value) => value * sy;
  const pagePadding = ms(screenWidth >= 600 ? 22 : 25);
  const contentWidth = Math.min(screenWidth - pagePadding * 2, screenWidth >= 600 ? 520 : 393);

  return StyleSheet.create({
    background: {
      flex: 1,
      width: "100%",
      height: "100%",
      backgroundColor: "#070B1F",
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: pagePadding,
      paddingTop: vs(screenWidth >= 600 ? 48 : 52),
      paddingBottom: vs(150),
      alignItems: "center",
    },
    contentFrame: {
      width: contentWidth,
    },
    header: {
      height: vs(44),
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      width: ms(42),
      height: vs(44),
      justifyContent: "center",
    },
    title: {
      flex: 1,
      color: "#F7D8B4",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(22),
      lineHeight: ms(31),
      textAlign: "center",
    },
    headerSpacer: {
      width: ms(42),
    },
    heroCard: {
      marginTop: vs(22),
      borderRadius: ms(18),
      borderWidth: 1,
      borderColor: "rgba(229, 111, 116, 0.78)",
      backgroundColor: "rgba(35, 15, 49, 0.82)",
      paddingHorizontal: ms(22),
      paddingVertical: vs(22),
    },
    eyebrow: {
      color: "#FFB36B",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(14),
      lineHeight: ms(21),
    },
    lead: {
      marginTop: vs(9),
      color: "#FFE0BE",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(17),
      lineHeight: ms(27),
    },
  });
};

const detailStyles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(229, 111, 116, 0.78)",
    backgroundColor: "rgba(34, 14, 48, 0.82)",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  groupTitle: {
    color: "#FFC08B",
    fontFamily: "NanumSquareNeo",
    fontSize: 16,
    lineHeight: 23,
  },
  groupCopy: {
    marginTop: 4,
    color: "rgba(255, 222, 204, 0.64)",
    fontFamily: "NanumSquareNeo",
    fontSize: 12,
    lineHeight: 18,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  timeInputRow: {
    height: 48,
    marginTop: 15,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 179, 107, 0.34)",
    backgroundColor: "rgba(18, 11, 34, 0.58)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledWrap: {
    opacity: 0.42,
  },
  timeLabel: {
    marginLeft: 8,
    color: "#F1D7C7",
    fontFamily: "NanumSquareNeo",
    fontSize: 13,
    lineHeight: 19,
  },
  timeInput: {
    width: 74,
    height: 38,
    color: "#FFE2BC",
    fontFamily: "NanumSquareNeo",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "right",
  },
  settingRow: {
    minHeight: 68,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 211, 195, 0.13)",
    flexDirection: "row",
    alignItems: "center",
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    width: 38,
    alignItems: "flex-start",
  },
  rowTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 12,
  },
  rowTitle: {
    color: "#FFC08B",
    fontFamily: "NanumSquareNeo",
    fontSize: 15,
    lineHeight: 22,
  },
  rowCopy: {
    marginTop: 3,
    color: "rgba(255, 222, 204, 0.64)",
    fontFamily: "NanumSquareNeo",
    fontSize: 11,
    lineHeight: 17,
  },
  primaryButton: {
    height: 52,
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: "#F56643",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: 15,
    lineHeight: 22,
  },
});
