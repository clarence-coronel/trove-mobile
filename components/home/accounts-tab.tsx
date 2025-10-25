import useColorTheme from "@/hooks/useColorTheme";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Account, database, NewAccount } from "@/lib/db";

import { toast } from "@backpackapp-io/react-native-toast";
import AddAccountModal from "./add-account-modal";
import Card from "./card";
import EditAccountModal from "./edit-account-modal";

export default function AccountsTab() {
  const { theme } = useColorTheme();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const allAccounts = await database.accounts.getAll();
      setAccounts(allAccounts);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (newAccount: NewAccount) => {
    try {
      await database.accounts.add(newAccount);
      await loadAccounts();

      toast.success(`Account added successfully!`);
    } catch (error) {
      console.error("Failed to add account:", error);

      toast.error("Failed to add account. Please try again.");
    }
  };

  const handleEditAccount = async (
    id: string,
    updatedAccount: Partial<NewAccount>
  ) => {
    try {
      const success = await database.accounts.update(id, updatedAccount);

      if (success) {
        await loadAccounts();
        setEditModalVisible(false);
        setSelectedAccount(null);

        toast.success("Account updated successfully!");
      } else {
        throw new Error("Failed to update account. Please try again.");
      }
    } catch (error) {
      console.error("Failed to edit account:", error);
      toast.error("Failed to update account. Please try again.");
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      const success = await database.accounts.delete(id);

      if (success) {
        await loadAccounts();
        setEditModalVisible(false);
        setSelectedAccount(null);

        toast.success("Account deleted successfully!");
      } else {
        throw new Error("Failed to delete account. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account. Please try again.");
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.background.secondary },
        ]}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={accounts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <TouchableOpacity
            style={[
              styles.addButton,
              {
                borderColor: theme.tint,
              },
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={[styles.addButtonText, { color: theme.tint }]}>
              Add Account
            </Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text.secondary }]}>
              Create an account to get started
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            bankName={item.provider}
            nickname={item.nickname}
            balance={item.balance}
            cardholder={item.accountName}
            cardType={item.type}
            onEdit={() => {
              setSelectedAccount(item);
              setEditModalVisible(true);
            }}
          />
        )}
        showsVerticalScrollIndicator={true}
      />

      <AddAccountModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddAccount}
      />

      <EditAccountModal
        visible={editModalVisible}
        onClose={() => {
          setSelectedAccount(null);
          setEditModalVisible(false);
        }}
        account={selectedAccount}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    gap: 20,
    flex: 1,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
});
