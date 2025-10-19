import TransactionList from "@/components/transaction-list";
import useColorTheme from "@/hooks/useColorTheme";
import { database, Transaction, TransactionType } from "@/lib/db/database";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { TabBar, TabView } from "react-native-tab-view";

interface TransactionScreenProps {
  type: TransactionType;
}

export default function TransactionScreen({ type }: TransactionScreenProps) {
  const { theme } = useColorTheme();
  const accentColor = type === "EARNING" ? "#10871a" : "#FF4D4D";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setShowTimePicker(true);
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const updatedDate = new Date(date);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setDate(updatedDate);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await database.getTransactionsByType(type);
      setTransactions(data);
    } catch (error) {
      console.error(`Failed to load ${type.toLowerCase()}s:`, error);
      Alert.alert("Error", `Failed to load ${type.toLowerCase()}s`);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [type])
  );

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

  const addTransaction = async () => {
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
        type,
        amount: amountNum,
        accountId: selectedAccountId,
        datetime: date.toISOString(),
      });

      const account = await database.getAccountById(selectedAccountId);
      if (account) {
        const newBalance =
          type === "EARNING"
            ? account.balance + amountNum
            : account.balance - amountNum;
        await database.updateAccountBalance(selectedAccountId, newBalance);
      }

      setNewDesc("");
      setNewAmount("");
      setDate(new Date());
      loadTransactions();
      Alert.alert(
        "Success",
        `${type === "EARNING" ? "Earning" : "Expense"} added successfully!`
      );
    } catch (error) {
      console.error(`Failed to add ${type.toLowerCase()}:`, error);
      Alert.alert("Error", `Failed to add ${type.toLowerCase()}`);
    }
  };

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
              style={styles.input}
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

            <TouchableOpacity
              style={[
                styles.dateButton,
                { backgroundColor: theme.background.secondary },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: theme.text.primary }}>
                {`Selected: ${date.toLocaleDateString()} ${date.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}`}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeDate}
                accentColor={accentColor}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                is24Hour={true}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onChangeTime}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: accentColor }]}
            onPress={addTransaction}
          >
            <Text style={styles.addButtonText}>
              {`Add ${type === "EARNING" ? "Earning" : "Expense"}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const ListTab = () => (
    <View style={{ padding: 16, paddingBottom: 0 }}>
      {loading ? (
        <View style={styles.centerContainer}>
          <Text>Loading {type.toLowerCase()}s...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={{ color: theme.text.secondary }}>
            No {type.toLowerCase()}s yet. Add your first one!
          </Text>
        </View>
      ) : (
        <TransactionList
          transactions={transactions}
          onRefresh={loadTransactions}
        />
      )}
    </View>
  );

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "form", title: "Form" },
    { key: "history", title: "History" },
  ]);

  return (
    <TabView
      style={{ backgroundColor: theme.background.secondary }}
      navigationState={{ index, routes }}
      renderScene={({ route }) => {
        switch (route.key) {
          case "form":
            return <AddTab />;
          case "history":
            return <ListTab />;
          default:
            return null;
        }
      }}
      onIndexChange={setIndex}
      initialLayout={{ width: Dimensions.get("window").width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: theme.tint }}
          style={{ backgroundColor: theme.background.primary }}
          activeColor={theme.tint}
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
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
