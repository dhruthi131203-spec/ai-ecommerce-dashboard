import React, { useState } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";
import "./App.css";

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  const [form, setForm] = useState({
    customer_id: "",
    product: "",
    amount: "",
    date: ""
  });

  // CSV Upload
  const handleCSV = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const formatted = result.data.map(d => ({
          ...d,
          product: d.product.toLowerCase(),
          amount: Number(d.amount)
        }));
        setData(formatted);
      }
    });
  };

  // Search (FIXED)
  const handleSearch = (value) => {
    setSearch(value);

    const results = data.filter(item =>
      item.product.toLowerCase().includes(value.toLowerCase())
    );

    setFiltered(results);
  };

  // Add Data
  const handleAdd = () => {
    if (!form.product || !form.amount) return;

    setData([
      ...data,
      {
        ...form,
        product: form.product.toLowerCase(),
        amount: Number(form.amount)
      }
    ]);

    setForm({ customer_id: "", product: "", amount: "", date: "" });
  };

  // METRICS
  const totalRevenue = data.reduce((a, b) => a + b.amount, 0);
  const orders = data.length;
  const avgOrder = orders ? (totalRevenue / orders).toFixed(2) : 0;

  // TOP PRODUCT
  const productMap = {};
  data.forEach(d => {
    productMap[d.product] = (productMap[d.product] || 0) + d.amount;
  });

  const topProduct = Object.keys(productMap).reduce((a, b) =>
    productMap[a] > productMap[b] ? a : b, "-"
  );

  // BAR CHART DATA
  const barData = Object.keys(productMap).map((key, index) => ({
    name: key,
    amount: productMap[key],
    fill: ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"][index % 5]
  }));

  // TREND FIX (GROUP BY DATE)
  const dateMap = {};
  data.forEach(d => {
    if (!d.date) return;
    dateMap[d.date] = (dateMap[d.date] || 0) + d.amount;
  });

  const trendData = Object.keys(dateMap)
    .sort()
    .map(date => ({
      date,
      amount: dateMap[date]
    }));

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* STATS */}
      <div className="stats">
        <div className="card">₹{totalRevenue} <br /> Total Revenue</div>
        <div className="card">{orders} <br /> Orders</div>
        <div className="card">₹{avgOrder} <br /> Avg Order</div>
      </div>

      {/* TOP PRODUCT */}
      <div className="top-product">
        🏆 Top Selling Product: {topProduct}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {search && (
        <div className="search-results">
          {filtered.length > 0 ? (
            filtered.map((item, i) => (
              <div key={i}>
                {item.product} - ₹{item.amount}
              </div>
            ))
          ) : (
            <div>No results found</div>
          )}
        </div>
      )}

      {/* ADD DATA */}
      <div className="form">
        <h3>Add Data</h3>

        <input
          placeholder="Customer ID"
          value={form.customer_id}
          onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
        />

        <input
          placeholder="Product"
          value={form.product}
          onChange={(e) => setForm({ ...form, product: e.target.value })}
        />

        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />

        <button onClick={handleAdd}>Add Data</button>
      </div>

      {/* CSV UPLOAD (UNCHANGED ✅) */}
      <input type="file" accept=".csv" onChange={handleCSV} />

      {/* AI PREDICTION */}
      <div className="prediction">
        🤖 Predicted Next Sale: ₹{avgOrder}
      </div>

      {/* BAR CHART */}
      <h3>Sales by Product</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount">
            {barData.map((entry, index) => (
              <cell key={index} fill={entry.fill} />
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
            dataKey="amount"
            stroke="#4a7dfc"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;