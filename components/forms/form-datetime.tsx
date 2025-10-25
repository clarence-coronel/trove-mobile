import useColorTheme from "@/hooks/useColorTheme";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface FormDateTimeProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: "date" | "time" | "datetime";
  required?: boolean;
}

export function FormDateTime({
  label,
  value,
  onChange,
  mode = "datetime",
  required = false,
}: FormDateTimeProps) {
  const { theme } = useColorTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      if (mode === "datetime") {
        onChange(selectedDate);
        setShowTimePicker(true);
      } else {
        onChange(selectedDate);
      }
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(value);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      onChange(updatedDate);
    }
  };

  const handlePress = () => {
    if (mode === "time") {
      setShowTimePicker(true);
    } else {
      setShowDatePicker(true);
    }
  };

  const getDisplayText = () => {
    switch (mode) {
      case "date":
        return value.toLocaleDateString();
      case "time":
        return value.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "datetime":
        return `${value.toLocaleDateString()} ${value.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
    }
  };

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

      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor: theme.background.secondary,
            borderColor: theme.divider,
          },
        ]}
        onPress={handlePress}
      >
        <Text style={[styles.dateText, { color: theme.text.primary }]}>
          {getDisplayText()}
        </Text>
        <Text style={[styles.icon, { color: theme.text.secondary }]}>🗓</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
          accentColor={theme.tint}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={value}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeTime}
          accentColor={theme.tint}
        />
      )}
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
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 14,
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginLeft: 8,
  },
});
