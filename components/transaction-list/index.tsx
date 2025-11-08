import useColorTheme from "@/hooks/useColorTheme";
import { Transaction } from "@/lib/db";
import React from "react";
import {
  FlatList,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TransactionCard from "./transaction-card ";

interface Props {
  transactions: Transaction[];
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  isGrouped?: boolean; // new prop
}

export default function TransactionList({
  transactions,
  onRefresh,
  refreshing = false,
  isGrouped = false,
}: Props) {
  const { theme } = useColorTheme();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  // Group transactions by date
  const groupedTransactions = () => {
    if (!transactions || transactions.length === 0) return [];

    const sorted = [...transactions].sort(
      (a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );

    const groups: Record<string, Transaction[]> = {};
    sorted.forEach((tx) => {
      const dateKey = new Date(tx.datetime).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({
        title: date,
        data: groups[date],
      }));
  };

  if (isGrouped) {
    return (
      <SectionList
        sections={groupedTransactions()}
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
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <View style={{ paddingBottom: 6 }}>
            <View
              style={[styles.headerContainer, { backgroundColor: theme.tint }]}
            >
              <Text style={[styles.headerText, { color: theme.text.primary }]}>
                {title}
              </Text>
            </View>
          </View>
        )}
        stickySectionHeadersEnabled
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
  } else {
    return (
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          transactions.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TransactionCard
            description={item.name}
            amount={item.amount}
            date={item.datetime}
            type={item.type}
            account={item.account}
            showDate={!isGrouped}
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
  headerContainer: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  headerText: {
    fontWeight: "700",
    fontSize: 14,
  },
});
