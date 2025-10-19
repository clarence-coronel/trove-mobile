import TransactionList from "@/components/transaction-list";

import useColorTheme from "@/hooks/useColorTheme";
import { database, Transaction } from "@/lib/db/database";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

export default function ExpensesScreen() {
  const { theme } = useColorTheme();

  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  // Load earnings from database
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const transactions = await database.getTransactionsByType("EXPENSE");
      setExpenses(transactions);
    } catch (error) {
      console.error("Failed to load expenses:", error);
      Alert.alert("Error", "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // Reload earnings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [])
  );

  // Load first account ID on mount
  React.useEffect(() => {
    const loadDefaultAccount = async () => {
      try {
        const accounts = await database.getAllAccounts();
        if (accounts.length > 0) {
          setSelectedAccountId(accounts[0].id);
        }
      } catch (error) {
        console.error("Failed to load accounts:", error);
      }
    };
    loadDefaultAccount();
  }, []);

  const addExpense = async () => {
    if (!newDesc || !newAmount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!selectedAccountId) {
      Alert.alert(
        "Error",
        "No account selected. Please create an account first."
      );
      return;
    }

    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      await database.addTransaction({
        name: newDesc,
        type: "EXPENSE",
        amount: amountNum,
        accountId: selectedAccountId,
      });

      // Update account balance
      const account = await database.getAccountById(selectedAccountId);
      if (account) {
        await database.updateAccountBalance(
          selectedAccountId,
          account.balance + amountNum
        );
      }

      setNewDesc("");
      setNewAmount("");
      loadExpenses(); // Refresh the list
      Alert.alert("Success", "Expense added successfully!");
    } catch (error) {
      console.error("Failed to add earning:", error);
      Alert.alert("Error", "Failed to add earning");
    }
  };

  // Add Earning tab
  const AddTab = () => (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.centeredContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.addContainer,
            { backgroundColor: theme.background.primary },
          ]}
        >
          <View style={{ gap: 10 }}>
            <TextInput
              style={[styles.input]}
              mode="flat"
              underlineColor="transparent"
              placeholder="Description"
              value={newDesc}
              onChangeText={setNewDesc}
            />
            <TextInput
              style={styles.input}
              mode="flat"
              underlineColor="transparent"
              placeholder="Amount"
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addExpense}>
            <Text style={styles.addButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Transactions tab
  const ListTab = () => (
    <View style={{ padding: 16, paddingBottom: 0 }}>
      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading earnings...</Text>
        </View>
      ) : expenses.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: theme.text.secondary }}>No expenses yet</Text>
        </View>
      ) : (
        <TransactionList transactions={expenses} onRefresh={loadExpenses} />
      )}
    </View>
  );

  // TabView state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "form", title: "Form" },
    { key: "history", title: "History" },
  ]);

  return (
    <TabView
      style={{ backgroundColor: theme.background.secondary }}
      navigationState={{ index, routes }}
      renderScene={SceneMap({
        form: AddTab,
        history: ListTab,
      })}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get("window").width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: "#10871a" }}
          style={{ backgroundColor: theme.background.primary }}
          activeColor="#10871a"
          inactiveColor="#888"
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  tabContainer: { flex: 1, backgroundColor: "#f5f5f5" },
  centeredContent: { flexGrow: 1, justifyContent: "center", padding: 20 },
  addContainer: {
    padding: 20,
    borderRadius: 12,
    gap: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: "#FF4D4D",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  listContent: { padding: 20 },
  earningItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  desc: { fontSize: 16, fontWeight: "500" },
  amount: { fontSize: 16, fontWeight: "bold", color: "#10871a", marginTop: 4 },
  date: { fontSize: 12 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
