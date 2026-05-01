import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://ai-ecommerce-dashboard-2-znpk.onrender.com";

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [day, setDay] = useState("");

  // FETCH DATA
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/get-data`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CALCULATIONS
  const filteredData = data.filter((item) =>
    item.product.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filteredData.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalOrders = filteredData.length;

  const avgOrder =
    totalOrders === 0 ? 0 : (totalRevenue / totalOrders).toFixed(2);

  const topProduct =
    filteredData.length > 0
      ? filteredData.reduce((a, b) =>
          a.amount > b.amount ? a : b
        ).product
      : "-";

  // PREDICTION
  const handlePredict = async () => {
    try {
      const res = await axios.get(`${API}/predict?day=${day}`);
      setPrediction(res.data.prediction);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>AI E-Commerce Dashboard</h1>

      {/* TOP CARDS */}
      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div> Total Revenue ₹{totalRevenue}</div>
        <div> Orders {totalOrders}</div>
        <div> Avg Order ₹{avgOrder}</div>
      </div>

      {/* TOP PRODUCT */}
      <div style={{ marginTop: "20px" }}>
        🏆 Top Selling Product: {topProduct}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: "20px", width: "100%" }}
      />

      {/* ADD DATA */}
      <div style={{ marginTop: "20px" }}>
        <h3>Add Data</h3>
        <input placeholder="Customer ID" id="cid" />
        <input placeholder="Product" id="prod" />
        <input placeholder="Amount" id="amt" />
        <input placeholder="Date" id="date" />

        <button
          onClick={async () => {
            await axios.post(`${API}/add-data`, {
              customer_id: document.getElementById("cid").value,
              product: document.getElementById("prod").value,
              amount: document.getElementById("amt").value,
              date: document.getElementById("date").value,
            });
            fetchData();
          }}
        >
          Add Data
        </button>
      </div>

      {/* PREDICTION */}
      <div style={{ marginTop: "20px" }}>
        <h3>AI Prediction</h3>
        <input
          placeholder="Enter day"
          value={day}
          onChange={(e) => setDay(e.target.value)}
        />
        <button onClick={handlePredict}>Predict</button>

        {prediction && <p>Prediction: {prediction}</p>}
      </div>

      {/* RECOMMENDATION */}
      <div style={{ marginTop: "20px" }}>
        <h3>Recommendation</h3>
        <button
          onClick={async () => {
            const res = await axios.get(`${API}/recommend`);
            alert("Recommended: " + res.data.product);
          }}
        >
          Get Recommendation
        </button>
      </div>
    </div>
  );
}

export default App;