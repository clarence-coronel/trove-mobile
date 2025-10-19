import AccountsTab from "@/components/accounts/accounts-tab";
import OverviewTab from "@/components/accounts/overview-tab";
import { View } from "@/components/Themed";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import * as React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

export default function AccountsScreen() {
  const colorScheme = useColorScheme();
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
    <View style={styles.container}>
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
              backgroundColor: Colors[colorScheme ?? "light"].tint,
            }}
            style={{
              backgroundColor:
                Colors[colorScheme ?? "light"].background.primary,
            }}
            activeColor={Colors[colorScheme ?? "light"].tint} // active tab text color
            inactiveColor={colorScheme === "dark" ? "#888" : "#555"} // inactive tab text color
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
