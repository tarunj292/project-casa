// backend/api/fetchProductforSwipe.ts

interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: {
    $numberDecimal: string;
  };
  currency: string;
  sizes: string[];
  fits: string[];
  tags: string[];
  stock: number;
  gender: string;
  brand: string;
  category: string[];
}

const fetchProducts = async (page: number = 1, limit: number = 10, excludeIds: string[] = []): Promise<Product[]> => {
  try {
    let url = `http://localhost:5002/api/products?page=${page}&limit=${limit}`;

    // Add exclude parameter if we have IDs to exclude
    if (excludeIds.length > 0) {
      url += `&exclude=${excludeIds.join(',')}`;
    }

    console.log(`📦 Fetching products page ${page} (excluding ${excludeIds.length} seen products)`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    console.log(`✅ Fetched ${data.length} new products for page ${page}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return [];
  }
};

/**
 * Fetches products filtered by gender.
 * @param {string} gender - The gender to filter by (e.g., 'male', 'female', 'unisex').
 * @returns {Promise<Product[]>} A promise that resolves to an array of products.
 */
export const fetchProductsByGender = async (gender: string): Promise<Product[]> => {
  try {
    const url = `http://localhost:5002/api/products/gender?gender=${gender}`;
    console.log(`👕 Fetching products for gender: ${gender}`);
    
    const response = await fetch(url);
    const data = await response.json(); // Read the body only ONCE

    if (!response.ok) {
      // Now you can use 'data' which contains the error details from the server
      throw new Error(data.error || `Failed to fetch products for gender: ${gender}`);
    }

    console.log(`✅ Fetched ${data.length} products for gender: ${gender}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`❌ Error fetching products for gender ${gender}:`, error);
    return [];
  }
};


export default fetchProducts;