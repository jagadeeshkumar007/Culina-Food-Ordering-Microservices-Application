"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";

interface OrderItem {
  menuItemId: number;
  itemName: string;
  itemPriceCents: number;
  quantity: number;
}

interface Order {
  id: number;
  chefId: number;
  status: "CREATED" | "PAID" | "CONFIRMED" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED";
  totalAmountCents: number;
  items: OrderItem[];
  createdAt: string;
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const statusColors: Record<string, string> = {
    CREATED: "bg-gray-200 text-gray-800",
    PAID: "bg-yellow-200 text-yellow-800",
    CONFIRMED: "bg-purple-200 text-purple-800",
    PREPARING: "bg-blue-200 text-blue-800",
    READY: "bg-green-100 text-green-800",
    DELIVERED: "bg-green-200 text-green-800",
    CANCELLED: "bg-red-200 text-red-800",
  };

  const statusEmoji: Record<string, string> = {
    CREATED: "⏳",
    PAID: "💳",
    CONFIRMED: "✅",
    PREPARING: "🍳",
    READY: "🎉",
    DELIVERED: "🚚",
    CANCELLED: "❌",
  };

  const statusDescriptions: Record<string, string> = {
    CREATED: "Order created, awaiting payment",
    PAID: "Payment received, waiting for chef confirmation",
    CONFIRMED: "Chef accepted your order",
    PREPARING: "Your food is being prepared",
    READY: "Your order is ready for pickup!",
    DELIVERED: "Order completed",
    CANCELLED: "Order was cancelled",
  };

  const getStatusProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      CREATED: 14,
      PAID: 28,
      CONFIRMED: 42,
      PREPARING: 70,
      READY: 85,
      DELIVERED: 100,
      CANCELLED: 0,
    };
    return progressMap[status] || 0;
  };

  async function fetchOrders() {
    if (!user) return;

    try {
      const res = await api.get("/order");
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();

    // Poll for updates every 3 seconds
    const interval = setInterval(fetchOrders, 3000);

    return () => clearInterval(interval);
  }, [user]);

  const cancelOrder = async (orderId: number) => {
    try {
      const res = await api.post(`/order/${orderId}/cancel`, {});
      if (res.ok) {
        showToast("Order cancelled", "success");
        await fetchOrders();
      } else {
        showToast("Cannot cancel this order", "error");
      }
    } catch (error) {
      showToast("Failed to cancel order", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-gray-600 mb-4">Please log in to view your orders</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-orange-600 text-white px-6 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">My Orders</h1>
          <button
            onClick={() => router.push("/home")}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Continue Shopping
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600 mb-4">No orders yet</p>
            <button
              onClick={() => router.push("/home")}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded"
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <>
            {/* Live Update Indicator */}
            <div className="flex items-center justify-end gap-2 mb-4 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates every 3 seconds</span>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Order ID</p>
                      <p className="text-2xl font-bold text-gray-900">#{order.id}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-orange-600">
                        ₹{(order.totalAmountCents / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge and Description */}
                  <div className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusColors[order.status]}`}>
                        {statusEmoji[order.status]} {order.status}
                      </span>
                      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                        <span className="text-xs text-gray-500 italic">
                          {statusDescriptions[order.status]}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {order.status !== "CANCELLED" && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${order.status === "DELIVERED" ? "bg-green-600" : "bg-orange-600"
                            }`}
                          style={{ width: `${getStatusProgress(order.status)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Order Items
                    </p>
                    <ul className="space-y-2">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">
                            {item.itemName} <span className="text-gray-500">× {item.quantity}</span>
                          </span>
                          <span className="text-gray-900 font-semibold">
                            ₹{((item.itemPriceCents * item.quantity) / 100).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons / Status Messages */}
                  {order.status === "CREATED" || order.status === "PAID" ? (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancel Order
                    </button>
                  ) : order.status === "CONFIRMED" ? (
                    <div className="w-full bg-purple-100 border-2 border-purple-300 text-purple-800 py-3 rounded-lg text-center font-semibold">
                      ✅ Chef is preparing your order
                    </div>
                  ) : order.status === "PREPARING" ? (
                    <div className="w-full bg-blue-100 border-2 border-blue-300 text-blue-800 py-3 rounded-lg text-center font-semibold animate-pulse">
                      🍳 Cooking in progress...
                    </div>
                  ) : order.status === "READY" ? (
                    <div className="w-full bg-green-100 border-2 border-green-400 text-green-800 py-3 rounded-lg text-center font-bold text-lg">
                      🎉 Ready for pickup!
                    </div>
                  ) : order.status === "DELIVERED" ? (
                    <div className="w-full bg-green-600 text-white py-3 rounded-lg text-center font-semibold">
                      ✓ Order delivered - Thank you!
                    </div>
                  ) : order.status === "CANCELLED" ? (
                    <div className="w-full bg-red-100 border-2 border-red-300 text-red-800 py-3 rounded-lg text-center font-semibold">
                      ❌ Order cancelled
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
