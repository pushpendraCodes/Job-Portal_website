"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import { hydrateAuth, logout, setAccessToken, updateUser } from "./authSlice";
import { useAppDispatch, useAppSelector } from "./hooks";
import { api, bindUnauthorizedHandler, restorePortalSession, type ApiSuccess } from "@/lib/api";

type MeProfile = {
  fullName?: string;
  fullNameHi?: string;
  ownerName?: string;
  companyName?: string;
  companyNameHi?: string;
};

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
  const { user, hydrated } = useAppSelector((s) => s.auth);
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

  useEffect(() => {
    if (!hydrated || !user || user.name) return;
    let cancelled = false;

    void api
      .get<ApiSuccess<{ profile?: MeProfile }>>("/profile/me")
      .then(({ data }) => {
        if (cancelled) return;
        const profile = data.data.profile;
        const hi = user.preferredLocale === "hi";
        const name =
          (hi && (profile?.fullNameHi || profile?.companyNameHi)) ||
          profile?.fullName ||
          profile?.ownerName ||
          profile?.companyName ||
          "";
        if (name) dispatch(updateUser({ name }));
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [hydrated, user, dispatch]);

  return <>{children}</>;
}
