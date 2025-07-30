const mongoose = require('mongoose');
const Category = require('../models/category');

// MongoDB connection
mongoose.connect('mongodb+srv://jaylulia20:cb28jfBC719EiUGt@cluster0.akrbkak.mongodb.net/casa_app?retryWrites=true&w=majority&appName=Cluster0');

const categoryData = require('./dummy_category_women.json');

async function insertCategories() {
  try {
    for (const item of categoryData) {
      const existing = await Category.findOne({ name: item.name });
      if (!existing) {
        await Category.create({
          name: item.name,
          image: item.image  // <-- You missed this line earlier
        });
        console.log(`✅ Inserted category: ${item.name}`);
      } else {
        console.log(`⚠️ Category already exists: ${item.name}`);
      }
    }

    console.log('🎉 All category data inserted!');
    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error inserting categories:', err);
    mongoose.disconnect();
  }
}

insertCategories();
