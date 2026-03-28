"use client";

import { Suspense } from "react";
import UserNavbar from "@/components/UserNavbar";
import SearchContent from "./SearchContent";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <UserNavbar />
      <Suspense fallback={<div className="text-center p-8 text-gray-600">Loading search results...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
