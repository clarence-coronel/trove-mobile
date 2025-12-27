import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import useColorTheme from "@/hooks/useColorTheme";
import Account, { AccountType } from "@/lib/dbv2/model/Account";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { FormField } from "../../forms/form-field";
import { FormSelector } from "../../forms/form-selector";
import FormModal from "../../modals/form-modal";

interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: (id: string, account: Partial<Account>) => void;
  onDelete: (id: string) => void;
  account: Account | null;
}

interface FormState {
  provider: string;
  name: string;
  type: AccountType;
}

export default function EditAccountModal({
  visible,
  onClose,
  onEdit,
  onDelete,
  account,
}: EditAccountModalProps) {
  const { theme } = useColorTheme();

  const [formData, setFormData] = useState<FormState>({
    provider: "",
    name: "",
    type: AccountType.SAVINGS,
  });

  useEffect(() => {
    if (account) {
      setFormData({
        provider: account.provider,
        name: account.name,
        type: account.type,
      });
    }
  }, [account]);

  const handleSubmit = () => {
    if (!formData.provider || !formData.name || !formData.type) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields",
      });
      return;
    }

    if (!account) return;

    const updatedAccount: Partial<Account> = {
      provider: formData.provider,
      name: formData.name,
      type: formData.type,
    };

    onEdit(account.id, updatedAccount);
    onClose();
  };

  const handleDelete = () => {
    if (!account) return;

    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(account.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    onClose();
  };

  if (!account) return null;

  return (
    <FormModal
      visible={visible}
      onClose={handleClose}
      title="Edit Account"
      onSubmit={handleSubmit}
      submitText="Save Changes"
      disableSubmit={!formData.provider || !formData.name || !formData.type}
      headerRight={
        <TouchableOpacity onPress={handleDelete}>
          <MaterialCommunityIcons
            name="delete-outline"
            size={20}
            style={{ color: theme.error, textAlign: "center" }}
          />
        </TouchableOpacity>
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <FormField
            label="Provider"
            required
            placeholder="e.g., BDO, BPI, GCash"
            value={formData.provider}
            onChangeText={(text) =>
              setFormData({ ...formData, provider: text })
            }
          />

          <FormField
            label="Name"
            required
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <FormSelector
            label="Type"
            required
            options={Object.values(AccountType).map((type) => ({
              label: type.replace("_", "-").toUpperCase(),
              value: type,
            }))}
            value={formData.type}
            onChange={(type) =>
              setFormData({ ...formData, type: type as AccountType })
            }
          />
        </View>
      </ScrollView>
    </FormModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    gap: 16,
  },
});
