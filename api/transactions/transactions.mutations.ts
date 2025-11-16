import { database, NewTransaction } from "@/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsKeys, transactionsKeys } from "../queryKeys";
import Toast from "react-native-toast-message";

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, NewTransaction>({
    mutationKey: ["transaction", "create"],
    mutationFn: async (newTransaction: NewTransaction) =>
      await database.transactions.add(newTransaction),
    onError: (error, variables) => {
      Toast.show({
        type: "error",
        text1: `Failed to add ${
          variables.type === "EARNING" ? "earning" : "expense"
        }`,
        text2: error.message || "Please try again",
      });

      console.error(error);
    },
    onSuccess: (_response, variables) => {
      Toast.show({
        type: "success",
        text1: `${
          variables.type === "EARNING" ? "Earning" : "Expense"
        } added successfully!`,
        text2: `₱${variables.amount.toFixed(2)} - ${variables.name}`,
      });

      // Invalidate all transaction lists
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });

      // Invalidate account list and total balance
      queryClient.invalidateQueries({
        queryKey: accountsKeys.lists(),
      });
    },
  });
};

interface TransferParams {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export const useTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, TransferParams>({
    mutationKey: ["account", "transfer"],
    mutationFn: async ({
      fromAccountId,
      toAccountId,
      amount,
    }: TransferParams) => {
      // Get current balances
      const fromAccount = await database.accounts.getById(fromAccountId);
      const toAccount = await database.accounts.getById(toAccountId);

      if (!fromAccount || !toAccount) {
        throw new Error("Account not found");
      }

      if (fromAccount.balance < amount) {
        throw new Error("Insufficient balance");
      }

      // Calculate new balances
      const newFromBalance = fromAccount.balance - amount;
      const newToBalance = toAccount.balance + amount;

      // Update both accounts
      const fromUpdated = await database.accounts.updateBalance(
        fromAccountId,
        newFromBalance
      );
      const toUpdated = await database.accounts.updateBalance(
        toAccountId,
        newToBalance
      );

      return fromUpdated && toUpdated;
    },
    onError: (error, variables) => {
      Toast.show({
        type: "error",
        text1: "Transfer failed",
        text2: error.message || "Please try again",
      });

      console.error(error);
    },
    onSuccess: (_response, variables) => {
      Toast.show({
        type: "success",
        text1: "Transfer successful!",
        text2: `₱${variables.amount.toFixed(2)} transferred`,
      });

      // Invalidate account list and total balance
      queryClient.invalidateQueries({
        queryKey: accountsKeys.lists(),
      });

      // Invalidate specific accounts
      queryClient.invalidateQueries({
        queryKey: accountsKeys.detail(variables.fromAccountId),
      });
      queryClient.invalidateQueries({
        queryKey: accountsKeys.detail(variables.toAccountId),
      });
    },
  });
};
