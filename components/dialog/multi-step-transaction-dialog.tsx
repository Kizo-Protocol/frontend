"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Step, Status } from "@/hooks/mutation/use-multi-step-transaction";

interface MultiStepTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  steps: Step[];
  currentStep: number;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  onRetry?: () => void;
  onClose?: () => void;
  explorerUrl?: string;
  showTxHashes?: boolean;
}

const getStatusIcon = (status: Status) => {
  switch (status) {
    case "success":
      return (
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
      );
    case "error":
      return (
        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
      );
    case "pending":
      return (
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
      );
    default:
      return (
        <div className="h-4 w-4 rounded-full border-[0.5px] border-gray-300 dark:border-gray-600 flex-shrink-0" />
      );
  }
};

const getStatusBadge = (status: Status) => {
  switch (status) {
    case "success":
      return (
        <Badge
          className="text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30 border-green-200 dark:border-green-800 flex-shrink-0 text-xs"
          variant="secondary"
        >
          Success
        </Badge>
      );
    case "error":
      return (
        <Badge
          className="flex-shrink-0 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800"
          variant="destructive"
        >
          Error
        </Badge>
      );
    case "pending":
      return (
        <Badge
          className="text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 flex-shrink-0 text-xs"
          variant="secondary"
        >
          In Progress
        </Badge>
      );
    case "idle":
      return (
        <Badge
          className="flex-shrink-0 text-xs border-gray-300 dark:border-gray-600"
          variant="outline"
        >
          Pending
        </Badge>
      );
    default:
      return (
        <Badge
          className="flex-shrink-0 text-xs border-gray-300 dark:border-gray-600"
          variant="outline"
        >
          Unknown
        </Badge>
      );
  }
};

export function MultiStepTransactionDialog({
  open,
  onOpenChange,
  title,
  description,
  steps,
  currentStep,
  isLoading,
  isSuccess,
  isError,
  onRetry,
  onClose,
  explorerUrl = "https://etherscan.io/tx",
  showTxHashes = true,
}: MultiStepTransactionDialogProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hasErrors = steps.some((step) => step.status === "error");

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    onOpenChange(false);
  };

  const canClose = !isLoading || isSuccess || isError;

  return (
    <Dialog open={open} onOpenChange={canClose ? onOpenChange : undefined}>
      <DialogContent
        className="w-[95vw] sm:max-w-[550px] mx-auto h-[80vh] max-h-[800px] flex flex-col overflow-hidden rounded-4xl"
        onPointerDownOutside={(e) => {
          if (!canClose) e.preventDefault();
        }}
      >
        <DialogHeader className="flex-shrink-0 space-y-2 pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl pr-6">
            <div className="flex-shrink-0">
              {isSuccess && <CheckCircle className="h-6 w-6 text-green-500" />}
              {isError && <XCircle className="h-6 w-6 text-red-500" />}
              {isLoading && (
                <Clock className="h-6 w-6 text-blue-500 animate-spin" />
              )}
            </div>
            <span className="truncate">{title}</span>
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col space-y-4 overflow-hidden">
          {isLoading && currentStep > 0 && (
            <div className="flex-shrink-0 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 flex-shrink-0 text-blue-500 animate-spin mt-0.5" />
                <div className="text-sm">
                  <span className="block font-medium mb-0.5">
                    Executing step {currentStep}
                  </span>
                  <span className="block break-words text-muted-foreground">
                    {steps[currentStep - 1]?.text}
                  </span>
                </div>
              </div>
            </div>
          )}

          {hasErrors && (
            <div className="flex-shrink-0 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <span className="block font-medium text-red-500">
                    Transaction failed
                  </span>
                  <span className="block text-muted-foreground mt-0.5">
                    Please check the details below and retry if needed.
                  </span>
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="flex-shrink-0 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="block font-medium text-green-500">
                    All steps completed successfully!
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4 pb-2">
                {steps.map((step, index) => (
                  <div key={step.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">{getStatusIcon(step.status)}</div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium break-words text-gray-900 dark:text-gray-100">
                              {step.step}. {step.text}
                            </p>
                            {step.description && (
                              <p className="text-xs text-muted-foreground break-words mt-1">
                                {step.description}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 ml-2">
                            {getStatusBadge(step.status)}
                          </div>
                        </div>

                        {step.status === "error" && step.error && (
                          <div className="mt-2">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3">
                              <p className="text-xs font-medium text-red-500 mb-1">
                                Error Details:
                              </p>
                              <ScrollArea className="max-h-24 overflow-y-auto">
                                <code className="text-xs text-muted-foreground break-all whitespace-pre-wrap leading-relaxed block font-mono">
                                  {step.error}
                                </code>
                              </ScrollArea>
                            </div>
                          </div>
                        )}

                        {showTxHashes && step.txHash && (
                          <div className="mt-2 space-y-2">
                            <Button
                              className="h-8 text-xs px-4 rounded-2xl"
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(
                                  `${explorerUrl}/${step.txHash}`,
                                  "_blank",
                                )
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="truncate">View Transaction</span>
                            </Button>
                            {showDetails && (
                              <div className="bg-muted rounded-2xl p-3">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Transaction Hash:
                                </p>
                                <code className="text-xs bg-background border border-border rounded-xl px-3 py-2 font-mono block break-all">
                                  {step.txHash}
                                </code>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="ml-7">
                        <Separator className="w-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {showTxHashes && steps.some((step) => step.txHash) && (
            <div className="flex-shrink-0 pt-3 border-t border-border">
              <Button
                className="text-xs h-8 rounded-2xl"
                size="sm"
                variant="ghost"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? "Hide" : "Show"} Transaction Details
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 mt-4 border-t border-border flex-col sm:flex-row">
          {hasErrors && onRetry && (
            <Button
              className="gap-2 w-full sm:w-auto rounded-3xl"
              disabled={isLoading}
              variant="outline"
              onClick={onRetry}
            >
              <RotateCcw className="h-4 w-4 flex-shrink-0" />
              Retry
            </Button>
          )}

          <Button
            className="w-full sm:w-auto rounded-3xl"
            disabled={!canClose}
            variant={isSuccess ? "default" : "outline"}
            onClick={handleClose}
          >
            {isLoading ? "Processing..." : isSuccess ? "Done" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
