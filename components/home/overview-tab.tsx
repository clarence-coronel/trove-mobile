import useColorTheme from "@/hooks/useColorTheme";
import { database, Transaction } from "@/lib/db/database";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "react-native-paper";
import TransactionList from "../transaction-list";

export default function OverviewTab() {
  const { theme } = useColorTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const loadOverviewData = async () => {
    try {
      setLoading(true);
      const [fetchedTransactions, total] = await Promise.all([
        database.getAllTransactions(),
        database.getTotalBalance(),
      ]);

      setTransactions(fetchedTransactions);
      setTotalBalance(total);
    } catch (error) {
      console.error("Failed to load overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOverviewData();
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.text.primary} />
        <Text style={{ color: theme.text.primary, marginTop: 10 }}>
          Loading...
        </Text>
      </View>
    );
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
              {isVisible ? `${totalBalance.toLocaleString()}` : "••••••"}
            </Text>
            <MaterialCommunityIcons
              name={isVisible ? "eye" : "eye-off"}
              size={28}
              color={"#fff"}
            />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {transactions.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: theme.text.secondary }}>
            No transactions yet.
          </Text>
        </View>
      ) : (
        <TransactionList
          transactions={transactions}
          onRefresh={loadOverviewData}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingBottom: 0 },
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
