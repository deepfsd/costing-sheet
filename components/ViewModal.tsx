'use client';

import React from 'react';

interface ViewModalProps {
  entry: any;
  materialsData: any[];
  onClose: () => void;
}

export default function ViewModal({ entry, materialsData, onClose }: ViewModalProps) {
  const calculateMaterialCost = (mat: any) => {
    const found = materialsData.find(
      (m) => m.name.toLowerCase() === mat.name.toLowerCase()
    );
    return found ? mat.unit * found.value : null;
  };

  const totalCost = entry.materials.reduce((total: number, mat: any) => {
    const cost = calculateMaterialCost(mat);
    return total + (cost || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-xl shadow-lg space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">📦 Product Details</h2>

        {entry.imageUrl ? (
          <img
            src={entry.imageUrl}
            alt="Product"
            className="w-32 h-32 object-cover rounded"
          />
        ) : (
          <p className="text-gray-500">No image available</p>
        )}

        <div>
          <p><strong>Description:</strong> {entry.product_description}</p>
          <p><strong>Packaging:</strong> {entry.packaging}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mt-4 mb-2">Materials Used:</h3>
          <ul className="space-y-1 text-sm">
            {entry.materials.map((mat: any, i: number) => {
              const cost = calculateMaterialCost(mat);
              return (
                <li key={i} className="flex justify-between border-b pb-1">
                  <span>
                    {mat.name} × {mat.unit} {mat.inUnit || ''}
                  </span>
                  <span>{cost !== null ? `₹${cost.toFixed(2)}` : 'N/A'}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="text-lg font-semibold">
          Total Costing: <span className="text-green-700">₹{totalCost}</span>
        </p>

        <p className="text-gray-700 whitespace-pre-wrap"><strong>Comments:</strong> {entry.comments}</p>

        <div className="text-right">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
