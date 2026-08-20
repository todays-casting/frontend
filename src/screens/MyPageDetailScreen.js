import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ImageBackground,
  Linking,
  Modal,
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import authApi from "../api/auth-api";
import notificationsApi from "../api/notifications-api";

const COPY = {
  settingsTitle: "\uC54C\uB9BC\uC124\uC815",
  settingsEyebrow: "\uC54C\uB9BC \uD658\uACBD",
  settingsLead: "\uD558\uB8E8 \uAE30\uB85D\uACFC \uCE90\uC2A4\uD305 \uC18C\uC2DD\uC744 \uB193\uCE58\uC9C0 \uC54A\uB3C4\uB85D \uC54C\uB9BC \uBC29\uC2DD\uC744 \uC870\uC815\uD574\uC694.",
  recordReminder: "\uAE30\uB85D \uC54C\uB9BC",
  recordReminderCopy: "\uD558\uB8E8\uB97C \uC815\uB9AC\uD560 \uC2DC\uAC04\uC744 \uC54C\uB824\uC918\uC694.",
  recordReminderTime: "\uC54C\uB9BC \uC2DC\uAC04",
  recordReminderPlaceholder: "21:30",
  notificationGroup: "\uC54C\uB9BC \uC124\uC815",
  pushNotification: "\uD478\uC2DC \uC54C\uB9BC",
  pushNotificationCopy: "\uC911\uC694\uD55C \uAE30\uB85D \uC18C\uC2DD\uC744 \uBC1B\uC544\uC694.",
  draftNotice: "\uC784\uC2DC\uC800\uC7A5 \uC548\uB0B4",
  draftNoticeCopy: "\uC800\uC7A5\uB418\uC9C0 \uC54A\uC740 \uAE30\uB85D\uC774 \uC788\uC744 \uB54C \uC54C\uB824\uC918\uC694.",
  timeCancel: "\uCDE8\uC18C",
  timeSave: "\uC801\uC6A9\uD558\uAE30",
  accountTitle: "\uACC4\uC815 \uC124\uC815",
  accountEyebrow: "\uACC4\uC815 \uAD00\uB9AC",
  accountLead: "\uC548\uC804\uD55C \uACC4\uC815 \uC0AC\uC6A9\uC744 \uC704\uD574 \uD544\uC694\uD55C \uC815\uBCF4\uB97C \uAD00\uB9AC\uD574\uC694.",
  passwordChange: "\uBE44\uBC00\uBC88\uD638 \uBCC0\uACBD",
  passwordChangeCopy: "\uD604\uC7AC \uBE44\uBC00\uBC88\uD638\uB85C \uC0C8 \uBE44\uBC00\uBC88\uD638\uB97C \uC124\uC815\uD574\uC694.",
  withdraw: "\uD0C8\uD1F4\uD558\uAE30",
  withdrawCopy: "\uC11C\uBE44\uC2A4 \uC774\uC6A9\uC744 \uB9C8\uBB34\uB9AC\uD560 \uB54C \uD655\uC778\uD574\uC694.",
  contactTitle: "\uBB38\uC758\uD558\uAE30",
  contactEyebrow: "\uB3C4\uC6C0 \uC13C\uD130",
  contactLead: "\uD544\uC694\uD55C \uB3C4\uC6C0\uC744 \uD655\uC778\uD560 \uC218 \uC788\uB3C4\uB85D \uBB38\uC758 \uD56D\uBAA9\uC744 \uC900\uBE44\uD588\uC5B4\uC694.",
  accountHelp: "\uACC4\uC815 \uBB38\uC758",
  recordHelp: "\uAE30\uB85D \uBB38\uC758",
  cardHelp: "\uCE74\uB4DC \uBB38\uC758",
  send: "\uBB38\uC758 \uBCF4\uB0B4\uAE30",
};

const CONTACT_ROWS = [
  {
    icon: "person-circle-outline",
    label: COPY.accountHelp,
    url: "https://forms.gle/3PBdC7i7Zht3FLhj7",
  },
  {
    icon: "create-outline",
    label: COPY.recordHelp,
    url: "https://forms.gle/JjURHC8kewarmajn6",
  },
  {
    icon: "albums-outline",
    label: COPY.cardHelp,
    url: "https://forms.gle/zCUfxDMXDGhVvC8Z7",
  },
];

const DEFAULT_CONTACT_FORM_URL = CONTACT_ROWS[0].url;

const openContactForm = (url = DEFAULT_CONTACT_FORM_URL) => {
  Linking.openURL(url).catch(() => {
    Alert.alert("문의 폼 열기 실패", "잠시 후 다시 시도해주세요.");
  });
};

const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

const padTime = (value) => String(value).padStart(2, "0");

const normalizeAlertTime = (value) => {
  if (typeof value !== "string") {
    return "21:30";
  }

  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());

  if (!match) {
    return "21:30";
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return "21:30";
  }

  return `${padTime(hour)}:${padTime(minute)}`;
};

const toApiAlertTime = (value) => `${normalizeAlertTime(value)}:00`;

export function SettingsScreen({ navigation }) {
  const [recordReminder, setRecordReminder] = useState(true);
  const [pushNotification, setPushNotification] = useState(true);
  const [draftNotice, setDraftNotice] = useState(true);
  const [alertTime, setAlertTime] = useState("21:30");
  const [draftAlertTime, setDraftAlertTime] = useState("21:30");
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const settingsRef = useRef({
    pushEnabled: true,
    dailyReminderEnabled: true,
    dailyReminderTime: "21:30",
    draftNoticeEnabled: true,
  });
  const settingsSaveQueueRef = useRef(Promise.resolve());
  const pendingSettingsSavesRef = useRef(0);

  useEffect(() => {
    let active = true;

    notificationsApi
      .getNotificationSettings()
      .then((settings) => {
        if (!active || !settings) {
          return;
        }

        const loadedSettings = {
          pushEnabled: Boolean(settings.pushEnabled),
          dailyReminderEnabled: Boolean(settings.dailyReminderEnabled),
          dailyReminderTime: normalizeAlertTime(settings.dailyReminderTime),
          draftNoticeEnabled: settings.draftNoticeEnabled ?? true,
        };

        settingsRef.current = loadedSettings;
        setPushNotification(loadedSettings.pushEnabled);
        setRecordReminder(loadedSettings.dailyReminderEnabled);
        setAlertTime(loadedSettings.dailyReminderTime);
        setDraftNotice(Boolean(loadedSettings.draftNoticeEnabled));
      })
      .catch((error) => {
        console.warn("Failed to load notification settings:", error);
      })
      .finally(() => {
        if (active) {
          setSettingsLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const saveNotificationSettings = async (nextSettings) => {
    const payload = {
      ...settingsRef.current,
      ...nextSettings,
    };

    settingsRef.current = payload;
    setPushNotification(payload.pushEnabled);
    setRecordReminder(payload.dailyReminderEnabled);
    setAlertTime(normalizeAlertTime(payload.dailyReminderTime));
    setDraftNotice(Boolean(payload.draftNoticeEnabled));
    pendingSettingsSavesRef.current += 1;
    setSavingSettings(true);

    settingsSaveQueueRef.current = settingsSaveQueueRef.current
      .catch(() => {})
      .then(async () => {
        try {
          const saved = await notificationsApi.updateNotificationSettings({
            ...payload,
            dailyReminderTime: toApiAlertTime(payload.dailyReminderTime),
          });

          if (saved) {
            const savedSettings = {
              pushEnabled: Boolean(saved.pushEnabled),
              dailyReminderEnabled: Boolean(saved.dailyReminderEnabled),
              dailyReminderTime: normalizeAlertTime(
                saved.dailyReminderTime || payload.dailyReminderTime
              ),
              draftNoticeEnabled: saved.draftNoticeEnabled ?? payload.draftNoticeEnabled,
            };

            settingsRef.current = savedSettings;
            setPushNotification(savedSettings.pushEnabled);
            setRecordReminder(savedSettings.dailyReminderEnabled);
            setAlertTime(savedSettings.dailyReminderTime);
            setDraftNotice(Boolean(savedSettings.draftNoticeEnabled));
          }
        } catch (error) {
          console.warn("Failed to update notification settings:", error);
        } finally {
          pendingSettingsSavesRef.current -= 1;

          if (pendingSettingsSavesRef.current === 0) {
            setSavingSettings(false);
          }
        }
      });

    return settingsSaveQueueRef.current;
  };

  const updateRecordReminder = (value) => {
    saveNotificationSettings({ dailyReminderEnabled: value });
  };

  const updatePushNotification = (value) => {
    saveNotificationSettings({ pushEnabled: value });
  };

  const updateDraftNotice = (value) => {
    saveNotificationSettings({ draftNoticeEnabled: value });
  };

  const openTimePicker = () => {
    if (!recordReminder || settingsDisabled) {
      return;
    }

    setDraftAlertTime(alertTime);
    setTimePickerVisible(true);
  };

  const selectDraftHour = (hour) => {
    const [, minute] = draftAlertTime.split(":");
    setDraftAlertTime(`${padTime(hour)}:${minute || "00"}`);
  };

  const selectDraftMinute = (minute) => {
    const [hour] = draftAlertTime.split(":");
    setDraftAlertTime(`${hour || "21"}:${padTime(minute)}`);
  };

  const applyDraftTime = () => {
    const nextTime = normalizeAlertTime(draftAlertTime);
    setTimePickerVisible(false);
    saveNotificationSettings({ dailyReminderTime: nextTime });
  };

  const settingsDisabled = !settingsLoaded || savingSettings;

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
          <ToneSwitch
            value={recordReminder}
            onValueChange={updateRecordReminder}
            disabled={settingsDisabled}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.78}
          style={[
            detailStyles.timeInputRow,
            (!recordReminder || settingsDisabled) && detailStyles.disabledWrap,
          ]}
          onPress={openTimePicker}
          disabled={!recordReminder || settingsDisabled}
        >
          <View style={detailStyles.timeLabelRow}>
            <Ionicons name="time-outline" size={21} color="#FFB36B" />
            <Text style={detailStyles.timeLabel}>{COPY.recordReminderTime}</Text>
          </View>
          <View style={detailStyles.timeValueWrap}>
            <Text style={detailStyles.timeValue}>{alertTime}</Text>
            <Ionicons name="chevron-forward" size={18} color="#E8B17C" />
          </View>
        </TouchableOpacity>

        <SettingRow
          icon="notifications-outline"
          title={COPY.pushNotification}
          copy={COPY.pushNotificationCopy}
          right={
            <ToneSwitch
              value={pushNotification}
              onValueChange={updatePushNotification}
              disabled={settingsDisabled}
            />
          }
        />
        <SettingRow
          icon="save-outline"
          title={COPY.draftNotice}
          copy={COPY.draftNoticeCopy}
          right={
            <ToneSwitch
              value={draftNotice}
              onValueChange={updateDraftNotice}
              disabled={settingsDisabled}
            />
          }
          last
        />
      </View>

      <TimePickerModal
        visible={timePickerVisible}
        value={draftAlertTime}
        onSelectHour={selectDraftHour}
        onSelectMinute={selectDraftMinute}
        onCancel={() => setTimePickerVisible(false)}
        onConfirm={applyDraftTime}
      />
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
            onPress={() => openContactForm(item.url)}
          />
        ))}
      </View>

      <TouchableOpacity
        activeOpacity={0.86}
        style={detailStyles.primaryButton}
        onPress={openContactForm}
      >
        <Ionicons name="send-outline" size={18} color="#FFFFFF" />
        <Text style={detailStyles.primaryButtonText}>{COPY.send}</Text>
      </TouchableOpacity>
    </DetailShell>
  );
}

export function AccountSettingsScreen({ navigation }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [reauthNoticeVisible, setReauthNoticeVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [withdrawSaving, setWithdrawSaving] = useState(false);

  const closePasswordModal = () => {
    if (passwordSaving) {
      return;
    }

    setPasswordVisible(false);
    setPasswordError("");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      setPasswordError("\uBE44\uBC00\uBC88\uD638\uB97C \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("\uC0C8 \uBE44\uBC00\uBC88\uD638\uB294 8\uC790 \uC774\uC0C1\uC73C\uB85C \uC124\uC815\uD574\uC8FC\uC138\uC694.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setPasswordError("\uC0C8 \uBE44\uBC00\uBC88\uD638\uAC00 \uC11C\uB85C \uB2E4\uB985\uB2C8\uB2E4.");
      return;
    }

    setPasswordSaving(true);
    setPasswordError("");

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      setPasswordVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setReauthNoticeVisible(true);
    } catch (error) {
      console.warn("Failed to change password:", error);
      setPasswordError("\uBE44\uBC00\uBC88\uD638\uB97C \uBCC0\uACBD\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC785\uB825\uAC12\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const withdrawAccount = async () => {
    setWithdrawSaving(true);
    setWithdrawError("");

    try {
      await authApi.deleteAccount();
      navigation.replace("Login");
    } catch (error) {
      console.warn("Failed to delete account:", error);
      setWithdrawError("\uD0C8\uD1F4 \uCC98\uB9AC\uB97C \uC644\uB8CC\uD558\uC9C0 \uBABB\uD588\uC5B4\uC694. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.");
      setWithdrawSaving(false);
    }
  };

  return (
    <DetailShell
      navigation={navigation}
      title={COPY.accountTitle}
      eyebrow={COPY.accountEyebrow}
      lead={COPY.accountLead}
    >
      <View style={detailStyles.card}>
        <SettingRow
          icon="lock-closed-outline"
          title={COPY.passwordChange}
          copy={COPY.passwordChangeCopy}
          right={<Ionicons name="chevron-forward" size={21} color="#E8B17C" />}
          onPress={() => setPasswordVisible(true)}
        />
        <SettingRow
          icon="trash-outline"
          title={COPY.withdraw}
          copy={COPY.withdrawCopy}
          right={<Ionicons name="chevron-forward" size={21} color="#E8B17C" />}
          onPress={() => {
            setWithdrawError("");
            setWithdrawVisible(true);
          }}
          last
        />
      </View>

      <PasswordChangeModal
        visible={passwordVisible}
        currentPassword={currentPassword}
        newPassword={newPassword}
        newPasswordConfirm={newPasswordConfirm}
        error={passwordError}
        saving={passwordSaving}
        onChangeCurrentPassword={setCurrentPassword}
        onChangeNewPassword={setNewPassword}
        onChangeNewPasswordConfirm={setNewPasswordConfirm}
        onCancel={closePasswordModal}
        onConfirm={changePassword}
      />
      <ConfirmDialog
        visible={reauthNoticeVisible}
        title={"\uBE44\uBC00\uBC88\uD638\uAC00 \uBCC0\uACBD\uB410\uC5B4\uC694"}
        copy={"\uACC4\uC815 \uBCF4\uC548\uC744 \uC704\uD574 \uC0C8 \uBE44\uBC00\uBC88\uD638\uB85C \uB2E4\uC2DC \uB85C\uADF8\uC778\uD574\uC8FC\uC138\uC694."}
        confirmLabel={"\uD655\uC778\uD588\uC5B4\uC694"}
        singleAction
        onCancel={() => navigation.replace("Login")}
        onConfirm={() => navigation.replace("Login")}
      />
      <ConfirmDialog
        visible={withdrawVisible}
        title={"\uC815\uB9D0 \uD0C8\uD1F4\uD560\uAE4C\uC694?"}
        copy={"\uACC4\uC815\uACFC \uAE30\uB85D\uC774 \uC0AD\uC81C\uB418\uBA70, \uB2E4\uC2DC \uBCF5\uAD6C\uD558\uAE30 \uC5B4\uB824\uC6CC\uC694."}
        confirmLabel={withdrawSaving ? "\uCC98\uB9AC \uC911" : COPY.withdraw}
        error={withdrawError}
        danger
        disabled={withdrawSaving}
        onCancel={() => {
          if (!withdrawSaving) {
            setWithdrawVisible(false);
            setWithdrawError("");
          }
        }}
        onConfirm={withdrawAccount}
      />
    </DetailShell>
  );
}

function TimePickerModal({
  visible,
  value,
  onSelectHour,
  onSelectMinute,
  onCancel,
  onConfirm,
}) {
  const [selectedHour, selectedMinute] = normalizeAlertTime(value)
    .split(":")
    .map(Number);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={detailStyles.modalOverlay}>
        <View style={detailStyles.timePickerSheet}>
          <View style={detailStyles.modalHandle} />
          <Text style={detailStyles.modalTitle}>{COPY.recordReminderTime}</Text>
          <Text style={detailStyles.modalCopy}>
            {"\uD558\uB8E8\uB97C \uC815\uB9AC\uD560 \uBB34\uB300 \uC2DC\uAC04\uC744 \uACE0\uB974\uC138\uC694."}
          </Text>

          <View style={detailStyles.timePickerColumns}>
            <ScrollView
              style={detailStyles.timePickerColumn}
              contentContainerStyle={detailStyles.timePickerColumnContent}
              showsVerticalScrollIndicator={false}
            >
              {HOURS.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  activeOpacity={0.78}
                  style={[
                    detailStyles.timeOption,
                    hour === selectedHour && detailStyles.selectedTimeOption,
                  ]}
                  onPress={() => onSelectHour(hour)}
                >
                  <Text
                    style={[
                      detailStyles.timeOptionText,
                      hour === selectedHour && detailStyles.selectedTimeOptionText,
                    ]}
                  >
                    {padTime(hour)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={detailStyles.timeColon}>:</Text>
            <ScrollView
              style={detailStyles.timePickerColumn}
              contentContainerStyle={detailStyles.timePickerColumnContent}
              showsVerticalScrollIndicator={false}
            >
              {MINUTES.map((minute) => (
                <TouchableOpacity
                  key={minute}
                  activeOpacity={0.78}
                  style={[
                    detailStyles.timeOption,
                    minute === selectedMinute && detailStyles.selectedTimeOption,
                  ]}
                  onPress={() => onSelectMinute(minute)}
                >
                  <Text
                    style={[
                      detailStyles.timeOptionText,
                      minute === selectedMinute && detailStyles.selectedTimeOptionText,
                    ]}
                  >
                    {padTime(minute)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={detailStyles.modalActions}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={[detailStyles.modalButton, detailStyles.modalGhostButton]}
              onPress={onCancel}
            >
              <Text style={detailStyles.modalGhostText}>{COPY.timeCancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.82}
              style={detailStyles.modalButton}
              onPress={onConfirm}
            >
              <Text style={detailStyles.modalButtonText}>{COPY.timeSave}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PasswordChangeModal({
  visible,
  currentPassword,
  newPassword,
  newPasswordConfirm,
  error,
  saving,
  onChangeCurrentPassword,
  onChangeNewPassword,
  onChangeNewPasswordConfirm,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={detailStyles.modalOverlay}>
        <View style={detailStyles.formDialog}>
          <Text style={detailStyles.modalTitle}>{COPY.passwordChange}</Text>
          <Text style={detailStyles.modalCopy}>
            {"\uC0C8 \uBE44\uBC00\uBC88\uD638\uB85C \uBCC0\uACBD\uD558\uBA74 \uB2E4\uC2DC \uB85C\uADF8\uC778\uD574\uC57C \uD574\uC694."}
          </Text>
          <SecureInput
            placeholder={"\uD604\uC7AC \uBE44\uBC00\uBC88\uD638"}
            value={currentPassword}
            onChangeText={onChangeCurrentPassword}
          />
          <SecureInput
            placeholder={"\uC0C8 \uBE44\uBC00\uBC88\uD638"}
            value={newPassword}
            onChangeText={onChangeNewPassword}
          />
          <SecureInput
            placeholder={"\uC0C8 \uBE44\uBC00\uBC88\uD638 \uD655\uC778"}
            value={newPasswordConfirm}
            onChangeText={onChangeNewPasswordConfirm}
          />
          {!!error && <Text style={detailStyles.errorText}>{error}</Text>}
          <View style={detailStyles.modalActions}>
            <TouchableOpacity
              activeOpacity={0.82}
              style={[detailStyles.modalButton, detailStyles.modalGhostButton]}
              onPress={onCancel}
              disabled={saving}
            >
              <Text style={detailStyles.modalGhostText}>{COPY.timeCancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.82}
              style={[detailStyles.modalButton, saving && detailStyles.disabledWrap]}
              onPress={onConfirm}
              disabled={saving}
            >
              <Text style={detailStyles.modalButtonText}>
                {saving ? "\uBCC0\uACBD \uC911" : "\uBCC0\uACBD\uD558\uAE30"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SecureInput({ placeholder, value, onChangeText }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255, 222, 204, 0.44)"
      secureTextEntry
      style={detailStyles.secureInput}
    />
  );
}

function ConfirmDialog({
  visible,
  title,
  copy,
  confirmLabel,
  error,
  singleAction,
  danger,
  disabled,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={detailStyles.modalOverlay}>
        <View style={detailStyles.formDialog}>
          <Text style={detailStyles.modalTitle}>{title}</Text>
          <Text style={detailStyles.modalCopy}>{copy}</Text>
          {!!error && <Text style={detailStyles.errorText}>{error}</Text>}
          <View style={detailStyles.modalActions}>
            {!singleAction && (
              <TouchableOpacity
                activeOpacity={0.82}
                style={[detailStyles.modalButton, detailStyles.modalGhostButton]}
                onPress={onCancel}
                disabled={disabled}
              >
                <Text style={detailStyles.modalGhostText}>{COPY.timeCancel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.82}
              style={[
                detailStyles.modalButton,
                danger && detailStyles.dangerButton,
                disabled && detailStyles.disabledWrap,
              ]}
              onPress={onConfirm}
              disabled={disabled}
            >
              <Text style={detailStyles.modalButtonText}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DetailShell({ navigation, title, eyebrow, lead, children }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const shell = createShellStyles(width, height, insets);

  return (
    <ImageBackground
      source={require("../../assets/images/login_background.png")}
      style={shell.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={shell.safeArea} edges={["left", "right"]}>
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

function SettingRow({ icon, title, copy, right, last, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      style={[detailStyles.settingRow, last && detailStyles.lastRow]}
      onPress={onPress}
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

const createShellStyles = (screenWidth, screenHeight, insets) => {
  const sx = screenWidth / 393;
  const sy = screenHeight / 824;
  const scale = Math.min(Math.max(Math.min(sx, sy), 0.82), 1.15);
  const ms = (value) => value * scale;
  const vs = (value) => value * sy;
  const pagePadding = ms(screenWidth >= 600 ? 22 : 25);
  const contentWidth = Math.min(screenWidth - pagePadding * 2, screenWidth >= 600 ? 520 : 393);
  const topPadding = Math.max(insets.top, vs(18)) + vs(screenWidth >= 600 ? 24 : 26);

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
      paddingTop: topPadding,
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
  timeValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 3,
  },
  timeValue: {
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
  modalOverlay: {
    flex: 1,
    paddingHorizontal: 24,
    backgroundColor: "rgba(4, 6, 18, 0.68)",
    alignItems: "center",
    justifyContent: "center",
  },
  timePickerSheet: {
    width: "100%",
    maxWidth: 360,
    maxHeight: "82%",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 163, 99, 0.72)",
    backgroundColor: "rgba(28, 13, 48, 0.97)",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },
  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: 4,
    backgroundColor: "rgba(255, 222, 204, 0.46)",
    marginBottom: 17,
  },
  modalTitle: {
    color: "#FFE0BE",
    fontFamily: "NanumSquareNeo",
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
  },
  modalCopy: {
    marginTop: 6,
    color: "rgba(255, 222, 204, 0.68)",
    fontFamily: "NanumSquareNeo",
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },
  timePickerColumns: {
    height: 240,
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timePickerColumn: {
    width: 92,
    height: 220,
  },
  timePickerColumnContent: {
    paddingVertical: 6,
  },
  timeOption: {
    height: 42,
    marginVertical: 3,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedTimeOption: {
    borderWidth: 1,
    borderColor: "rgba(255, 179, 107, 0.78)",
    backgroundColor: "rgba(245, 102, 67, 0.22)",
  },
  timeOptionText: {
    color: "rgba(255, 226, 188, 0.7)",
    fontFamily: "NanumSquareNeo",
    fontSize: 17,
    lineHeight: 24,
  },
  selectedTimeOptionText: {
    color: "#FFE0BE",
    fontSize: 20,
  },
  timeColon: {
    width: 30,
    color: "#FFB36B",
    fontFamily: "NanumSquareNeo",
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
  },
  modalActions: {
    marginTop: 18,
    flexDirection: "row",
    columnGap: 10,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F56643",
    alignItems: "center",
    justifyContent: "center",
  },
  modalGhostButton: {
    borderWidth: 1,
    borderColor: "rgba(255, 179, 107, 0.54)",
    backgroundColor: "rgba(34, 20, 56, 0.78)",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontFamily: "NanumSquareNeo",
    fontSize: 14,
    lineHeight: 21,
  },
  modalGhostText: {
    color: "#F9CBA4",
    fontFamily: "NanumSquareNeo",
    fontSize: 14,
    lineHeight: 21,
  },
  formDialog: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 163, 99, 0.72)",
    backgroundColor: "rgba(28, 13, 48, 0.97)",
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  secureInput: {
    height: 48,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 179, 107, 0.34)",
    backgroundColor: "rgba(18, 11, 34, 0.58)",
    paddingHorizontal: 14,
    color: "#FFE2BC",
    fontFamily: "NanumSquareNeo",
    fontSize: 14,
    lineHeight: 21,
  },
  errorText: {
    marginTop: 10,
    color: "#FF9B7A",
    fontFamily: "NanumSquareNeo",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  dangerButton: {
    backgroundColor: "#C94D4D",
  },
});
