import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Aptos,
  AptosConfig,
  Network,
  UserTransactionResponse,
} from "@aptos-labs/ts-sdk";

export type Status = "idle" | "pending" | "success" | "error";
export type AptosAddress = string;

export type Step = {
  id: string;
  step: number;
  text: string;
  description?: string;
  status: Status;
  error?: string;
  txHash?: string;
  result?: any;
};

export type AptosTransactionConfig = {
  function: string;
  typeArguments?: string[];
  functionArguments: any[];
};

export type ContractStep = {
  id: string;
  type: "contract";
  name: string;
  description: string;
  buildTransaction: (
    params: any,
    userAddress: AptosAddress,
    previousResults: any[],
  ) => AptosTransactionConfig | Promise<AptosTransactionConfig>;
  onSuccess?: (result: UserTransactionResponse, params: any) => any;
  onError?: (error: Error, params: any) => void;
};

export type ApiStep = {
  id: string;
  type: "api";
  name: string;
  description: string;
  apiCall: (
    params: any,
    userAddress: AptosAddress,
    previousResults: any[],
  ) => Promise<any>;
  onSuccess?: (result: any, params: any) => any;
  onError?: (error: Error, params: any) => void;
};

export type CustomStep = {
  id: string;
  type: "custom";
  name: string;
  description: string;
  execute: (
    params: any,
    userAddress: AptosAddress,
    previousResults: any[],
  ) => Promise<any>;
  onSuccess?: (result: any, params: any) => any;
  onError?: (error: Error, params: any) => void;
};

export type StepDefinition = ContractStep | ApiStep | CustomStep;

export type MultiStepConfig = {
  steps: StepDefinition[];
  finalizationDelay?: number;
  stopOnError?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
};

export type MultiStepResult = {
  results: any[];
  txHashes: string[];
  receipts: UserTransactionResponse[];
};

export type MultiStepHookReturn<TParams> = {
  mutation: UseMutationResult<MultiStepResult, Error, TParams>;
  steps: Step[];
  currentStep: number;
  progress: number;
  resetSteps: () => void;
  retryCurrentStep: () => void;
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
};

const getAptosClient = () => {
  if (typeof window === "undefined") return null;
  const aptosConfig = new AptosConfig({
    network: Network.TESTNET,
  });

  return new Aptos(aptosConfig);
};

export const useMultiStepTransaction = <TParams>(
  config: MultiStepConfig,
): MultiStepHookReturn<TParams> => {
  const { account, signAndSubmitTransaction } = useWallet();
  const userAddress = account?.address?.toString();

  const initialSteps: Step[] = [
    {
      id: "preparation",
      step: 1,
      text: "Preparing transaction",
      description: "Initializing multi-step process",
      status: "idle",
    },
    ...config.steps.map((stepDef, index) => ({
      id: stepDef.id,
      step: index + 2,
      text: stepDef.name,
      description: stepDef.description,
      status: "idle" as Status,
    })),
    {
      id: "finalization",
      step: config.steps.length + 2,
      text: "Finalizing",
      description: "Completing transaction process",
      status: "idle",
    },
  ];

  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [currentParams, setCurrentParams] = useState<TParams | null>(null);

  const progress = Math.round((currentStep / steps.length) * 100);

  const updateStep = useCallback(
    (
      stepId: string,
      status: Status,
      error?: string,
      txHash?: string,
      result?: any,
    ) => {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === stepId
            ? { ...step, status, error, txHash, result }
            : step,
        ),
      );
    },
    [],
  );

  const resetSteps = useCallback(() => {
    setSteps(initialSteps);
    setCurrentStep(0);
    setCurrentParams(null);
  }, [initialSteps]);

  const handleStepError = useCallback(
    (stepId: string, error: Error) => {
      updateStep(stepId, "error", error.message);

      if (config.stopOnError !== false) {
        const currentStepIndex = steps.findIndex((s) => s.id === stepId);

        setSteps((prev) =>
          prev.map((step, index) =>
            index > currentStepIndex
              ? { ...step, status: "idle" as const }
              : step,
          ),
        );
      }
    },
    [config.stopOnError, updateStep, steps],
  );

  const executeContractStep = async (
    stepDef: ContractStep,
    params: TParams,
    previousResults: any[],
  ): Promise<any> => {
    if (!userAddress || !account) {
      throw new Error("Wallet not connected");
    }

    const txConfig = await stepDef.buildTransaction(
      params,
      userAddress,
      previousResults,
    );

    const response = await signAndSubmitTransaction({
      sender: account.address,
      data: {
        function: txConfig.function as `${string}::${string}::${string}`,
        typeArguments: txConfig.typeArguments,
        functionArguments: txConfig.functionArguments,
      },
    });

    const txHash = response.hash;
    const aptos = getAptosClient();

    if (!aptos) {
      throw new Error("Aptos client not available");
    }

    const receipt = await aptos.waitForTransaction({
      transactionHash: txHash,
    });

    updateStep(stepDef.id, "success", undefined, txHash, receipt);

    return stepDef.onSuccess
      ? await stepDef.onSuccess(receipt as UserTransactionResponse, params)
      : receipt;
  };

  const executeApiStep = async (
    stepDef: ApiStep,
    params: TParams,
    previousResults: any[],
  ): Promise<any> => {
    if (!userAddress) {
      throw new Error("Wallet not connected");
    }

    const result = await stepDef.apiCall(params, userAddress, previousResults);

    updateStep(stepDef.id, "success", undefined, undefined, result);

    return stepDef.onSuccess ? await stepDef.onSuccess(result, params) : result;
  };

  const executeCustomStep = async (
    stepDef: CustomStep,
    params: TParams,
    previousResults: any[],
  ): Promise<any> => {
    if (!userAddress) {
      throw new Error("Wallet not connected");
    }

    const result = await stepDef.execute(params, userAddress, previousResults);

    updateStep(stepDef.id, "success", undefined, undefined, result);

    return stepDef.onSuccess ? await stepDef.onSuccess(result, params) : result;
  };

  const executeSteps = async (params: TParams): Promise<MultiStepResult> => {
    if (!userAddress) {
      throw new Error("Wallet not connected");
    }

    setCurrentParams(params);
    resetSteps();

    const results: any[] = [];
    const txHashes: string[] = [];
    const receipts: UserTransactionResponse[] = [];

    try {
      setCurrentStep(1);
      updateStep("preparation", "pending");
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateStep("preparation", "success");

      for (let i = 0; i < config.steps.length; i++) {
        const stepDef = config.steps[i];
        const stepNumber = i + 2;

        setCurrentStep(stepNumber);
        updateStep(stepDef.id, "pending");

        try {
          let result: any;

          switch (stepDef.type) {
            case "contract":
              result = await executeContractStep(
                stepDef as ContractStep,
                params,
                results,
              );

              const step = steps.find((s) => s.id === stepDef.id);

              if (step?.txHash) {
                txHashes.push(step.txHash);
              }
              if (result && "hash" in result) {
                receipts.push(result);
              }
              break;

            case "api":
              result = await executeApiStep(
                stepDef as ApiStep,
                params,
                results,
              );
              break;

            case "custom":
              result = await executeCustomStep(
                stepDef as CustomStep,
                params,
                results,
              );
              break;

            default:
              throw new Error(`Unknown step type: ${(stepDef as any).type}`);
          }

          results.push(result);
        } catch (error) {
          const err = error as Error;

          if ("onError" in stepDef && stepDef.onError) {
            stepDef.onError(err, params);
          }

          handleStepError(stepDef.id, err);

          if (config.stopOnError !== false) {
            throw err;
          }

          results.push(null);
        }
      }

      const finalizationStep = config.steps.length + 2;

      setCurrentStep(finalizationStep);
      updateStep("finalization", "pending");

      if (config.finalizationDelay) {
        await new Promise((resolve) =>
          setTimeout(resolve, config.finalizationDelay),
        );
      }

      updateStep("finalization", "success");
      setCurrentStep(0);

      return {
        results,
        txHashes,
        receipts,
      };
    } catch (error) {
      setCurrentStep(0);
      throw error;
    }
  };

  const retryCurrentStep = useCallback(() => {
    if (currentParams && currentStep > 0) {
      const currentStepId = steps[currentStep - 1]?.id;

      if (currentStepId) {
        updateStep(currentStepId, "idle");
      }

      mutation.mutate(currentParams);
    }
  }, [currentParams, currentStep, steps]);

  const mutation = useMutation({
    mutationFn: executeSteps,
  });

  return {
    mutation,
    steps,
    currentStep,
    progress,
    resetSteps,
    retryCurrentStep,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
};
