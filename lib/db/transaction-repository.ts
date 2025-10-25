import * as SQLite from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";
import type {
  Transaction,
  NewTransaction,
  TransactionType,
  Account,
} from "./types";

export class TransactionRepository {
  constructor(private getDb: () => SQLite.SQLiteDatabase | null) {}

  private get db(): SQLite.SQLiteDatabase {
    const db = this.getDb();
    if (!db) throw new Error("Database not initialized");
    return db;
  }

  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      amount: row.amount,
      datetime: row.datetime,
      accountId: row.accountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: row.category,
      account: row.account_id
        ? {
            id: row.account_id,
            provider: row.account_provider,
            nickname: row.account_nickname,
            balance: row.account_balance,
            accountName: row.account_accountName,
            type: row.account_type,
            createdAt: row.account_createdAt,
            updatedAt: row.account_updatedAt,
          }
        : null,
    };
  }

  async getAll(): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT 
        t.*,
        a.id as account_id,
        a.provider as account_provider,
        a.nickname as account_nickname,
        a.balance as account_balance,
        a.accountName as account_accountName,
        a.type as account_type,
        a.createdAt as account_createdAt,
        a.updatedAt as account_updatedAt
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      ORDER BY t.datetime DESC`
    );

    return rows.map((row) => this.mapRowToTransaction(row));
  }

  async getById(id: string): Promise<Transaction | null> {
    const row = await this.db.getFirstAsync<any>(
      `SELECT 
        t.*,
        a.id as account_id,
        a.provider as account_provider,
        a.nickname as account_nickname,
        a.balance as account_balance,
        a.accountName as account_accountName,
        a.type as account_type,
        a.createdAt as account_createdAt,
        a.updatedAt as account_updatedAt
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.id = ?`,
      [id]
    );

    return row ? this.mapRowToTransaction(row) : null;
  }

  async getByAccountId(accountId: string): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT 
        t.*,
        a.id as account_id,
        a.provider as account_provider,
        a.nickname as account_nickname,
        a.balance as account_balance,
        a.accountName as account_accountName,
        a.type as account_type,
        a.createdAt as account_createdAt,
        a.updatedAt as account_updatedAt
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.accountId = ?
      ORDER BY t.datetime DESC`,
      [accountId]
    );

    return rows.map((row) => this.mapRowToTransaction(row));
  }

  async getByType(type: TransactionType): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT 
        t.*,
        a.id as account_id,
        a.provider as account_provider,
        a.nickname as account_nickname,
        a.balance as account_balance,
        a.accountName as account_accountName,
        a.type as account_type,
        a.createdAt as account_createdAt,
        a.updatedAt as account_updatedAt
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.type = ?
      ORDER BY t.datetime DESC`,
      [type]
    );

    return rows.map((row) => this.mapRowToTransaction(row));
  }

  async add(transaction: NewTransaction): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const datetime = transaction.datetime || now;

    await this.db.runAsync(
      `INSERT INTO transactions (id, name, type, amount, category, datetime, accountId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        transaction.name,
        transaction.type,
        transaction.amount,
        transaction.category,
        datetime,
        transaction.accountId,
        now,
        now,
      ]
    );

    // Update account balance automatically
    const account: Account | null = await this.db.getFirstAsync(
      `SELECT balance FROM accounts WHERE id = ?`,
      [transaction.accountId]
    );

    if (account) {
      const currentBalance = account.balance ?? 0;
      const newBalance =
        transaction.type === "EARNING"
          ? currentBalance + transaction.amount
          : currentBalance - transaction.amount;

      await this.db.runAsync(
        `UPDATE accounts SET balance = ?, updatedAt = ? WHERE id = ?`,
        [newBalance, now, transaction.accountId]
      );
    }

    return id;
  }

  async update(
    id: string,
    transaction: Partial<NewTransaction>
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (transaction.name !== undefined) {
      fields.push("name = ?");
      values.push(transaction.name);
    }
    if (transaction.type !== undefined) {
      fields.push("type = ?");
      values.push(transaction.type);
    }
    if (transaction.amount !== undefined) {
      fields.push("amount = ?");
      values.push(transaction.amount);
    }
    if (transaction.category !== undefined) {
      fields.push("category = ?");
      values.push(transaction.category);
    }
    if (transaction.datetime !== undefined) {
      fields.push("datetime = ?");
      values.push(transaction.datetime);
    }
    if (transaction.accountId !== undefined) {
      fields.push("accountId = ?");
      values.push(transaction.accountId);
    }

    if (fields.length === 0) return false;

    fields.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const result = await this.db.runAsync(
      `UPDATE transactions SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.changes > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.runAsync(
      "DELETE FROM transactions WHERE id = ?",
      [id]
    );

    return result.changes > 0;
  }

  async deleteByAccountId(accountId: string): Promise<void> {
    await this.db.runAsync("DELETE FROM transactions WHERE accountId = ?", [
      accountId,
    ]);
  }

  async deleteAll(): Promise<void> {
    await this.db.runAsync("DELETE FROM transactions");
  }

  async getCountByAccountId(accountId: string): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM transactions WHERE accountId = ?",
      [accountId]
    );

    return result?.count || 0;
  }

  async getTotalAmountByTypeForAccount(
    accountId: string,
    type: TransactionType
  ): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(amount) as total FROM transactions WHERE accountId = ? AND type = ?",
      [accountId, type]
    );

    return result?.total || 0;
  }

  async searchByName(query: string): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT 
        t.*,
        a.id as account_id,
        a.provider as account_provider,
        a.nickname as account_nickname,
        a.balance as account_balance,
        a.accountName as account_accountName,
        a.type as account_type,
        a.createdAt as account_createdAt,
        a.updatedAt as account_updatedAt
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.name LIKE ?
      ORDER BY t.datetime DESC`,
      [`%${query}%`]
    );

    return rows.map((row) => this.mapRowToTransaction(row));
  }

  async getByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync<any>(
      `SELECT 
        t.*,
        a.id as account_id,
        a.provider as account_provider,
        a.nickname as account_nickname,
        a.balance as account_balance,
        a.accountName as account_accountName,
        a.type as account_type,
        a.createdAt as account_createdAt,
        a.updatedAt as account_updatedAt
      FROM transactions t
      LEFT JOIN accounts a ON t.accountId = a.id
      WHERE t.datetime BETWEEN ? AND ?
      ORDER BY t.datetime DESC`,
      [startDate, endDate]
    );

    return rows.map((row) => this.mapRowToTransaction(row));
  }
}
