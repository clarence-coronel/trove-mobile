import useColorTheme from "@/hooks/useColorTheme";
import { Account, TransactionType } from "@/lib/db";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/balance";

import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";

import { useGetAllAccounts } from "@/api/accounts/accounts.queries";
import { useCreateTransaction } from "@/api/transactions/transactions.mutations";
import { toast } from "@backpackapp-io/react-native-toast";
import { FormDateTime } from "../forms/form-datetime";
import { FormField } from "../forms/form-field";
import { FormSelect } from "../forms/form-select";
import SpinnerLoader from "../loaders/spinner-loader";

const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transportation",
  "Bills & Utilities",
  "Healthcare",
  "Shopping",
  "Entertainment",
  "Education",
  "Personal Care",
  "Housing",
  "Insurance",
  "Subscriptions",
  "Travel",
  "Gifts & Donations",
  "Others",
];

const EARNING_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business Income",
  "Investments",
  "Bonus",
  "Refund",
  "Gift",
  "Side Hustle",
  "Rental Income",
  "Commission",
  "Interest",
  "Dividends",
  "Others",
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

  const accentColor = type === "EARNING" ? "#10871a" : "#FF4D4D";

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const [date, setDate] = useState(new Date());

  const getAllAccounts = useGetAllAccounts();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (!selectedAccountId || getAllAccounts.isLoading) return;

    const selected = getAllAccounts.data?.find(
      (acc) => acc.id === selectedAccountId
    );

    if (!selected) return;

    setSelectedAccount(selected);
  }, [selectedAccountId, getAllAccounts.data]);

  useEffect(() => {
    if (getAllAccounts.isLoading) return;

    setSelectedAccountId("");
  }, [getAllAccounts.data]);

  const handleBalanceChange = (text: string) => {
    // Format with commas
    const formatted = formatNumberWithCommas(text);
    setNewAmount(formatted);
  };

  const addTransaction = async () => {
    toast.dismiss();

    if (!newDesc || !newAmount || !category) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!selectedAccountId || !selectedAccount) {
      toast.error("No account selected. Please create an account first.");
      return;
    }

    const amountNum = parseFormattedNumber(newAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (type === "EXPENSE") {
      const newAccountBalance = selectedAccount.balance - amountNum;

      if (newAccountBalance < 0) {
        toast.error("Insufficient account balance.");
        return;
      }
    }

    await createTransaction.mutateAsync({
      name: newDesc,
      type,
      amount: amountNum,
      accountId: selectedAccountId,
      datetime: date.toISOString(),
      category,
    });

    setSelectedAccountId("");
    setNewDesc("");
    setCategory(null);
    setNewAmount("");
    setDate(new Date());

    onTransactionAdded?.();
  };

  if (getAllAccounts.isLoading) return <SpinnerLoader />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.addContainer,
            { backgroundColor: theme.background.primary },
          ]}
        >
          <View style={{ gap: 10 }}>
            <FormSelect
              label="Account"
              required
              options={
                getAllAccounts.data?.map((account) => ({
                  label: `${account.provider} / ${account.accountName} ${
                    account.nickname ? `/ ${account.nickname}` : ""
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

            <FormSelect
              label="Category"
              required
              options={
                type === "EXPENSE"
                  ? EXPENSE_CATEGORIES.map((cat) => ({
                      label: cat,
                      value: cat,
                    }))
                  : EARNING_CATEGORIES.map((cat) => ({
                      label: cat,
                      value: cat,
                    }))
              }
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
            style={[styles.addButton, { backgroundColor: accentColor }]}
            onPress={addTransaction}
          >
            <Text style={styles.addButtonText}>
              {`Add ${type === "EARNING" ? "Earning" : "Expense"}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  addContainer: {
    padding: 20,
    borderRadius: 12,
    gap: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
