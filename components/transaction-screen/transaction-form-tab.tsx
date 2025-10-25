import useColorTheme from "@/hooks/useColorTheme";
import { Account, database, TransactionType } from "@/lib/db";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/balance";
import * as React from "react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";

import { toast } from "@backpackapp-io/react-native-toast";
import { FormDateTime } from "../forms/form-datetime";
import { FormField } from "../forms/form-field";
import { FormSelect } from "../forms/form-select";
import { FormSelector } from "../forms/form-selector";

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
  const accentColor = type === "EARNING" ? "#10871a" : "#FF4D4D";

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [category, setCategory] = useState("Others");

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const [date, setDate] = useState(new Date());

  const [accounts, setAccounts] = useState<Account[]>([]);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  React.useEffect(() => {
    if (!selectedAccountId) return;

    const selected = accounts.find((acc) => acc.id === selectedAccountId);

    if (!selected) return;

    setSelectedAccount(selected);
  }, [selectedAccountId, accounts]);

  React.useEffect(() => {
    const loadDefaultAccount = async () => {
      try {
        const accounts = await database.accounts.getAll();

        setAccounts(accounts);

        if (accounts.length > 0) {
          setSelectedAccountId(accounts[0].id);
        }
      } catch (error) {
        console.error("Failed to load accounts:", error);
      }
    };
    loadDefaultAccount();
  }, []);

  const handleBalanceChange = (text: string) => {
    // Format with commas
    const formatted = formatNumberWithCommas(text);
    setNewAmount(formatted);
  };

  const addTransaction = async () => {
    if (!newDesc || !newAmount) {
      toast.error("Please fill in all fields");
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

    try {
      if (type === "EXPENSE") {
        const newAccountBalance = selectedAccount.balance - amountNum;

        if (newAccountBalance < 0) {
          toast.dismiss();
          toast.error("Insufficient account balance.");
          return;
        }
      }
      await database.transactions.add({
        name: newDesc,
        type,
        amount: amountNum,
        accountId: selectedAccountId,
        datetime: date.toISOString(),
        category,
      });

      const account = await database.accounts.getById(selectedAccountId);
      if (account) {
        const newBalance =
          type === "EARNING"
            ? account.balance + amountNum
            : account.balance - amountNum;
        await database.accounts.updateBalance(selectedAccountId, newBalance);
      }

      setNewDesc("");
      setNewAmount("");
      setDate(new Date());
      onTransactionAdded?.();

      toast.success(
        `${type === "EARNING" ? "Earning" : "Expense"} added successfully!`
      );
    } catch (error) {
      console.error(`Failed to add ${type.toLowerCase()}:`, error);

      toast.error(`Failed to add ${type.toLowerCase()}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.centeredContent}
        keyboardShouldPersistTaps="handled"
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
              options={accounts.map((account) => ({
                label: `${account.provider} / ${account.accountName} ${
                  account.nickname ? `/ ${account.nickname}` : ""
                }`,
                value: account.id,
              }))}
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

            <FormField
              label="Amount"
              required
              placeholder="0"
              value={newAmount}
              onChangeText={handleBalanceChange}
              keyboardType="numeric"
            />

            <FormSelector
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
  centeredContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
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
