import "react-native-get-random-values";
import * as SQLite from "expo-sqlite";
import { AccountRepository } from "./account-repository";
import { TransactionRepository } from "./transaction-repository";

class Database {
  private db: SQLite.SQLiteDatabase | null = null;
  public accounts: AccountRepository;
  public transactions: TransactionRepository;

  constructor() {
    this.accounts = new AccountRepository(() => this.db);
    this.transactions = new TransactionRepository(() => this.db);
  }

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync("myapp.db");

      await this.db.execAsync("PRAGMA foreign_keys = ON;");

      await this.createTables();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        nickname TEXT,
        balance REAL NOT NULL DEFAULT 0,
        accountName TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('SAVINGS', 'CHECKING', 'E-WALLET', 'CASH')),
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('EXPENSE', 'EARNING')),
        amount REAL NOT NULL,
        datetime TEXT NOT NULL,
        accountId TEXT NOT NULL,
        category TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);
      CREATE INDEX IF NOT EXISTS idx_accounts_provider ON accounts(provider);
      CREATE INDEX IF NOT EXISTS idx_transactions_accountId ON transactions(accountId);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_datetime ON transactions(datetime);
    `);
  }

  async resetDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }

    await SQLite.deleteDatabaseAsync("myapp.db");
    await this.init();
    console.log("Database reset successfully");
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log("Database connection closed");
    }
  }
}

export const database = new Database();
