import { View, Text, StyleSheet } from "react-native";
import colors from "../styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header({ title = "Casting" }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Text style={styles.logo}>Casting</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    paddingHorizontal: 20,
    backgroundColor: colors.beige,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.coral,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.navy,
  },
});
