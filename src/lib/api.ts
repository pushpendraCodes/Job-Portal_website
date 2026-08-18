import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function bindUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

function clearPortalSession() {
  Cookies.remove("accessToken");
  Cookies.remove("refreshToken");
  if (typeof window !== "undefined") {
    localStorage.removeItem("authUser");
  }
  unauthorizedHandler?.();
}

function isAuthEndpoint(url?: string) {
  if (!url) return false;
  return (
    url.includes("/auth/refresh") ||
    url.includes("/auth/otp") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/register")
  );
}

api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const message = String(error.response?.data?.message || "");

    if (status !== 401 || !original || original._retry || isAuthEndpoint(original.url)) {
      if (
        status === 401 &&
        !isAuthEndpoint(original?.url) &&
        (message.toLowerCase().includes("access token") ||
          message.toLowerCase().includes("unauthorized"))
      ) {
        const hasRefresh = Boolean(Cookies.get("refreshToken"));
        if (!hasRefresh) clearPortalSession();
      }
      return Promise.reject(error);
    }

    original._retry = true;
    const refreshToken = Cookies.get("refreshToken");
    if (!refreshToken) {
      clearPortalSession();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const tokens = data.data as { accessToken: string; refreshToken: string };
      Cookies.set("accessToken", tokens.accessToken, { expires: 1 });
      Cookies.set("refreshToken", tokens.refreshToken, { expires: 30 });
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${tokens.accessToken}`;
      return api(original);
    } catch {
      clearPortalSession();
      return Promise.reject(error);
    }
  },
);

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function getErrorMessage(err: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string })?.message || fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export async function restorePortalSession(): Promise<string | null> {
  const access = Cookies.get("accessToken");
  if (access) return access;
  const refreshToken = Cookies.get("refreshToken");
  if (!refreshToken) {
    if (typeof window !== "undefined" && localStorage.getItem("authUser")) {
      clearPortalSession();
    }
    return null;
  }
  try {
    const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
    const tokens = data.data as { accessToken: string; refreshToken: string };
    Cookies.set("accessToken", tokens.accessToken, { expires: 1 });
    Cookies.set("refreshToken", tokens.refreshToken, { expires: 30 });
    return tokens.accessToken;
  } catch {
    clearPortalSession();
    return null;
  }
}
