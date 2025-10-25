import useColorTheme from "@/hooks/useColorTheme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function SpinnerLoader() {
  const { theme } = useColorTheme();

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={theme.tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
