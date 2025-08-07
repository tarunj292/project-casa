const CuratedList = require("../models/curatedList");
const mongoose = require("mongoose");

// GET all curated lists
const getAllCuratedLists = async (req, res) => {
  console.log("✅ GET /api/curatedlist/ called");

  try {
    const lists = await CuratedList.find().populate("userId").populate("products");
    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET a user's curated list
const getUserCuratedList = async (req, res) => {
  try {
    console.log('📋 getUserCuratedList called for userId:', req.params.userId);

    // Convert string userId to ObjectId if needed
    let userId;
    try {
      userId = mongoose.Types.ObjectId.isValid(req.params.userId)
        ? req.params.userId
        : new mongoose.Types.ObjectId();
      console.log('🔧 Processed User ID for search:', userId);
    } catch (idError) {
      console.error('❌ Error processing user ID:', idError);
      userId = new mongoose.Types.ObjectId();
    }

    const list = await CuratedList.findOne({ userId: userId }).populate("products");
    if (!list) {
      console.log('❌ Curated list not found for user:', req.params.userId);
      return res.status(404).json({ message: "Curated list not found" });
    }
    console.log('✅ Found curated list:', list);
    res.status(200).json(list);
  } catch (err) {
    console.error('❌ Error in getUserCuratedList:', err);
    res.status(500).json({ message: err.message });
  }
};

// POST create a curated list
const createCuratedList = async (req, res) => {
  try {
    const { products, name } = req.body;

    const newList = new CuratedList({
      userId: req.user.id,
      products,
      name,
    });

    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT add product
const addProductToList = async (req, res) => {
  try {
    console.log('🔥 addProductToList called');
    console.log('📦 Request body:', req.body);
    console.log('👤 User ID:', req.user.id);

    const { productId } = req.body;
    console.log('🛍️ Product ID to add:', productId);

    // Ensure userId is a valid ObjectId
    let userId;
    try {
      userId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? req.user.id
        : new mongoose.Types.ObjectId();
      console.log('🔧 Processed User ID:', userId);
    } catch (idError) {
      console.error('❌ Error processing user ID:', idError);
      userId = new mongoose.Types.ObjectId();
    }

    const list = await CuratedList.findOneAndUpdate(
      { userId: userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    );

    console.log('✅ Successfully updated curated list:', list);
    res.status(200).json(list);
  } catch (err) {
    console.error('❌ Error in addProductToList:', err);
    console.error('❌ Full error details:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

// PUT remove product
const removeProductFromList = async (req, res) => {
  try {
    console.log('🗑️ removeProductFromList called');
    console.log('📦 Request body:', req.body);
    console.log('👤 User ID:', req.user.id);

    const { productId } = req.body;
    console.log('🛍️ Product ID to remove:', productId);

    // Ensure userId is a valid ObjectId
    let userId;
    try {
      userId = mongoose.Types.ObjectId.isValid(req.user.id)
        ? req.user.id
        : new mongoose.Types.ObjectId();
      console.log('🔧 Processed User ID:', userId);
    } catch (idError) {
      console.error('❌ Error processing user ID:', idError);
      userId = new mongoose.Types.ObjectId();
    }

    const list = await CuratedList.findOneAndUpdate(
      { userId: userId },
      { $pull: { products: productId } },
      { new: true }
    );

    console.log('✅ Successfully updated curated list:', list);
    res.status(200).json(list);
  } catch (err) {
    console.error('❌ Error in removeProductFromList:', err);
    console.error('❌ Full error details:', err.stack);
    res.status(500).json({ message: err.message });
  }
};

// DELETE entire list
const deleteCuratedList = async (req, res) => {
  try {
    await CuratedList.findOneAndDelete({ userId: req.user.id });
    res.status(200).json({ message: "Curated list deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllCuratedLists,
  getUserCuratedList,
  createCuratedList,
  addProductToList,
  removeProductFromList,
  deleteCuratedList,
};
