import Colors from "@/constants/Colors";
import { useColorScheme } from "react-native";

const useColorTheme = () => {
  const colorScheme = useColorScheme();

  return {
    theme: Colors[colorScheme ?? "light"],
    mode: colorScheme ?? "light",
  };
};

export default useColorTheme;
