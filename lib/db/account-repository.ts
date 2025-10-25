import * as SQLite from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";
import type { Account, NewAccount, AccountType } from "./types";

export class AccountRepository {
  constructor(private getDb: () => SQLite.SQLiteDatabase | null) {}

  private get db(): SQLite.SQLiteDatabase {
    const db = this.getDb();
    if (!db) throw new Error("Database not initialized");
    return db;
  }

  async getAll(): Promise<Account[]> {
    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts ORDER BY createdAt DESC"
    );
  }

  async getById(id: string): Promise<Account | null> {
    return await this.db.getFirstAsync<Account>(
      "SELECT * FROM accounts WHERE id = ?",
      [id]
    );
  }

  async getByType(type: AccountType): Promise<Account[]> {
    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE type = ? ORDER BY createdAt DESC",
      [type]
    );
  }

  async getByProvider(provider: string): Promise<Account[]> {
    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE provider LIKE ? ORDER BY createdAt DESC",
      [`%${provider}%`]
    );
  }

  async add(account: NewAccount): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO accounts (id, provider, nickname, balance, accountName, type, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        account.provider,
        account.nickname,
        account.balance,
        account.accountName,
        account.type,
        now,
        now,
      ]
    );

    return id;
  }

  async update(id: string, account: Partial<NewAccount>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (account.provider !== undefined) {
      fields.push("provider = ?");
      values.push(account.provider);
    }
    if (account.nickname !== undefined) {
      fields.push("nickname = ?");
      values.push(account.nickname);
    }
    if (account.balance !== undefined) {
      fields.push("balance = ?");
      values.push(account.balance);
    }
    if (account.accountName !== undefined) {
      fields.push("accountName = ?");
      values.push(account.accountName);
    }
    if (account.type !== undefined) {
      fields.push("type = ?");
      values.push(account.type);
    }

    if (fields.length === 0) return false;

    fields.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);

    const result = await this.db.runAsync(
      `UPDATE accounts SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.changes > 0;
  }

  async updateBalance(id: string, newBalance: number): Promise<boolean> {
    const result = await this.db.runAsync(
      "UPDATE accounts SET balance = ?, updatedAt = ? WHERE id = ?",
      [newBalance, new Date().toISOString(), id]
    );

    return result.changes > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.runAsync("DELETE FROM accounts WHERE id = ?", [
      id,
    ]);

    return result.changes > 0;
  }

  async deleteAll(): Promise<void> {
    await this.db.runAsync("DELETE FROM accounts");
  }

  async getTotalBalance(): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(balance) as total FROM accounts"
    );

    return result?.total || 0;
  }

  async getTotalBalanceByType(type: AccountType): Promise<number> {
    const result = await this.db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(balance) as total FROM accounts WHERE type = ?",
      [type]
    );

    return result?.total || 0;
  }

  async getCount(): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM accounts"
    );

    return result?.count || 0;
  }

  async searchByName(query: string): Promise<Account[]> {
    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE accountName LIKE ? ORDER BY accountName",
      [`%${query}%`]
    );
  }

  async searchByNickname(query: string): Promise<Account[]> {
    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE nickname LIKE ? ORDER BY nickname",
      [`%${query}%`]
    );
  }
}
