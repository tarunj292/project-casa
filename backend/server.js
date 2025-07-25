const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()
const productRoutes = require('./routes/productRoutes')


const app = express()

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`🚀Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
app.use('/api/products', productRoutes);
app.get("/", (req, res) => {
  res.send("API is running");
});