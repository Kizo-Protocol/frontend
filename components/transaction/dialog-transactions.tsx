import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  X,
} from "lucide-react";

import { urlExplorer } from "@/lib/helper/web3";

type Status = "idle" | "pending" | "success" | "error";
type HexAddress = `0x${string}`;

interface Step {
  step: number;
  text: string;
  status: Status;
  error?: string;
}

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: "idle" | "pending" | "success" | "error";
  txHash?: HexAddress;
  errorMessage?: string;
  steps?: Step[];
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({
  isOpen,
  onClose,
  status,
  txHash,
  errorMessage,
  steps = [],
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (status === "pending" && !hasStepError) return;
    onClose();
  };

  if (!isOpen) return null;

  const isProcessing = status === "pending";
  const isSuccess = status === "success";
  const isFailed = status === "error";

  const hasStepError = steps.some((step) => step.status === "error");

  const canClose = !isProcessing || hasStepError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        role="button"
        tabIndex={0}
        onClick={canClose ? handleClose : undefined}
        onKeyDown={
          canClose
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClose();
                }
              }
            : undefined
        }
      />

      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200">
        <div className="relative px-6 pt-6 pb-4">
          {canClose && (
            <button
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={handleClose}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div className="text-center">
            {isSuccess && (
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            )}

            {(isFailed || hasStepError) && (
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            )}

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isProcessing && !hasStepError && "Processing Transaction"}
              {isProcessing && hasStepError && "Transaction Error"}
              {isSuccess && "Transaction Complete"}
              {isFailed && "Transaction Failed"}
            </h2>

            <p className="text-gray-600 text-sm">
              {isProcessing &&
                !hasStepError &&
                "Please wait while we process your transaction"}
              {isProcessing &&
                hasStepError &&
                "An error occurred during transaction processing"}
              {isSuccess && "Your transaction has been confirmed"}
              {isFailed && "Something went wrong with your transaction"}
            </p>
          </div>
        </div>

        {isProcessing && steps.length > 0 && (
          <div className="px-6 pb-4">
            <div className="space-y-4">
              {steps.map((step, index) => {
                const isActive = step.status === "pending";
                const isCompleted = step.status === "success";
                const hasError = step.status === "error";

                return (
                  <div key={step.step} className="flex items-center gap-4">
                    <div className="flex-shrink-0 relative">
                      {isCompleted ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      ) : hasError ? (
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                      ) : isActive ? (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-medium">
                            {step.step}
                          </span>
                        </div>
                      )}

                      {index < steps.length - 1 && (
                        <div
                          className={`absolute top-8 left-4 w-px h-6 ${
                            isCompleted ? "bg-green-300" : "bg-gray-300"
                          }`}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-green-700"
                            : hasError
                              ? "text-red-700"
                              : isActive
                                ? "text-blue-700"
                                : "text-gray-600"
                        }`}
                      >
                        {step.text}
                      </p>
                      {hasError && step.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {step.error}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {txHash && !isProcessing && (
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Transaction Hash
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copy"
                    onClick={() => copyToClipboard(txHash)}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <a
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                    href={urlExplorer({ txHash })}
                    rel="noopener noreferrer"
                    target="_blank"
                    title="View on Explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </a>
                </div>
              </div>
              <code className="text-xs font-mono text-gray-800 break-all block bg-white rounded-lg p-3 border border-gray-200">
                {txHash}
              </code>
            </div>
          </div>
        )}

        {isFailed && errorMessage && (
          <div className="px-6 pb-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 w-auto line-clamp-5">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          {isProcessing && !hasStepError ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                Please don&#39;t close this window
              </div>
            </div>
          ) : (
            <button
              className={`w-full py-3 px-4 rounded-2xl font-medium text-sm transition-colors ${
                isSuccess
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : hasStepError || isFailed
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-800 hover:bg-gray-900 text-white"
              }`}
              onClick={handleClose}
            >
              {isSuccess
                ? "Done"
                : hasStepError || isFailed
                  ? "Close"
                  : "Close"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDialog;
