import useColorTheme from "@/hooks/useColorTheme";
import { Transaction, TransactionType } from "@/lib/db";
import { database } from "@/lib/db/database";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import TransactionList from "../transaction-list";

interface Props {
  type: TransactionType;
}

export default function HistoryTab({ type }: Props) {
  const { theme } = useColorTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await database.transactions.getByType(type);
      setTransactions(data);
    } catch (error) {
      console.error(`Failed to load ${type.toLowerCase()}s:`, error);

      Toast.show({
        type: "error",
        text1: `Failed to load ${type.toLowerCase()}s`,
      });
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [type])
  );

  return (
    <View style={styles.centerContainer}>
      {loading ? (
        <View>
          <Text style={{ color: theme.text.secondary }}>
            Loading {type.toLowerCase()}s...
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
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    height: "100%",
  },
});
