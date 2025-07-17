'use client';

import { useEffect, useState } from 'react';
import CostingForm from '@/components/CostingForm';
import { materialMasterData } from '@/lib/materialMaster';
import { supabase } from '@/lib/supabaseClient';
import ViewModal from '@/components/ViewModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import * as XLSX from 'xlsx';

function getPackagingCost(packaging: string, materials: any[]) {
  const packItem = materials.find(
    (mat) => mat.name.toLowerCase() === packaging.toLowerCase()
  );

  const master = materialMasterData.find(
    (mat) => mat.name.toLowerCase() === packaging.toLowerCase()
  );

  if (packItem && master) {
    return packItem.unit * master.value;
  }
  return null;
}



export default function CostingSheet() {
  const [entries, setEntries] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<any | null>(null);
  const [materialsData, setMaterialsData] = useState<any[]>([]);
  const [viewEntry, setViewEntry] = useState<any | null>(null);

  const handleSave = (entry: any, isEdit = false) => {
    if (isEdit) {
      setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
    } else {
      setEntries((prev) => [entry, ...prev]);
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase.from('materials').select('*');
      if (error) {
        console.error('Error fetching materials:', error.message);
      } else {
        setMaterialsData(data);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('costing_sheet')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        const formatted = data.map((item) => ({
          ...item,
          productDescription: item.product_description,
          imageUrl: item.image_url,
        }));
        setEntries(formatted);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmed) return;

    const { error } = await supabase.from('costing_sheet').delete().eq('id', id);
    if (error) {
      console.error('Delete failed:', error);
    } else {
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pendingEditEntry, setPendingEditEntry] = useState<any | null>(null);

  const handleDeleteConfirmed = async () => {
    if (!confirmDeleteId) return;

    const { error } = await supabase.from('costing_sheet').delete().eq('id', confirmDeleteId);
    if (error) {
      console.error('Delete failed:', error);
    } else {
      setEntries((prev) => prev.filter((entry) => entry.id !== confirmDeleteId));
    }
    setConfirmDeleteId(null);
  };


  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const parsedEntries = data.map((row: any) => {
        const materialsArray = row['Materials Used']
          .split(',')
          .map((item: string) => {
            const [name, qtyUnit] = item.trim().split(':');
            const unitMatch = qtyUnit.match(/[a-zA-Z]+/);
            const qtyMatch = qtyUnit.match(/[0-9.]+/);

            return {
              name: name.trim(),
              unit: parseFloat(qtyMatch?.[0] || '0'),
              inUnit: unitMatch?.[0] || '',
            };
          });

        return {
          product_description: row['Product Description'],
          packaging: row['Packaging'],
          comments: row['Comments'] || '',
          materials: materialsArray,
          image_url: row['Image URL'] || null,
        };
      });

      // Upload each parsed entry to Supabase
      for (const entry of parsedEntries) {
        const { error } = await supabase.from('costing_sheet').insert(entry);
        if (error) console.error('Insert error:', error);
      }

      // Refresh entries after upload
      alert('Bulk upload completed!');
      window.location.reload();
    };
    reader.readAsBinaryString(file);
  };


  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📋 Costing Sheet</h1>

        <div className="flex gap-4">
          {/* <label className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md cursor-pointer transition">
            📤 Upload in Bulk
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleBulkUpload}
              className="hidden"
            />
          </label> */}

          <button
            onClick={() => {
              setEditEntry(null);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
          >
            ➕ Add Costing
          </button>
        </div>
      </div>



      {entries.length === 0 ? (
        <p className="text-gray-500 text-center py-10">
          No costing entries yet. Click "Add Costing" to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-[100px]">Product</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-[200px]">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-[180px]">Packaging</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-[300px]">Materials Used</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-[140px]">Costing (₹)</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-[200px]">Comments</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    {entry.imageUrl ? (
                      <img
                        src={entry.imageUrl}
                        alt="Product"
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800 truncate max-w-xs">{entry.product_description}</td>
                  <td className="px-4 py-3 text-gray-800 truncate max-w-[150px]">{entry.packaging}</td>
                  <td className="px-4 py-3 text-gray-800 text-sm max-w-xs">
                    <div className="flex flex-col gap-1 max-h-28 overflow-y-auto pr-1">
                      {entry.materials.map((mat: any, i: number) => {
                        const found = materialsData.find(
                          (m) => m.name.toLowerCase() === mat.name.toLowerCase()
                        );
                        const cost = found ? mat.unit * found.value : null;
                        return (
                          <div
                            key={i}
                            className="flex justify-between items-center text-xs border-b border-gray-200 pb-1"
                          >
                            <span className="truncate max-w-[140px]">
                              {mat.name.charAt(0).toUpperCase() + mat.name.slice(1)} × {mat.unit}{' '}
                              {mat.inUnit || ''}
                            </span>
                            <span className="text-right font-medium whitespace-nowrap">
                              {cost !== null ? `₹${cost.toFixed(2)}` : 'N/A'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-800 font-semibold whitespace-nowrap">
                    ₹
                    {entry.materials.reduce((total: number, mat: any) => {
                      const found = materialsData.find(
                        (m) => m.name.toLowerCase() === mat.name.toLowerCase()
                      );
                      const cost = found ? mat.unit * found.value : 0;
                      return total + cost;
                    }, 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{entry.comments}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => setViewEntry(entry)}
                      className="text-green-600 hover:text-green-800 text-sm underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setEditEntry(entry);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(entry.id)}
                      className="text-red-600 hover:text-red-800 text-sm underline"
                    >
                      Delete
                    </button>
                    {confirmDeleteId && (
                      <DeleteConfirmModal
                        onCancel={() => setConfirmDeleteId(null)}
                        onDelete={handleDeleteConfirmed}
                        onEdit={() => {
                          const entryToEdit = entries.find((e) => e.id === confirmDeleteId);
                          if (entryToEdit) {
                            setEditEntry(entryToEdit);
                            setShowForm(true);
                          }
                          setConfirmDeleteId(null);
                        }}
                      />
                    )}

                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>


      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
                <CostingForm
                  onClose={() => {
                    setShowForm(false);
                    setEditEntry(null);
                  }}
                  onSave={handleSave}
                  initialData={editEntry}
                />
              </div>
            </div>
          </div>
        </div>
      )}



      {viewEntry && (
        <ViewModal
          entry={viewEntry}
          materialsData={materialsData}
          onClose={() => setViewEntry(null)}
        />
      )}

    </div>
  );
}


