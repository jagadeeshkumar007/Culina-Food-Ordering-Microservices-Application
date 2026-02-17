"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { useApi } from "@/utils/ApiClient";

type Menu = {
  id: number;
  title: string;
  isActive: boolean;
};


export default function ChefMenusPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");

  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  function startEdit(menu: Menu) {
    setEditingMenuId(menu.id);
    setEditName(menu.title);
  }

  function cancelEdit() {
    setEditingMenuId(null);
  }

  async function deactivateMenu(menuId: number) {
    if (!confirm("Deactivate this menu? Users will no longer see it.")) return;

    const api = useApi();
    await api.post(
      `/menu/${menuId}/deactivate`,
      {}
    );

    fetchMenus();
  }


  async function saveMenu(menuId: number) {
    const api = useApi();
    await api.post("/chefs/menu/createMenu", {
      menuId, // backend can accept this if needed
      title: editName,
    });

    setEditingMenuId(null);
    fetchMenus();
  }


  useEffect(() => {
    fetchMenus();
  }, [user]);

  async function fetchMenus() {
    if (!user) return;

    const api = useApi();
    const res = await api.get("/chefs/menus");

    if (res.ok) {
      setMenus(await res.json());
    }
  }

  async function createMenu() {
    if (!user) return;

    const api = useApi();
    await api.post("/chefs/menu/createMenu", {
      title,
    });

    setShowModal(false);
    setTitle("");
    fetchMenus();
  }

  return (
    <div className="min-h-screen bg-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-gray-900 text-2xl font-bold">Your Menus</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            + Create Menu
          </button>
        </div>

        {menus.map((menu) => {
          const isEditing = editingMenuId === menu.id;

          return (
            <div
              key={menu.id}
              className={`p-5 rounded-xl shadow mb-4 border transition ${menu.isActive
                  ? "bg-white"
                  : "bg-gray-100 opacity-70"
                }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-black border px-3 py-2 rounded mb-2"
                    />
                  ) : (
                    <>
                      <h3 className="text-black text-lg font-semibold">
                        {menu.title}
                      </h3>
                      {!menu.isActive && (
                        <p className="text-sm text-red-600 mt-1">
                          Menu is inactive
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* STATUS BADGE */}
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${menu.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}
                >
                  {menu.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 mt-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveMenu(menu.id)}
                      className="bg-orange-600 text-white px-4 py-1 rounded"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(menu)}
                      className="text-sm text-orange-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        router.push(`/chef/menus/${menu.id}/items`)
                      }
                      className="text-sm text-blue-600"
                    >
                      Items →
                    </button>

                    {menu.isActive && (
                      <button
                        onClick={() => deactivateMenu(menu.id)}
                        className="text-sm text-red-600"
                      >
                        Deactivate
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

      </div>

      {showModal && (
        <Modal title="Create Menu" onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Menu name"
              className="w-full text-black border px-3 py-2 rounded"
            />
            <button
              onClick={createMenu}
              className="w-full bg-orange-600 text-white py-2 rounded"
            >
              Create Menu
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
