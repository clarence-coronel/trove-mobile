import { database, NewTransaction } from "@/lib/db";
import { toast } from "@backpackapp-io/react-native-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsKeys, transactionsKeys } from "../queryKeys";

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, NewTransaction>({
    mutationKey: ["transaction", "create"],
    mutationFn: async (newTransaction: NewTransaction) =>
      await database.transactions.add(newTransaction),
    onError: (error, variables) => {
      console.error(error);
      toast.error(
        `Failed to add ${variables.type === "EARNING" ? "earning" : "expense"},`
      );
    },
    onSuccess: (_response, variables) => {
      toast.success(
        `${
          variables.type === "EARNING" ? "Earning" : "Expense"
        } added successfully!`
      );

      // Invalidate all transaction lists
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });

      // Invalidate account list and total balance
      queryClient.invalidateQueries({
        queryKey: accountsKeys.lists(),
      });
    },
  });
};
