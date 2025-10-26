import { Transaction } from "@/lib/db";
import React from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import TransactionCard from "./transaction-card ";

interface Props {
  transactions: Transaction[];
  onRefresh?: () => Promise<void>;
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

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.listContent,
        transactions.length === 0 && styles.emptyListContent,
      ]}
      renderItem={({ item }) => (
        <TransactionCard
          description={item.name}
          amount={item.amount}
          date={item.datetime}
          type={item.type}
          account={item.account}
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
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transactions</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
  },
});
