import AccountsTab from "@/components/screens/home/accounts-tab";
import OverviewTab from "@/components/screens/home/overview-tab";
import { View } from "@/components/Themed";
import useColorTheme from "@/hooks/useColorTheme";
import * as React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

export default function AccountsScreen() {
  const { theme, mode } = useColorTheme();
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "overview", title: "Overview" },
    { key: "accounts", title: "Accounts" },
  ]);

  const renderScene = SceneMap({
    overview: OverviewTab,
    accounts: AccountsTab,
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background.secondary },
      ]}
    >
      {/* Tab View */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{
              backgroundColor: theme.tint,
            }}
            style={{
              backgroundColor: theme.background.primary,
            }}
            activeColor={theme.tint} // active tab text color
            inactiveColor={mode === "dark" ? "#888" : "#555"} // inactive tab text color
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
