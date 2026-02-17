"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OrderSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push("/orders");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Order Placed Successfully! 🎉
        </h1>

        <p className="text-gray-600 mb-6 text-lg">
          Your payment has been processed and your order is confirmed.
        </p>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold mb-2">
            ✓ Payment Successful
          </p>
          <p className="text-green-700 text-sm">
            The chef will confirm your order shortly
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push("/orders")}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View My Orders
          </button>

          <button
            onClick={() => router.push("/home")}
            className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Redirecting to orders page in 5 seconds...
        </p>
      </div>
    </div>
  );
}
