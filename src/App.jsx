import React, { useState } from "react";
import "./App.css";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

  const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

  // INPUT
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ADD DATA
  const handleAddData = () => {
    if (!formData.product || !formData.amount || !formData.date) return;

    const newEntry = {
      ...formData,
      product: formData.product.toLowerCase(),
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

  // CSV UPLOAD
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data.map((item) => ({
          customerId: item.customerId || "",
          product: item.product.toLowerCase(),
          amount: Number(item.amount),
          date: item.date,
        }));

        setSalesData(parsed);
      },
    });
  };

  // SEARCH
  const filteredData = salesData.filter((item) =>
    item.product.includes(searchTerm.toLowerCase())
  );

  // GROUP BY PRODUCT
  const groupedData = Object.values(
    salesData.reduce((acc, item) => {
      if (!acc[item.product]) {
        acc[item.product] = { product: item.product, total: 0 };
      }
      acc[item.product].total += item.amount;
      return acc;
    }, {})
  );

  // GROUP BY DATE (FIXED)
  const trendData = Object.values(
    salesData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = { date: item.date, total: 0 };
      }
      acc[item.date].total += item.amount;
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.date) - new Date(b.date)); // 🔥 IMPORTANT FIX

  // STATS
  const totalRevenue = salesData.reduce((sum, i) => sum + i.amount, 0);
  const totalOrders = salesData.length;
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

  const topProduct =
    groupedData.length > 0
      ? groupedData.reduce((a, b) => (a.total > b.total ? a : b)).product
      : "-";

  const prediction =
    trendData.length > 0
      ? Math.round(
          trendData.reduce((sum, i) => sum + i.total, 0) / trendData.length
        )
      : 0;

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* STATS */}
      <div className="stats">
        <div className="card">₹{totalRevenue}<br />Total Revenue</div>
        <div className="card">{totalOrders}<br />Orders</div>
        <div className="card">₹{avgOrder.toFixed(2)}<br />Avg Order</div>
      </div>

      <div className="top-product">
        🏆 Top Selling Product:{" "}
        {topProduct !== "-"
          ? topProduct.charAt(0).toUpperCase() + topProduct.slice(1)
          : "-"}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {searchTerm && (
        <div className="search-results">
          {filteredData.map((item, i) => (
            <div key={i}>
              {item.product} - ₹{item.amount}
            </div>
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

        {/* CSV UPLOAD (KEEPED) */}
        <input type="file" accept=".csv" onChange={handleCSVUpload} />
      </div>

      {/* AI */}
      <div className="prediction">
        🤖 Predicted Next Sale: ₹{prediction}
      </div>

      {/* BAR CHART (FIXED COLORS) */}
      <h3>Sales by Product</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total">
            {groupedData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* LINE CHART (FIXED) */}
      <h3>Sales Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#4a7dfc"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;