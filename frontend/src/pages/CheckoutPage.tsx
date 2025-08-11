import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Truck, CheckCircle, Minus, Plus } from "lucide-react";
import axios from "axios";
import { CartData, useCart } from "../contexts/CartContext";
import { useUser } from "../contexts/UserContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

/* ---------------- Types ---------------- */
interface Product {
  id: string;
  name: string;
  brand: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image?: string;
  images?: string[];
  selectedSize: string;
  quantity: number;
}

interface Address {
  id: string;        // backend _id of the shipment subdoc
  name: string;      // label for UI (Home/Office/Address 1)
  address: string;   // pretty one-line
  phone: string;
  isDefault?: boolean;
}

interface PaymentMethod {
  id: number;
  type: string;
  name: string;
  icon: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, updateQuantity } = useCart();
  const { userData } = useUser();
  const { product, bagItems, total, directBuy } = location.state || {};

  /* ---------------- Cart → Products ---------------- */
  const fallbackBagItems = cart?.items || [];
  const fallbackTotal = fallbackBagItems.reduce((sum, item) => {
    const price = parseFloat(item.product.price.$numberDecimal);
    return sum + price * (item.quantity || 1);
  }, 0);

  const mappedCartItems: Product[] = fallbackBagItems.map((item) => ({
    id: item.product._id,
    name: item.product.name,
    brand: typeof item.product.brand === "string" ? item.product.brand : item.product.brand.name,
    price: `₹${parseFloat(item.product.price.$numberDecimal).toFixed(2)}`,
    images: item.product.images,
    selectedSize: item.size,
    quantity: item.quantity,
  }));

  const orderItems: Product[] = directBuy && product ? [product] : bagItems ? bagItems : mappedCartItems;

  const orderTotal: number = useMemo(
    () =>
      total ||
      (product ? parseInt(product.price.replace("₹", "").replace(",", "")) : fallbackTotal),
    [total, product, fallbackTotal]
  );

  /* ---------------- Address state ---------------- */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState<string | null>(null);

  /* ---------------- Payment state ---------------- */
  const [selectedPayment, setSelectedPayment] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods: PaymentMethod[] = [
    { id: 1, type: "Razorpay", name: "Pay with Razorpay", icon: "💳" },
  ];

  /* ---------------- Utils: resolve userId ---------------- */
  const resolveUserId = async (): Promise<string | null> => {
    if (userData?._id) return String(userData._id);

    const keys = ["userData", "user", "currentUser"];
    for (const k of keys) {
      const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        const id = obj?._id || obj?.id || obj?.user?._id || obj?.user?.id;
        if (id) return String(id);
      } catch {}
    }
    const direct = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (direct) return String(direct);

    const phone =
      userData?.phoneNumber ||
      localStorage.getItem("phone") ||
      sessionStorage.getItem("phone");
    if (phone) {
      try {
        const res = await axios.get(`${API_BASE}/users`, {
          params: { phone },
          withCredentials: false,
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          return String(res.data[0]._id);
        }
      } catch (e) {
        console.warn("User lookup by phone failed:", e);
      }
    }
    return null;
  };

  /* ---------------- Fetch addresses from backend ---------------- */
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setAddrLoading(true);
        setAddrError(null);

        const userId = await resolveUserId();
        if (!userId) throw new Error("User not found. Please log in again.");

        const res = await axios.get(`${API_BASE}/users/${userId}/shipment`, {
          withCredentials: false, // avoid CORS wildcard + credentials clash
        });

        // Expecting array of shipment subdocs or { shipment: [...] }
        const list = Array.isArray(res.data) ? res.data : res.data?.shipment || [];

        const mapped: Address[] = list.map((s: any, idx: number) => {
          const line1 = (s.billing_address || "").trim();
          const line2 = (s.billing_address_2 || "").trim();
          const cityState = [s.billing_city, s.billing_state].filter(Boolean).join(", ");
          const pin = s.billing_pincode ? ` - ${s.billing_pincode}` : "";
          const country = s.billing_country ? `, ${s.billing_country}` : "";
          return {
            id: s._id || String(idx),
            name: s.isDefault ? "Home" : `Address ${idx + 1}`,
            address: [line1, line2, cityState + pin + country].filter(Boolean).join(", "),
            phone: s.billing_phone || "",
            isDefault: !!s.isDefault,
          };
        });

        if (!mounted) return;

        setAddresses(mapped);
        const defIndex = mapped.findIndex((a) => a.isDefault);
        setSelectedAddress(defIndex >= 0 ? defIndex : 0);
      } catch (err: any) {
        if (!mounted) return;
        console.error("Failed to fetch addresses:", err);
        setAddrError(err?.message || "Could not fetch addresses.");
        setAddresses([]);
      } finally {
        if (mounted) setAddrLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // re-run if user id in context changes
  }, [userData?._id]);

  /* ---------------- Quantity handlers ---------------- */
  const handleQuantity = async (productId: string, size: string, change: number) => {
    try {
      const currentItem = orderItems.find(
        (item) => item.id === productId && item.selectedSize === size
      );
      if (currentItem) {
        const newQuantity = Math.max(0, (currentItem.quantity || 0) + change);
        await updateQuantity(productId, size, newQuantity);
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  /* ---------------- Order creation ---------------- */
  const createOrder = async (
    cartData: CartData,
    deliveryAddress: string,
    paymentStatus: string,
    paymentId?: string
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE}/orders/create`,
        {
          user: userData?._id,
          products: cartData.items,
          address: deliveryAddress,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          paymentStatus,
          deliveryStatus: "pending",
          totalAmount: orderTotal,
          paymentId,
        },
        { withCredentials: false }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating order:", error.response?.data || error.message);
      return { success: false };
    }
  };

  const deleteCart = async () => {
    try {
      const response = await axios.delete(`${API_BASE}/cart/delete`, {
        data: { phone: userData?.phoneNumber },
        withCredentials: false,
      });
      console.log("Cart deleted:", response.data);
    } catch (error: any) {
      console.error("Error deleting cart:", error.response?.data || error.message);
    }
  };

  /* ---------------- Payment ---------------- */
  const handleRazorpayPayment = async () => {
    try {
      if (!addresses.length) {
        alert("Please add a delivery address first.");
        return;
      }
      const selected = addresses[selectedAddress];

      const paymentOrderResponse = await axios.post(
        `${API_BASE}/payments/create-order`,
        { amount: orderTotal, currency: "INR", receipt: "order_" + Date.now() },
        { withCredentials: false }
      );

      if (!paymentOrderResponse.data.success) {
        throw new Error("Failed to create payment order");
      }

      const { order } = paymentOrderResponse.data;

      const options = {
        key: "rzp_live_NSJ391QbwVovIS", // LIVE KEY
        amount: order.amount,
        currency: order.currency,
        name: "CASA",
        description: "Payment for your order",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await axios.post(
              `${API_BASE}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: false }
            );

            if (verifyResponse.data.success) {
              const orderResponse = await createOrder(
                cart,
                selected.address,
                "Paid",
                response.razorpay_payment_id
              );
              if (orderResponse.success) {
                await deleteCart();
                setIsProcessing(false);
                navigate("/order-success", {
                  state: {
                    orderId: "ORD" + Date.now(),
                    items: orderItems,
                    total: orderTotal,
                    address: selected,
                    paymentId: response.razorpay_payment_id,
                  },
                });
              }
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setIsProcessing(false);
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: userData?.name || "",
          email: userData?.email || "",
          contact: userData?.phoneNumber || "",
        },
        theme: { color: "#10B981" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      setIsProcessing(false);
      alert("Failed to initialize payment. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    try {
      await handleRazorpayPayment();
    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessing(false);
      alert("Payment failed. Please try again.");
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="relative max-w-md mx-auto min-h-screen bg-gray-900 text-white overflow-x-hidden">
      <div className="pb-24">
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft size={24} className="text-white hover:text-blue-400 transition-colors" />
            </button>
            <h1 className="text-xl font-bold">Checkout</h1>
          </div>
        </div>

        <div className="px-4 py-6 space-y-6">
          {/* Address */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <MapPin size={20} className="text-blue-400" />
              <span>Delivery Address</span>
            </h2>

            {addrLoading ? (
              <div className="space-y-3">
                <div className="h-20 rounded-lg bg-gray-800 animate-pulse" />
                <div className="h-20 rounded-lg bg-gray-800 animate-pulse" />
              </div>
            ) : addresses.length ? (
              <div className="space-y-3">
                {addresses.map((address, index) => (
                  <button
                    key={address.id}
                    onClick={() => setSelectedAddress(index)}
                    className={`w-full p-4 rounded-lg border text-left transition-colors ${
                      selectedAddress === index
                        ? "border-blue-500 bg-blue-500 bg-opacity-10"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-white">
                          {address.name} {address.isDefault ? "(Default)" : ""}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">{address.address}</p>
                        <p className="text-sm text-gray-400">{address.phone}</p>
                      </div>
                      {selectedAddress === index && (
                        <CheckCircle size={20} className="text-blue-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => navigate("/location")}
                  className="w-full p-3 rounded-lg border border-dashed border-gray-700 text-gray-300 hover:border-gray-500"
                >
                  + Add new address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addrError && (
                  <p className="text-sm text-red-400">Could not load addresses: {addrError}</p>
                )}
                <button
                  onClick={() => navigate("/location")}
                  className="w-full p-3 rounded-lg border border-dashed border-gray-700 text-gray-300 hover:border-gray-500"
                >
                  + Add your first address
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              {orderItems.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={
                      item.image ||
                      (item.images && item.images[0]) ||
                      "https://placehold.co/100x100/1f2937/ffffff?text=Item"
                    }
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/100x100/1f2937/ffffff?text=Error";
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.brand}</h3>
                    <p className="text-xs text-gray-400">{item.name}</p>
                    {item.selectedSize && (
                      <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.price}</p>
                    {item.quantity && item.quantity > 1 && (
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleQuantity(item.id, item.selectedSize, -1);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-white">{item.quantity}</span>
                  <button
                    onClick={() => {
                      handleQuantity(item.id, item.selectedSize, 1);
                    }}
                    className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{orderTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <CreditCard size={20} className="text-green-400" />
              <span>Payment Method</span>
            </h2>
            <div className="space-y-3">
              {paymentMethods.map((method, index) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(index)}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedPayment === index
                      ? "border-green-500 bg-green-500 bg-opacity-10"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <h3 className="font-medium text-white">{method.type}</h3>
                        <p className="text-sm text-gray-400">{method.name}</p>
                      </div>
                    </div>
                    {selectedPayment === index && (
                      <CheckCircle size={20} className="text-green-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Truck size={16} className="text-blue-400" />
              <span className="text-sm font-medium">Delivery Information</span>
            </div>
            <p className="text-xs text-gray-400">
              Expected delivery in 2-3 business days. Free delivery on orders above ₹1,500.
            </p>
          </div>
        </div>
      </div>

      {/* Place Order */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing || addrLoading || addresses.length === 0}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : `Pay with Razorpay - ₹${orderTotal}`}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
