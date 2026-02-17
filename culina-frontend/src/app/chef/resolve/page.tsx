"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";

export default function ChefResolvePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    resolveChef();
  }, []);

  async function resolveChef() {
    try {
      const api = useApi();
      const res = await api.get("/chefs/me");

      // 🔴 NOT ONBOARDED → FORCE ONBOARDING
      if (res.status === 404) {
        router.replace("/chef/onboarding");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to resolve chef");
      }

      const chef = await res.json();

      // 🟡 ONBOARDED BUT NOT APPROVED → STATUS
      if (
        chef.verificationStatus === "PENDING" ||
        chef.verificationStatus === "REJECTED"
      ) {
        router.replace("/chef/status");
        return;
      }

      // 🟢 APPROVED → DASHBOARD
      if (chef.verificationStatus === "APPROVED") {
        router.replace("/chef/dashboard");
      }
    } catch (err) {
      router.replace("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Redirecting…</p>
    </div>
  );
}
