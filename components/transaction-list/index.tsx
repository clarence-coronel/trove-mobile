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
  isGrouped?: boolean;
}

const ITEM_SPACING = 12; // consistent spacing between headers and cards

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

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <View style={{ marginBottom: ITEM_SPACING }}>
      <TransactionCard
        description={item.name}
        amount={item.amount}
        date={item.datetime}
        type={item.type}
        account={item.account}
        showDate={!isGrouped}
        category={item.category}
      />
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View
      style={{
        marginBottom: ITEM_SPACING,
        paddingVertical: 6,
        backgroundColor: theme.background.secondary,
      }}
    >
      <View
        style={[styles.headerContainer, { backgroundColor: theme.divider }]}
      >
        <Text style={[styles.headerText, { color: "white" }]}>{title}</Text>
      </View>
    </View>
  );

  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={isRefreshing || refreshing}
      onRefresh={handleRefresh}
      colors={["#10871a"]}
      tintColor="#10871a"
    />
  ) : undefined;

  const isEmpty = transactions.length === 0;

  if (isGrouped) {
    return (
      <SectionList
        sections={groupedTransactions()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          isEmpty ? styles.emptyListContent : styles.listContent
        }
        renderItem={renderTransactionItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
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
        contentContainerStyle={
          isEmpty ? styles.emptyListContent : styles.listContent
        }
        renderItem={renderTransactionItem}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
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
  },
  emptyListContent: {
    flexGrow: 1, // take full height
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  headerText: {
    fontWeight: "700",
    fontSize: 14,
  },
});
