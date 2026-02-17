"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useApi } from "@/utils/ApiClient";
import { useAuth } from "@/context/AuthContext";
import { clearCart } from "@/utils/cartService";
import { showToast } from "@/utils/toast";

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();

  const orderId = params.get("orderId");
  const amount = params.get("amount");

  async function pay() {
    if (!orderId || !amount || !user) {
      showToast("Missing payment information", "error");
      return;
    }

    try {
      // Debug: Check token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token available for payment');
        showToast("Authentication token missing. Please login again.", "error");
        return;
      }
      console.log('Token available for payment:', !!token);

      // Step 1: Call payment API
      const paymentRes = await api.post("/payment/pay", {
        orderId: Number(orderId),
        userId: user.userId,
        totalAmountCents: Number(amount)
      });

      if (!paymentRes.ok) {
        throw new Error("Payment failed");
      }

      console.log('Payment successful, now clearing cart...');

      // Step 2: Clear cart (non-blocking, suppress errors)
      try {
        await clearCart(api);
        console.log('Cart cleared successfully');
      } catch (cartError) {
        // Silently handle cart clear errors - payment was successful
        console.log('Cart will be cleared on next page load');
      }

      // Step 3: Redirect to success
      showToast("Payment successful! ✓", "success");
      router.push("/orders/success");
    } catch (error) {
      console.error("Payment error:", error);
      showToast("Payment processing failed. Please try again.", "error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow max-w-sm w-full text-center">
        <h1 className="text-xl font-bold text-black mb-4">
          Payment
        </h1>

        <p className="mb-4 text-gray-800">
          Order #{orderId}
        </p>

        <p className="text-lg font-semibold text-black mb-6">
          ₹{Number(amount) / 100}
        </p>

        <button
          onClick={pay}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded"
        >
          Pay Now (Mock)
        </button>
      </div>
    </div>
  );
}
