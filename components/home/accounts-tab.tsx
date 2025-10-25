import useColorTheme from "@/hooks/useColorTheme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Account, NewAccount } from "@/lib/db";

import {
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from "@/api/accounts/accounts.mutations";
import { useGetAllAccounts } from "@/api/accounts/accounts.queries";
import AddAccountModal from "./add-account-modal";
import Card from "./card";
import EditAccountModal from "./edit-account-modal";

export default function AccountsTab() {
  const { theme } = useColorTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const getAllAccounts = useGetAllAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAddAccount = async (newAccount: NewAccount) => {
    createAccount.mutate(newAccount);
  };

  const handleEditAccount = async (
    id: string,
    updatedAccount: Partial<NewAccount>
  ) => {
    const success = await updateAccount.mutateAsync({
      id,
      account: updatedAccount,
    });

    if (success) setSelectedAccount(null);
  };

  const handleDeleteAccount = async (id: string) => {
    const success = await deleteAccount.mutateAsync(id);

    if (success) setSelectedAccount(null);
  };

  if (getAllAccounts.isLoading) {
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
        data={getAllAccounts.data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          getAllAccounts.data && getAllAccounts.data.length === 0
            ? { height: "100%" }
            : null,
        ]}
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
