import React, { useState, useEffect } from "react";
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
  const [productTotals, setProductTotals] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orders, setOrders] = useState(0);
  const [avgOrder, setAvgOrder] = useState(0);
  const [topProduct, setTopProduct] = useState("");

  const [prediction, setPrediction] = useState(0);

  const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

  // ---------------- CSV UPLOAD ----------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const clean = result.data.map(row => ({
          customer_id: row["customer_id"] || row["Customer ID"] || "",
          product: (row["product"] || row["Product"] || "").toLowerCase(),
          amount: Number(row["amount"] || row["Amount"] || 0),
          date: row["purchase_date"] || row["Date"] || ""
        }));

        setData(clean);
      }
    });
  };

  // ---------------- PROCESS ----------------
  useEffect(() => {
    if (data.length === 0) return;

    const total = data.reduce((sum, d) => sum + d.amount, 0);
    setTotalRevenue(total);
    setOrders(data.length);
    setAvgOrder((total / data.length).toFixed(2));

    // PRODUCT TOTAL
    const map = {};
    data.forEach(d => {
      map[d.product] = (map[d.product] || 0) + d.amount;
    });

    const productArray = Object.keys(map).map(p => ({
      product: p,
      amount: map[p]
    }));

    setProductTotals(productArray);

    // TOP PRODUCT
    const top = productArray.reduce((a, b) =>
      a.amount > b.amount ? a : b
    );
    setTopProduct(top.product);

    // SEARCH
    if (search) {
      const res = productArray.filter(p =>
        p.product.includes(search.toLowerCase())
      );
      setFiltered(res);
    } else {
      setFiltered([]);
    }

    // 🔥 TREND FIX (VERY IMPORTANT)
    const trendMap = {};

    data.forEach(d => {
      if (!d.date) return;

      // Convert dd-mm-yyyy → yyyy-mm-dd
      const parts = d.date.split("-");
      if (parts.length !== 3) return;

      const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`;

      trendMap[formatted] =
        (trendMap[formatted] || 0) + d.amount;
    });

    const trendArray = Object.keys(trendMap)
      .sort()
      .map(date => ({
        date,
        amount: trendMap[date]
      }));

    setTrendData(trendArray);

    // SIMPLE AI PREDICTION
    if (trendArray.length > 0) {
      const avg =
        trendArray.reduce((s, d) => s + d.amount, 0) /
        trendArray.length;

      setPrediction(Math.round(avg));
    }

  }, [data, search]);

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* STATS */}
      <div className="cards">
        <div className="card">
          <h2>₹{totalRevenue}</h2>
          <p>Total Revenue</p>
        </div>

        <div className="card">
          <h2>{orders}</h2>
          <p>Orders</p>
        </div>

        <div className="card">
          <h2>₹{avgOrder}</h2>
          <p>Avg Order</p>
        </div>
      </div>

      <div className="top-product">
        🏆 Top Selling Product: {topProduct}
      </div>

      {/* CSV */}
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {/* SEARCH */}
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map((item, i) => (
        <div key={i}>
          🔎 {item.product} → ₹{item.amount}
        </div>
      ))}

      {/* AI */}
      <div className="prediction">
        🤖 Predicted Next Sale: ₹{prediction}
      </div>

      {/* BAR */}
      <h3>Sales by Product</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={productTotals}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="product"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="amount">
            {productTotals.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* TREND */}
      <h3>Sales Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date"/>
          <YAxis/>
          <Tooltip/>
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