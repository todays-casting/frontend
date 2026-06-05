import { View, Text, StyleSheet } from "react-native";
import Header from "../components/Header";
import colors from "../styles/colors";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header title="홈" />

      <View style={styles.content}>
        <Text style={styles.title}>홈 화면</Text>
        <Text style={styles.description}>개발 시작!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.beige,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.navy,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: colors.darkGray,
  },
});