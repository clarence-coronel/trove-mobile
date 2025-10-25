import { database, NewAccount } from "@/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsKeys } from "../queryKeys";
import { toast } from "@backpackapp-io/react-native-toast";

export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, NewAccount>({
    mutationKey: ["accounts", "create"],
    mutationFn: async (newAccount: NewAccount) =>
      await database.accounts.add(newAccount),
    meta: {
      onError: (error: Error) => {
        console.error(error);
        toast.error("Failed to add account.");
      },
    },
    onSuccess: () => {
      toast.success("Account added successfully!");

      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // Invalidate total balance
      queryClient.invalidateQueries({
        queryKey: accountsKeys.list({ aggregate: "balance" }),
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
      console.error(error);
      toast.error("Failed to save account.");
    },
    onSuccess: () => {
      toast.success("Account saved successfully!");

      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // Also invalidate transactions related to this account
      // sample => queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationKey: ["accounts", "delete"],
    mutationFn: async (id) => await database.accounts.delete(id),
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete account.");
    },
    onSuccess: () => {
      toast.success("Account deleted successfully!");

      queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });

      // Invalidate total balance
      queryClient.invalidateQueries({
        queryKey: accountsKeys.list({ aggregate: "balance" }),
      });

      // Also invalidate transactions related to this account
      // sample => queryClient.invalidateQueries({ queryKey: accountsKeys.lists() });
    },
  });
};
