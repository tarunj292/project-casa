const express = require("express");
const { verifyToken } = require("../util/verifyToken");
const {
  getAllCuratedLists,
  getUserCuratedList,
  createCuratedList,
  addProductToList,
  removeProductFromList,
  deleteCuratedList,
} = require("../controllers/curatedListController");

const router = express.Router();

router.get("/", getAllCuratedLists); // Admin use
router.get("/:userId", getUserCuratedList); // Public user list
router.post("/", verifyToken, createCuratedList);
router.put("/add", verifyToken, addProductToList);
router.put("/remove", verifyToken, removeProductFromList);
router.delete("/", verifyToken, deleteCuratedList);

module.exports = router;
