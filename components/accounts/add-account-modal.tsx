import React, { useState } from "react";
import { FormField } from "../forms/form-field";
import { FormSelector } from "../forms/form-selector";
import FormModal from "../modals/form-modal";
import { AccountType } from "./card";

const accountTypes: AccountType[] = ["SAVINGS", "CHECKING", "E-WALLET"];

interface FormData {
  bankName: string;
  nickname: string;
  balance: string;
  cardholder: string;
  cardType: AccountType;
}

interface AddAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (account: {
    bankName: string;
    nickname: string;
    balance: number;
    cardholder: string;
    cardType: AccountType;
  }) => void;
}

export default function AddAccountModal({
  visible,
  onClose,
  onAdd,
}: AddAccountModalProps) {
  const [formData, setFormData] = useState<FormData>({
    bankName: "",
    nickname: "",
    balance: "",
    cardholder: "",
    cardType: "SAVINGS",
  });

  const handleSubmit = () => {
    if (!formData.bankName || !formData.nickname || !formData.cardholder) {
      alert("Please fill in all required fields");
      return;
    }

    const newAccount = {
      bankName: formData.bankName,
      nickname: formData.nickname,
      balance: parseFloat(formData.balance) || 0,
      cardholder: formData.cardholder.toUpperCase(),
      cardType: formData.cardType,
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
      bankName: "",
      nickname: "",
      balance: "",
      cardholder: "",
      cardType: "SAVINGS",
    });
  };

  return (
    <FormModal
      visible={visible}
      onClose={handleClose}
      title="Add New Account"
      onSubmit={handleSubmit}
      submitText="Add Account"
    >
      <FormField
        label="Bank Name"
        required
        placeholder="e.g., BDO, BPI, GCash"
        value={formData.bankName}
        onChangeText={(text) => setFormData({ ...formData, bankName: text })}
      />

      <FormField
        label="Nickname"
        placeholder="e.g., Travel Fund, Emergency"
        value={formData.nickname}
        onChangeText={(text) => setFormData({ ...formData, nickname: text })}
      />

      <FormField
        label="Initial Balance"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={formData.balance}
        onChangeText={(text) => setFormData({ ...formData, balance: text })}
      />

      <FormField
        label="Account Name"
        required
        placeholder="Name"
        value={formData.cardholder}
        onChangeText={(text) => setFormData({ ...formData, cardholder: text })}
      />

      <FormSelector
        label="Account Type"
        required
        options={accountTypes}
        value={formData.cardType}
        onChange={(type) => setFormData({ ...formData, cardType: type })}
      />
    </FormModal>
  );
}
