import useColorTheme from "@/hooks/useColorTheme";
import { TransactionType } from "@/lib/db";
import React from "react";
import { StyleSheet, View } from "react-native";

import { useGetAllTransactionsByType } from "@/api/transactions/transactions.queries";
import SpinnerLoader from "../loaders/spinner-loader";
import TransactionList from "../transaction-list";

interface Props {
  type: TransactionType;
}

export default function HistoryTab({ type }: Props) {
  const { theme } = useColorTheme();

  const getAllTransactionsByType = useGetAllTransactionsByType(type);

  const handleRefresh = async () => {
    await getAllTransactionsByType.refetch();
  };

  if (getAllTransactionsByType.isLoading) {
    return <SpinnerLoader />;
  }

  return (
    <View style={styles.container}>
      <TransactionList
        transactions={getAllTransactionsByType.data ?? []}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
