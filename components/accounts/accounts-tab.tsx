import React from "react";
import { FlatList, StyleSheet } from "react-native";
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
  return (
    <FlatList
      data={sampleAccounts}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.listContent}
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
  listContent: { padding: 20, gap: 20 },
});
