import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";

export type AccountType = "SAVINGS" | "CHECKING" | "E-WALLET" | "CASH";

interface CardProps {
  bankName?: string;
  nickname?: string | null;
  balance?: number;
  cardholder?: string;
  cardType?: AccountType;
  initialVisibility?: boolean;
  textColor?: string | null;
  onEdit?: () => void;
}

export default function Card({
  bankName = "SeaBank",
  nickname = null,
  balance = 0,
  cardholder = "CLARENCE CORONEL",
  cardType = "SAVINGS",
  initialVisibility = false,
  textColor = null,
  onEdit,
}: CardProps) {
  const [isVisible, setIsVisible] = useState(initialVisibility);

  const effectiveTextColor = textColor ?? "#FFFFFF";

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const formatBalance = (amount: number) => {
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={["#3ca940", "#10871a", "#065b0f"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Header with bank name and edit button */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text
                style={[styles.bankName, { color: effectiveTextColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {bankName}
              </Text>
              {nickname && (
                <Text
                  style={[styles.nickname, { color: effectiveTextColor }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {nickname}
                </Text>
              )}
            </View>

            {/* Edit button */}
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <MaterialCommunityIcons
                name="pencil"
                size={24}
                color={effectiveTextColor}
              />
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View style={styles.balanceSection}>
            <Text style={[styles.label, { color: effectiveTextColor }]}>
              AVAILABLE BALANCE
            </Text>

            <TouchableOpacity
              onPress={toggleVisibility}
              style={styles.eyeButton}
              activeOpacity={1}
            >
              <View style={styles.balanceContainer}>
                <Text style={[styles.balance, { color: effectiveTextColor }]}>
                  ₱
                </Text>
                <Text
                  style={[styles.balance, { color: effectiveTextColor }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {isVisible ? formatBalance(balance) : "••••••"}
                </Text>

                <MaterialCommunityIcons
                  name={isVisible ? "eye" : "eye-off"}
                  size={24}
                  color={effectiveTextColor}
                  style={styles.eyeIcon}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Text style={[styles.label, { color: effectiveTextColor }]}>
                ACCOUNT NAME
              </Text>
              <Text
                style={[styles.value, { color: effectiveTextColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {cardholder}
              </Text>
            </View>
            <View style={styles.footerType}>
              <Text style={[styles.label, { color: effectiveTextColor }]}>
                TYPE
              </Text>
              <Text
                style={[styles.value, { color: effectiveTextColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {cardType}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    aspectRatio: 1.5,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradient: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    maxWidth: "100%",
  },
  headerTextContainer: {
    flex: 1,
    minWidth: 0,
    maxWidth: "100%",
  },
  editButton: {
    padding: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    flexShrink: 0,
  },
  bankName: {
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  balanceSection: {
    maxWidth: "100%",
  },
  eyeButton: {
    alignSelf: "flex-start",
    borderRadius: 4,
    maxWidth: "100%",
  },
  eyeIcon: {
    flexShrink: 0,
  },
  nickname: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  label: {
    fontSize: 8,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  balance: {
    fontSize: 32,
    flexShrink: 1,
    minWidth: 0,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    maxWidth: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  footerItem: {
    flex: 1,
    minWidth: 0,
  },
  footerType: {
    flexShrink: 0,
    minWidth: 60,
  },
});
