import "react-native-get-random-values";
import * as SQLite from "expo-sqlite";
import { AccountRepository } from "./account-repository";
import { TransactionRepository } from "./transaction-repository";

// Unique app identifier - change this to something unique for your app
const APP_SIGNATURE = "trove-v1-10-2025-101701";

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
      this.db = await SQLite.openDatabaseAsync("trove.db");

      await this.db.execAsync("PRAGMA foreign_keys = ON;");

      await this.createTables();
      await this.setAppSignature();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Create metadata table for app signature
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS _metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

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

  private async setAppSignature(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Check if signature already exists
    const existing = await this.db.getFirstAsync(
      "SELECT value FROM _metadata WHERE key = 'app_signature'"
    );

    if (!existing) {
      // Set the app signature
      await this.db.runAsync(
        "INSERT OR REPLACE INTO _metadata (key, value) VALUES (?, ?)",
        ["app_signature", APP_SIGNATURE]
      );
    }
  }

  async verifyAppSignature(): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const result = await this.db.getFirstAsync<{ value: string }>(
        "SELECT value FROM _metadata WHERE key = 'app_signature'"
      );

      return result?.value === APP_SIGNATURE;
    } catch (error) {
      console.error("Failed to verify app signature:", error);
      return false;
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      // Close the database connection first
      if (this.db) {
        await this.db.closeAsync();
        this.db = null;
        console.log("Database connection closed for reset");
      }

      // Delete the database file
      await SQLite.deleteDatabaseAsync("trove.db");
      console.log("Database file deleted");

      // Reinitialize the database
      await this.init();
      console.log("Database reset successfully");
    } catch (error) {
      console.error("Database reset failed:", error);
      // Attempt to reinitialize even if deletion failed
      try {
        await this.init();
      } catch (initError) {
        console.error(
          "Failed to reinitialize database after reset error:",
          initError
        );
      }
      throw error;
    }
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
export { APP_SIGNATURE };
