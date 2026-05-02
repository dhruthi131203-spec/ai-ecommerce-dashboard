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

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [orders, setOrders] = useState(0);
  const [avgOrder, setAvgOrder] = useState(0);
  const [topProduct, setTopProduct] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    product: "",
    amount: "",
    date: ""
  });

  // ---------------- CSV UPLOAD (FIXED) ----------------
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const clean = result.data.map(row => ({
          customer_id: row["Customer ID"] || row["customer_id"] || "",
          product: (row["Product"] || row["product"] || "").toLowerCase(),
          amount: Number(row["Amount"] || row["amount"] || 0),
          date: row["Date"] || row["date"] || ""
        }));

        console.log("Parsed CSV:", clean); // DEBUG

        setData(clean);
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

  // ---------------- PROCESS DATA ----------------
  useEffect(() => {
    if (data.length === 0) return;

    // TOTALS
    const total = data.reduce((sum, d) => sum + d.amount, 0);
    setTotalRevenue(total);
    setOrders(data.length);
    setAvgOrder((total / data.length).toFixed(2));

    // PRODUCT TOTAL
    const productMap = {};
    data.forEach(d => {
      productMap[d.product] =
        (productMap[d.product] || 0) + d.amount;
    });

    const productArray = Object.keys(productMap).map(p => ({
      product: p,
      amount: productMap[p]
    }));

    setProductTotals(productArray);

    // TOP PRODUCT
    const top = productArray.reduce((a, b) =>
      a.amount > b.amount ? a : b
    );
    setTopProduct(top.product);

    // SEARCH
    if (search !== "") {
      const res = data.filter(d =>
        d.product.includes(search.toLowerCase())
      );

      const map = {};
      res.forEach(d => {
        map[d.product] = (map[d.product] || 0) + d.amount;
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

    // TREND (FIXED)
    const dateMap = {};
    data.forEach(d => {
      const date = new Date(d.date);
      if (isNaN(date)) return;

      const key = date.toISOString().split("T")[0];
      dateMap[key] = (dateMap[key] || 0) + d.amount;
    });

    setTrendData(
      Object.keys(dateMap).sort().map(date => ({
        date,
        amount: dateMap[date]
      }))
    );

  }, [data, search]);

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* STATS */}
      <div className="cards">
        <div>₹{totalRevenue}<br />Total Revenue</div>
        <div>{orders}<br />Orders</div>
        <div>₹{avgOrder}<br />Avg Order</div>
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

      {/* ADD DATA */}
      <h3>Add Data</h3>
      <input placeholder="Customer ID"
        value={form.customer_id}
        onChange={(e)=>setForm({...form,customer_id:e.target.value})}/>
      <input placeholder="Product"
        value={form.product}
        onChange={(e)=>setForm({...form,product:e.target.value})}/>
      <input placeholder="Amount"
        value={form.amount}
        onChange={(e)=>setForm({...form,amount:e.target.value})}/>
      <input type="date"
        value={form.date}
        onChange={(e)=>setForm({...form,date:e.target.value})}/>

      <button onClick={handleAdd}>Add Data</button>

      {/* BAR */}
      <h3>Sales by Product</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={productTotals}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="product"/>
          <YAxis/>
          <Tooltip/>
          <Bar dataKey="amount" fill="#4CAF50"/>
        </BarChart>
      </ResponsiveContainer>

      {/* LINE */}
      <h3>Sales Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis dataKey="date"/>
          <YAxis/>
          <Tooltip/>
          <Line type="monotone" dataKey="amount" stroke="#ff5722"/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;