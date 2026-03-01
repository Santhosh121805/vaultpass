import { createClient } from "@supabase/supabase-js";
import { env } from "../utils/env.js";

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

// User table types
export interface User {
  id: string;
  wallet_address: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Vault table types
export type VaultStatus = "active" | "triggered" | "distributed" | "canceled";

export interface Vault {
  id: string;
  user_id: string;
  chain: string;
  contract_address: string;
  interval_days: number;
  last_checkin: string | null;
  status: VaultStatus;
  created_at: string;
  updated_at: string;
}

// Beneficiary table types
export interface Beneficiary {
  id: string;
  vault_id: string;
  nickname: string;
  wallet_address: string;
  email: string;
  percentage: number;
  created_at: string;
  updated_at: string;
}

// Notification table types
export type NotificationType =
  | "checkin_due"
  | "overdue"
  | "grace_period"
  | "distributed"
  | "claim_link_sent";

export interface Notification {
  id: string;
  user_id: string;
  vault_id?: string;
  type: NotificationType;
  title: string;
  message: string;
  sent_at: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUser(walletAddress: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data as User | null;
}

export async function createUser(walletAddress: string, email: string) {
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        wallet_address: walletAddress.toLowerCase(),
        email,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data as User;
}

export async function getVault(vaultId: string) {
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("id", vaultId)
    .single();

  if (error) throw error;
  return data as Vault;
}

export async function getVaultByAddress(walletAddress: string) {
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("contract_address", walletAddress.toLowerCase());

  if (error) throw error;
  return data as Vault[] | null;
}

export async function getUserVaults(userId: string) {
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data as Vault[];
}

export async function createVault(vault: Omit<Vault, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("vaults")
    .insert([vault])
    .select()
    .single();

  if (error) throw error;
  return data as Vault;
}

export async function updateVault(vaultId: string, updates: Partial<Vault>) {
  const { data, error } = await supabase
    .from("vaults")
    .update(updates)
    .eq("id", vaultId)
    .select()
    .single();

  if (error) throw error;
  return data as Vault;
}

export async function getBeneficiaries(vaultId: string) {
  const { data, error } = await supabase
    .from("beneficiaries")
    .select("*")
    .eq("vault_id", vaultId);

  if (error) throw error;
  return data as Beneficiary[];
}

export async function createBeneficiary(beneficiary: Omit<Beneficiary, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("beneficiaries")
    .insert([beneficiary])
    .select()
    .single();

  if (error) throw error;
  return data as Beneficiary;
}

export async function deleteBeneficiary(beneficiaryId: string) {
  const { error } = await supabase
    .from("beneficiaries")
    .delete()
    .eq("id", beneficiaryId);

  if (error) throw error;
}

export async function createNotification(notification: Omit<Notification, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([notification])
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

export async function getNotifications(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

export async function getActiveVaults() {
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("status", "active");

  if (error) throw error;
  return data as Vault[];
}

export async function getTriggeredVaults() {
  const { data, error } = await supabase
    .from("vaults")
    .select("*")
    .eq("status", "triggered");

  if (error) throw error;
  return data as Vault[];
}
