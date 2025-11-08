import useColorTheme from "@/hooks/useColorTheme";
import { Account, TransactionType } from "@/lib/db";
import { formatDateTime } from "@/utils/datetime";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type Props = {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  account: Account | null;
  showDate?: boolean;
};

export default function TransactionCard({
  description,
  amount,
  date,
  type,
  account,
  showDate = false,
}: Props) {
  const { theme } = useColorTheme();

  return (
    <View
      style={[
        styles.transactionItem,
        { backgroundColor: theme.background.primary },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={[styles.transactionDesc, { color: theme.text.primary }]}>
          {description}
        </Text>
        <Text style={[styles.transactionDate, { color: theme.text.secondary }]}>
          {formatDateTime({
            isoString: date,
            include: { time: true, date: showDate },
          })}
        </Text>
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: type === "EXPENSE" ? "#FF4D4D" : "#10871a" },
        ]}
      >
        {type === "EXPENSE" ? "-" : "+"} ₱ {Math.abs(amount).toLocaleString()}
      </Text>
      {account && (
        <Text
          style={[styles.transactionAccount, { color: theme.text.secondary }]}
        >
          {`${account.provider} / ${account.accountName} ${
            account.nickname ? `/ ${account.nickname}` : ""
          }`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  transactionDesc: { fontSize: 16, fontWeight: "500" },
  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  transactionAccount: { fontSize: 12 },
  transactionDate: { fontSize: 12 },
});
