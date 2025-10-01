"use client";

import { Bell, BellMinus } from "lucide-react";
import { useState } from "react";

import { HoverPopover } from "@/components/ui/hover-popover";

export function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);

  const trigger = (
    <button className="hover:bg-transparent relative">
      <Bell className="w-5 h-5 cursor-pointer hover:text-muted-foreground transition-colors" />
      {/* <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
        3
      </span> */}
    </button>
  );

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between py-2 px-3 border-b">
        <h4 className="font-semibold text-md">Notifications</h4>
      </div>

      <div className="flex flex-col gap-1 flex-1 items-center justify-center">
        <BellMinus className="text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          You have no notifications.
        </span>
      </div>
    </div>
  );

  return (
    <HoverPopover
      align="end"
      autoCloseDelay={1000}
      content={content}
      contentClassName="w-80 h-80"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={trigger}
    />
  );
}
