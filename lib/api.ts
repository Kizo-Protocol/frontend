const BASE_URL = "/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const rateLimiter = {
  refreshAttempts: new Map<string, number>(),
  lastRefresh: 0,
  maxRefreshAttempts: 3,
  refreshCooldown: 5000,

  canRefresh(): boolean {
    const now = Date.now();

    return now - this.lastRefresh > this.refreshCooldown;
  },

  recordRefreshAttempt(): void {
    this.lastRefresh = Date.now();
  },
};

function mapApiPath(path: string): string {
  if (path.startsWith("/api/")) {
    return path.replace("/api", "");
  }

  return path;
}

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: any,
  options?: {
    headers?: Record<string, string>;
    skipRefresh?: boolean;
    credentials?: RequestCredentials;
  },
): Promise<T> {
  const mappedPath = mapApiPath(path);
  const url = `${BASE_URL}${mappedPath}`;

  const getAuthHeaders = (): Record<string, string> => {
    if (typeof window === "undefined") return {};

    const token = localStorage.getItem("auth_token");

    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...options?.headers,
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: options?.credentials || "include",
  });

  if (
    res.status === 401 &&
    !options?.skipRefresh &&
    !path.includes("/auth/refresh") &&
    !path.includes("/auth/logout") &&
    !path.includes("/auth/login")
  ) {
    if (rateLimiter.canRefresh()) {
      try {
        rateLimiter.recordRefreshAttempt();

        return request<T>(path, method, body, {
          ...options,
          skipRefresh: true,
        });
      } catch (refreshError) {
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/auth")
        ) {
          window.location.href = "/auth/login";
        }
        throw refreshError;
      }
    } else {
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/auth")
      ) {
        window.location.href = "/auth/login";
      }
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    let errorData;

    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText, statusCode: res.status };
    }

    const structuredError = {
      message: errorData.message || errorText,
      response: {
        status: res.status,
        data: errorData,
      },
      timestamp: new Date().toISOString(),
    };

    const { logger } = await import("@/lib/logger");

    logger.api.error(method, path, structuredError);

    throw structuredError;
  }

  return res.json();
}

export const api = {
  get: <T>(
    path: string,
    options?: {
      headers?: Record<string, string>;
      credentials?: RequestCredentials;
    },
  ) => request<T>(path, "GET", undefined, options),
  post: <T>(
    path: string,
    body: any,
    options?: {
      headers?: Record<string, string>;
      credentials?: RequestCredentials;
    },
  ) => request<T>(path, "POST", body, options),
  put: <T>(
    path: string,
    body: any,
    options?: {
      headers?: Record<string, string>;
      credentials?: RequestCredentials;
    },
  ) => request<T>(path, "PUT", body, options),
  delete: <T>(
    path: string,
    options?: {
      headers?: Record<string, string>;
      credentials?: RequestCredentials;
    },
  ) => request<T>(path, "DELETE", undefined, options),
  patch: <T>(
    path: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
      credentials?: RequestCredentials;
    },
  ) => request<T>(path, "PATCH", body, options),
};
