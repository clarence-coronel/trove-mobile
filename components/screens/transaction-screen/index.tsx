import useColorTheme from "@/hooks/useColorTheme";
import { TransactionType } from "@/lib/db";
import * as React from "react";
import { useState } from "react";
import { Dimensions } from "react-native";
import { TabBar, TabView } from "react-native-tab-view";
import HistoryTab from "./history-tab";
import TransactionFormTab from "./transaction-form-tab";

interface Props {
  type: TransactionType;
}

export default function TransactionScreen({ type }: Props) {
  const { theme } = useColorTheme();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "form", title: "Form" },
    { key: "history", title: "History" },
  ]);

  return (
    <TabView
      style={{ backgroundColor: theme.background.secondary }}
      navigationState={{ index, routes }}
      renderScene={({ route }) => {
        switch (route.key) {
          case "form":
            return <TransactionFormTab type={type} />;
          case "history":
            return <HistoryTab type={type} />;
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
