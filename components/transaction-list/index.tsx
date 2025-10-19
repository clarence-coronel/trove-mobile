import { Transaction } from "@/lib/db/database";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import TransactionCard from "./transaction-card ";

interface Props {
  transactions: Transaction[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function TransactionList({
  transactions,
  onRefresh,
  refreshing = false,
}: Props) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No transactions yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => (
        <TransactionCard
          description={item.name}
          amount={item.amount}
          date={item.datetime}
          type={item.type}
        />
      )}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing || refreshing}
            onRefresh={handleRefresh}
            colors={["#10871a"]}
            tintColor="#10871a"
          />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 20, gap: 12 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});
