'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import MaterialForm from '@/components/MaterialForm';
import * as XLSX from 'xlsx';
import HistoryModal from '@/components/HistoryModal';
import '@/styles/animations.css';

interface Material {
  id: string;
  name: string;
  value: number;
  unit: string;
  created_at: string;
  updated_at?: string;
}


function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;

  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();

  if (date.getFullYear() === today.getFullYear()) {
    return `${month} ${day} at ${time}`;
  } else {
    return `${month} ${day}, ${date.getFullYear()} at ${time}`;
  }
}


export default function MaterialMasterPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<null | { id: string, name: string }>(null);
  const [deleteModalMaterial, setDeleteModalMaterial] = useState<Material | null>(null);


  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setMaterials(data);
  };

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this material?');
    if (!confirm) return;

    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) {
      console.error('Delete error:', error.message);
      alert('Failed to delete material');
    } else {
      await fetchMaterials();
    }
  };

  const handleDeleteAll = async () => {
    const confirm = window.confirm('⚠️ Are you sure you want to delete ALL materials?\n\n👉 Tip: There is an ✏️ Edit button next to each material if you want to update instead.');
    if (!confirm) return;

    const { error } = await supabase.from('materials').delete().not('id', 'is', null);
    if (error) {
      console.error('Error deleting all materials:', error.message);
      alert('❌ Failed to delete all materials.');
    } else {
      alert('✅ All materials deleted successfully.');
      await fetchMaterials();
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleMaterialsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      const materials = jsonData.map((row: any) => ({
        name: row.Name || row.name,
        category: row.Category || row.category || '',
        unit: row.Unit || row.unit,
        value: parseFloat(row['Cost Per Unit'] || row.value || 0),
        vendor: row.Vendor || row.vendor || '',
      }));

      const { error } = await supabase.from('materials').insert(materials);

      if (error) {
        alert('Upload failed: ' + error.message);
      } else {
        alert('✅ Materials uploaded successfully!');
      }
    };

    reader.readAsArrayBuffer(file);
  };
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">📦 Material Master</h1>

        <div className="flex gap-3 flex-wrap">
          {/* <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm cursor-pointer transition">
            📤 Bulk Upload
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleMaterialsUpload}
              className="hidden"
            />
          </label> */}

          <button
            onClick={() => {
              setEditingMaterial(null);
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm transition"
          >
            ➕ Add Material
          </button>

          {/* <button
            onClick={() => setShowDeleteAllConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow-sm transition"
          >
            🗑 Delete All
          </button> */}
        </div>

      </div>

      <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
        {materials.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Value/Unit</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Created At</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Updated At</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((mat, index) => (
                <tr key={mat.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-gray-800">
                    {mat.name.charAt(0).toUpperCase() + mat.name.slice(1)}
                  </td>
                  <td className="px-6 py-4 text-gray-800">₹{mat.value}/{mat.unit}</td>
                  <td className="px-6 py-4 text-gray-500">{formatDateLabel(mat.created_at)}</td>
                  <td className="px-6 py-4 text-gray-500">{mat.updated_at ? formatDateLabel(mat.updated_at) : '—'}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => setSelectedMaterial({ id: mat.id, name: mat.name })} className="text-blue-600 hover:underline">
                      View History
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-600 space-x-3">
                    <button onClick={() => { setEditingMaterial(mat); setShowModal(true); }} className="text-blue-600 hover:underline text-sm">✏️ Edit</button>
                    <button
                      onClick={() => setDeleteModalMaterial(mat)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      🗑 Delete
                    </button>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center p-8 text-gray-500 text-lg">
            No materials found. Click “Add Material” to get started.
          </div>
        )}
      </div>
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">⚠️ Confirm Delete All?</h2>
            <p className="text-gray-700">
              This will permanently delete all materials and their history.<br />
              <span className="text-blue-600 font-medium">💡 Tip: Use the ✏️ Edit button if you want to update instead!</span>
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={async () => {
                  const { error: historyErr } = await supabase
                    .from('material_history')
                    .delete()
                    .not('material_id', 'is', null);

                  const { error: materialsErr } = await supabase
                    .from('materials')
                    .delete()
                    .not('id', 'is', null);

                  if (historyErr || materialsErr) {
                    console.error('Delete error:', historyErr || materialsErr);
                    alert('❌ Failed to delete all materials.');
                  } else {
                    await fetchMaterials();
                    alert('✅ All materials deleted.');
                  }

                  setShowDeleteAllConfirm(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                🗑 Yes, Delete All
              </button>

              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalMaterial && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 text-center space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold text-red-600">⚠️ Delete Material?</h2>
            <p className="text-gray-700">
              Are you sure you want to delete <strong className="text-gray-900">{deleteModalMaterial.name}</strong>?
              <br />
              You can also use <span className="text-blue-600 font-semibold">✏️ Edit</span> instead if you want to make changes.
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setEditingMaterial(deleteModalMaterial);
                  setDeleteModalMaterial(null);
                  setShowModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                ✏️ Edit
              </button>
              <button
                onClick={async () => {
                  const { error } = await supabase
                    .from('materials')
                    .delete()
                    .eq('id', deleteModalMaterial.id);

                  if (error) {
                    console.error('Delete error:', error.message);
                    alert('❌ Failed to delete material.');
                  } else {
                    await fetchMaterials();
                    alert('✅ Material deleted.');
                  }
                  setDeleteModalMaterial(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                🗑 Delete
              </button>
              <button
                onClick={() => setDeleteModalMaterial(null)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}


      {selectedMaterial && (
        <HistoryModal
          materialId={selectedMaterial.id}
          materialName={selectedMaterial.name}
          onClose={() => setSelectedMaterial(null)}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <MaterialForm
              onClose={() => setShowModal(false)}
              onAdd={fetchMaterials}
              editingMaterial={editingMaterial}
            />
          </div>
        </div>
        
      )}
    </div>
    
  );
  
}
