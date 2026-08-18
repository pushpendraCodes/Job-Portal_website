"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import { hydrateAuth, logout, setAccessToken } from "./authSlice";
import { useAppDispatch } from "./hooks";
import { bindUnauthorizedHandler, restorePortalSession } from "@/lib/api";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const booted = useRef(false);

  useEffect(() => {
    bindUnauthorizedHandler(() => {
      dispatch(logout());
      if (typeof window === "undefined") return;
      const parts = window.location.pathname.split("/").filter(Boolean);
      const locale = parts[0] === "hi" || parts[0] === "en" ? parts[0] : "en";
      const loginPath = `/${locale}/auth/login`;
      if (!window.location.pathname.includes("/auth/login")) {
        window.location.assign(loginPath);
      }
    });
    return () => bindUnauthorizedHandler(null);
  }, [dispatch]);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const boot = async () => {
      dispatch(hydrateAuth());
      const token = await restorePortalSession();
      if (token) dispatch(setAccessToken(token));
    };
    void boot();
  }, [dispatch]);

  return <>{children}</>;
}
