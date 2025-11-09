import { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text } from "react-native-paper";
import Toast from "react-native-toast-message";

import useColorTheme from "@/hooks/useColorTheme";
import { Account, TransactionType } from "@/lib/db";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/balance";

import { useGetAllAccounts } from "@/api/accounts/accounts.queries";
import { useCreateTransaction } from "@/api/transactions/transactions.mutations";

import { FormDateTime } from "../../forms/form-datetime";
import { FormField } from "../../forms/form-field";
import { FormSelect } from "../../forms/form-select";
import { FormSelector } from "../../forms/form-selector";
import SpinnerLoader from "../../loaders/spinner-loader";

const EXPENSE_CATEGORIES = [
  "Food",
  "Housing",
  "Health",
  "Travel",
  "Education",
  "Shopping",
  "Transportation",
  "Entertainment",
  "Gifts & Charity",
  "Other",
];

const EARNING_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investments",
  "Refunds",
  "Gifts",
  "Other",
];

interface Props {
  type: TransactionType;
  onTransactionAdded?: () => void;
}

export default function TransactionFormTab({
  type,
  onTransactionAdded,
}: Props) {
  const { theme } = useColorTheme();
  const createTransaction = useCreateTransaction();
  const getAllAccounts = useGetAllAccounts();

  const accentColor = type === "EARNING" ? "#10871a" : "#FF4D4D";

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (!selectedAccountId || getAllAccounts.isLoading) return;
    const selected = getAllAccounts.data?.find(
      (acc) => acc.id === selectedAccountId
    );
    setSelectedAccount(selected ?? null);
  }, [selectedAccountId, getAllAccounts.data]);

  useEffect(() => {
    if (!getAllAccounts.isLoading) setSelectedAccountId("");
  }, [getAllAccounts.data]);

  const handleBalanceChange = (text: string) => {
    setNewAmount(formatNumberWithCommas(text));
  };

  const addTransaction = async () => {
    if (!newDesc || !newAmount || !category) {
      Toast.show({
        type: "error",
        text1: "Please fill in all required fields.",
      });
      return;
    }

    if (!selectedAccountId || !selectedAccount) {
      Toast.show({
        type: "error",
        text1: "No account selected. Please create an account first.",
      });
      return;
    }

    const amountNum = parseFormattedNumber(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Toast.show({ type: "error", text1: "Please enter a valid amount." });
      return;
    }

    if (type === "EXPENSE" && selectedAccount.balance - amountNum < 0) {
      Toast.show({ type: "error", text1: "Insufficient account balance." });
      return;
    }

    await createTransaction.mutateAsync({
      name: newDesc,
      type,
      amount: amountNum,
      accountId: selectedAccountId,
      datetime: date.toISOString(),
      category,
    });

    setNewDesc("");
    setNewAmount("");
    setCategory(null);
    setSelectedAccountId("");
    setDate(new Date());

    onTransactionAdded?.();
  };

  if (getAllAccounts.isLoading) return <SpinnerLoader />;

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      enableOnAndroid
      enableAutomaticScroll
      extraScrollHeight={Platform.OS === "ios" ? 100 : 40}
    >
      <View
        style={[
          styles.formContainer,
          {
            backgroundColor: theme.background.primary,
            shadowColor: theme.text.primary,
          },
        ]}
      >
        <Text style={[styles.formTitle, { color: theme.text.primary }]}>
          {type === "EARNING" ? "Add New Earning" : "Add New Expense"}
        </Text>

        <View style={styles.inputGroup}>
          <FormSelect
            label="Account"
            required
            options={
              getAllAccounts.data?.map((account) => ({
                label: `${account.provider} / ${account.accountName}${
                  account.nickname ? ` / ${account.nickname}` : ""
                }`,
                value: account.id,
              })) ?? []
            }
            value={selectedAccountId}
            onChange={setSelectedAccountId}
          />

          <FormField
            label="Description"
            required
            placeholder={
              type === "EARNING" ? "e.g. Monthly Salary" : "e.g. Groceries"
            }
            value={newDesc}
            onChangeText={setNewDesc}
          />

          <FormSelector
            label="Category"
            required
            options={(type === "EXPENSE"
              ? EXPENSE_CATEGORIES
              : EARNING_CATEGORIES
            ).map((cat) => ({
              label: cat,
              value: cat,
            }))}
            value={category}
            onChange={setCategory}
          />

          <FormField
            label="Amount"
            required
            placeholder="0"
            value={newAmount}
            onChangeText={handleBalanceChange}
            keyboardType="numeric"
          />

          <FormDateTime
            label="Transaction Date"
            value={date}
            onChange={setDate}
            mode="datetime"
            required
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: accentColor }]}
          onPress={addTransaction}
          activeOpacity={0.85}
        >
          <Text style={styles.submitButtonText}>Enter</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
  },
  formContainer: {
    borderRadius: 16,
    padding: 24,
    gap: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  inputGroup: {
    gap: 14,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
