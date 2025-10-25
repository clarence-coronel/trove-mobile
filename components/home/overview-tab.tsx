import { useGetAllAccountsBalance } from "@/api/accounts/accounts.queries";
import { useGetAllTransactions } from "@/api/transactions/transactions.queries";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SpinnerLoader from "../loaders/spinner-loader";
import TransactionList from "../transaction-list";

export default function OverviewTab() {
  const getAllAccountsBalance = useGetAllAccountsBalance();
  const getAllTransactions = useGetAllTransactions();

  const [isVisible, setIsVisible] = useState(true);

  if (getAllAccountsBalance.isLoading || getAllTransactions.isLoading) {
    return <SpinnerLoader />;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#3ca940", "#10871a", "#065b0f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.totalCard}
      >
        <Text style={styles.totalLabel}>Total Balance</Text>
        <TouchableOpacity
          onPress={() => setIsVisible(!isVisible)}
          activeOpacity={1}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={styles.totalAmount}>₱</Text>
            <Text style={styles.totalAmount}>
              {isVisible
                ? (getAllAccountsBalance.data ?? 0).toLocaleString()
                : "••••••"}
            </Text>

            <MaterialCommunityIcons
              name={isVisible ? "eye" : "eye-off"}
              size={28}
              color={"#fff"}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <TransactionList
        transactions={getAllTransactions.data ?? []}
        onRefresh={getAllTransactions.refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 0,
  },
  totalCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 22,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
  },
  totalAmount: { fontSize: 32, color: "#fff", fontWeight: "bold" },
});
