import useColorTheme from "@/hooks/useColorTheme";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Modal from "react-native-modal";
import Toast from "react-native-toast-message";
import { useToastConfig } from "../toastConfig";

interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  onSubmit: () => void;
  disableSubmit?: boolean;
  submitText?: string;
  cancelText?: string;
}

export default function FormModal({
  visible,
  onClose,
  title,
  headerRight,
  children,
  onSubmit,
  submitText = "Submit",
  disableSubmit = false,
  cancelText = "Cancel",
}: FormModalProps) {
  const { theme } = useColorTheme();
  const toastConfig = useToastConfig();

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.5}
      style={{ justifyContent: "flex-end", margin: 0 }}
      useNativeDriver={true}
      hideModalContentWhileAnimating
      animationIn="slideInUp"
      animationOut="slideOutDown"
      avoidKeyboard={true}
    >
      <Toast config={toastConfig} position="top" topOffset={20} />
      <View
        style={[
          styles.modalContent,
          { backgroundColor: theme.background.primary },
        ]}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          enableAutomaticScroll
          extraScrollHeight={Platform.OS === "ios" ? 80 : 20}
          showsVerticalScrollIndicator={false}
        >
          {(title || headerRight) && (
            <View style={styles.headerContainer}>
              {title && (
                <Text
                  style={[styles.modalTitle, { color: theme.text.primary }]}
                >
                  {title}
                </Text>
              )}
              {headerRight && (
                <View style={styles.headerRight}>{headerRight}</View>
              )}
            </View>
          )}

          {children}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: theme.divider },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.text.primary }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={disableSubmit}
              style={[
                styles.button,
                styles.submitButton,
                {
                  backgroundColor: disableSubmit
                    ? theme.text.secondary
                    : theme.tint,
                },
              ]}
              onPress={onSubmit}
            >
              <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                {submitText}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: "90%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
    lineHeight: 32,
  },
  headerRight: {
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  submitButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
