import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  hydrated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuth(state) {
      const accessToken = Cookies.get("accessToken") || null;
      const refreshToken = Cookies.get("refreshToken") || null;
      const raw = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;

      if (!accessToken && !refreshToken) {
        state.accessToken = null;
        state.user = null;
        if (typeof window !== "undefined") localStorage.removeItem("authUser");
      } else {
        state.accessToken = accessToken;
        state.user = raw ? (JSON.parse(raw) as AuthUser) : null;
      }
      state.hydrated = true;
    },
    setCredentials(
      state,
      action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      Cookies.set("accessToken", action.payload.accessToken, { expires: 1 });
      Cookies.set("refreshToken", action.payload.refreshToken, { expires: 30 });
      localStorage.setItem("authUser", JSON.stringify(action.payload.user));
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      Cookies.set("accessToken", action.payload, { expires: 1 });
    },
    updateUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (!state.user) return;
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("authUser", JSON.stringify(state.user));
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      localStorage.removeItem("authUser");
    },
  },
});

export const { hydrateAuth, setCredentials, setAccessToken, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
