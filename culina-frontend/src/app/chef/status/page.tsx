"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";

type ChefProfile = {
    verificationStatus: "PENDING" | "REJECTED" | "APPROVED";
    displayName: string;
};

export default function ChefStatusPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [chef, setChef] = useState<ChefProfile | null>(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    async function fetchStatus() {
        const api = useApi();
        const res = await api.get("/chefs/me");

        // SAFETY: no onboarding → back to onboarding
        if (res.status === 403 || res.status === 404) {
            router.replace("/chef/onboarding");
            return;
        }

        const data = await res.json();

        // APPROVED → dashboard
        if (data.verificationStatus === "APPROVED") {
            router.replace("/chef/dashboard");
            return;
        }

        setChef(data);
    }

    if (!chef) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading status…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-gray-900">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
                    Hello, {chef.displayName}
                </h1>

                {chef.verificationStatus === "PENDING" && (
                    <>
                        <p className="text-yellow-600 font-medium mb-2">
                            Your application is under review
                        </p>
                        <p className="text-gray-600 text-sm">
                            Our admin team is reviewing your details.
                            You’ll be notified once approved.
                        </p>
                    </>
                )}

                {chef.verificationStatus === "REJECTED" && (
                    <>
                        <p className="text-red-600 font-medium mb-2">
                            Application Rejected
                        </p>
                        <p className="text-gray-600 text-sm mb-4">
                            Unfortunately, your onboarding was rejected.
                        </p>
                        <button
                            onClick={() => router.push("/chef/onboarding")}
                            className="bg-orange-600 text-white px-4 py-2 rounded-lg"
                        >
                            Re-Apply
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
