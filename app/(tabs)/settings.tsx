import useColorTheme from "@/hooks/useColorTheme";
import { APP_SIGNATURE, database } from "@/lib/db";
import { toast } from "@backpackapp-io/react-native-toast";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as SQLite from "expo-sqlite";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Settings() {
  const { theme } = useColorTheme();
  const [isResetting, setIsResetting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const queryClient = useQueryClient();

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const dbName = "trove.db";

      let dbFile = new File(new Directory(Paths.document, "SQLite"), dbName);
      let exists = dbFile.exists;

      if (!exists) {
        dbFile = new File(Paths.document, dbName);
        exists = dbFile.exists;
      }

      if (!exists) {
        const documentsDir = new Directory(Paths.document);
        dbFile = new File(documentsDir, dbName);
        exists = dbFile.exists;
      }

      if (!exists) {
        toast.error(
          "Database file not found. Make sure you have created some data first."
        );
        return;
      }

      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .split(".")[0];
      const backupFileName = `trove-backup-${timestamp}.db`;
      const cacheDir = new Directory(Paths.cache);
      const backupFile = new File(cacheDir, backupFileName);

      dbFile.copy(backupFile);

      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        await Sharing.shareAsync(backupFile.uri, {
          mimeType: "application/x-sqlite3",
          dialogTitle: "Save Backup",
          UTI: "public.database",
        });

        toast.success("Backup created successfully!");
      } else {
        toast.success(`Backup saved to: ${backupFile.uri}`);
      }
    } catch (error) {
      console.error("Backup failed:", error);

      toast.error(`Failed to create backup: ${error}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const verifyBackupSignature = async (dbPath: string): Promise<boolean> => {
    try {
      const testDb = await SQLite.openDatabaseAsync(dbPath);

      // Check if _metadata table exists
      const tables = await testDb.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='_metadata'"
      );

      if (tables.length === 0) {
        await testDb.closeAsync();
        return false;
      }

      // Check the signature
      const result = await testDb.getFirstAsync<{ value: string }>(
        "SELECT value FROM _metadata WHERE key = 'app_signature'"
      );

      await testDb.closeAsync();

      return result?.value === APP_SIGNATURE;
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const fileName = result.assets[0].name;
      if (!fileName.endsWith(".db")) {
        toast.error("Please select a valid database file (.db)");
        return;
      }

      Alert.alert(
        "Restore Database",
        "This will replace your current database with the backup. All current data will be lost. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Restore",
            style: "destructive",
            onPress: async () => {
              setIsRestoring(true);
              try {
                // First verify the backup signature
                const isValid = await verifyBackupSignature(
                  result.assets[0].uri
                );

                if (!isValid) {
                  toast.error(
                    "This backup file was not created by this app or is corrupted. For security reasons, only backups created by this app can be restored."
                  );
                  setIsRestoring(false);
                  return;
                }

                // Close the current database connection
                await database.close();

                // Get the backup file
                const backupFile = new File(result.assets[0].uri);

                // Find the database location
                const dbName = "trove.db";
                let dbFile = new File(
                  new Directory(Paths.document, "SQLite"),
                  dbName
                );
                let exists = dbFile.exists;

                if (!exists) {
                  dbFile = new File(Paths.document, dbName);
                  exists = dbFile.exists;
                }

                if (!exists) {
                  const documentsDir = new Directory(Paths.document);
                  dbFile = new File(documentsDir, dbName);
                }

                // Delete the existing database
                if (dbFile.exists) {
                  dbFile.delete();
                }

                // Copy the backup file to the database location
                backupFile.copy(dbFile);

                // Reinitialize the database
                await database.init();

                // Verify the restored database
                const isRestoredValid = await database.verifyAppSignature();

                if (!isRestoredValid) {
                  throw new Error("Restored database verification failed");
                }

                // Invalidate all queries to refresh the UI
                await queryClient.invalidateQueries();

                toast.success("Database restored successfully!");
              } catch (error) {
                console.error("Restore failed:", error);

                toast.error(`Failed to restore database: ${error}`);
                // Try to reinitialize the database even if restore failed
                try {
                  await database.init();
                } catch (initError) {
                  console.error("Failed to reinitialize database:", initError);
                }
              } finally {
                setIsRestoring(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Document picker failed:", error);

      toast.error("Failed to select backup file");
    }
  };

  const handleResetDatabase = () => {
    Alert.alert(
      "Reset Database",
      "Are you sure you want to reset the database? This will delete all accounts and transactions. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setIsResetting(true);
            try {
              await database.resetDatabase();
              await queryClient.invalidateQueries();

              toast.success("Database has been reset successfully.");
            } catch (error) {
              console.error("Failed to reset database:", error);
              toast.success("Failed to reset database. Please try again.");
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background.secondary },
      ]}
    >
      <Text style={[styles.header, { color: theme.text.primary }]}>
        Settings
      </Text>

      {/* Create Backup */}
      <TouchableOpacity
        style={[
          styles.settingItem,
          { backgroundColor: theme.background.primary },
        ]}
        onPress={handleCreateBackup}
        disabled={isBackingUp}
      >
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons
            name="backup-restore"
            size={24}
            color="#007AFF"
          />
          <Text style={[styles.settingText, { color: theme.text.primary }]}>
            Create Backup
          </Text>
        </View>
        {isBackingUp && <ActivityIndicator size="small" color="#007AFF" />}
      </TouchableOpacity>

      {/* Restore Backup */}
      <TouchableOpacity
        style={[
          styles.settingItem,
          { backgroundColor: theme.background.primary },
        ]}
        onPress={handleRestoreBackup}
        disabled={isRestoring}
      >
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons
            name="database-import"
            size={24}
            color="#34C759"
          />
          <Text style={[styles.settingText, { color: theme.text.primary }]}>
            Restore Backup
          </Text>
        </View>
        {isRestoring && <ActivityIndicator size="small" color="#34C759" />}
      </TouchableOpacity>

      {/* Reset Database */}
      <TouchableOpacity
        style={[
          styles.settingItem,
          { backgroundColor: theme.background.primary },
        ]}
        onPress={handleResetDatabase}
        disabled={isResetting}
      >
        <View style={styles.settingLeft}>
          <MaterialCommunityIcons
            name="database-refresh"
            size={24}
            color={theme.error}
          />
          <Text style={[styles.settingText, { color: theme.text.primary }]}>
            Reset Database
          </Text>
        </View>
        {isResetting && <ActivityIndicator size="small" color={theme.error} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 8,
  },
  settingItem: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingText: {
    fontSize: 17,
  },
  disabled: {
    opacity: 0.3,
  },
  disabledText: {
    color: "#59595fff",
  },
  comingSoon: {
    fontSize: 13,
    color: "#8E8E93",
  },
});
