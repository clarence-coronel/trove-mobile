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
        },`,
      });

      console.error(error);
    },
    onSuccess: (_response, variables) => {
      Toast.show({
        type: "success",
        text1: `${
          variables.type === "EARNING" ? "Earning" : "Expense"
        } added successfully!`,
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
