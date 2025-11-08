import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AccountType, NewAccount } from "@/lib/db";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/balance";

import Toast from "react-native-toast-message";
import { FormField } from "../../forms/form-field";
import { FormSelector } from "../../forms/form-selector";
import FormModal from "../../modals/form-modal";

const accountTypes: { label: string; value: AccountType }[] = [
  { label: "SAVINGS", value: "SAVINGS" },
  { label: "CHECKING", value: "CHECKING" },
  { label: "E-WALLET", value: "E-WALLET" },
  { label: "CASH", value: "CASH" },
];

const MAX_PROVIDER_LENGTH = 50;
const MAX_NICKNAME_LENGTH = 50;
const MAX_ACCOUNT_NAME_LENGTH = 50;
const MAX_BALANCE = 1000000000000;

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (account: NewAccount) => void;
}

interface FormState {
  provider: string;
  nickname: string | null;
  balance: string;
  accountName: string;
  type: AccountType;
}

export default function AddAccountModal({
  visible,
  onClose,
  onAdd,
}: AddAccountModalProps) {
  const [formData, setFormData] = useState<FormState>({
    provider: "",
    nickname: null,
    balance: "",
    accountName: "",
    type: "SAVINGS",
  });

  const handleBalanceChange = (text: string) => {
    const numericValue = parseFormattedNumber(text);

    if (numericValue > MAX_BALANCE) {
      Toast.show({
        type: "error",
        text1: `Balance cannot exceed ${formatNumberWithCommas(
          MAX_BALANCE.toString()
        )}`,
      });

      return;
    }

    const formatted = formatNumberWithCommas(text);
    setFormData({ ...formData, balance: formatted });
  };

  const handleSubmit = () => {
    if (!formData.provider || !formData.accountName || !formData.type) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields.",
      });
      return;
    }

    const balanceValue =
      formData.balance === "" ? 0 : parseFormattedNumber(formData.balance);

    if (balanceValue > MAX_BALANCE) {
      Toast.show({
        type: "error",
        text1: `Balance cannot exceed ${formatNumberWithCommas(
          MAX_BALANCE.toString()
        )}`,
      });
      return;
    }

    const newAccount: NewAccount = {
      provider: formData.provider,
      nickname: formData.nickname || null,
      balance: balanceValue,
      accountName: formData.accountName,
      type: formData.type,
    };

    onAdd(newAccount);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormData({
      provider: "",
      nickname: "",
      balance: "",
      accountName: "",
      type: "SAVINGS",
    });
  };

  return (
    <FormModal
      visible={visible}
      onClose={handleClose}
      title="Add Account"
      onSubmit={handleSubmit}
      submitText="Add"
      disableSubmit={
        !formData.provider || !formData.accountName || !formData.type
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <FormField
            label="Provider Name"
            required
            placeholder="e.g., BDO, BPI, GCash"
            value={formData.provider}
            onChangeText={(text) => {
              if (text.length <= MAX_PROVIDER_LENGTH) {
                setFormData({ ...formData, provider: text });
              }
            }}
            maxLength={MAX_PROVIDER_LENGTH}
          />

          <FormField
            label="Account Name"
            required
            placeholder="Name"
            value={formData.accountName}
            onChangeText={(text) => {
              if (text.length <= MAX_ACCOUNT_NAME_LENGTH) {
                setFormData({ ...formData, accountName: text });
              }
            }}
            maxLength={MAX_ACCOUNT_NAME_LENGTH}
          />

          <FormField
            label="Nickname"
            placeholder="e.g., Travel Fund, Emergency"
            value={formData.nickname ?? ""}
            onChangeText={(text) => {
              if (text.length <= MAX_NICKNAME_LENGTH) {
                setFormData({ ...formData, nickname: text });
              }
            }}
            maxLength={MAX_NICKNAME_LENGTH}
          />

          <FormField
            label="Initial Balance"
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={formData.balance}
            onChangeText={handleBalanceChange}
          />

          <FormSelector
            label="Account Type"
            required
            options={accountTypes}
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
