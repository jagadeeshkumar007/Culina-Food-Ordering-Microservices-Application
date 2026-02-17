// app/chef/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { showToast } from "@/utils/toast";

// ============================================================================
// TYPES
// ============================================================================

type Chef = {
  id: number;
  userId: number;
  displayName: string;
  kitchenName: string;
  cuisineType: string;
  isActive: boolean;
};

type OrderStats = {
  total: number;
  pending: number;
  preparing: number;
  ready: number;
};

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================

function ChefNavbar({ chef, onToggleActive }: { chef: Chef; onToggleActive: () => void }) {
  const { logout } = useAuth();

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {chef.kitchenName}
            </h1>
            <p className="text-sm text-gray-600">
              Welcome, {chef.displayName}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onToggleActive}
              className={`px-5 py-2 rounded-lg text-white font-medium transition-colors ${chef.isActive
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-500 hover:bg-gray-600"
                }`}
            >
              {chef.isActive ? "Active" : "Inactive"}
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="text-orange-600">{icon}</div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
    </div>
  );
}

// ============================================================================
// ACTION CARD COMPONENT
// ============================================================================

function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 cursor-pointer group border border-gray-100"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-orange-100 rounded-lg text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600">
            {description}
          </p>
        </div>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CHEF DASHBOARD COMPONENT
// ============================================================================

export default function ChefDashboard() {
  const router = useRouter();
  const { user, authLoading, logout } = useAuth();
  const api = useApi();

  const [chef, setChef] = useState<Chef | null>(null);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated or not a chef
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "chef") {
      router.replace("/user/dashboard");
      return;
    }

    loadChefData();

    // Real-time polling every 3 seconds
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    return () => clearInterval(interval);
  }, [authLoading, user, router]);

  async function loadChefData() {
    setLoading(true);
    await Promise.all([fetchChef(), fetchStats()]);
    setLoading(false);
  }

  async function fetchChef() {
    try {
      const res = await api.get("/chefs/me");
      if (res.ok) {
        const data = await res.json();
        setChef(data);
      } else {
        console.error("Failed to fetch chef data");
      }
    } catch (error) {
      console.error("Error fetching chef:", error);
    }
  }

  async function fetchStats() {
    try {
      const res = await api.get("/chefs/me/orders/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        console.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }

  async function toggleActive() {
    if (!chef) return;

    try {
      const res = await api.post(`/chefs/me/active?active=${!chef.isActive}`);

      if (res.ok) {
        setChef({ ...chef, isActive: !chef.isActive });
      } else {
        showToast("Failed to update status. Please try again.", 'error');
      }
    } catch (error) {
      console.error("Error toggling active status:", error);
      showToast("Network error. Please try again.", 'error');
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Unable to load chef data</p>
          <button
            onClick={logout}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ChefNavbar chef={chef} onToggleActive={toggleActive} />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-white-500 to-white-600 rounded-2xl shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-2 text-orange-600">Welcome back, {chef.displayName}! 👋</h2>
          <p className="text-gray-700">
            Here's what's happening with your kitchen today
          </p>
        </div>

        {/* STATS */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Order Statistics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Orders"
              value={stats.total}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              title="Pending"
              value={stats.pending}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              title="Preparing"
              value={stats.preparing}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            <StatCard
              title="Ready"
              value={stats.ready}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ActionCard
              title="Manage Menus"
              description="Create, update, and organize your menu items"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              onClick={() => router.push("/chef/menus")}
            />

            <ActionCard
              title="View Orders"
              description="Track and manage incoming customer orders"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
              onClick={() => router.push("/chef/orders")}
            />

            <ActionCard
              title="Profile Settings"
              description="Update your kitchen details and information"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              onClick={() => router.push("/chef/profile")}
            />

            <ActionCard
              title="Analytics"
              description="View insights and performance metrics"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              onClick={() => router.push("/chef/analytics")}
            />

            <ActionCard
              title="Reviews"
              description="See what customers are saying about your food"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
              onClick={() => router.push("/chef/reviews")}
            />

            <ActionCard
              title="Earnings"
              description="Track your revenue and payout history"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              onClick={() => router.push("/chef/earnings")}
            />
          </div>
        </div>

        {/* Status Banner */}
        {!chef.isActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Your kitchen is currently inactive</h4>
                <p className="text-sm text-yellow-700">
                  Customers won't be able to see your menu or place orders. Click the "Active" button above to start receiving orders.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}