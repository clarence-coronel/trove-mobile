import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Feather } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

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
          backgroundColor: Colors[colorScheme ?? "light"].background.primary,
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
            <Feather size={20} name="plus-circle" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "Expenses",
          tabBarIcon: ({ color }) => (
            <Feather size={20} name="minus-circle" color={color} />
          ),
        }}
      />
      {/* Center floating Home tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Trove",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View style={styles.homeWrapper}>
              <View
                style={[
                  styles.centerIconContainer,
                  {
                    borderColor: color,
                    backgroundColor:
                      Colors[colorScheme ?? "light"].background.primary,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="treasure-chest-outline"
                  size={30}
                  color={color}
                />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="trend"
        options={{
          title: "Trend",
          tabBarIcon: ({ color }) => (
            <Feather size={20} name="trending-up" color={color} />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity style={[props.style, { opacity: 0.3 }]}>
              {props.children}
            </TouchableOpacity>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Feather size={20} name="settings" color={color} />
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
    top: 0, // floating above tab bar
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
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
