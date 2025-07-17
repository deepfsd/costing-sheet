'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const units = [
  'pcs', 'kg', 'g', 'ton',
  'mm', 'cm', 'm',
  'ltr', 'ml', 'm³',
  'bag', 'box', 'roll',
  'sheet', 'pack'
];

type Material = {
  name: string;
  unit: number;
  inUnit: string;
};

interface Props {
  onClose: () => void;
  onSave: (entry: any, isEdit?: boolean) => void;
  initialData?: any;
}

export default function CostingForm({ onClose, onSave, initialData }: Props) {
  const [productDescription, setProductDescription] = useState('');
  const [packaging, setPackaging] = useState('');
  const [materials, setMaterials] = useState<Material[]>([{ name: '', unit: 0, inUnit: '' }]);
  const [comments, setComments] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [materialSuggestions, setMaterialSuggestions] = useState<string[]>([]);
  const [allMaterialNames, setAllMaterialNames] = useState<string[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [nameToUnitMap, setNameToUnitMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setProductDescription(initialData.productDescription || '');
      setPackaging(initialData.packaging || '');
      setMaterials(initialData.materials || [{ name: '', unit: 0, inUnit: '' }]);
      setComments(initialData.comments || '');
      setImageUrl(initialData.imageUrl || null);
    }
  }, [initialData]);

  const handleImageUpload = async (file: File) => {
    setUploading(true);

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `uploads/${fileName}`; // optional subfolder inside the bucket

    const { data, error } = await supabase.storage
      .from('product-images') // ✅ your actual bucket
      .upload(filePath, file);

    if (error) {
      alert('❌ Upload failed: ' + error.message);
    } else {
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      setImageUrl(urlData.publicUrl);
      alert('✅ Image uploaded successfully!');
    }

    setUploading(false);
  };

  const handleSubmit = async () => {
    const newEntry = {
      product_description: productDescription,
      packaging,
      materials,
      comments,
      image_url: imageUrl,
    };

    if (initialData?.id) {
      const { error } = await supabase
        .from('costing_sheet')
        .update(newEntry)
        .eq('id', initialData.id);

      if (!error) {
        onSave({ ...initialData, ...newEntry }, true);
        onClose();
      } else {
        alert('Update failed');
      }
    } else {
      const { data, error } = await supabase
        .from('costing_sheet')
        .insert([newEntry])
        .select()
        .single();

      if (!error) {
        onSave({ ...data, productDescription, imageUrl }, false);
        onClose();
      } else {
        alert('Save failed');
      }
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase.from('materials').select('name, unit');
      if (!error && data) {
        const names = data.map((mat) => mat.name.toLowerCase());
        setAllMaterialNames(names);

        const nameUnitMap: Record<string, string> = {};
        data.forEach((mat) => {
          nameUnitMap[mat.name.toLowerCase()] = mat.unit;
        });
        setNameToUnitMap(nameUnitMap);
      }
    };
    fetchMaterials();
  }, []);

  const handleMaterialChange = (
    index: number,
    field: keyof Material,
    value: string | number
  ) => {
    const updated = [...materials];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setMaterials(updated);

    if (field === 'name' && typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();

      if (trimmed === '') {
        setMaterialSuggestions([]);
        setFocusedIndex(null);
        return;
      }

      const filtered = allMaterialNames.filter((name) =>
        name.includes(trimmed)
      );
      setMaterialSuggestions(filtered.length > 0 ? filtered : ['Not Found']);
      setFocusedIndex(index);

      // ✅ Auto-select unit if name matches exactly
      if (nameToUnitMap[trimmed]) {
        updated[index].inUnit = nameToUnitMap[trimmed];
        setMaterials([...updated]);
      }
    }
  };



  const handleRemoveMaterial = (index: number) => {
    const updated = [...materials];
    updated.splice(index, 1);
    setMaterials(updated);
  };

  return (
    <div className="space-y-6 text-sm sm:text-base">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">{initialData ? 'Edit' : 'Add'} Costing</h2>

      {/* Product Description */}
      <div>
        <label className="block font-medium mb-1">📦 Product Description</label>
        <input
          type="text"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Packaging */}
      <div>
        <label className="block font-medium mb-1">📦 Packaging</label>
        <input
          type="text"
          value={packaging}
          onChange={(e) => setPackaging(e.target.value)}
          className="w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Materials */}
      <div>
        <label className="block font-medium mb-1">🧱 Materials Used</label>
        <div className="bg-gray-50 p-3 rounded border border-gray-300 relative z-0">
          {materials.map((mat, index) => (
            <div key={index} className="relative flex flex-wrap gap-2 mt-2 items-center">
              <div className="w-full sm:w-1/3 relative">
                <input
                  type="text"
                  placeholder="Material name"
                  value={mat.name}
                  onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded-md shadow-sm"
                />
                {materialSuggestions.length > 0 && focusedIndex === index && (
                  <ul className="absolute z-10 mt-1 bg-white border border-gray-300 rounded shadow-sm w-full max-h-40 overflow-y-auto">
                    {materialSuggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          if (suggestion !== 'Not Found') {
                            handleMaterialChange(index, 'name', suggestion);
                          }
                          setMaterialSuggestions([]);
                          setFocusedIndex(null);
                        }}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${suggestion === 'Not Found' ? 'text-gray-400 italic cursor-default' : ''}`}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input
                type="number"
                placeholder="Unit"
                value={mat.unit}
                onChange={(e) => handleMaterialChange(index, 'unit', Number(e.target.value))}
                className="w-20 p-2 border rounded-md shadow-sm"
              />

              <select
                value={mat.inUnit}
                onChange={(e) => handleMaterialChange(index, 'inUnit', e.target.value)}
                className="w-24 p-2 border rounded-md shadow-sm"
              >
                <option value="">Select</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>

              {materials.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(index)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setMaterials([...materials, { name: '', unit: 0, inUnit: '' }])}
          className="mt-2 text-blue-600 hover:underline text-sm"
        >
          ➕ Add another
        </button>
      </div>

      {/* Comments */}
      <div>
        <label className="block font-medium mb-1">📝 Comments</label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full p-2 border rounded-md shadow-sm"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block font-medium mb-1">🖼️ Image</label>
        {imageUrl ? (
          <div
            className="relative w-32 h-32 mb-2 cursor-pointer group"
            onClick={() => setImageUrl(null)}
          >
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-md border"
            />
            <span className="absolute inset-0 flex items-center justify-center text-white bg-black/60 opacity-0 group-hover:opacity-100 transition text-sm font-medium">
              Click to remove
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
              >
                Choose Image
              </label>
              <span className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'No file chosen'}
              </span>
            </div>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
              className="hidden"
            />
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}
