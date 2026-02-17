"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect logged-in users to their home page
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/chefs");
      } else if (user.role === "CHEF") {
        router.push("/chef/dashboard");
      } else {
        router.push("/home");
      }
    }
  }, [user, router]);

  // If user is logged in, show loading while redirecting
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-10 py-6">
        <h1 className="text-3xl font-extrabold text-orange-600">
          Culina
        </h1>

        <div className="space-x-4">
          <button
            onClick={() => router.push("/login")}
            className="text-gray-700 hover:text-orange-600 font-medium"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/signup")}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Home-Cooked Food,
            <span className="text-orange-600 block">
              Delivered Fresh
            </span>
          </h2>

          <p className="text-lg text-gray-600 mb-10">
            Discover meals prepared by verified home chefs.
            Taste authenticity, freshness, and passion — all in one place.
          </p>

          <div className="flex justify-center gap-6">
            <button
              onClick={() => router.push("/signup")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl text-lg shadow-lg"
            >
              Order Food
            </button>

            <button
              onClick={() => router.push("/signup?role=chef")}
              className="bg-white border border-orange-600 text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-xl text-lg shadow"
            >
              Become a Chef
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Culina. All rights reserved.
      </footer>
    </div>
  );
}
