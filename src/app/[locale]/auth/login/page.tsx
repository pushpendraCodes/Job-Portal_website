"use client";

import { Suspense } from "react";
import LoginPage from "./LoginClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="container-x py-14">Loading…</div>}>
      <LoginPage />
    </Suspense>
  );
}
