// components/DeleteConfirmModal.tsx
'use client';
import { XCircle } from 'lucide-react';

export default function DeleteConfirmModal({
  onCancel,
  onDelete,
  onEdit,
}: {
  onCancel: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full relative">
        <XCircle className="text-red-600 w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-center text-red-700 mb-2">
          Are you sure you want to delete this?
        </h2>
        <p className="text-gray-600 text-center mb-4">
          ⚠️ This action cannot be undone. You can also <strong>edit</strong> instead if needed.
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold"
          >
            Yes, Delete
          </button>
          <button
            onClick={onEdit}
            className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 font-semibold"
          >
            Edit Instead
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
