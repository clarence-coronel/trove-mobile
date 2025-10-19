import "react-native-get-random-values";
import * as SQLite from "expo-sqlite";
import { v4 as uuidv4 } from "uuid";

// Types
export type AccountType = "SAVINGS" | "CHECKING" | "E-WALLET";
export type TransactionType = "EXPENSE" | "EARNING";

export interface Account {
  id: string;
  provider: string;
  nickname: string | null;
  balance: number;
  accountName: string;
  type: AccountType;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  datetime: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export type NewAccount = Omit<Account, "id" | "createdAt" | "updatedAt">;
export type NewTransaction = Omit<
  Transaction,
  "id" | "datetime" | "createdAt" | "updatedAt"
> & {
  datetime?: string;
};

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  /**
   * Initialize the database and create tables
   */
  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync("myapp.db");
      await this.createTables();
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Database initialization failed:", error);
      throw error;
    }
  }

  /**
   * Create necessary tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        provider TEXT NOT NULL,
        nickname TEXT,
        balance REAL NOT NULL DEFAULT 0,
        accountName TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('SAVINGS', 'CHECKING', 'E-WALLET')),
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
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (accountId) REFERENCES accounts(id) ON DELETE CASCADE
      );
    `);

    // Add indexes for better query performance
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

    // Delete the database file
    await SQLite.deleteDatabaseAsync("myapp.db");

    // Reinitialize
    await this.init();
    console.log("Database reset successfully");
  }

  // ==================== ACCOUNT METHODS ====================

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<Account[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts ORDER BY createdAt DESC"
    );
  }

  /**
   * Get account by ID
   */
  async getAccountById(id: string): Promise<Account | null> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getFirstAsync<Account>(
      "SELECT * FROM accounts WHERE id = ?",
      [id]
    );
  }

  /**
   * Get accounts by type
   */
  async getAccountsByType(type: AccountType): Promise<Account[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE type = ? ORDER BY createdAt DESC",
      [type]
    );
  }

  /**
   * Get accounts by provider
   */
  async getAccountsByProvider(provider: string): Promise<Account[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE provider LIKE ? ORDER BY createdAt DESC",
      [`%${provider}%`]
    );
  }

  /**
   * Add a new account with auto-generated UUID
   */
  async addAccount(account: NewAccount): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

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

  /**
   * Update an existing account
   */
  async updateAccount(
    id: string,
    account: Partial<NewAccount>
  ): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

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

    // Always update the updatedAt timestamp
    fields.push("updatedAt = ?");
    values.push(new Date().toISOString());

    values.push(id);
    const result = await this.db.runAsync(
      `UPDATE accounts SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.changes > 0;
  }

  /**
   * Update account balance
   */
  async updateAccountBalance(id: string, newBalance: number): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.runAsync(
      "UPDATE accounts SET balance = ?, updatedAt = ? WHERE id = ?",
      [newBalance, new Date().toISOString(), id]
    );

    return result.changes > 0;
  }

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.runAsync("DELETE FROM accounts WHERE id = ?", [
      id,
    ]);

    return result.changes > 0;
  }

  /**
   * Delete all accounts (useful for testing)
   */
  async deleteAllAccounts(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM accounts");
  }

  /**
   * Get total balance across all accounts
   */
  async getTotalBalance(): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(balance) as total FROM accounts"
    );

    return result?.total || 0;
  }

  /**
   * Get total balance by account type
   */
  async getTotalBalanceByType(type: AccountType): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(balance) as total FROM accounts WHERE type = ?",
      [type]
    );

    return result?.total || 0;
  }

  /**
   * Get accounts count
   */
  async getAccountsCount(): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM accounts"
    );

    return result?.count || 0;
  }

  /**
   * Search accounts by account name
   */
  async searchAccountsByName(query: string): Promise<Account[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE accountName LIKE ? ORDER BY accountName",
      [`%${query}%`]
    );
  }

  /**
   * Search accounts by nickname
   */
  async searchAccountsByNickname(query: string): Promise<Account[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Account>(
      "SELECT * FROM accounts WHERE nickname LIKE ? ORDER BY nickname",
      [`%${query}%`]
    );
  }

  // ==================== TRANSACTION METHODS ====================

  /**
   * Get all transactions
   */
  async getAllTransactions(): Promise<Transaction[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Transaction>(
      "SELECT * FROM transactions ORDER BY datetime DESC"
    );
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getFirstAsync<Transaction>(
      "SELECT * FROM transactions WHERE id = ?",
      [id]
    );
  }

  /**
   * Get all transactions for a specific account
   */
  async getTransactionsByAccountId(accountId: string): Promise<Transaction[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Transaction>(
      "SELECT * FROM transactions WHERE accountId = ? ORDER BY datetime DESC",
      [accountId]
    );
  }

  /**
   * Get transactions by type
   */
  async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Transaction>(
      "SELECT * FROM transactions WHERE type = ? ORDER BY datetime DESC",
      [type]
    );
  }

  /**
   * Add a new transaction
   */
  async addTransaction(transaction: NewTransaction): Promise<string> {
    if (!this.db) throw new Error("Database not initialized");

    const id = uuidv4();
    const now = new Date().toISOString();
    const datetime = transaction.datetime || now;

    await this.db.runAsync(
      `INSERT INTO transactions (id, name, type, amount, datetime, accountId, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        transaction.name,
        transaction.type,
        transaction.amount,
        datetime,
        transaction.accountId,
        now,
        now,
      ]
    );

    return id;
  }

  /**
   * Update an existing transaction
   */
  async updateTransaction(
    id: string,
    transaction: Partial<NewTransaction>
  ): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

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

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string): Promise<boolean> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.runAsync(
      "DELETE FROM transactions WHERE id = ?",
      [id]
    );

    return result.changes > 0;
  }

  /**
   * Delete all transactions for a specific account
   */
  async deleteTransactionsByAccountId(accountId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM transactions WHERE accountId = ?", [
      accountId,
    ]);
  }

  /**
   * Delete all transactions
   */
  async deleteAllTransactions(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.runAsync("DELETE FROM transactions");
  }

  /**
   * Get transactions count for an account
   */
  async getTransactionsCountByAccountId(accountId: string): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM transactions WHERE accountId = ?",
      [accountId]
    );

    return result?.count || 0;
  }

  /**
   * Get total amount by transaction type for an account
   */
  async getTotalAmountByTypeForAccount(
    accountId: string,
    type: TransactionType
  ): Promise<number> {
    if (!this.db) throw new Error("Database not initialized");

    const result = await this.db.getFirstAsync<{ total: number | null }>(
      "SELECT SUM(amount) as total FROM transactions WHERE accountId = ? AND type = ?",
      [accountId, type]
    );

    return result?.total || 0;
  }

  /**
   * Search transactions by name
   */
  async searchTransactionsByName(query: string): Promise<Transaction[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Transaction>(
      "SELECT * FROM transactions WHERE name LIKE ? ORDER BY datetime DESC",
      [`%${query}%`]
    );
  }

  /**
   * Get transactions within a date range
   */
  async getTransactionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.getAllAsync<Transaction>(
      "SELECT * FROM transactions WHERE datetime BETWEEN ? AND ? ORDER BY datetime DESC",
      [startDate, endDate]
    );
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log("Database connection closed");
    }
  }
}

// Export a singleton instance
export const database = new Database();
