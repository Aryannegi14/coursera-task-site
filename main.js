// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./LandingPage";
import ProductList from "./ProductList";
import CartPage from "./CartPage";
import { CartProvider } from "./CartContext";

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

// CartContext.jsx
import React, { createContext, useState } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (plant) => {
    const existing = cart.find((item) => item.id === plant.id);
    if (existing) {
      const updated = cart.map((item) =>
        item.id === plant.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updated);
    } else {
      setCart([...cart, { ...plant, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

// Header.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "./CartContext";

export default function Header() {
  const { cart } = useContext(CartContext);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="p-4 bg-green-600 text-white flex justify-between items-center">
      <h1 className="text-xl font-bold">Plantify 🌿</h1>
      <nav className="space-x-4">
        <Link to="/products">Products</Link>
        <Link to="/cart">🛒 ({totalItems})</Link>
      </nav>
    </header>
  );
}

// LandingPage.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center text-white text-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6')" }}
    >
      <h1 className="text-4xl font-bold mb-4">Welcome to Plantify 🌿</h1>
      <p className="mb-6 max-w-lg">
        Discover beautiful houseplants to brighten up your space. Carefully selected for aesthetics and ease of care.
      </p>
      <Link to="/products">
        <button className="bg-green-500 px-6 py-2 rounded-full text-lg font-semibold hover:bg-green-700">
          Get Started
        </button>
      </Link>
    </div>
  );
}

// ProductList.jsx
import React, { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import Header from "./Header";

const plants = [
  { id: 1, name: "Snake Plant", price: 15, category: "Low Light", img: "https://via.placeholder.com/100" },
  { id: 2, name: "Fiddle Leaf Fig", price: 35, category: "Large Plants", img: "https://via.placeholder.com/100" },
  { id: 3, name: "Peace Lily", price: 20, category: "Flowering", img: "https://via.placeholder.com/100" },
  { id: 4, name: "ZZ Plant", price: 18, category: "Low Light", img: "https://via.placeholder.com/100" },
  { id: 5, name: "Aloe Vera", price: 12, category: "Succulents", img: "https://via.placeholder.com/100" },
  { id: 6, name: "Rubber Plant", price: 25, category: "Large Plants", img: "https://via.placeholder.com/100" },
];

export default function ProductList() {
  const { addToCart, cart } = useContext(CartContext);
  const [disabledButtons, setDisabledButtons] = useState([]);

  const grouped = plants.reduce((acc, plant) => {
    acc[plant.category] = acc[plant.category] || [];
    acc[plant.category].push(plant);
    return acc;
  }, {});

  const handleAdd = (plant) => {
    addToCart(plant);
    setDisabledButtons([...disabledButtons, plant.id]);
  };

  return (
    <div>
      <Header />
      <div className="p-4">
        {Object.keys(grouped).map((cat) => (
          <div key={cat} className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{cat}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {grouped[cat].map((plant) => (
                <div key={plant.id} className="border p-2 rounded shadow">
                  <img src={plant.img} alt={plant.name} className="w-full h-32 object-cover mb-2" />
                  <h3 className="text-lg font-semibold">{plant.name}</h3>
                  <p>${plant.price}</p>
                  <button
                    onClick={() => handleAdd(plant)}
                    disabled={disabledButtons.includes(plant.id)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded disabled:bg-gray-400"
                  >
                    {disabledButtons.includes(plant.id) ? "Added" : "Add to Cart"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// CartPage.jsx
import React, { useContext } from "react";
import { CartContext } from "./CartContext";
import Header from "./Header";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useContext(CartContext);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  return (
    <div>
      <Header />
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Shopping Cart</h2>
        <p>Total Items: {totalItems}</p>
        <p className="mb-4">Total Cost: ${totalCost}</p>
        {cart.map((item) => (
          <div key={item.id} className="flex items-center mb-4 border p-2 rounded">
            <img src={item.img} alt={item.name} className="w-16 h-16 mr-4" />
            <div className="flex-grow">
              <h3 className="font-bold">{item.name}</h3>
              <p>Unit Price: ${item.price}</p>
            </div>
            <div className="flex space-x-2 items-center">
              <button onClick={() => updateQuantity(item.id, -1)} className="px-2 bg-gray-300 rounded">-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, 1)} className="px-2 bg-gray-300 rounded">+</button>
              <button onClick={() => removeItem(item.id)} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
        <div className="flex gap-4 mt-4">
          <Link to="/products">
            <button className="bg-blue-500 px-4 py-2 text-white rounded">Continue Shopping</button>
          </Link>
          <button className="bg-green-600 px-4 py-2 text-white rounded">Checkout (Coming Soon)</button>
        </div>
      </div>
    </div>
  );
}
