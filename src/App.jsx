import React, { useState } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer, Cell
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

  // 🔥 FIX DATE FORMAT (handles DD-MM-YYYY & YYYY-MM-DD)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");

      // DD-MM-YYYY → convert
      if (parts[0].length === 2) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    return dateStr;
  };

  // 📂 CSV UPLOAD (KEEPING THIS SAFE)
  const handleCSV = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const formatted = result.data.map((d) => ({
          customer_id: d.customer_id,
          product: d.product.toLowerCase(),
          amount: Number(d.amount),
          date: formatDate(d.date)
        }));

        setData(formatted);
      }
    });
  };

  // 🔍 SEARCH (CLEAN + GROUPED)
  const handleSearch = (value) => {
    setSearch(value);

    const results = data.filter((item) =>
      item.product.toLowerCase().includes(value.toLowerCase())
    );

    const grouped = {};
    results.forEach((item) => {
      grouped[item.product] =
        (grouped[item.product] || 0) + item.amount;
    });

    const cleanResults = Object.keys(grouped).map((key) => ({
      product: key,
      total: grouped[key]
    }));

    setFiltered(cleanResults);
  };

  // ➕ ADD DATA
  const handleAdd = () => {
    if (!form.product || !form.amount) return;

    setData([
      ...data,
      {
        ...form,
        product: form.product.toLowerCase(),
        amount: Number(form.amount),
        date: formatDate(form.date)
      }
    ]);

    setForm({ customer_id: "", product: "", amount: "", date: "" });
  };

  // 📊 METRICS
  const totalRevenue = data.reduce((a, b) => a + b.amount, 0);
  const orders = data.length;
  const avgOrder = orders ? (totalRevenue / orders).toFixed(2) : 0;

  // 🏆 TOP PRODUCT
  const productMap = {};
  data.forEach((d) => {
    productMap[d.product] =
      (productMap[d.product] || 0) + d.amount;
  });

  const topProduct =
    Object.keys(productMap).length > 0
      ? Object.keys(productMap).reduce((a, b) =>
          productMap[a] > productMap[b] ? a : b
        )
      : "-";

  // 📊 BAR CHART DATA (WITH COLORS)
  const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

  const barData = Object.keys(productMap).map((key, index) => ({
    name: key,
    amount: productMap[key],
    fill: colors[index % colors.length]
  }));

  // 📈 TREND DATA (FIXED PROPERLY)
  const dateMap = {};

  data.forEach((d) => {
    if (!d.date) return;

    dateMap[d.date] =
      (dateMap[d.date] || 0) + d.amount;
  });

  const trendData = Object.keys(dateMap)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((date) => ({
      date,
      amount: dateMap[date]
    }));

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* 📊 STATS */}
      <div className="stats">
        <div className="card">₹{totalRevenue}<br />Total Revenue</div>
        <div className="card">{orders}<br />Orders</div>
        <div className="card">₹{avgOrder}<br />Avg Order</div>
      </div>

      {/* 🏆 TOP PRODUCT */}
      <div className="top-product">
        🏆 Top Selling Product: {topProduct}
      </div>

      {/* 🔍 SEARCH */}
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
              <div key={i} className="search-item">
                🔍 {item.product.toUpperCase()} → ₹{item.total}
              </div>
            ))
          ) : (
            <div>No results found</div>
          )}
        </div>
      )}

      {/* ➕ ADD DATA */}
      <div className="form">
        <h3>Add Data</h3>

        <input
          placeholder="Customer ID"
          value={form.customer_id}
          onChange={(e) =>
            setForm({ ...form, customer_id: e.target.value })
          }
        />

        <input
          placeholder="Product"
          value={form.product}
          onChange={(e) =>
            setForm({ ...form, product: e.target.value })
          }
        />

        <input
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
        />

        <input
          type="date"
          value={form.date}
          onChange={(e) =>
            setForm({ ...form, date: e.target.value })
          }
        />

        <button onClick={handleAdd}>Add Data</button>
      </div>

      {/* 📂 CSV UPLOAD (UNCHANGED) */}
      <input type="file" accept=".csv" onChange={handleCSV} />

      {/* 🤖 PREDICTION */}
      <div className="prediction">
        🤖 Predicted Next Sale: ₹{avgOrder}
      </div>

      {/* 📊 BAR CHART */}
      <h3>Sales by Product</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount">
            {barData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 📈 TREND GRAPH */}
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
            stroke="#4CAF50"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;