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
} from "recharts";

function App() {
  const [salesData, setSalesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prediction, setPrediction] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    product: "",
    amount: "",
    date: "",
  });

  // ✅ NORMALIZE FUNCTION
  const normalize = (str) => str.trim().toLowerCase();

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
      product: normalize(formData.product),
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
    normalize(item.product).includes(normalize(searchTerm))
  );

  // ✅ GROUP DATA
  const groupedData = salesData.reduce((acc, item) => {
    const key = normalize(item.product);

    if (!acc[key]) acc[key] = 0;
    acc[key] += item.amount;

    return acc;
  }, {});

  const chartData = Object.keys(groupedData).map((key) => ({
    name: key,
    amount: groupedData[key],
  }));

  // ✅ STATS
  const totalRevenue = salesData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalOrders = salesData.length;

  const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;

  const topProduct =
    chartData.length > 0
      ? chartData.reduce((a, b) =>
          a.amount > b.amount ? a : b
        ).name
      : "-";

  // ✅ LINE DATA
  const lineData = salesData.map((item) => ({
    date: item.date,
    amount: item.amount,
  }));

  // ✅ AI PREDICTION
  const handlePredict = () => {
    if (totalOrders === 0) {
      setPrediction("No data");
    } else {
      const avg = totalRevenue / totalOrders;
      setPrediction(`₹${avg.toFixed(2)}`);
    }
  };

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* STATS */}
      <div className="stats">
        <div className="card">Total Revenue ₹{totalRevenue}</div>
        <div className="card">Orders {totalOrders}</div>
        <div className="card">
          Avg Order ₹{avgOrder.toFixed(2)}
        </div>
      </div>

      <div className="top-product">
        🏆 Top Selling Product:{" "}
        {topProduct.charAt(0).toUpperCase() + topProduct.slice(1)}
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

      {/* AI PREDICTION */}
      <div className="form">
        <h3>AI Prediction</h3>
        <input placeholder="Enter day (optional)" />
        <button onClick={handlePredict}>Predict</button>
        <p>Prediction: {prediction}</p>
      </div>

      {/* BAR GRAPH */}
      <h3>Sales by Product</h3>
      <BarChart width={600} height={300} data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="amount" fill="#4CAF50" />
      </BarChart>

      {/* LINE GRAPH */}
      <h3>Sales Trend</h3>
      <LineChart width={600} height={300} data={lineData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>

      {/* SEARCH RESULTS */}
      <h3>Search Results</h3>
      {filteredData.map((item, index) => (
        <div key={index}>
          {item.product.charAt(0).toUpperCase() +
            item.product.slice(1)}{" "}
          - ₹{item.amount}
        </div>
      ))}
    </div>
  );
}

export default App;