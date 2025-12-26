import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "accounts",
      columns: [
        { name: "name", type: "string" },
        { name: "provider", type: "string" },
        { name: "type", type: "string" },
        { name: "initial_balance", type: "number" },
        { name: "color", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "transactions",
      columns: [
        { name: "account_id", type: "string", isIndexed: true },
        { name: "amount", type: "number" },
        { name: "type", type: "string" }, // 'income', 'expense', 'transfer'
        { name: "category", type: "string" },
        { name: "description", type: "string", isOptional: true },

        // Transfer linking fields
        {
          name: "transfer_id",
          type: "string",
          isOptional: true,
          isIndexed: true,
        }, // Links both sides of transfer
        {
          name: "transfer_account_id",
          type: "string",
          isOptional: true,
          isIndexed: true,
        }, // The other account in the transfer

        { name: "date", type: "number" }, // Transaction date
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
  ],
});
