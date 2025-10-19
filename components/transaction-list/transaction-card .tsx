import useColorTheme from "@/hooks/useColorTheme";
import { formatDateTime } from "@/utils/datetime";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type Props = {
  description: string;
  amount: number;
  date: string;
};

export default function TransactionCard({ description, amount, date }: Props) {
  const { theme } = useColorTheme();

  return (
    <View
      style={[
        styles.transactionItem,
        { backgroundColor: theme.background.primary },
      ]}
    >
      <Text style={[styles.transactionDesc, { color: theme.text.primary }]}>
        {description}
      </Text>
      <Text
        style={[
          styles.transactionAmount,
          { color: amount < 0 ? "#FF4D4D" : "#10871a" },
        ]}
      >
        {amount < 0 ? "-" : "+"} ₱ {Math.abs(amount).toLocaleString()}
      </Text>
      <Text style={[styles.transactionDate, { color: theme.text.secondary }]}>
        {formatDateTime(date)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  transactionItem: {
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  transactionDesc: { fontSize: 16, fontWeight: "500" },
  transactionAmount: { fontSize: 16, fontWeight: "bold" },
  transactionDate: { fontSize: 12 },
});
