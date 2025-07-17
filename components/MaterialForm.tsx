'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { updateMaterialWithHistory } from '@/lib/materialService';

const units = ['pcs', 'kg', 'g', 'ton', 'mm', 'cm', 'm', 'ltr', 'ml', 'm³', 'bag', 'box', 'roll', 'sheet', 'pack'];

interface Material {
  id: string;
  name: string;
  value: number;
  unit: string;
  created_at: string;
}

interface FormProps {
  onAdd: () => void;
  onClose: () => void;
  editingMaterial?: Material | null;
}

export default function MaterialForm({ onAdd, onClose, editingMaterial }: FormProps) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState('kg');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingMaterial) {
      setName(editingMaterial.name);
      setValue(editingMaterial.value.toString());
      setUnit(editingMaterial.unit);
    }
  }, [editingMaterial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    let error;
    const lowerCaseName = name.trim().toLowerCase();

    if (editingMaterial) {
      // 📝 Update with history
      const result = await updateMaterialWithHistory(
        editingMaterial.id,
        parseFloat(value),
        unit
      );
      error = result.error;
    } else {
      // ➕ Insert new material
      const insertResult = await supabase
        .from('materials')
        .insert([{ name: lowerCaseName, value: parseFloat(value), unit }])
        .select();

      error = insertResult.error;

      if (!error && insertResult.data && insertResult.data.length > 0) {
        const newMaterial = insertResult.data[0];

        // ✅ Save initial value in history
        const historyResult = await supabase
          .from('material_history')
          .insert([
            {
              material_id: newMaterial.id,
              value: newMaterial.value,
              unit: newMaterial.unit,
            },
          ]);

        if (historyResult.error) {
          console.error('History insert error (initial):', historyResult.error);
        }
      }
    }

    setLoading(false);

    if (error) {
      console.error('Supabase error:', error.message);
      alert(`Error: ${error.message}`);
    } else {
      setName('');
      setValue('');
      setUnit('kg');
      onAdd();
      onClose();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-5">
        {editingMaterial ? '✏️ Edit Material' : '➕ Add New Material'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Material Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md"
        >
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
        <div className="flex justify-between space-x-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingMaterial ? '💾 Update' : '✅ Add'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-md disabled:opacity-50"
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
