import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? "light"].tint;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        headerShown: useClientOnlyValue(false, false),
        tabBarStyle: {
          height: 60, // reduced height
          backgroundColor: Colors[colorScheme ?? "light"].background,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons size={28} name="cash-plus" color={color} />
          ),
        }}
      />

      {/* Center floating Home tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.homeWrapper}>
              <View
                style={[
                  styles.centerIconContainer,
                  {
                    borderColor: color,
                    backgroundColor: Colors[colorScheme ?? "light"].background,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="wallet-bifold-outline"
                  size={30}
                  color={color}
                />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons size={28} name="cash-minus" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  homeWrapper: {
    width: 70,
    alignItems: "center",
    justifyContent: "flex-start",
    height: 60, // match new tab bar height
  },
  centerIconContainer: {
    position: "absolute",
    top: -10, // floating above tab bar
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 35,
    borderWidth: 2,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 4,
    // elevation: 5,
  },
  homeLabel: {
    marginTop: 38, // position below the floating icon
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
