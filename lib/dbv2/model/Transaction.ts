import { Database, Model, Query } from "@nozbe/watermelondb";
import {
  field,
  date,
  relation,
  readonly,
  lazy,
  text,
  nochange,
  immutableRelation,
} from "@nozbe/watermelondb/decorators";
import { Q } from "@nozbe/watermelondb";
import Account from "./Account";

export default class Transaction extends Model {
  static table = "transactions";

  static associations = {
    account: { type: "belongs_to", key: "account_id" },
  } as const;

  @nochange @field("account_id") accountId!: string;
  @field("amount") amount!: number;
  @field("type") type!: string; // 'income', 'expense', 'transfer'
  @field("category") category!: string;
  @text("description") description!: string;

  // Transfer fields
  @field("transfer_id") transferId!: string;
  @field("transfer_account_id") transferAccountId!: string;

  // Dates
  @date("date") date!: number;
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @immutableRelation("accounts", "account_id") account!: Account;
}
