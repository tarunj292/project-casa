const Order = require('../models/order');

// CREATE new order
const createOrder = async (req, res) => {
  try {
    const {
      user,
      products,
      address,
      estimatedDelivery,
      paymentStatus,
      totalAmount
    } = req.body;

    if (!user || !products || products.length === 0 || !address || !estimatedDelivery || !paymentStatus) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const newProductsEntry = products.map(product => ({
      product: product.product._id,
      name: product.product.name,
      price: parseFloat(product.priceAtAdd?.['$numberDecimal'] || product.product.price?.['$numberDecimal']),
      quantity: product.quantity || 1,
      size: product.size
    }))
    console.log(newProductsEntry)

    for (const item of newProductsEntry) {
      if (!item.product || !item.name || !item.price || !item.size) {
        return res.status(400).json({ error: 'Each product must include product ID, name, price, and size' });
      }
      item.quantity = item.quantity || 1;
    }

    // no need we already have it in frontend
    // const totalAmount = products.reduce((sum, item) => {
    //   console.log(item)
    //   return sum + item.priceAtAdd.$numberDecimal * item.quantity;
    // }, 0);

    const newOrder = new Order({
      user,
      products: newProductsEntry,
      address,
      estimatedDelivery,
      paymentStatus,
      totalAmount
    });

    const saved = await newOrder.save();
    res.status(201).json({success: true, saved});
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order', detail: err.message });
  }
};

// GET all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'display_name email phone')
      .populate('products.product', 'name price images');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'display_name email phone')
      .populate('products.product', 'name price images');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE order status (delivery or payment)
const updateOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE order
const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder
};
