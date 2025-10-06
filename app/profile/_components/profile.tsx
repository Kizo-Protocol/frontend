"use client";

import React from "react";
import { User, Info, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import GenerateAvatar from "@/components/avatar/generate-avatar";
import { authService } from "@/services/auth.service";
import { betService } from "@/services/bet.service";
import { useCurrentUser } from "@/hooks/query/api/use-auth";
import { useBetStats } from "@/hooks/query/api/use-bets";
import { useYieldSummary } from "@/hooks/query/api/use-yields";
import ButtonCopy from "@/components/ui/button-copy";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/helper/number";
import { PriceDisplay } from "@/components/price/price-display";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import PositionTab from "./position-tab";
import YieldTab from "./yield-tab";
import ActivityTab from "./activity-tab";

export default function Profile() {
  const [mounted, setMounted] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useCurrentUser();
  const { data: betStatsData } = useBetStats(user?.address);
  const { data: yieldData } = useYieldSummary();

  React.useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "z6euuqyl");

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dv3z889zh";
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(errorData?.error?.message || "Failed to upload image");
    }

    const data = await response.json();

    return data.secure_url;
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");

      return;
    }

    setIsUploading(true);

    try {
      const url = await uploadToCloudinary(file);

      setAvatarUrl(url);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    const usernameValidation = authService.validateUsername(username);

    if (username && !usernameValidation.valid) {
      toast.error(usernameValidation.error || "Invalid username");

      return;
    }

    if (avatarUrl) {
      const avatarValidation = authService.validateAvatarUrl(avatarUrl);

      if (!avatarValidation.valid) {
        toast.error(avatarValidation.error || "Invalid avatar URL");

        return;
      }
    }

    setIsUpdating(true);

    try {
      await authService.updateProfile({
        username: username || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      toast.success("Profile updated successfully!");
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const isAuthenticated =
    typeof window !== "undefined" && authService.isAuthenticated();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <User className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Profile Access Required</h2>
            <p className="text-muted-foreground">
              Please connect your wallet to view your profile
            </p>
            <Button onClick={() => (window.location.href = "/")}>
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (userError || (!userLoading && !user)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <p className="text-red-500">Failed to load profile</p>
            <p className="text-sm text-muted-foreground">
              {userError?.message ||
                "Please check your connection and try again"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>Retry</Button>
              <Button
                variant="outline"
                onClick={() => {
                  authService.logout();
                  window.location.href = "/";
                }}
              >
                Logout & Reconnect
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalBets: betStatsData?.data?.totalBets || 0,
    wonBets: betStatsData?.data?.wonBets || 0,
    activeBets: betStatsData?.data?.activeBets || 0,
    lostBets: betStatsData?.data?.lostBets || 0,
    winRate: betStatsData?.data?.winRate || 0,
    totalAmount: betStatsData?.data?.totalAmount || "0",
    totalPayout: betStatsData?.data?.totalPayout || "0",
    profit: betStatsData?.data?.profit || "0",
  };

  const userBets = user?.bets || [];
  const activeBets = userBets.filter((bet) => bet.status === "active");
  const wonBets = userBets.filter((bet) => bet.status === "won");
  const claimableBets = wonBets.filter(
    (bet) => betService.isBetClaimable(bet as any).claimable,
  );
  const allPositions = [...activeBets, ...wonBets];
  const yieldSummary = yieldData?.data;

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 max-w-7xl w-full">
        <div className="space-y-8 w-full">
          <div className="gap-4 w-full">
            <Card className="border-0 w-full px-0">
              <CardHeader className="w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-1 items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                      <Avatar className="size-16">
                        <AvatarFallback>
                          <GenerateAvatar username={user?.address || "User"} />
                        </AvatarFallback>
                        <AvatarImage
                          alt="User Avatar"
                          className="object-cover"
                          src={user?.avatarUrl || undefined}
                        />
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">
                          {user ? authService.getDisplayName(user) : "User"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {user && authService.formatAddress(user.address)}
                          <ButtonCopy className="w-3.5 h-3.5" />
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <SheetTrigger asChild>
                      <Button variant={"default"}>Edit Profile</Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg px-5">
                      <SheetHeader>
                        <SheetTitle>Edit Profile</SheetTitle>
                        <SheetDescription>
                          Update your username and profile picture
                        </SheetDescription>
                      </SheetHeader>
                      <div className="space-y-6 py-6">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            placeholder="Enter username (3-30 characters)"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Can only contain letters, numbers, hyphens, and
                            underscores
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Profile Picture</Label>
                          <div
                            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                              isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50"
                            } ${isUploading ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => fileInputRef.current?.click()}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                fileInputRef.current?.click();
                              }
                            }}
                          >
                            <input
                              ref={fileInputRef}
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading}
                              type="file"
                              onChange={handleFileInputChange}
                            />
                            {avatarUrl ? (
                              <div className="relative">
                                <Image
                                  priority
                                  unoptimized
                                  alt="Profile preview"
                                  className="w-full h-48 object-cover rounded-md"
                                  height={400}
                                  src={avatarUrl}
                                  width={400}
                                />
                                <Button
                                  className="absolute top-2 right-2"
                                  size="icon"
                                  type="button"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAvatarUrl("");
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center space-y-3">
                                {isUploading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                                    <p className="text-sm text-muted-foreground">
                                      Uploading...
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <div className="rounded-full bg-muted p-3">
                                      <Upload className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">
                                        Drop your image here, or{" "}
                                        <span className="text-primary">
                                          browse
                                        </span>
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        PNG, JPG or GIF up to 5MB
                                      </p>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            className="flex-1 rounded-3xl"
                            variant="outline"
                            onClick={() => {
                              setIsEditOpen(false);
                              setUsername(user?.username || "");
                              setAvatarUrl(user?.avatarUrl || "");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 rounded-3xl"
                            disabled={isUpdating}
                            onClick={handleUpdateProfile}
                          >
                            {isUpdating ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="flex flex-wrap justify-between gap-4 lg:gap-6">
            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  Active Bets
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      The total number of active bets you have on the platform
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl leading-none capitalize">
                  {activeBets.length}
                </span>
                {claimableBets.length > 0 && (
                  <div className="flex flex-col">
                    <div className="text-xs text-muted-foreground">
                      Claimable:
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      {claimableBets.length}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The percentage of bets that you have won</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-end gap-1">
                <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
                  {(stats.winRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  Total Payout
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your total salary amount for the current pay period</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-3xl sm:text-4xl lg:text-5xl leading-none">
                  {formatNumber(betService.formatAmount(stats.totalPayout), {
                    suffix: " APT",
                    compact: true,
                  })}
                </span>
                <PriceDisplay
                  aptAmount={parseFloat(
                    betService.formatAmount(stats.totalPayout),
                  )}
                  className="text-sm text-muted-foreground"
                  showSymbol={false}
                  usdClassName="text-base"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 p-4 sm:bg-transparent">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  Profit/Loss
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your accumulated profit/loss from betting</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className={`text-3xl sm:text-4xl lg:text-5xl leading-none ${
                    parseFloat(stats.profit) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatNumber(
                    betService.formatProfit(stats.profit).formatted,
                    { suffix: " APT", compact: true },
                  )}
                </span>
                <PriceDisplay
                  aptAmount={parseFloat(
                    betService
                      .formatProfit(stats.profit)
                      .formatted.replace("+", "")
                      .replace(" APT", ""),
                  )}
                  className="text-sm text-muted-foreground"
                  showSymbol={false}
                  usdClassName="text-base"
                />
              </div>
            </div>

            {/* Claimable Winnings Section */}
            {claimableBets.length > 0 && (
              <div className="flex flex-col gap-2 p-4 sm:bg-transparent border border-green-200 rounded-lg bg-green-50/50">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-green-700 font-medium">
                    Claimable Winnings
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-green-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Winnings from resolved bets that you can claim now</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl leading-none text-green-600">
                    {claimableBets.length}
                  </span>
                  <span className="text-sm text-green-700">
                    {claimableBets.length === 1 ? "bet ready" : "bets ready"} to
                    claim
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-[0.5px] rounded-2xl">
            <Tabs className="" defaultValue="position">
              <TabsList className="flex gap-3 px-5 py-3">
                <TabsTrigger value="position">Position</TabsTrigger>
                <TabsTrigger value="yield">Yield</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent className="space-y-4" value="position">
                <PositionTab
                  activeBets={allPositions}
                  userLoading={userLoading}
                />
              </TabsContent>

              <TabsContent className="space-y-4" value="yield">
                <YieldTab
                  userLoading={userLoading}
                  yieldSummary={yieldSummary}
                />
              </TabsContent>

              <TabsContent className="space-y-4" value="activity">
                <ActivityTab userBets={userBets} userLoading={userLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
