import React, { useState } from "react";
import "./App.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

function App() {
  const [salesData, setSalesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    product: "",
    amount: "",
    date: "",
  });

  // 🎨 Colors for products
  const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddData = () => {
    if (!formData.product || !formData.amount || !formData.date) return;

    const newEntry = {
      ...formData,
      product: formData.product.trim().toLowerCase(),
      amount: Number(formData.amount),
    };

    setSalesData([...salesData, newEntry]);

    setFormData({
      customerId: "",
      product: "",
      amount: "",
      date: "",
    });
  };

  // 🔍 SEARCH
  const filteredData = salesData.filter((item) =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📊 GROUP BY PRODUCT
  const groupedData = salesData.reduce((acc, item) => {
    const key = item.product;
    if (!acc[key]) acc[key] = 0;
    acc[key] += item.amount;
    return acc;
  }, {});

  const chartData = Object.keys(groupedData).map((key) => ({
    product: key,
    amount: groupedData[key],
  }));

  // 📈 GROUP BY DATE (FIXED TREND)
  const trendData = salesData.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = 0;
    acc[item.date] += item.amount;
    return acc;
  }, {});

  const trendChartData = Object.keys(trendData).map((date) => ({
    date,
    amount: trendData[date],
  }));

  // 📊 STATS
  const totalRevenue = salesData.reduce((sum, i) => sum + i.amount, 0);
  const totalOrders = salesData.length;
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

  const topProduct =
    chartData.length > 0
      ? chartData.reduce((a, b) => (a.amount > b.amount ? a : b)).product
      : "-";

  // 🤖 Simple AI Prediction
  const predictedSale = avgOrder * 1.1;

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* STATS */}
      <div className="stats">
        <div className="card">₹{totalRevenue} <span>Total Revenue</span></div>
        <div className="card">{totalOrders} <span>Orders</span></div>
        <div className="card">₹{avgOrder.toFixed(2)} <span>Avg Order</span></div>
      </div>

      <div className="top-product">
        🏆 Top Selling Product:{" "}
        {topProduct.charAt(0).toUpperCase() + topProduct.slice(1)}
      </div>

      {/* SEARCH */}
      <input
        className="search"
        placeholder="Search product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* SEARCH RESULTS */}
      {searchTerm && (
        <div className="results">
          <h3>Search Results</h3>
          {filteredData.map((item, i) => (
            <p key={i}>
              {item.product.toUpperCase()} - ₹{item.amount}
            </p>
          ))}
        </div>
      )}

      {/* FORM */}
      <div className="form">
        <h3>Add Data</h3>
        <input name="customerId" placeholder="Customer ID" value={formData.customerId} onChange={handleChange} />
        <input name="product" placeholder="Product" value={formData.product} onChange={handleChange} />
        <input name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} />
        <input type="date" name="date" value={formData.date} onChange={handleChange} />
        <button onClick={handleAddData}>Add Data</button>
      </div>

      {/* AI */}
      <div className="prediction">
        🤖 Predicted Next Sale: ₹{predictedSale.toFixed(0)}
      </div>

      {/* BAR CHART */}
      <h3>Sales by Product</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="amount">
            {chartData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* LINE CHART */}
      <h3>Sales Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#2196F3" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;