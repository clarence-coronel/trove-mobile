import useColorTheme from "@/hooks/useColorTheme";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
import Card, { AccountType } from "./card";

const sampleAccounts = [
  {
    bankName: "BDO",
    nickname: "Travel Fund",
    balance: 125450.75,
    cardholder: "CLARENCE CORONEL",
    cardType: "SAVINGS" as AccountType,
  },
  {
    bankName: "BPI",
    nickname: "Groceries",
    balance: 85230.0,
    cardholder: "CLARENCE CORONEL",
    cardType: "CHECKING" as AccountType,
  },
  {
    bankName: "GCash",
    nickname: "Bills",
    balance: 8945.5,
    cardholder: "CLARENCE CORONEL",
    cardType: "E-WALLET" as AccountType,
  },
  {
    bankName: "Maya",
    nickname: "Coffee & Snacks",
    balance: 15670.25,
    cardholder: "CLARENCE CORONEL",
    cardType: "E-WALLET" as AccountType,
  },
  {
    bankName: "Metrobank",
    nickname: "Emergency Fund",
    balance: 450890.0,
    cardholder: "CLARENCE CORONEL",
    cardType: "SAVINGS" as AccountType,
  },
];

export default function AccountsTab() {
  const { theme } = useColorTheme();

  return (
    <FlatList
      data={sampleAccounts}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={[
        styles.listContent,
        { backgroundColor: theme.background.secondary },
      ]}
      ListHeaderComponent={
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              borderColor: theme.tint,
            },
          ]}
          onPress={() => console.log("Add Account pressed")}
        >
          <Text style={[styles.addButtonText, { color: theme.tint }]}>
            Add Account
          </Text>
        </TouchableOpacity>
      }
      renderItem={({ item }) => (
        <Card
          bankName={item.bankName}
          nickname={item.nickname}
          balance={item.balance}
          cardholder={item.cardholder}
          cardType={item.cardType}
        />
      )}
      showsVerticalScrollIndicator={true}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    gap: 20,
  },
  addButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1.5,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
