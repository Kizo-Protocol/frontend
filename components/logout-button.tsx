"use client";

import React from "react";
import { LogOut, Loader2 } from "lucide-react";

import { useLogout } from "@/hooks/query/api/use-auth";

import { Button } from "./ui/button";
import { useAuthMiddleware } from "./auth-middleware";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Logout button component that handles comprehensive logout functionality
 * including wallet disconnection and token cleanup
 */
export function LogoutButton({
  variant = "outline",
  size = "default",
  showIcon = true,
  children,
  className,
}: LogoutButtonProps) {
  const logout = useLogout();
  const { forceLogout } = useAuthMiddleware();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch {
      try {
        await forceLogout();
      } catch {
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  return (
    <Button
      className={className}
      disabled={logout.isPending}
      size={size}
      variant={variant}
      onClick={handleLogout}
    >
      {logout.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        showIcon && <LogOut className="h-4 w-4" />
      )}
      {children || (logout.isPending ? "Logging out..." : "Logout")}
    </Button>
  );
}

/**
 * Simple text logout link
 */
export function LogoutLink({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <LogoutButton
      className={className}
      showIcon={false}
      size="sm"
      variant="ghost"
    >
      {children || "Logout"}
    </LogoutButton>
  );
}

/**
 * Icon-only logout button
 */
export function LogoutIconButton({ className }: { className?: string }) {
  return (
    <LogoutButton
      className={className}
      showIcon={true}
      size="icon"
      variant="ghost"
    >
      <span className="sr-only">Logout</span>
    </LogoutButton>
  );
}
