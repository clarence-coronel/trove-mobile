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

  return (
    <View style={styles.centerContainer}>
      {getAllTransactionsByType.isLoading ? (
        <SpinnerLoader />
      ) : (
        <View
          style={[
            styles.transactionContainer,
            getAllTransactionsByType.data &&
            getAllTransactionsByType.data.length === 0
              ? { height: "100%" }
              : null,
          ]}
        >
          <TransactionList
            transactions={getAllTransactionsByType.data ?? []}
            onRefresh={getAllTransactionsByType.refetch}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    height: "100%",
  },
  transactionContainer: {
    width: "100%",
    justifyContent: "flex-start",
  },
});
