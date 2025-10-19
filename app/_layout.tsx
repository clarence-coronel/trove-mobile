import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { database } from "@/lib/db/database";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [dbInitialized, setDbInitialized] = useState(false);

  const queryClient = new QueryClient();

  // Paper themes
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  // Navigation themes
  const navigationTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

  const initializeDatabase = async () => {
    try {
      await database.init();
      setDbInitialized(true);
      console.log("Database ready");
    } catch (error) {
      console.error("Failed to initialize database:", error);
    }
  };

  useEffect(() => {
    initializeDatabase();
  }, []);

  if (!dbInitialized) {
    return null; // or return null
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperTheme}>
          <NavigationThemeProvider value={navigationTheme}>
            <StatusBar style={isDark ? "light" : "dark"} />

            <SafeAreaView
              style={{
                flex: 1,
                backgroundColor: isDark ? "#000000" : "#ffffff",
              }}
            >
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal" }}
                />
              </Stack>
            </SafeAreaView>
          </NavigationThemeProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
