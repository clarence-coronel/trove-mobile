const tintColorLight = "#10871a";
const tintColorDark = "#10871a";

export default {
  light: {
    text: {
      primary: "#000",
      secondary: "",
    },
    background: { primary: "#fff", secondary: "#f1efefff" },
    tint: tintColorLight,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorLight,
    divider: "#ddd",
  },
  dark: {
    text: {
      primary: "#fff",
      secondary: "rgba(255, 255, 255, 0.46)",
    },
    background: { primary: "#181717ff", secondary: "#111010ff" },
    tint: tintColorDark,
    tabIconDefault: "#ccc",
    tabIconSelected: tintColorDark,
    divider: "#444",
  },
};
