import { database, NewAccount } from "@/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsKeys, transactionsKeys } from "../queryKeys";
import Toast from "react-native-toast-message";

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, NewAccount>({
    mutationKey: ["accounts", "create"],
    mutationFn: async (newAccount: NewAccount) =>
      await database.accounts.add(newAccount),
    meta: {
      onError: (error: Error) => {
        Toast.show({
          type: "error",
          text1: "Failed to add account.",
        });

        console.error(error);
      },
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Account added successfully!",
      });

      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // Invalidate total balance
      queryClient.invalidateQueries({
        queryKey: accountsKeys.list({ aggregate: "balance" }),
      });

      // Invalidate all transactions
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.all,
      });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    { id: string; account: Partial<NewAccount> }
  >({
    mutationKey: ["accounts", "update"],
    mutationFn: async ({ id, account }) =>
      await database.accounts.update(id, account),
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to save account.",
      });

      console.error(error);
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Account saved successfully!",
      });

      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // Invalidate all transactions
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.all,
      });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationKey: ["accounts", "delete"],
    mutationFn: async (id) => await database.accounts.delete(id),
    onError: (error) => {
      Toast.show({
        type: "error",
        text1: "Failed to delete account.",
      });

      console.error(error);
    },
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Account deleted successfully!",
      });

      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // Invalidate total balance
      queryClient.invalidateQueries({
        queryKey: accountsKeys.list({ aggregate: "balance" }),
      });

      // Invalidate all transactions
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.all,
      });
    },
  });
};
