"use client";

import { useRouter } from "next/navigation";

export default function ChefCard({ chef }: any) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6">
      <h3 className="text-xl text-black font-semibold">{chef.kitchenName}</h3>
      <p className="mt-1 text-sm   text-gray-700">
        By {chef.displayName}
      </p>

      <p className="mt-2 text-sm text-gray-700">
        {chef.cuisineType}
      </p>

      <div className="flex text-black justify-between mt-4 text-sm">
        <span>⭐ {chef.avgRating || "New"}</span>
        <button
          onClick={() => router.push(`/chef/${chef.userId}/menu`)}
          className="text-orange-600 font-semibold"
        >
          View Menu →
        </button>
      </div>
    </div>
  );
}
