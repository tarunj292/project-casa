// backend/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const mongoose = require('mongoose');

const Product = require('../models/product');
const Brand = require('../models/brand');
const Category = require('../models/category');

const {
    getAllProducts,
    getProductById,
    getProductByCategory,
    getAllProductsByBrand,
    getAllProductsByPrice,
    getProductsByGender,
    getProductsByTag,
    search,
    createProduct,
    deleteProduct,
    updateProduct
} = require('../controllers/productController');

const upload = multer({ dest: 'uploads/' });

router.post('/import', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        const filePath = req.file.path;
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const headers = jsonData[0].map(h => h.trim().toLowerCase());
        const dataRows = jsonData.slice(1);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const row of dataRows) {
            if (row.length < headers.length) {
                continue;
            }

            const getColumnData = (header) => {
                const index = headers.indexOf(header);
                return index !== -1 ? row[index] : undefined;
            };

            const name = getColumnData('name');
            const description = getColumnData('description') || '';
            const price = parseFloat(getColumnData('price'));
            const categoryName = getColumnData('category');
            const images = getColumnData('images') ? String(getColumnData('images')).split(',').map(s => s.trim()) : [];
            const tags = getColumnData('tags') ? String(getColumnData('tags')).split(',').map(s => s.trim()) : [];
            const sizes = getColumnData('sizes') ? String(getColumnData('sizes')).split(',').map(s => s.trim()) : [];
            const fits = getColumnData('fits') ? String(getColumnData('fits')).split(',').map(s => s.trim()) : [];
            const stock = parseInt(getColumnData('stock'), 10);
            const geo_tags = getColumnData('geo_tags') ? String(getColumnData('geo_tags')).split(',').map(s => s.trim()) : [];
            let gender = getColumnData('gender');
            const brandName = getColumnData('brand');
            const brandNameTrimmed = brandName ? brandName.trim() : '';
            const brandIdFromExcel = getColumnData('brandid');
            
            const duplicateHeaders = headers.filter((item, index) => headers.indexOf(item) !== index);
            if (duplicateHeaders.length > 0) {
                console.warn(`Warning: Duplicate headers found in the Excel file: ${duplicateHeaders.join(', ')}. The first occurrence will be used.`);
            }

            if (!name || isNaN(price) || !categoryName || isNaN(stock) || !brandNameTrimmed) {
                errorCount++;
                errors.push(`Row with missing or invalid required data (name, price, category, stock, or brand): ${JSON.stringify(row)}`);
                continue;
            }

            try {
                let categoryDoc = await Category.findOne({ name: categoryName });
                if (!categoryDoc) {
                    categoryDoc = new Category({ name: categoryName, image: 'https://via.placeholder.com/150' });
                    await categoryDoc.save();
                }

                let brandDoc = null;
                if (brandIdFromExcel) {
                    brandDoc = await Brand.findById(brandIdFromExcel);
                } else if (brandNameTrimmed) {
                    brandDoc = await Brand.findOne({ name: brandNameTrimmed });
                }

                if (!brandDoc) {
                    const uniqueEmail = `placeholder-${Date.now()}-${Math.random().toString(36).substring(2, 8)}@example.com`;
                    brandDoc = new Brand({
                        name: brandNameTrimmed,
                        logo_url: 'https://via.placeholder.com/150',
                        email: uniqueEmail,
                        password: 'placeholder-password'
                    });
                    await brandDoc.save();
                }

                const existingProduct = await Product.findOne({ name: name, brand: brandDoc._id });
                if (existingProduct) {
                    errorCount++;
                    errors.push(`Duplicate product found for row: ${JSON.stringify(row)}. Skipping.`);
                    continue;
                }

                // Correctly handle the gender field
                if (gender) {
                    // Capitalize the first letter if the field is not empty
                    gender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
                } else {
                    // Set a default value if the field is empty
                    gender = 'Unisex';
                }

                const newProduct = new Product({
                    name,
                    description,
                    price,
                    images,
                    tags,
                    sizes,
                    fits,
                    stock,
                    is_active: true,
                    geo_tags,
                    gender,
                    brand: brandDoc._id,
                    category: [categoryDoc._id]
                });
                await newProduct.save();
                successCount++;
            } catch (dbError) {
                console.error('Database error for row:', row, 'Error:', dbError.message);
                errorCount++;
                errors.push(`Database error for row ${JSON.stringify(row)}: ${dbError.message}`);
            }
        }

        fs.unlinkSync(filePath);

        if (errorCount > 0) {
            return res.status(200).json({
                message: `Import completed with errors. Successfully imported ${successCount} products. ${errorCount} products failed.`,
                errors: errors,
            });
        }

        res.status(200).json({ message: `Successfully imported ${successCount} products.` });

    } catch (error) {
        console.error('Import process error:', error);
        res.status(500).json({ message: 'Internal server error during import. Check file format.' });
    }
});

router.get('/brand/:id', async (req, res, next) => {
  console.log(`Attempting to fetch products for brand ID: ${req.params.id}`);if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
console.error(`Invalid brand ID format: ${req.params.id}`);
 return res.status(400).json({ message: 'Invalid Brand ID' });
    }
    next();
}, getAllProductsByBrand);

// ... (rest of your existing routes) ...
router.post('/create', createProduct);
router.get('/', getAllProducts);
router.get('/id/:id', getProductById);
router.get('/category', getProductByCategory);
router.get('/price', getAllProductsByPrice);
router.get('/gender', getProductsByGender);
router.get('/tag', getProductsByTag);
router.post('/search', search);
router.put('/update/:id', updateProduct);
router.delete('/id/:id', deleteProduct);

module.exports = router;