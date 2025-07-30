// src/pages/AllBrandsPage.tsx
import React, { useEffect, useState } from "react";

interface Brand {
  _id: string;
  name: string;
  logo_url?: string;
  is_active: boolean;
  created_at?: string;
}

const AllBrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5002/api/brands")
      .then((res) => res.json())
      .then((data) => {
        setBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching brands:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading brands...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">All Brands</h1>
      {brands.length === 0 ? (
        <p>No brands found</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {brands.map((brand) => (
            <div key={brand._id} className="bg-gray-800 p-4 rounded-lg">
              <h2 className="text-lg font-semibold">{brand.name}</h2>
              {brand.logo_url && (
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="mt-2 w-24 h-24 object-contain"
                />
              )}
              <p className="mt-2 text-sm">
                Status: {brand.is_active ? "✅ Active" : "❌ Inactive"}
              </p>
              {brand.created_at && (
                <p className="text-xs text-gray-400">
                  Created: {new Date(brand.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBrandsPage;
