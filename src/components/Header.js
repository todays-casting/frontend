import { View, Text, StyleSheet } from "react-native";
import colors from "../styles/colors";

export default function Header({ title = "Casting" }) {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>Casting</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 90,
    paddingTop: 42,
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