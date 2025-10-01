"use client";
import {
  ChartPie,
  ClockFading,
  LayoutDashboard,
  Settings,
  UserRound,
  WalletMinimal,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { cn } from "@/lib/utils";
import {
  SidebarBody,
  Sidebar as SidebarComponent,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function AppSidebar({
  children,
  open,
  setOpen,
}: {
  children: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
    },
    {
      label: "My Portfolio",
      href: "/my-portfolio",
      icon: <ChartPie className="h-5 w-5 shrink-0" />,
    },
    {
      label: "My Wallet",
      href: "/my-wallet",
      icon: <WalletMinimal className="h-5 w-5 shrink-0" />,
    },
    {
      label: "History",
      href: "/history",
      icon: <ClockFading className="h-5 w-5 shrink-0" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5 shrink-0" />,
    },
  ];

  const isActiveLink = (link: (typeof links)[0]) => {
    if (link.href && pathname.startsWith(link.href) && link.href !== "#") {
      return true;
    }

    return false;
  };

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col bg-background md:flex-row",
        "h-svh",
      )}
    >
      <SidebarComponent animate={true} open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between md:gap-10">
          <div className={`flex flex-col`}>
            <Link
              className={`flex items-center ${open ? "justify-start" : "justify-center"}`}
              href="/dashboard"
            >
              <motion.div
                animate={{
                  width: open ? "200px" : "40px",
                  height: open ? "auto" : "40px",
                }}
                className="relative overflow-hidden cursor-pointer"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <AnimatePresence mode="wait">
                  {open ? (
                    <motion.div
                      key="full-logo"
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        alt="Logo"
                        className="w-full max-w-[200px] h-auto"
                        draggable={false}
                        height={50}
                        src="/logo-full-purple.png"
                        width={150}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mini-logo"
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-center w-10 h-10"
                      exit={{ opacity: 0, scale: 0.8 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        alt="Logo"
                        className="w-8 h-8 object-contain"
                        draggable={false}
                        height={32}
                        src="/logo-gold.png"
                        width={32}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            <nav
              aria-label="Main navigation"
              className={`mt-4 md:mt-6 flex flex-col gap-2 px-2`}
              role="navigation"
            >
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  className={cn(
                    "relative z-10 rounded-md px-2.5 py-2 transition-colors duration-200",
                    isActiveLink(link)
                      ? "bg-gradient-to-t from-cblue to-cpurple text-white shadow-[0_0_0_2px_#0F1D4A,inset_0_0_8px_rgba(84,49,131,0.6)] hover:bg-secondary/80"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-700",
                  )}
                  link={link}
                />
              ))}
            </nav>
          </div>
        </SidebarBody>
      </SidebarComponent>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export const UserProfile = () => {
  const { open } = useSidebar();

  return (
    <div className="flex items-center gap-3 bg-background rounded-2xl p-3 border border-neutral-200 dark:border-neutral-700">
      <Avatar className="w-10 h-10 shrink-0">
        <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
          JD
        </AvatarFallback>
        <AvatarImage alt="User Avatar" src="/images/user/user-1.webp" />
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-0.5 transition-opacity duration-200 min-w-0",
          !open && "hidden md:flex",
        )}
      >
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          John Doe
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
          Admin
        </span>
      </div>
    </div>
  );
};

export const LogoIcon = () => {
  return (
    <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
      <UserRound className="h-5 w-5 text-primary-foreground" />
    </div>
  );
};
