import { Suspense } from "react";
import SignupContent from "./SignupContent";

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-gray-600">Loading...</div></div>}>
            <SignupContent />
        </Suspense>
    );
}
