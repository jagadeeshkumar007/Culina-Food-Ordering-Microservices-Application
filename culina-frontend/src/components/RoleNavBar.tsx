"use client";

import { useAuth } from "@/context/AuthContext";
import UserNavbar from "./UserNavbar";
import ChefNavbar from "./ChefNavBar";
import AdminNavbar from "./AdminNavBar";

export default function RoleNavbar() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "chef") return <ChefNavbar />;
  if (user.role === "admin") return <AdminNavbar />;
}
