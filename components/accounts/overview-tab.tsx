import useColorTheme from "@/hooks/useColorTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import TransactionList from "../transaction-list";

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    description: "Grocery Shopping",
    amount: -1250.75,
    date: "2025-10-15T14:35",
  },
  { id: "2", description: "Salary", amount: 50000, date: "2025-10-14T09:00" },
  { id: "3", description: "Coffee", amount: -150, date: "2025-10-14T08:30" },
  {
    id: "4",
    description: "Electric Bill",
    amount: -3200,
    date: "2025-10-13T17:45",
  },
  {
    id: "5",
    description: "Freelance Payment",
    amount: 12000,
    date: "2025-10-12T12:15",
  },
  {
    id: "6",
    description: "Netflix Subscription",
    amount: -499,
    date: "2025-10-12T20:00",
  },
  {
    id: "7",
    description: "Dining Out",
    amount: -1800,
    date: "2025-10-11T19:30",
  },
  { id: "8", description: "Bonus", amount: 10000, date: "2025-10-10T10:00" },
  { id: "9", description: "Gasoline", amount: -2200, date: "2025-10-10T16:20" },
  {
    id: "10",
    description: "Amazon Purchase",
    amount: -3200,
    date: "2025-10-09T15:10",
  },
];

export default function OverviewTab() {
  const { theme } = useColorTheme();

  const [isVisible, setIsVisible] = useState(true);
  const totalBalance = mockTransactions.reduce((sum, t) => sum + t.amount, 0);

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

      <TransactionList transactions={mockTransactions} />
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
  listContent: { paddingBottom: 20, gap: 12 },
  transactionItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionDesc: { fontSize: 16, fontWeight: "500" },
  transactionAmount: { fontSize: 16, fontWeight: "bold", marginTop: 4 },
  transactionDate: { fontSize: 12, marginTop: 2 },
});
