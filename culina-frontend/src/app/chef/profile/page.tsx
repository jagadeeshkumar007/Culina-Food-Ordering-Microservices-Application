"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/utils/ApiClient";
import { useRouter } from "next/navigation";
import { showToast } from "@/utils/toast";

type ChefProfile = {
    id: number;
    displayName: string;
    kitchenName: string;
    description: string;
    cuisineType: string;
    status: string;
};

export default function ChefProfilePage() {
    const { user } = useAuth();
    const api = useApi();
    const router = useRouter();

    const [profile, setProfile] = useState<ChefProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        displayName: "",
        kitchenName: "",
        description: "",
        cuisineType: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await api.get("/chefs/me");
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setForm({
                    displayName: data.displayName || "",
                    kitchenName: data.kitchenName || "",
                    description: data.description || "",
                    cuisineType: data.cuisineType || "",
                });
            }
        } catch (error) {
            console.error("Failed to load profile:", error);
            showToast("Failed to load profile", "error");
        } finally {
            setLoading(false);
        }
    }

    async function saveProfile() {
        setSaving(true);
        try {
            const res = await api.post("/chefs/onboard", form);
            if (res.ok) {
                showToast("Profile updated successfully!", "success");
                setEditing(false);
                fetchProfile();
            } else {
                throw new Error("Failed to update profile");
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
            showToast("Failed to update profile", "error");
        } finally {
            setSaving(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Chef Profile</h1>
                            <p className="text-gray-600 mt-1">Manage your chef information</p>
                        </div>
                        {!editing ? (
                            <button
                                onClick={() => setEditing(true)}
                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setForm({
                                            displayName: profile?.displayName || "",
                                            kitchenName: profile?.kitchenName || "",
                                            description: profile?.description || "",
                                            cuisineType: profile?.cuisineType || "",
                                        });
                                    }}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProfile}
                                    disabled={saving}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Content */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    {/* Status Badge */}
                    {profile?.status && (
                        <div className="mb-6">
                            <span
                                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${profile.status === "APPROVED"
                                        ? "bg-green-100 text-green-800"
                                        : profile.status === "PENDING"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                            >
                                Status: {profile.status}
                            </span>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Chef Name
                            </label>
                            {editing ? (
                                <input
                                    name="displayName"
                                    value={form.displayName}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            ) : (
                                <p className="text-lg text-gray-900">{profile?.displayName || "Not set"}</p>
                            )}
                        </div>

                        {/* Kitchen Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Kitchen Name
                            </label>
                            {editing ? (
                                <input
                                    name="kitchenName"
                                    value={form.kitchenName}
                                    onChange={handleChange}
                                    placeholder="Kitchen Name"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            ) : (
                                <p className="text-lg text-gray-900">{profile?.kitchenName || "Not set"}</p>
                            )}
                        </div>

                        {/* Cuisine Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Cuisine Type
                            </label>
                            {editing ? (
                                <input
                                    name="cuisineType"
                                    value={form.cuisineType}
                                    onChange={handleChange}
                                    placeholder="e.g., South Indian, Italian"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            ) : (
                                <p className="text-lg text-gray-900">{profile?.cuisineType || "Not set"}</p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                About Your Cooking
                            </label>
                            {editing ? (
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Tell us about your cooking style and specialties"
                                    rows={5}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            ) : (
                                <p className="text-lg text-gray-900 leading-relaxed">
                                    {profile?.description || "Not set"}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm text-blue-800 font-semibold mb-1">Profile Information</p>
                            <p className="text-sm text-blue-700">
                                Your profile information is displayed to customers when they view your menu items. Keep it updated to attract more orders!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
