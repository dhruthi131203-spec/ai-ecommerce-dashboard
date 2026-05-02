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

  const [form, setForm] = useState({
    customer_id: "",
    product: "",
    amount: "",
    date: ""
  });

  // ---------------- CSV UPLOAD ----------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const cleanData = result.data
          .filter(row => row.product && row.amount && row.date)
          .map(row => ({
            customer_id: row.customer_id || "",
            product: row.product.toLowerCase(),
            amount: Number(row.amount),
            date: row.date
          }));

        setData(cleanData);
      }
    });
  };

  // ---------------- ADD DATA ----------------
  const handleAdd = () => {
    if (!form.product || !form.amount || !form.date) return;

    const newItem = {
      ...form,
      product: form.product.toLowerCase(),
      amount: Number(form.amount)
    };

    setData([...data, newItem]);

    setForm({
      customer_id: "",
      product: "",
      amount: "",
      date: ""
    });
  };

  // ---------------- MAIN LOGIC ----------------
  useEffect(() => {
    if (data.length === 0) return;

    // PRODUCT TOTAL
    const productMap = {};
    data.forEach(item => {
      productMap[item.product] =
        (productMap[item.product] || 0) + item.amount;
    });

    setProductTotals(
      Object.keys(productMap).map(p => ({
        product: p,
        amount: productMap[p]
      }))
    );

    // SEARCH
    if (search !== "") {
      const filteredItems = data.filter(item =>
        item.product.includes(search.toLowerCase())
      );

      const map = {};
      filteredItems.forEach(item => {
        map[item.product] = (map[item.product] || 0) + item.amount;
      });

      setFiltered(
        Object.keys(map).map(p => ({
          product: p,
          amount: map[p]
        }))
      );
    } else {
      setFiltered([]);
    }

    // SALES TREND (FIXED)
    const dateMap = {};

    data.forEach(item => {
      const d = new Date(item.date);
      if (isNaN(d)) return;

      const key = d.toISOString().split("T")[0];
      dateMap[key] = (dateMap[key] || 0) + item.amount;
    });

    setTrendData(
      Object.keys(dateMap).sort().map(date => ({
        date,
        amount: dateMap[date]
      }))
    );

    // PREDICTION
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

      {/* ADD DATA (RESTORED) */}
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

      {/* LINE CHART */}
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