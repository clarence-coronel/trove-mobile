import useColorTheme from "@/hooks/useColorTheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
}

export function FormField({
  label,
  required = false,
  ...textInputProps
}: FormFieldProps) {
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
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.background.secondary,
            color: theme.text.primary,
            borderColor: theme.divider,
          },
        ]}
        placeholderTextColor={theme.text.secondary}
        {...textInputProps}
      />
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
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
  },
});
