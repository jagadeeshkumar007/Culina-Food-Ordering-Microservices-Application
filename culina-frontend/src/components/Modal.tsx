"use client";

export default function Modal({
  title,
  onClose,
  children,
  size = "md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className={`bg-white w-full ${sizeClasses[size]} max-h-[90vh] rounded-xl shadow-lg flex flex-col`}>

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        {/* BODY (SCROLLABLE) */}
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
