import React, { useState, useEffect } from "react";
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
  const [productTotals, setProductTotals] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [prediction, setPrediction] = useState(0);

  // ✅ CSV Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const formatted = result.data.map(row => ({
          customer_id: row.customer_id,
          product: row.product.toLowerCase(),
          amount: Number(row.amount),
          date: new Date(row.date) // IMPORTANT
        }));

        setData(formatted);
      }
    });
  };

  // ✅ PROCESS DATA
  useEffect(() => {
    if (data.length === 0) return;

    // -------- PRODUCT TOTAL --------
    const productMap = {};
    data.forEach(item => {
      productMap[item.product] =
        (productMap[item.product] || 0) + item.amount;
    });

    const productArray = Object.keys(productMap).map(p => ({
      product: p,
      amount: productMap[p]
    }));

    setProductTotals(productArray);

    // -------- SEARCH --------
    if (search !== "") {
      const filteredItems = data.filter(item =>
        item.product.includes(search.toLowerCase())
      );

      const searchMap = {};
      filteredItems.forEach(item => {
        searchMap[item.product] =
          (searchMap[item.product] || 0) + item.amount;
      });

      const searchArray = Object.keys(searchMap).map(p => ({
        product: p,
        amount: searchMap[p]
      }));

      setFiltered(searchArray);
    } else {
      setFiltered([]);
    }

    // -------- TREND (FIXED PART) --------
    const dateMap = {};

    data.forEach(item => {
      const dateKey = item.date.toISOString().split("T")[0];

      if (!dateMap[dateKey]) {
        dateMap[dateKey] = 0;
      }

      dateMap[dateKey] += item.amount;
    });

    const trendArray = Object.keys(dateMap)
      .sort()
      .map(date => ({
        date,
        amount: dateMap[date]
      }));

    setTrendData(trendArray);

    // -------- PREDICTION --------
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    setPrediction(Math.round(total / data.length));

  }, [data, search]);

  return (
    <div className="container">

      <h1>AI E-Commerce Dashboard</h1>

      {/* CSV Upload */}
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {/* Search */}
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Search Results */}
      {filtered.map((item, index) => (
        <div key={index}>
          🔎 {item.product.toUpperCase()} → ₹{item.amount}
        </div>
      ))}

      {/* Prediction */}
      <div>🤖 Predicted Next Sale: ₹{prediction}</div>

      {/* BAR CHART */}
      <h3>Sales by Product</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={productTotals}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="amount" fill="#4CAF50" />
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
            stroke="#ff5722"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>

    </div>
  );
}

export default App;