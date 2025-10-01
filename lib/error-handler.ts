import { toast } from "sonner";

export interface ApiError {
  statusCode?: number;
  message?: string;
  response?: {
    data?: {
      statusCode?: number;
      message?: string;
      error?: string;
    };
    status?: number;
  };
}

export const handleApiError = (
  error: ApiError | Error | any,
  defaultMessage?: string,
): string => {
  let errorMessage = defaultMessage || "An unexpected error occurred";
  let statusCode: number | undefined;

  if (error?.response?.data?.message) {
    errorMessage = error.response.data.message;
    statusCode = error.response.data.statusCode || error.response.status;
  } else if (error?.response?.data?.error) {
    errorMessage = error.response.data.error;
    statusCode = error.response.data.statusCode || error.response.status;
  } else if (error?.response?.data) {
    if (typeof error.response.data === "string") {
      try {
        const parsed = JSON.parse(error.response.data);

        errorMessage = parsed.message || parsed.error || error.response.data;
        statusCode = parsed.statusCode;
      } catch {
        errorMessage = error.response.data;
      }
    } else if (error.response.data.message) {
      errorMessage = error.response.data.message;
      statusCode = error.response.data.statusCode;
    }
  } else if (error?.message) {
    if (error.message.includes("{") && error.message.includes("}")) {
      try {
        const parsed = JSON.parse(error.message);

        errorMessage = parsed.message || parsed.error || error.message;
        statusCode = parsed.statusCode;
      } catch {
        errorMessage = error.message;
      }
    } else {
      errorMessage = error.message;
    }
  }

  if (!statusCode) {
    statusCode =
      error?.response?.data?.statusCode ||
      error?.response?.status ||
      error?.statusCode;
  }

  switch (statusCode) {
    case 409:
      if (
        errorMessage.toLowerCase().includes("user already exists") ||
        errorMessage.toLowerCase().includes("already exists")
      ) {
        errorMessage = "An account with this email or username already exists";
      }
      break;
    case 401:
      errorMessage =
        "Invalid credentials. Please check your email/username and password";
      break;
    case 403:
      errorMessage = "You don't have permission to perform this action";
      break;
    case 404:
      errorMessage = "The requested resource was not found";
      break;
    case 422:
      errorMessage = "Please check your input and try again";
      break;
    case 429:
      errorMessage = "Too many requests. Please try again later";
      break;
    case 500:
      errorMessage = "Server error. Please try again later";
      break;
  }

  return errorMessage;
};

export const showErrorToast = (
  error: ApiError | Error | any,
  defaultMessage?: string,
): void => {
  const errorMessage = handleApiError(error, defaultMessage);

  toast.error(errorMessage);
};

export const showSuccessToast = (message: string): void => {
  toast.success(message);
};
