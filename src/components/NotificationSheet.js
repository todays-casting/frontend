import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const COPY = {
  eyebrow: "\u2726  TODAY",
  title: "\uC54C\uB9BC",
  close: "\uBAA8\uB450 \uD655\uC778\uD588\uC5B4\uC694",
  empty: "\uC0C8 \uC54C\uB9BC\uC774 \uC5C6\uC5B4\uC694.",
};

export default function NotificationSheet({
  visible,
  notifications = [],
  onClose,
  onMarkAllRead,
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = createStyles(width, height, insets);
  const handleMarkAllRead = () => {
    onMarkAllRead?.();
    onClose?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.popover}>
          <View style={styles.arrow} />

          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{COPY.eyebrow}</Text>
              <Text style={styles.title}>{COPY.title}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.75} style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFD6A8" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.listScroll}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator
            bounces={false}
          >
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <View key={`${item.title}-${item.time}`} style={styles.item}>
                  <View style={[styles.iconWrap, item.unread && styles.unreadIconWrap]}>
                    <MaterialCommunityIcons
                      name={item.icon || "bell-outline"}
                      size={20}
                      color="#FFD29D"
                    />
                  </View>
                  <View style={styles.itemTextWrap}>
                    <View style={styles.itemTitleRow}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.unread && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.itemBody}>{item.body}</Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyBox}>
                <MaterialCommunityIcons name="bell-check-outline" size={24} color="#FFD29D" />
                <Text style={styles.emptyText}>{COPY.empty}</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity activeOpacity={0.84} style={styles.primaryButton} onPress={handleMarkAllRead}>
            <Text style={styles.primaryButtonText}>{COPY.close}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (screenWidth, screenHeight, insets) => {
  const scale = Math.min(Math.max(screenWidth / 393, 0.82), 1.15);
  const ms = (value) => value * scale;
  const horizontalInset = ms(14);
  const popoverWidth = Math.min(screenWidth - horizontalInset * 2, 410);
  const popoverTop = Math.max(insets.top, ms(16)) + ms(56);
  const popoverRight = Math.max(horizontalInset, (screenWidth - popoverWidth) / 2);
  const listMaxHeight = Math.min(screenHeight * 0.42, ms(360));

  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(3, 5, 16, 0.36)",
    },
    popover: {
      position: "absolute",
      top: popoverTop,
      right: popoverRight,
      width: popoverWidth,
      borderRadius: ms(20),
      borderWidth: 1,
      borderColor: "rgba(255, 179, 107, 0.52)",
      backgroundColor: "rgba(27, 15, 47, 0.98)",
      paddingHorizontal: ms(16),
      paddingTop: ms(16),
      paddingBottom: ms(14),
      shadowColor: "#FF8C55",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.26,
      shadowRadius: 22,
      elevation: 22,
    },
    arrow: {
      position: "absolute",
      top: -ms(7),
      right: ms(31),
      width: ms(14),
      height: ms(14),
      borderLeftWidth: 1,
      borderTopWidth: 1,
      borderColor: "rgba(255, 179, 107, 0.52)",
      backgroundColor: "rgba(27, 15, 47, 0.98)",
      transform: [{ rotate: "45deg" }],
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    eyebrow: {
      color: "#FFB36B",
      fontFamily: "MaruBuriSemiBold",
      fontSize: ms(12),
      lineHeight: ms(18),
      letterSpacing: 0,
    },
    title: {
      marginTop: ms(2),
      color: "#FFE0BE",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(22),
      lineHeight: ms(31),
    },
    closeButton: {
      width: ms(40),
      height: ms(40),
      borderRadius: ms(20),
      backgroundColor: "rgba(255, 214, 168, 0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    listScroll: {
      maxHeight: listMaxHeight,
      marginTop: ms(13),
    },
    list: {
      rowGap: ms(10),
      paddingBottom: ms(2),
    },
    item: {
      minHeight: ms(86),
      borderRadius: ms(15),
      borderWidth: 1,
      borderColor: "rgba(255, 211, 195, 0.14)",
      backgroundColor: "rgba(45, 24, 70, 0.82)",
      paddingHorizontal: ms(13),
      paddingVertical: ms(13),
      flexDirection: "row",
    },
    iconWrap: {
      width: ms(38),
      height: ms(38),
      borderRadius: ms(19),
      backgroundColor: "rgba(255, 179, 107, 0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    unreadIconWrap: {
      backgroundColor: "rgba(245, 102, 67, 0.24)",
    },
    itemTextWrap: {
      flex: 1,
      minWidth: 0,
      marginLeft: ms(11),
    },
    itemTitleRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    itemTitle: {
      flex: 1,
      color: "#FFE0BE",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(14),
      lineHeight: ms(21),
    },
    unreadDot: {
      width: ms(7),
      height: ms(7),
      borderRadius: ms(3.5),
      marginLeft: ms(8),
      backgroundColor: "#FF7746",
    },
    itemBody: {
      marginTop: ms(4),
      color: "rgba(255, 229, 205, 0.7)",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(12),
      lineHeight: ms(18),
    },
    itemTime: {
      marginTop: ms(7),
      color: "rgba(255, 179, 107, 0.78)",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(11),
      lineHeight: ms(16),
    },
    emptyBox: {
      minHeight: ms(104),
      borderRadius: ms(15),
      borderWidth: 1,
      borderColor: "rgba(255, 211, 195, 0.14)",
      backgroundColor: "rgba(45, 24, 70, 0.62)",
      alignItems: "center",
      justifyContent: "center",
      rowGap: ms(8),
    },
    emptyText: {
      color: "rgba(255, 229, 205, 0.76)",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(13),
      lineHeight: ms(20),
    },
    primaryButton: {
      height: ms(46),
      marginTop: ms(13),
      borderRadius: ms(23),
      backgroundColor: "#F56643",
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: "#FFFFFF",
      fontFamily: "NanumSquareNeo",
      fontSize: ms(14),
      lineHeight: ms(21),
    },
  });
};
