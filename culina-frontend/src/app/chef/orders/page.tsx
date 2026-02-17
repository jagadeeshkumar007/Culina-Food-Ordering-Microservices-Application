"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { showToast } from "@/utils/toast";

type OrderItem = {
    itemName: string;
    quantity: number;
};

type Order = {
    id: number;
    status: "PAID" | "CONFIRMED" | "PREPARING" | "READY";
    totalAmountCents: number;
    createdAt: string;
    items: OrderItem[];
};

type Stats = {
    pending: number;
    preparing: number;
    ready: number;
};

export default function ChefOrdersPage() {
    const { user } = useAuth();
    const api = useApi();
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<Stats>({ pending: 0, preparing: 0, ready: 0 });
    const [loading, setLoading] = useState(true);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
        fetchStats();

        const interval = setInterval(() => {
            fetchOrders();
            fetchStats();
        }, 3000); // every 3 seconds for real-time updates

        return () => clearInterval(interval);
    }, [api]);


    async function fetchOrders() {
        const res = await api.get("/order/chef/pending");

        if (res.ok) {
            setOrders(await res.json());
        }
        setLoading(false);
    }

    async function fetchStats() {
        const res = await api.get("/order/chef/stats");
        if (res.ok) {
            setStats(await res.json());
        }
    }

    async function updateStatus(orderId: number, action: "confirm" | "prepare" | "ready") {
        setActionInProgress(`${orderId}-${action}`);
        try {
            const endpoint = action === "confirm" ? `confirm` :
                action === "prepare" ? `preparing` :
                    `ready`;

            const res = await api.post(
                `/order/${orderId}/${endpoint}`,
                {}
            );

            if (res.ok) {
                const actionText = action === "confirm" ? "Order accepted" :
                    action === "prepare" ? "Cooking started" :
                        "Order marked ready";
                showToast(actionText + "! ✓", "success");
                await fetchOrders();
                await fetchStats();
            } else {
                showToast("Failed to update order status", "error");
            }
        } catch (error) {
            console.error("Error updating status:", error);
            showToast("Network error. Please try again.", "error");
        } finally {
            setActionInProgress(null);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading orders…
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Kitchen Dashboard
                    </h1>
                    <div className="text-sm text-gray-600">
                        Auto-refreshing every 3s
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded">
                        <p className="text-yellow-700 text-sm font-semibold">Pending</p>
                        <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                    </div>
                    <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
                        <p className="text-blue-700 text-sm font-semibold">Preparing</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.preparing}</p>
                    </div>
                    <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
                        <p className="text-green-700 text-sm font-semibold">Ready</p>
                        <p className="text-3xl font-bold text-green-900">{stats.ready}</p>
                    </div>
                </div>

                {orders.length === 0 && (
                    <div className="bg-white p-6 rounded-xl text-gray-600">
                        No orders yet. All caught up! 🎉
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onConfirm={() => updateStatus(order.id, "confirm")}
                            onPrepare={() => updateStatus(order.id, "prepare")}
                            onReady={() => updateStatus(order.id, "ready")}
                            isLoading={actionInProgress === `${order.id}-confirm` ||
                                actionInProgress === `${order.id}-prepare` ||
                                actionInProgress === `${order.id}-ready`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function OrderCard({
    order,
    onConfirm,
    onPrepare,
    onReady,
    isLoading = false,
}: {
    order: Order;
    onConfirm: () => void;
    onPrepare: () => void;
    onReady: () => void;
    isLoading?: boolean;
}) {
    return (
        <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-orange-600 text-lg">
                        Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                </div>

                <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${order.status === "PAID"
                        ? "bg-yellow-100 text-yellow-700"
                        : order.status === "CONFIRMED"
                            ? "bg-purple-100 text-purple-700"
                            : order.status === "PREPARING"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                        }`}
                >
                    {order.status}
                </span>
            </div>

            {/* ITEMS */}
            <div className="mt-4 space-y-2">
                {order.items.map((item, idx) => (
                    <div
                        key={`${item.itemName}-${idx}`}
                        className="flex justify-between text-sm text-gray-700"
                    >
                        <span>{item.itemName}</span>
                        <span>× {item.quantity}</span>
                    </div>
                ))}
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex justify-between items-center">
                <span className="font-semibold">
                    ₹{order.totalAmountCents / 100}
                </span>

                {order.status === "PAID" && (
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isLoading ? "Processing..." : "Accept Order"}
                    </button>
                )}

                {order.status === "CONFIRMED" && (
                    <button
                        onClick={onPrepare}
                        disabled={isLoading}
                        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isLoading ? "Processing..." : "Start Preparing"}
                    </button>
                )}

                {order.status === "PREPARING" && (
                    <button
                        onClick={onReady}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        {isLoading ? "Processing..." : "Mark Ready"}
                    </button>
                )}
            </div>
        </div>
    );
}

