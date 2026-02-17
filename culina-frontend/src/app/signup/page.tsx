"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApi } from "@/utils/ApiClient";

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const defaultRole =
        searchParams.get("role") === "chef" ? "chef" : "customer";

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: defaultRole,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function submit() {
        setError("");
        setLoading(true);

        try {
            const api = useApi();
            const res = await api.post("/auth/signup", form, { skipAuth: true });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Signup failed");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-gray-900">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
                    Create your Culina account
                </h1>

                {error && (
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                )}

                <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 mb-5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                    <option value="customer">Customer</option>
                    <option value="chef">Chef</option>
                </select>

                <button
                    onClick={submit}
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium"
                >
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p className="text-sm text-center mt-4 text-gray-600">
                    Already have an account?{" "}
                    <span
                        className="text-orange-600 cursor-pointer font-medium"
                        onClick={() => router.push("/login")}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}
