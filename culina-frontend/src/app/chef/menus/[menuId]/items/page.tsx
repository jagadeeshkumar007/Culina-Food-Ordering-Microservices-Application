"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/Modal";
import { useApi } from "@/utils/ApiClient";
import { showToast } from "@/utils/toast";

type MenuItem = {
    id: number;
    name: string;
    description: string;
    priceCents: number;
    preparationTimeMinutes: number;
    availableQty: number;
    isAvailable: boolean;
    imageBase64?: string;
    tags?: string[];
};

export default function ChefMenuItemsPage() {
    const { menuId } = useParams();
    const { user } = useAuth();
    const api = useApi();

    const [items, setItems] = useState<MenuItem[]>([]);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [showModal, setShowModal] = useState(false);

    // edit / create state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [qty, setQty] = useState("");
    const [prep, setPrep] = useState("");
    const [tags, setTags] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, [menuId]);

    async function fetchItems() {
        const res = await api.get(
            `/chefs/menu/${menuId}/items`
        );
        if (res.ok) setItems(await res.json());
    }

    function openCreateModal() {
        resetForm();
        setEditingItem(null);
        setShowModal(true);
    }

    function openEditModal(item: MenuItem) {
        setEditingItem(item);
        setName(item.name);
        setDescription(item.description);
        setPrice(String(item.priceCents / 100));
        setQty(String(item.availableQty));
        setPrep(String(item.preparationTimeMinutes));
        setTags(item.tags?.join(", ") || "");
        setImagePreview(
            item.imageBase64
                ? `data:image/jpeg;base64,${item.imageBase64}`
                : null
        );
        setImageFile(null);
        setShowModal(true);
    }

    async function saveItem() {
        // Validation
        if (!name.trim() || !description.trim() || !price || !qty || !prep) {
            showToast("Please fill in all required fields", 'warning');
            return;
        }

        const formData = new FormData();
        formData.append("menuId", String(menuId));

        if (editingItem) {
            formData.append("menuItemId", String(editingItem.id));
        }

        formData.append("name", name.trim());
        formData.append("description", description.trim());
        formData.append("priceCents", String(Math.round(Number(price) * 100)));
        formData.append("availableQty", qty);
        formData.append("preparationTimeMinutes", prep);

        // Split tags by comma and send as individual entries
        if (tags.trim()) {
            const tagArray = tags.split(",").map(tag => tag.trim()).filter(tag => tag);
            tagArray.forEach(tag => {
                formData.append("tags", tag);
            });
        }

        // Always append image if a new file is selected
        if (imageFile) {
            console.log("Appending image file:", imageFile.name, "Size:", imageFile.size, "Type:", imageFile.type);
            formData.append("image", imageFile, imageFile.name);
        } else {
            console.log("No image file selected");
        }

        // Debug: Log all FormData entries
        console.log("FormData contents:");
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {
            const res = await api.post("/chefs/menu/createItem", formData);

            if (res.ok) {
                const savedItem = await res.json();
                console.log("Item saved successfully:", savedItem);
                resetForm();
                setEditingItem(null);
                setShowModal(false);
                fetchItems();
            } else {
                const errorText = await res.text();
                console.error("Failed to save item. Status:", res.status, "Error:", errorText);
                showToast(`Failed to save item: ${errorText}`, 'error');
            }
        } catch (error) {
            console.error("Error saving item:", error);
            showToast("Network error. Please try again.", 'error');
        }
    }

    function resetForm() {
        setName("");
        setDescription("");
        setPrice("");
        setQty("");
        setPrep("");
        setTags("");
        setImageFile(null);
        setImagePreview(null);
    }

    async function toggleAvailability(item: MenuItem) {
        await api.post(
            `/chefs/menu/item/${item.id}/availability?available=${!item.isAvailable}`,
            {}
        );
        fetchItems();
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Menu Items</h1>
                    <button
                        onClick={openCreateModal}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        + Add Item
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow">
                        <p className="text-gray-500 text-lg">No menu items yet. Add your first item!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow ${!item.isAvailable ? "opacity-60" : ""
                                    }`}
                            >
                                {/* Image Section */}
                                <div className="h-48 bg-gray-200 overflow-hidden relative">
                                    {item.imageBase64 ? (
                                        <img
                                            src={`data:image/jpeg;base64,${item.imageBase64}`}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    {!item.isAvailable && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            Unavailable
                                        </div>
                                    )}
                                </div>

                                {/* Content Section */}
                                <div className="p-5">
                                    <h3 className="font-bold text-xl text-gray-800 mb-2">{item.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                                    {/* Tags */}
                                    {item.tags && item.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {item.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                        <div className="bg-gray-50 p-2 rounded">
                                            <p className="text-gray-500 text-xs">Price</p>
                                            <p className="font-semibold text-gray-800">₹{(item.priceCents / 100).toFixed(2)}</p>
                                        </div>
                                        <div className={`p-2 rounded ${item.availableQty === 0 ? 'bg-red-50' :
                                                item.availableQty < 5 ? 'bg-yellow-50' :
                                                    'bg-gray-50'
                                            }`}>
                                            <p className="text-gray-500 text-xs">Available</p>
                                            <p className={`font-semibold ${item.availableQty === 0 ? 'text-red-800' :
                                                    item.availableQty < 5 ? 'text-yellow-800' :
                                                        'text-gray-800'
                                                }`}>
                                                {item.availableQty} units
                                                {item.availableQty === 0 && ' ⚠️'}
                                                {item.availableQty > 0 && item.availableQty < 5 && ' 🔥'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded col-span-2">
                                            <p className="text-gray-500 text-xs">Prep Time</p>
                                            <p className="font-semibold text-gray-800">{item.preparationTimeMinutes} minutes</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => toggleAvailability(item)}
                                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${item.isAvailable
                                                ? "bg-red-100 hover:bg-red-200 text-red-700"
                                                : "bg-green-100 hover:bg-green-200 text-green-700"
                                                }`}
                                        >
                                            {item.isAvailable ? "Deactivate" : "Activate"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <Modal
                    title={editingItem ? "Edit Menu Item" : "Add Menu Item"}
                    onClose={() => {
                        setShowModal(false);
                        resetForm();
                        setEditingItem(null);
                    }}
                >
                    <div className="space-y-4">
                        {/* IMAGE PREVIEW */}
                        <div className="w-full h-64 rounded-lg bg-gray-100 overflow-hidden border-2 border-dashed border-gray-300">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p>No Image Selected</p>
                                </div>
                            )}
                        </div>

                        {/* IMAGE UPLOAD */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }}
                                className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-orange-50 file:text-orange-700
                                    hover:file:bg-orange-100 cursor-pointer"
                            />
                        </div>

                        {/* NAME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Item Name *
                            </label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Butter Chicken"
                                required
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe your dish..."
                                rows={3}
                                required
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* PRICE & QTY */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₹) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="w-full border border-gray-300 px-4 py-2 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Available Qty *
                                </label>
                                <input
                                    type="number"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                    placeholder="0"
                                    required
                                    className="w-full border border-gray-300 px-4 py-2 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* PREP TIME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preparation Time (minutes) *
                            </label>
                            <input
                                type="number"
                                value={prep}
                                onChange={(e) => setPrep(e.target.value)}
                                placeholder="e.g., 30"
                                required
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* TAGS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (comma separated)
                            </label>
                            <input
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="e.g., Spicy, Vegetarian, Popular"
                                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-black focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                    setEditingItem(null);
                                }}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveItem}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                            >
                                {editingItem ? "Update Item" : "Create Item"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}