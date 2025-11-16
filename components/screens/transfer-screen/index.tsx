import useColorTheme from "@/hooks/useColorTheme";
import * as React from "react";
import { useState } from "react";
import { Dimensions } from "react-native";
import { TabBar, TabView } from "react-native-tab-view";
import TransferFormTab from "./transfer-form-tab";

export default function TransferScreen() {
  const { theme } = useColorTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([{ key: "form", title: "Transfer" }]);

  return (
    <TabView
      style={{ backgroundColor: theme.background.secondary }}
      navigationState={{ index, routes }}
      renderScene={({ route }) => {
        switch (route.key) {
          case "form":
            return <TransferFormTab />;

          default:
            return null;
        }
      }}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get("window").width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: theme.tint }}
          style={{ backgroundColor: theme.background.primary }}
          activeColor={theme.tint}
          inactiveColor="#888"
        />
      )}
    />
  );
}
