import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function App() {
  const API = "https://ai-ecommerce-dashboard-2-znpk.onrender.com";

  const [data, setData] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    product: "",
    amount: "",
    date: ""
  });
  const [prediction, setPrediction] = useState("");
  const [search, setSearch] = useState("");
  const [dayInput, setDayInput] = useState("");

  // FETCH DATA
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/get-data`);
      setData(res.data || []);
    } catch (error) {
      console.error("FETCH ERROR:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ADD DATA
  const addData = async () => {
    try {
      await axios.post(`${API}/add-data`, {
        customer_id: Number(form.customer_id),
        product: form.product,
        amount: Number(form.amount),
        date: form.date
      });

      setForm({
        customer_id: "",
        product: "",
        amount: "",
        date: ""
      });

      fetchData();
    } catch (error) {
      console.error("ADD DATA ERROR:", error);
    }
  };

  // AI PREDICTION
  const getPrediction = async () => {
    try {
      const res = await axios.get(`${API}/predict?day=${dayInput}`);
      setPrediction(res.data.prediction);
    } catch (error) {
      console.error("PREDICTION ERROR:", error);
    }
  };

  // FILTER
  const filteredData = data.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );

  // CALCULATIONS
  const totalRevenue = data.reduce((sum, item) => sum + item.amount, 0);
  const orders = data.length;
  const avgOrder = orders ? (totalRevenue / orders).toFixed(2) : 0;

  // CHART DATA
  const productMap = {};
  data.forEach((item) => {
    productMap[item.product] =
      (productMap[item.product] || 0) + item.amount;
  });

  const chartData = Object.keys(productMap).map((key) => ({
    product: key,
    amount: productMap[key]
  }));

  const topProduct =
    chartData.length > 0
      ? chartData.reduce((a, b) => (a.amount > b.amount ? a : b)).product
      : "-";

  return (
    <div className="container">
      <h1>AI E-Commerce Dashboard</h1>

      {/* CARDS */}
      <div className="cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue}</p>
        </div>
        <div className="card">
          <h3>Orders</h3>
          <p>{orders}</p>
        </div>
        <div className="card">
          <h3>Avg Order</h3>
          <p>₹{avgOrder}</p>
        </div>
      </div>

      {/* TOP PRODUCT */}
      <div className="top-product">
        🏆 Top Selling Product: {topProduct}
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* GRID */}
      <div className="grid">

        {/* ADD DATA */}
        <div className="box">
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
          <button onClick={addData}>Add Data</button>
        </div>

        {/* PREDICTION */}
        <div className="box">
          <h3>AI Prediction</h3>
          <input
            placeholder="Enter day"
            value={dayInput}
            onChange={(e) => setDayInput(e.target.value)}
          />
          <button onClick={getPrediction}>Predict</button>
          <p>Prediction: {prediction}</p>
        </div>
      </div>

      {/* BAR CHART */}
      <div className="chart-box">
        <h3>Sales by Product</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LINE CHART */}
      <div className="chart-box">
        <h3>Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#2196F3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;