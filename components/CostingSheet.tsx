'use client';

import React, { useState } from 'react';

const materialMasterData = [
  { name: 'wood', value: 200 },
  { name: 'paper', value: 100 },
  { name: 'metal', value: 300 },
];

interface MaterialUsedItem {
  name: string;
  unit: number;
}

export default function CostingSheet() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productDescription, setProductDescription] = useState('');
  const [packaging, setPackaging] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState<MaterialUsedItem[]>([
    { name: '', unit: 0 },
  ]);
  const [comments, setComments] = useState('');

  const handleAddMaterial = () => {
    setMaterialsUsed([...materialsUsed, { name: '', unit: 0 }]);
  };

  const handleMaterialChange = (index: number, key: 'name' | 'unit', value: string | number) => {
    const updated = [...materialsUsed];
    // @ts-ignore
    updated[index][key] = value;
    setMaterialsUsed(updated);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setProductImage(e.target.files[0]);
    }
  };

  const calculateCosting = () => {
    let total = 0;
    materialsUsed.forEach((item) => {
      const material = materialMasterData.find((mat) => mat.name.toLowerCase() === item.name.toLowerCase());
      if (material) {
        total += item.unit * material.value;
      }
    });
    return total;
  };

  return (
    <div style={{ padding: 20, maxWidth: 700 }}>
      <h2>Costing Sheet</h2>

      {/* Product Image Upload */}
      <div style={{ marginBottom: 10 }}>
        <label>Product Photo: </label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {productImage && (
          <div style={{ marginTop: 10 }}>
            <img
              src={URL.createObjectURL(productImage)}
              alt="Preview"
              style={{ width: 150, height: 'auto', borderRadius: 6 }}
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ marginBottom: 10 }}>
        <label>Product Description: </label>
        <input
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          style={inputStyle}
          placeholder="e.g. Set of 3 Coffee Paper"
        />
      </div>

      {/* Packaging */}
      <div style={{ marginBottom: 10 }}>
        <label>Packaging: </label>
        <input
          value={packaging}
          onChange={(e) => setPackaging(e.target.value)}
          style={inputStyle}
          placeholder="e.g. Cardboard Box"
        />
      </div>

      {/* Materials Used */}
      <div style={{ marginBottom: 10 }}>
        <label>Materials Used: </label>
        {materialsUsed.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
            <input
              value={item.name}
              onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
              placeholder="Material Name"
              style={inputStyle}
            />
            <input
              type="number"
              value={item.unit}
              onChange={(e) => handleMaterialChange(index, 'unit', parseFloat(e.target.value))}
              placeholder="Unit"
              style={inputStyle}
            />
          </div>
        ))}
        <button onClick={handleAddMaterial}>+ Add Material</button>
      </div>

      {/* Costing */}
      <div style={{ marginBottom: 10 }}>
        <label>Total Costing: </label>
        <strong>₹ {calculateCosting()}</strong>
      </div>

      {/* Comments */}
      <div style={{ marginBottom: 10 }}>
        <label>Comments: </label>
        <input
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          style={inputStyle}
          placeholder="e.g. We must sell this at ₹80"
        />
      </div>

      {/* Final Output */}
      <hr />
      <h4>Final Summary</h4>
      <p><strong>Description:</strong> {productDescription}</p>
      <p><strong>Packaging:</strong> {packaging}</p>
      <p><strong>Materials:</strong></p>
      <ul>
        {materialsUsed.map((item, idx) => (
          <li key={idx}>{item.name} × {item.unit}</li>
        ))}
      </ul>
      <p><strong>Costing:</strong> ₹{calculateCosting()}</p>
      <p><strong>Comments:</strong> {comments}</p>
    </div>
  );
}

const inputStyle = {
  padding: '6px',
  borderRadius: 4,
  border: '1px solid #ccc',
  flex: 1,
};
