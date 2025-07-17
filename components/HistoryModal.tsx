'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  materialId: string;
  materialName: string;
  onClose: () => void;
}

interface HistoryEntry {
  id: string;
  value: number;
  unit: string;
  created_at: string;
}

export default function HistoryModal({ materialId, materialName, onClose }: Props) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from('material_history')
        .select('*')
        .eq('material_id', materialId)
        .order('created_at', { ascending: false });

      if (error) console.error('Fetch history error:', error);
      else setHistory(data || []);

      setLoading(false);
    }

    fetchHistory();
  }, [materialId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">History - {materialName}</h2>

        {loading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p>No history available.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th>Date & Time</th>
                <th>Value</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b">
                  <td className="py-1">
                    {new Date(entry.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-1">{entry.value}</td>
                  <td className="py-1">{entry.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-right mt-4">
          <button onClick={onClose} className="px-4 py-1 bg-gray-200 rounded hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
