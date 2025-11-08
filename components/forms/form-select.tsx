import useColorTheme from "@/hooks/useColorTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Option = { label: string; value: string };

interface FormSelectProps {
  label: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function FormSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
}: FormSelectProps) {
  const { theme } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
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
          styles.selectButton,
          {
            backgroundColor: theme.background.secondary,
            borderColor: theme.divider,
          },
        ]}
        onPress={() => setIsOpen(true)}
      >
        <Text
          style={[
            styles.selectText,
            {
              color: value ? theme.text.primary : theme.text.secondary,
            },
          ]}
        >
          {value
            ? options.find((opt) => opt.value === value)?.label ?? value
            : placeholder}
        </Text>

        <MaterialCommunityIcons
          name="menu-down"
          size={18}
          color={theme.text.secondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.background.primary },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.divider }]}
            >
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                {label}
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={[styles.closeButton, { color: theme.tint }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => {
                const isSelected = value === option.value;
                return (
                  <TouchableOpacity
                    key={`${option.value}-${index}`}
                    style={[
                      styles.optionItem,
                      {
                        backgroundColor: isSelected
                          ? theme.tint + "20"
                          : "transparent",
                        borderBottomColor: theme.divider,
                      },
                    ]}
                    onPress={() => handleSelect(option)}
                  >
                    <Text
                      style={[
                        styles.optionItemText,
                        {
                          color: isSelected ? theme.tint : theme.text.primary,
                          fontWeight: isSelected ? "600" : "400",
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Text style={[styles.checkmark, { color: theme.tint }]}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
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
  selectButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectText: {
    fontSize: 14,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    fontSize: 14,
    fontWeight: "600",
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionItemText: {
    fontSize: 14,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
