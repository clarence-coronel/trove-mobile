import { Collection, Model } from "@nozbe/watermelondb";
import {
  children,
  date,
  field,
  nochange,
  readonly,
  text,
} from "@nozbe/watermelondb/decorators";
import Transaction from "./Transaction";

export enum AccountType {
  CASH = "cash",

  SAVINGS = "savings",
  CHECKING = "checking",

  E_WALLET = "e_wallet",

  // CREDIT_CARD = "credit_card",

  INVESTMENT = "investment",

  // LOAN = "loan",
}

export default class Account extends Model {
  static table = "accounts";

  static associations = {
    transaction: { type: "has_many", foreignKey: "account_id" },
  } as const;

  @nochange @field("initial_balance") initialBalance!: number;
  @text("name") name!: string;
  @text("provider") provider!: string;
  @field("type") type!: AccountType;
  @field("color") color?: string;
  @field("is_active") isActive!: boolean;

  // Dates
  @readonly @date("created_at") createdAt!: number;
  @readonly @date("updated_at") updatedAt!: number;

  @children("transactions") transactions!: Collection<Transaction>;
}
