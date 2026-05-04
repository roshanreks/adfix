"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: { name?: string }) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  deleteAccount: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "adfix-salt-v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 4) return { valid: false, error: "Password must be at least 4 characters" };
  return { valid: true };
}

// Demo credentials loaded from env or fallback (fail-secure: no default password in code)
function getDemoCredentials(): { email: string; passwordHash: string } | null {
  const email = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@adfix.app";
  const hash = process.env.NEXT_PUBLIC_DEMO_PASSWORD_HASH;
  if (!hash) return null;
  return { email, passwordHash: hash };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("adfix_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("adfix_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!validateEmail(email)) return false;
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) return false;

    const passwordHash = await hashPassword(password);

    const users = JSON.parse(localStorage.getItem("adfix_users") || "[]");
    const found = users.find((u: User & { passwordHash: string }) => u.email === email && u.passwordHash === passwordHash);
    if (found) {
      const { passwordHash: _, ...userWithoutPassword } = found;
      setUser(userWithoutPassword);
      localStorage.setItem("adfix_user", JSON.stringify(userWithoutPassword));
      return true;
    }

    const demo = getDemoCredentials();
    if (demo && email === demo.email && passwordHash === demo.passwordHash) {
      const demoUser: User = { id: "demo-1", name: "Demo User", email: demo.email, plan: "detailed" };
      localStorage.setItem("adfix_plan", "detailed");
      setUser(demoUser);
      localStorage.setItem("adfix_user", JSON.stringify(demoUser));
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    if (!name.trim() || !validateEmail(email)) return false;
    const pwdCheck = validatePassword(password);
    if (!pwdCheck.valid) return false;

    const users = JSON.parse(localStorage.getItem("adfix_users") || "[]");
    if (users.find((u: User) => u.email === email)) return false;

    const passwordHash = await hashPassword(password);
    const newUser: User & { passwordHash: string } = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email,
      passwordHash,
      plan: "free",
    };
    users.push(newUser);
    localStorage.setItem("adfix_users", JSON.stringify(users));
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("adfix_user", JSON.stringify(userWithoutPassword));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("adfix_user");
  }, []);

  const updateUser = useCallback(async (updates: { name?: string }): Promise<boolean> => {
    if (!user) return false;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("adfix_user", JSON.stringify(updatedUser));
    // Also update in the persisted users list
    const users: Array<User & { passwordHash: string }> = JSON.parse(localStorage.getItem("adfix_users") || "[]");
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      localStorage.setItem("adfix_users", JSON.stringify(users));
    }
    return true;
  }, [user]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;
    const currentHash = await hashPassword(currentPassword);
    const users: Array<User & { passwordHash: string }> = JSON.parse(localStorage.getItem("adfix_users") || "[]");
    const idx = users.findIndex((u) => u.id === user.id && u.passwordHash === currentHash);
    if (idx === -1) return false;
    const newHash = await hashPassword(newPassword);
    users[idx] = { ...users[idx], passwordHash: newHash };
    localStorage.setItem("adfix_users", JSON.stringify(users));
    return true;
  }, [user]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!user) return;
    const users: Array<User & { passwordHash: string }> = JSON.parse(localStorage.getItem("adfix_users") || "[]");
    localStorage.setItem("adfix_users", JSON.stringify(users.filter((u) => u.id !== user.id)));
    localStorage.removeItem("adfix_user");
    localStorage.removeItem("adfix_audits");
    localStorage.removeItem("adfix_preferences");
    localStorage.removeItem("adfix_plan");
    setUser(null);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, changePassword, deleteAccount, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
