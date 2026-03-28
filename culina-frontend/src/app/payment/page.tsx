import { Suspense } from "react";
import PaymentContent from "./PaymentContent";

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-gray-500">Loading payment…</p></div>}>
      <PaymentContent />
    </Suspense>
  );
}
