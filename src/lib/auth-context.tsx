"use client";

import React, { createContext, useContext } from "react";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 4) return { valid: false, error: "Use at least 4 characters for your password." };
  return { valid: true };
}

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email,
        image: session.user.image || undefined,
        avatar: session.user.image || undefined,
        plan: "detailed" as const, // All users get detailed (free audit)
        onboardingComplete: session.user.onboardingComplete,
      }
    : null;

  const login = React.useCallback(
    async (email: string, password: string): Promise<boolean> => {
      if (!validateEmail(email)) {
        toast.error("Enter a valid email address.");
        return false;
      }
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("That email and password do not match.");
        return false;
      }
      return true;
    },
    []
  );

  const register = React.useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      if (!name.trim()) {
        toast.error("Enter your name to create the account.");
        return false;
      }
      if (!validateEmail(email)) {
        toast.error("Enter a valid email address.");
        return false;
      }
      const pwCheck = validatePassword(password);
      if (!pwCheck.valid) {
        toast.error(pwCheck.error);
        return false;
      }

      try {
        // Read UTM data from localStorage
        let utmData = {};
        try {
          const raw = localStorage.getItem("adfix_utm");
          if (raw) utmData = JSON.parse(raw);
        } catch {
          // ignore
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, ...utmData }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "We could not create your account. Please try again.");
          return false;
        }

        // Auto-login after registration
        const loginResult = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginResult?.error) {
          toast.error("Account created, but sign-in did not complete. Please sign in.");
          return false;
        }

        return true;
      } catch {
        toast.error("We could not create your account. Please try again.");
        return false;
      }
    },
    []
  );

  const logout = React.useCallback(() => {
    signOut({ redirect: false }).then(() => {
      router.push("/dashboard/login");
    });
  }, [router]);

  const updateUser = React.useCallback(
    async (updates: { name?: string }): Promise<boolean> => {
      try {
        const res = await fetch("/api/user", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error();
        return true;
      } catch {
        toast.error("We could not update your profile.");
        return false;
      }
    },
    []
  );

  const changePassword = React.useCallback(
    async (currentPassword: string, newPassword: string): Promise<boolean> => {
      try {
        const res = await fetch("/api/user/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || "We could not change your password.");
          return false;
        }
        return true;
      } catch {
        toast.error("We could not change your password.");
        return false;
      }
    },
    []
  );

  const deleteAccount = React.useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/user", { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      await signOut({ redirect: false });
      router.push("/");
      toast.success("Account deleted.");
    } catch {
      toast.error("We could not delete the account. Please try again.");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUser,
        changePassword,
        deleteAccount,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProviderInner>{children}</AuthProviderInner>
    </SessionProvider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
