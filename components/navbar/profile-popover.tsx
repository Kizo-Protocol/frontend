"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverPopover } from "@/components/ui/hover-popover";
import { authService } from "@/services/auth.service";
import GenerateAvatar from "@/components/avatar/generate-avatar";
import ButtonCopy from "@/components/ui/button-copy";
import { LogoutButton } from "@/components/logout-button";

interface User {
  id: string;
  address: string;
  username?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfilePopoverProps {
  user?: User;
  address?: string;
}

export function ProfilePopover({ user, address }: ProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const displayUser = user || {
    id: "1",
    address: address || "0x0",
    username: null,
    avatarUrl: null,
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-10-15T10:30:00Z",
  };

  const trigger = (
    <Button
      className="h-auto hover:bg-foreground/10 rounded-full p-1"
      variant="ghost"
    >
      <div className="flex items-center gap-2 cursor-pointer">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <GenerateAvatar username={displayUser.address || "User"} />
          </AvatarFallback>
          <AvatarImage
            alt="User Avatar"
            className="object-cover"
            src={displayUser.avatarUrl || undefined}
          />
        </Avatar>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </Button>
  );

  const content = (
    <div className="space-y-1">
      <div className="px-2 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <GenerateAvatar username={displayUser.address || "User"} />
            </AvatarFallback>
            <AvatarImage
              alt="User Avatar"
              className="object-cover"
              src={displayUser.avatarUrl || undefined}
            />
          </Avatar>
          <div className="flex-1 min-w-0 -mt-0.5">
            <p className="text-md font-medium truncate">
              {authService.getDisplayName(displayUser)}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">
                {authService.formatAddress(displayUser.address)}
              </p>
              <ButtonCopy
                className="w-3 h-3 text-muted-foreground"
                text={displayUser.address}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-neutral-800" />

      <div className="flex flex-col text-md text-neutral-200">
        <Link
          className="w-full justify-start h-auto hover:bg-foreground/5 p-3 rounded-xl"
          href="/profile"
          onClick={() => setIsOpen(false)}
        >
          Profile
        </Link>
        <Link
          className="w-full justify-start h-auto hover:bg-foreground/5 p-3 rounded-xl"
          href="https://aptos.dev/zh/network/faucet"
          target="_blank"
          onClick={() => setIsOpen(false)}
        >
          Faucet
        </Link>
      </div>

      <Separator className="bg-neutral-800" />

      <LogoutButton
        className="w-full justify-start h-auto py-2 px-2 font-normal text-red-600 hover:text-red-600 text-md"
        variant="ghost"
      >
        Logout
      </LogoutButton>
    </div>
  );

  return (
    <HoverPopover
      align="end"
      content={content}
      contentClassName="w-56"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={trigger}
    />
  );
}
