import { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Text } from "react-native-paper";
import Toast from "react-native-toast-message";

import useColorTheme from "@/hooks/useColorTheme";
import { Account } from "@/lib/db";
import { formatNumberWithCommas, parseFormattedNumber } from "@/utils/balance";

import { useGetAllAccounts } from "@/api/accounts/accounts.queries";
import { useTransfer } from "@/api/transactions/transactions.mutations";

import { FormDateTime } from "../../forms/form-datetime";
import { FormField } from "../../forms/form-field";
import { FormSelect } from "../../forms/form-select";
import SpinnerLoader from "../../loaders/spinner-loader";

interface Props {
  onTransferCompleted?: () => void;
}

export default function TransferFormScreen({ onTransferCompleted }: Props) {
  const { theme } = useColorTheme();
  const { mutate: transfer, isPending: isTransferring } = useTransfer();
  const getAllAccounts = useGetAllAccounts();

  const accentColor = "#3B82F6";

  const [amount, setAmount] = useState("");
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [fromAccount, setFromAccount] = useState<Account | null>(null);
  const [toAccount, setToAccount] = useState<Account | null>(null);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    if (!fromAccountId || getAllAccounts.isLoading) return;
    const selected = getAllAccounts.data?.find(
      (acc) => acc.id === fromAccountId
    );
    setFromAccount(selected ?? null);
  }, [fromAccountId, getAllAccounts.data]);

  useEffect(() => {
    if (!toAccountId || getAllAccounts.isLoading) return;
    const selected = getAllAccounts.data?.find((acc) => acc.id === toAccountId);
    setToAccount(selected ?? null);
  }, [toAccountId, getAllAccounts.data]);

  useEffect(() => {
    if (!getAllAccounts.isLoading) {
      setFromAccountId("");
      setToAccountId("");
    }
  }, [getAllAccounts.data]);

  const handleAmountChange = (text: string) => {
    setAmount(formatNumberWithCommas(text));
  };

  const handleTransfer = () => {
    if (!amount) {
      Toast.show({ type: "error", text1: "Please enter an amount." });
      return;
    }

    if (!fromAccountId || !fromAccount) {
      Toast.show({ type: "error", text1: "Please select a source account." });
      return;
    }

    if (!toAccountId || !toAccount) {
      Toast.show({
        type: "error",
        text1: "Please select a destination account.",
      });
      return;
    }

    if (toAccountId === fromAccountId) {
      Toast.show({ type: "error", text1: "Cannot transfer to same account." });
      return;
    }

    const amountNum = parseFormattedNumber(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Toast.show({ type: "error", text1: "Please enter a valid amount." });
      return;
    }

    if (fromAccount.balance < amountNum) {
      Toast.show({
        type: "error",
        text1: "Insufficient balance in source account.",
      });
      return;
    }

    transfer(
      {
        fromAccountId,
        toAccountId,
        amount: amountNum,
      },
      {
        onSuccess: () => {
          setAmount("");
          setFromAccountId("");
          setToAccountId("");
          setDate(new Date());
          onTransferCompleted?.();
          setFromAccount(null);
          setToAccount(null);
        },
      }
    );
  };

  if (getAllAccounts.isLoading) return <SpinnerLoader />;

  const accountOptions =
    getAllAccounts.data?.map((account) => ({
      label: account.nickname
        ? `${account.nickname} (${account.provider})`
        : `${account.accountName} (${account.provider})`,
      value: account.id,
    })) ?? [];

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
          Transfer Money
        </Text>

        <View style={styles.inputGroup}>
          {/* From Account */}
          <View>
            <FormSelect
              label="From Account"
              required
              options={accountOptions}
              value={fromAccountId}
              onChange={setFromAccountId}
            />

            {fromAccount && (
              <View
                style={[
                  styles.balanceContainer,
                  {
                    backgroundColor: theme.divider,
                  },
                ]}
              >
                <Text
                  style={[styles.balanceLabel, { color: theme.text.secondary }]}
                >
                  Available Balance
                </Text>
                <Text
                  style={[styles.balanceAmount, { color: theme.text.primary }]}
                >
                  ₱{formatNumberWithCommas(fromAccount.balance.toString())}
                </Text>
              </View>
            )}
          </View>

          {/* To Account */}
          <View>
            <FormSelect
              label="To Account"
              required
              options={accountOptions}
              value={toAccountId}
              onChange={setToAccountId}
            />

            {toAccount && (
              <View
                style={[
                  styles.balanceContainer,
                  {
                    backgroundColor: theme.divider,
                  },
                ]}
              >
                <Text
                  style={[styles.balanceLabel, { color: theme.text.secondary }]}
                >
                  Current Balance
                </Text>
                <Text
                  style={[styles.balanceAmount, { color: theme.text.primary }]}
                >
                  ₱{formatNumberWithCommas(toAccount.balance.toString())}
                </Text>
              </View>
            )}
          </View>

          {/* Amount */}
          <FormField
            label="Amount"
            required
            placeholder="0"
            value={amount}
            onChangeText={handleAmountChange}
            keyboardType="numeric"
          />

          {/* Date */}
          <FormDateTime
            label="Transfer Date"
            value={date}
            onChange={setDate}
            mode="datetime"
            required
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: accentColor },
            isTransferring && styles.submitButtonDisabled,
          ]}
          onPress={handleTransfer}
          activeOpacity={0.85}
          disabled={isTransferring}
        >
          <Text style={styles.submitButtonText}>
            {isTransferring ? "Processing..." : "Transfer"}
          </Text>
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
  balanceContainer: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
