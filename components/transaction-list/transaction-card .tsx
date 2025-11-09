import useColorTheme from "@/hooks/useColorTheme";
import { Account, TransactionType } from "@/lib/db";
import { formatDateTime } from "@/utils/datetime";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";

type Props = {
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  account: Account | null;
  category: string;
  showDate?: boolean;
};

export default function TransactionCard({
  description,
  amount,
  date,
  type,
  account,
  category,
  showDate = false,
}: Props) {
  const { theme } = useColorTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const isExpense = type === "EXPENSE";

  // Enhanced color palette
  const colors = {
    expense: {
      amount: "#EF4444",
      badge: "#FEE2E2",
      badgeText: "#991B1B",
      icon: "#DC2626",
    },
    income: {
      amount: "#10B981",
      badge: "#D1FAE5",
      badgeText: "#065F46",
      icon: "#059669",
    },
  };

  const currentColors = isExpense ? colors.expense : colors.income;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background.primary,
          borderLeftColor: currentColors.icon,
          shadowColor: isExpense ? colors.expense.icon : colors.income.icon,
        },
      ]}
    >
      {/* Main Content Area */}
      <View style={styles.contentWrapper}>
        {/* Left Section: Icon + Details */}
        <View style={styles.leftContent}>
          {/* Transaction Type Icon */}
          {/* <View
            style={[
              styles.typeIconCircle,
              { backgroundColor: currentColors.badge },
            ]}
          >
            <Text style={[styles.typeIconText, { color: currentColors.icon }]}>
              {isExpense ? "−" : "+"}
            </Text>
          </View> */}

          {/* Transaction Details */}
          <View style={styles.transactionInfo}>
            <Pressable onLongPress={() => setShowTooltip(true)}>
              <Text
                style={[
                  styles.transactionDescription,
                  { color: theme.text.primary },
                ]}
                numberOfLines={2}
              >
                {description}
              </Text>
            </Pressable>

            <View style={styles.categoryAmountRow}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: currentColors.badge },
                ]}
              >
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: currentColors.badgeText },
                  ]}
                >
                  {category}
                </Text>
              </View>

              <Text
                style={[
                  styles.transactionAmount,
                  { color: currentColors.amount },
                ]}
              >
                {isExpense ? "−" : "+"}₱{Math.abs(amount).toLocaleString()}
              </Text>
            </View>

            <View style={styles.accountDateRow}>
              {/* Account Information */}
              {account && (
                <View style={styles.accountInfo}>
                  <Text
                    style={[
                      styles.accountDetail,
                      { color: theme.text.secondary },
                    ]}
                    numberOfLines={1}
                  >
                    {account.provider}
                  </Text>
                  <View
                    style={[
                      styles.dotSeparator,
                      { backgroundColor: theme.text.secondary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.accountDetail,
                      { color: theme.text.secondary },
                    ]}
                    numberOfLines={1}
                  >
                    {account.accountName}
                  </Text>
                  {account.nickname && (
                    <>
                      <View
                        style={[
                          styles.dotSeparator,
                          { backgroundColor: theme.text.secondary },
                        ]}
                      />
                      <Text
                        style={[
                          styles.accountDetail,
                          { color: theme.text.secondary },
                        ]}
                        numberOfLines={1}
                      >
                        {account.nickname}
                      </Text>
                    </>
                  )}
                </View>
              )}

              <Text
                style={[
                  styles.transactionDate,
                  { color: theme.text.secondary },
                ]}
              >
                {formatDateTime({
                  isoString: date,
                  include: { time: true, date: showDate },
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tooltip Modal */}
      <Portal>
        <Modal
          visible={showTooltip}
          onDismiss={() => setShowTooltip(false)}
          contentContainerStyle={[
            styles.tooltipModal,
            { backgroundColor: theme.background.primary },
          ]}
        >
          <Text style={[styles.tooltipText, { color: theme.text.primary }]}>
            {description}
          </Text>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 10,
    borderLeftWidth: 0,
    backgroundColor: "#FFFFFF",
  },
  contentWrapper: {
    flexDirection: "row",
    padding: 16,
    gap: 20,
    alignItems: "flex-start",
  },
  leftContent: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    minWidth: 0,
  },
  typeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  typeIconText: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 24,
  },
  transactionInfo: {
    flex: 1,
    gap: 16,
    minWidth: 0,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  categoryAmountRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  accountDateRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    gap: 6,
    flexWrap: "wrap",
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.4,
  },
  accountDetail: {
    fontSize: 12,
    fontWeight: "500",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  transactionDate: {
    fontSize: 11,
    fontWeight: "500",
  },
  tooltipModal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  tooltipText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
