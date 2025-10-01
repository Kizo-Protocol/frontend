"use client";
import React from "react";
import { usePathname } from "next/navigation";

import Navbar from "../navbar";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const hideNavbar = pathname && pathname.startsWith("/auth");

  if (hideNavbar) {
    return (
      <div className="relative">
        <div className="mx-auto">{children}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-svh max-w-[1600px] mx-auto">
      <div className="flex flex-col min-h-full">
        <Navbar />
        <div className="flex-1 p-5 bg-background2">{children}</div>
      </div>
    </div>
  );
}
