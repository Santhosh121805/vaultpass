import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";

export interface Beneficiary {
  id: string;
  nickname: string;
  walletAddress: string;
  percentage: number;
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: Date;
  route: string;
}

export interface VaultState {
  isConnected: boolean;
  walletAddress: string;
  totalValueETH: number;
  totalValueUSD: number;
  beneficiaries: Beneficiary[];
  checkInIntervalDays: number;
  lastCheckIn: Date;
  nextDeadline: Date;
  vaultStatus: "Safe" | "Warning" | "Critical";
  chainsConnected: number;
  alerts: Alert[];
}

interface VaultContextType {
  vault: VaultState;
  checkIn: () => void;
  addBeneficiary: (b: Omit<Beneficiary, "id">) => void;
  updateBeneficiary: (id: string, b: Partial<Beneficiary>) => void;
  removeBeneficiary: (id: string) => void;
  setCheckInInterval: (days: number) => void;
  depositETH: (amount: number) => void;
}

const now = new Date();
const defaultDeadline = new Date(now.getTime() + 72 * 24 * 60 * 60 * 1000);

const initialState: VaultState = {
  isConnected: false,
  walletAddress: "",
  totalValueETH: 12.458,
  totalValueUSD: 42357.23,
  beneficiaries: [
    { id: "1", nickname: "Sarah", walletAddress: "0x742d...F841", percentage: 50 },
    { id: "2", nickname: "Marcus", walletAddress: "0x8B3c...A219", percentage: 30 },
    { id: "3", nickname: "Elena", walletAddress: "0x1Fa9...C3d7", percentage: 20 },
  ],
  checkInIntervalDays: 90,
  lastCheckIn: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
  nextDeadline: defaultDeadline,
  vaultStatus: "Safe",
  chainsConnected: 2,
  alerts: [
    { id: "1", type: "info", message: "Vault created successfully", timestamp: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), route: "/" },
    { id: "2", type: "warning", message: "Check-in due in 72 days", timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), route: "/check-in" },
    { id: "3", type: "critical", message: "Beneficiary Marcus has unverified wallet", timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), route: "/beneficiaries" },
  ],
};

const VaultContext = createContext<VaultContextType | null>(null);

export const useVault = () => {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
};

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vault, setVault] = useState<VaultState>(initialState);
  const { address, isConnected } = useAccount();

  // Sync wagmi wallet state into vault context
  useEffect(() => {
    setVault(v => ({
      ...v,
      isConnected,
      walletAddress: address ?? "",
    }));
  }, [address, isConnected]);

  const checkIn = useCallback(() => {
    const now = new Date();
    setVault(v => ({
      ...v,
      lastCheckIn: now,
      nextDeadline: new Date(now.getTime() + v.checkInIntervalDays * 24 * 60 * 60 * 1000),
      vaultStatus: "Safe",
    }));
  }, []);

  const addBeneficiary = useCallback((b: Omit<Beneficiary, "id">) => {
    setVault(v => ({
      ...v,
      beneficiaries: [...v.beneficiaries, { ...b, id: crypto.randomUUID() }],
    }));
  }, []);

  const updateBeneficiary = useCallback((id: string, updates: Partial<Beneficiary>) => {
    setVault(v => ({
      ...v,
      beneficiaries: v.beneficiaries.map(b => b.id === id ? { ...b, ...updates } : b),
    }));
  }, []);

  const removeBeneficiary = useCallback((id: string) => {
    setVault(v => ({
      ...v,
      beneficiaries: v.beneficiaries.filter(b => b.id !== id),
    }));
  }, []);

  const setCheckInInterval = useCallback((days: number) => {
    setVault(v => ({
      ...v,
      checkInIntervalDays: days,
      nextDeadline: new Date(v.lastCheckIn.getTime() + days * 24 * 60 * 60 * 1000),
    }));
  }, []);

  const depositETH = useCallback((amount: number) => {
    setVault(v => ({
      ...v,
      totalValueETH: v.totalValueETH + amount,
      totalValueUSD: v.totalValueUSD + amount * 3400,
    }));
  }, []);

  return (
    <VaultContext.Provider value={{ vault, checkIn, addBeneficiary, updateBeneficiary, removeBeneficiary, setCheckInInterval, depositETH }}>
      {children}
    </VaultContext.Provider>
  );
};
