// app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { login: authLogin } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await authLogin(email, password);
            // Navigation is handled in AuthContext based on role
        } catch (err: any) {
            setError(err.message || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Culina</h1>
                    <p className="text-sm text-gray-600 mt-1">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"

                            />
                            <span className="absolute right-3 top-2 -translate-y-1/2 hover:cursor-pointer" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "🙈" : "👁️"}</span>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                {/* Sign Up Link */}
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <button
                        onClick={() => router.push("/signup")}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
}