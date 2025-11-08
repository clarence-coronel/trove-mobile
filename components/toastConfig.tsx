import useColorTheme from "@/hooks/useColorTheme"; // your existing hook
import React from "react";
import { BaseToast, ErrorToast } from "react-native-toast-message";

// Custom toast configuration using your theme
export const useToastConfig = () => {
  const { theme } = useColorTheme();

  return {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.tint,
          backgroundColor: theme.background.primary,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          color: theme.text.primary,
          fontWeight: "600",
        }}
        text2Style={{
          color: theme.text.secondary,
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.error,
          backgroundColor: theme.background.primary,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          color: theme.text.primary,
          fontWeight: "600",
        }}
        text2Style={{
          color: theme.text.secondary,
        }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.tabIconSelected,
          backgroundColor: theme.background.primary,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          color: theme.text.primary,
          fontWeight: "600",
        }}
        text2Style={{
          color: theme.text.secondary,
        }}
      />
    ),
  };
};
