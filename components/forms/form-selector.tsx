import useColorTheme from "@/hooks/useColorTheme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Option = {
  label: string;
  value: string;
};
interface FormSelectorProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function FormSelector({
  label,
  options,
  value,
  onChange,
  required = false,
}: FormSelectorProps) {
  const { theme } = useColorTheme();

  return (
    <View style={styles.formGroup}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={[styles.label, { color: theme.text.primary }]}>
          {label}
        </Text>
        {required && (
          <Text style={[styles.label, { color: theme.error }]}>*</Text>
        )}
      </View>
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={`${option.value}-${index}`}
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  value === option.value
                    ? theme.tint
                    : theme.background.secondary,
                borderColor: theme.divider,
              },
            ]}
            onPress={() => onChange(option.value)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color:
                    value === option.value ? "#FFFFFF" : theme.text.primary,
                },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    minWidth: "30%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
