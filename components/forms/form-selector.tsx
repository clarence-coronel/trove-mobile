import useColorTheme from "@/hooks/useColorTheme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FormSelectorProps<T> {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel?: (option: T) => string;
  required?: boolean;
}

export function FormSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel = (option) => option,
  required = false,
}: FormSelectorProps<T>) {
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
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor:
                  value === option ? theme.tint : theme.background.secondary,
                borderColor: theme.divider,
              },
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: value === option ? "#FFFFFF" : theme.text.primary,
                },
              ]}
            >
              {getLabel(option)}
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
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  optionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
