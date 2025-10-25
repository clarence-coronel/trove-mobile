import React, { useEffect, useState } from "react";

import useColorTheme from "@/hooks/useColorTheme";
import { Account, AccountType, NewAccount } from "@/lib/db";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { FormField } from "../forms/form-field";
import { FormSelector } from "../forms/form-selector";
import FormModal from "../modals/form-modal";

const accountTypes: AccountType[] = ["SAVINGS", "CHECKING", "E-WALLET", "CASH"];

interface EditAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: (id: string, account: Partial<NewAccount>) => void;
  onDelete: (id: string) => void;
  account: Account | null;
}

interface FormState {
  provider: string;
  nickname: string | null;
  accountName: string;
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
    nickname: null,
    accountName: "",
    type: "SAVINGS",
  });

  useEffect(() => {
    if (account) {
      setFormData({
        provider: account.provider,
        nickname: account.nickname ?? null,
        accountName: account.accountName,
        type: account.type,
      });
    }
  }, [account]);

  const handleSubmit = () => {
    if (!formData.provider || !formData.nickname || !formData.accountName) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields",
      });
      return;
    }

    if (!account) return;

    const updatedAccount: Partial<NewAccount> = {
      provider: formData.provider,
      nickname: formData.nickname,
      accountName: formData.accountName.toUpperCase(),
      type: formData.type,
    };

    onEdit(account.id, updatedAccount);
    onClose();
  };

  const handleDelete = () => {
    if (!account) return;

    Alert.alert(
      "Delete Account",
      `Are you sure you want to delete "${account.nickname}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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
      <FormField
        label="Bank Name"
        required
        placeholder="e.g., BDO, BPI, GCash"
        value={formData.provider}
        onChangeText={(text) => setFormData({ ...formData, provider: text })}
      />

      <FormField
        label="Nickname"
        required
        placeholder="e.g., Travel Fund, Emergency"
        value={formData.nickname ?? ""}
        onChangeText={(text) => setFormData({ ...formData, nickname: text })}
      />

      <FormField
        label="Account Name"
        required
        placeholder="Name"
        value={formData.accountName}
        onChangeText={(text) => setFormData({ ...formData, accountName: text })}
      />

      <FormSelector
        label="Account Type"
        required
        options={accountTypes.map((acc) => ({ label: acc, value: acc }))}
        value={formData.type}
        onChange={(type) =>
          setFormData({ ...formData, type: type as AccountType })
        }
      />
    </FormModal>
  );
}
