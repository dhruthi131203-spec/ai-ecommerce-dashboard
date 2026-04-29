import { useEffect, useState, useMemo } from "react";
import axios from "axios";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API = "http://127.0.0.1:5000";

function App() {
  const [data, setData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [search, setSearch] = useState("");
  const [dayInput, setDayInput] = useState("");

  const [form, setForm] = useState({
    customer_id: "",
    product: "",
    amount: "",
    date: ""
  });

  // FETCH DATA
  const fetchData = async () => {
    const res = await axios.get(`${API}/get-data`);
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ADD DATA
  const addData = async () => {
    await axios.post(`${API}/add-data`, {
      customer_id: Number(form.customer_id),
      product: form.product,
      amount: Number(form.amount),
      date: form.date
    });

    fetchData();
  };

  // PREDICTION
  const getPrediction = async () => {
    const res = await axios.get(`${API}/predict?day=${dayInput}`);
    setPrediction(res.data.prediction);
  };

  // RECOMMENDATION
  const getRecommendation = async () => {
    const res = await axios.get(`${API}/recommend`);
    setRecommendation(res.data.product);
  };

  // FILTER DATA
  const filteredData = useMemo(() => {
    return data.filter(item =>
      item.product.toLowerCase().includes(search.toLowerCase())
    );
  }, [data, search]);

  // GROUP DATA
  const groupedData = useMemo(() => {
    const map = {};
    filteredData.forEach(item => {
      const product = item.product.toLowerCase();
      map[product] = (map[product] || 0) + item.amount;
    });
    return map;
  }, [filteredData]);

  const labels = Object.keys(groupedData);
  const values = Object.values(groupedData);

  // KPI
  const totalRevenue = values.reduce((a, b) => a + b, 0);
  const totalOrders = filteredData.length;
  const avgOrder =
    totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

  const topProduct =
    labels.length > 0
      ? labels.reduce((a, b) =>
          groupedData[a] > groupedData[b] ? a : b
        )
      : "-";

  // 🎨 BAR CHART
  const chartData = {
    labels,
    datasets: [
      {
        label: "Total Sales",
        data: values,
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#06b6d4"
        ],
        borderRadius: 10
      }
    ]
  };

  // ✨ COMMON OPTIONS
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#111827",
          font: { size: 14, weight: "bold" }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#6b7280" }
      },
      y: {
        ticks: { color: "#6b7280" }
      }
    }
  };

  // 📈 LINE CHART (PREMIUM)
  const trendData = useMemo(() => {
    const map = {};

    filteredData.forEach(item => {
      const date = new Date(item.purchase_date)
        .toISOString()
        .split("T")[0];

      map[date] = (map[date] || 0) + item.amount;
    });

    const dates = Object.keys(map).sort();

    return {
      labels: dates,
      datasets: [
        {
          label: "Sales Trend",
          data: dates.map(d => map[d]),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,0.15)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#1d4ed8",
          pointRadius: 5,
          borderWidth: 3
        }
      ]
    };
  }, [filteredData]);

  // EXPORT CSV
  const exportCSV = () => {
    const headers = "Product,Amount,Date\n";
    const rows = filteredData
      .map(d => `${d.product},${d.amount},${d.purchase_date}`)
      .join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">
        AI E-Commerce Dashboard
      </h1>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p>Total Revenue</p>
          <h2>₹{totalRevenue}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p>Orders</p>
          <h2>{totalOrders}</h2>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p>Avg Order</p>
          <h2>₹{avgOrder}</h2>
        </div>
      </div>

      {/* TOP PRODUCT */}
      <div className="bg-yellow-100 p-4 rounded-xl mb-4 text-center">
        🏆 Top Selling Product: {topProduct}
      </div>

      {/* SEARCH */}
      <input
        className="border p-2 rounded w-full mb-4"
        placeholder="Search product..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid md:grid-cols-2 gap-6">

        {/* ADD DATA */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2>Add Data</h2>

          <input placeholder="Customer ID" className="border p-2 w-full mb-2"
            onChange={(e) => setForm({...form, customer_id: e.target.value})} />

          <input placeholder="Product" className="border p-2 w-full mb-2"
            onChange={(e) => setForm({...form, product: e.target.value})} />

          <input placeholder="Amount" className="border p-2 w-full mb-2"
            onChange={(e) => setForm({...form, amount: e.target.value})} />

          <input placeholder="Date" className="border p-2 w-full mb-2"
            onChange={(e) => setForm({...form, date: e.target.value})} />

          <button className="bg-blue-500 text-white w-full p-2 rounded"
            onClick={addData}>
            Add Data
          </button>
        </div>

        {/* PREDICTION */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2>AI Prediction</h2>

          <input placeholder="Enter day" className="border p-2 mb-2"
            onChange={(e) => setDayInput(e.target.value)} />

          <button className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={getPrediction}>
            Predict
          </button>

          {prediction && <p className="mt-2">Prediction: {prediction}</p>}
        </div>

        {/* RECOMMENDATION */}
        <div className="bg-white p-5 rounded-2xl shadow">
          <h2>Recommendation</h2>

          <button className="bg-purple-500 text-white px-4 py-2 rounded"
            onClick={getRecommendation}>
            Get Recommendation
          </button>

          {recommendation && <p className="mt-2">{recommendation}</p>}
        </div>

        {/* EXPORT */}
        <div className="bg-white p-5 rounded-2xl shadow flex items-center justify-center">
          <button className="bg-black text-white px-4 py-2 rounded"
            onClick={exportCSV}>
            Download CSV
          </button>
        </div>

      </div>

      {/* BAR CHART */}
      <div className="bg-white p-5 mt-6 rounded-2xl shadow">
        <h2>Sales (Grouped)</h2>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* LINE CHART */}
      <div className="bg-white p-5 mt-6 rounded-2xl shadow">
        <h2>Sales Trend</h2>
        <Line data={trendData} options={chartOptions} />
      </div>

    </div>
  );
}

export default App;