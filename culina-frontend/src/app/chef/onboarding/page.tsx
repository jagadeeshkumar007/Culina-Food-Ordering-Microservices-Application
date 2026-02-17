"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";

export default function ChefOnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [form, setForm] = useState({
        displayName: "",
        kitchenName: "",
        description: "",
        cuisineType: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function submit() {
        setLoading(true);
        setError("");

        try {
            const api = useApi();
            const res = await api.post("/chefs/onboard", form);

            if (!res.ok) {
                throw new Error("Onboarding failed");
            }

            // IMPORTANT: go back to resolve
            router.replace("/chef/resolve");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-gray-900">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
                    Chef Onboarding
                </h1>

                {error && (
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                )}

                <input
                    name="displayName"
                    placeholder="Your Name"
                    value={form.displayName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <input
                    name="kitchenName"
                    placeholder="Kitchen Name"
                    value={form.kitchenName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <input
                    name="cuisineType"
                    placeholder="Cuisine Type (e.g. South Indian)"
                    value={form.cuisineType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <textarea
                    name="description"
                    placeholder="Tell us about your cooking"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={4}
                />

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium"
                >
                    {loading ? "Submitting..." : "Submit Onboarding"}
                </button>
            </div>
        </div>
    );
}
