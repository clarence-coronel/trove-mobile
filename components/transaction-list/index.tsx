import React from "react";
import { FlatList, StyleSheet } from "react-native";
import TransactionCard from "./transaction-card ";

interface Props {
  transactions: {
    id: string;
    description: string;
    amount: number;
    date: string;
  }[];
}

export default function TransactionList({ transactions }: Props) {
  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TransactionCard
          description={item.description}
          amount={item.amount}
          date={item.date}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 20, gap: 12 },
});
