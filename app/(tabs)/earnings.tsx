import TransactionList from "@/components/transaction-list";
import useColorTheme from "@/hooks/useColorTheme";
import * as React from "react";
import { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  // TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

interface Earning {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export default function EarningsScreen() {
  const { theme } = useColorTheme();

  const [earnings, setEarnings] = useState<Earning[]>([
    {
      id: "1",
      description: "Freelance Project",
      amount: 12000,
      date: "2025-10-15",
    },
    { id: "2", description: "Bonus", amount: 8000, date: "2025-10-10" },
    {
      id: "3",
      description: "Freelance Project",
      amount: 12000,
      date: "2025-10-15",
    },
    { id: "4", description: "Bonus", amount: 8000, date: "2025-10-10" },
    {
      id: "5",
      description: "Freelance Project",
      amount: 12000,
      date: "2025-10-15",
    },
    { id: "6", description: "Bonus", amount: 8000, date: "2025-10-10" },
    {
      id: "7",
      description: "Freelance Project",
      amount: 12000,
      date: "2025-10-15",
    },
    { id: "8", description: "Bonus", amount: 8000, date: "2025-10-10" },
  ]);

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const addEarning = () => {
    if (!newDesc || !newAmount) return;
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum)) return;

    const newEarning: Earning = {
      id: (earnings.length + 1).toString(),
      description: newDesc,
      amount: amountNum,
      date: new Date().toISOString().split("T")[0],
    };
    setEarnings([newEarning, ...earnings]);
    setNewDesc("");
    setNewAmount("");
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

          <TouchableOpacity style={styles.addButton} onPress={addEarning}>
            <Text style={styles.addButtonText}>Add Earning</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // Transactions tab
  const ListTab = () => (
    <View style={{ padding: 16, paddingBottom: 0 }}>
      <TransactionList transactions={earnings} />
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
    backgroundColor: "#10871a",
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
});
