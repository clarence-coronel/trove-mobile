import React, { useState } from "react";

import { AccountType, NewAccount } from "@/lib/db/database";
import { FormField } from "../forms/form-field";
import { FormSelector } from "../forms/form-selector";
import FormModal from "../modals/form-modal";

const accountTypes: AccountType[] = ["SAVINGS", "CHECKING", "E-WALLET"];

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

  const formatNumberWithCommas = (value: string): string => {
    // Remove all non-digit and non-decimal characters
    const cleaned = value.replace(/[^\d.]/g, "");

    // Split by decimal point
    const parts = cleaned.split(".");

    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Return formatted number (limit to 2 decimal places)
    return parts.length > 1 ? `${parts[0]}.${parts[1].slice(0, 2)}` : parts[0];
  };

  const parseFormattedNumber = (value: string): number => {
    return parseFloat(value.replace(/,/g, "")) || 0;
  };

  const handleBalanceChange = (text: string) => {
    // Remove commas for parsing
    const numericValue = parseFormattedNumber(text);

    // Check if it exceeds max balance
    if (numericValue > MAX_BALANCE) {
      alert(
        `Balance cannot exceed ${formatNumberWithCommas(
          MAX_BALANCE.toString()
        )}`
      );
      return;
    }

    // Format with commas
    const formatted = formatNumberWithCommas(text);
    setFormData({ ...formData, balance: formatted });
  };

  const handleSubmit = () => {
    if (!formData.provider || !formData.accountName || !formData.type) {
      alert("Please fill in all required fields");
      return;
    }

    const balanceValue =
      formData.balance === "" ? 0 : parseFormattedNumber(formData.balance);

    if (balanceValue > MAX_BALANCE) {
      alert(
        `Balance cannot exceed ${formatNumberWithCommas(
          MAX_BALANCE.toString()
        )}`
      );
      return;
    }

    const newAccount: NewAccount = {
      provider: formData.provider,
      nickname: formData.nickname || null,
      balance: balanceValue,
      accountName: formData.accountName.toUpperCase(),
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
    >
      <FormField
        label="Bank Name"
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

      <FormSelector
        label="Account Type"
        required
        options={accountTypes}
        value={formData.type}
        onChange={(type) => setFormData({ ...formData, type })}
      />
    </FormModal>
  );
}
