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
} from "recharts";

function App() {
  // ✅ DEFAULT DATA (important for charts)
  const [salesData, setSalesData] = useState([
    { customerId: "1", product: "phone", amount: 50000, date: "2026-05-01" },
    { customerId: "2", product: "laptop", amount: 30000, date: "2026-05-02" },
    { customerId: "3", product: "phone", amount: 55000, date: "2026-05-03" },
    { customerId: "4", product: "tablet", amount: 25000, date: "2026-05-04" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    product: "",
    amount: "",
    date: "",
  });

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ ADD DATA
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

  // ✅ SEARCH
  const filteredData = salesData.filter((item) =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ GROUPING
  const groupedData = salesData.reduce((acc, item) => {
    const key = item.product.trim().toLowerCase();
    if (!acc[key]) acc[key] = 0;
    acc[key] += Number(item.amount);
    return acc;
  }, {});

  const chartData = Object.keys(groupedData).map((key) => ({
    product: key,
    amount: groupedData[key],
  }));

  // ✅ STATS
  const totalRevenue = salesData.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const totalOrders = salesData.length;
  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

  const topProduct =
    chartData.length > 0
      ? chartData.reduce((a, b) =>
          a.amount > b.amount ? a : b
        ).product
      : "-";

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* STATS */}
      <div className="stats">
        <div className="card">Total Revenue ₹{totalRevenue}</div>
        <div className="card">Orders {totalOrders}</div>
        <div className="card">Avg Order ₹{avgOrder.toFixed(2)}</div>
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

      {/* ADD DATA */}
      <div className="form">
        <h3>Add Data</h3>

        <input
          name="customerId"
          placeholder="Customer ID"
          value={formData.customerId}
          onChange={handleChange}
        />

        <input
          name="product"
          placeholder="Product"
          value={formData.product}
          onChange={handleChange}
        />

        <input
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
        />

        <input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
        />

        <button onClick={handleAddData}>Add Data</button>
      </div>

      {/* BAR CHART */}
      <h3>Sales by Product</h3>
      <BarChart width={600} height={300} data={chartData}>
        <XAxis dataKey="product" stroke="#555" />
        <YAxis stroke="#555" />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Bar dataKey="amount" fill="#4CAF50" radius={[6, 6, 0, 0]} />
      </BarChart>

      {/* LINE CHART */}
      <h3>Sales Trend</h3>
      <LineChart width={600} height={300} data={salesData}>
        <XAxis dataKey="date" stroke="#555" />
        <YAxis stroke="#555" />
        <Tooltip />
        <CartesianGrid strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="amount"
          stroke="#2196F3"
          strokeWidth={3}
          dot={{ r: 5 }}
        />
      </LineChart>

      {/* SEARCH RESULTS */}
      <h3>Search Results</h3>
      {filteredData.map((item, index) => (
        <div key={index}>
          {item.product.charAt(0).toUpperCase() + item.product.slice(1)} - ₹
          {item.amount}
        </div>
      ))}
    </div>
  );
}

export default App;