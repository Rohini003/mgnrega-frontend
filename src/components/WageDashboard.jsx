import React, { useEffect, useState } from "react";
import "./PerformanceDashboard.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0077b6", "#00b4d8", "#90e0ef", "#48cae4", "#023e8a"];

const PerformanceDashboard = () => {
  const [data, setData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  // --- Normalization helper ---
  const normalizeData = (data) => {
    return data.map((item) => {
      const households = parseInt(item.Total_Households_Worked) || 1;
      return {
        ...item,
        norm_active_workers:
          ((parseInt(item.Total_No_of_Active_Workers) || 0) / households) * 1000,
        norm_ongoing:
          ((parseInt(item.Number_of_Ongoing_Works) || 0) / households) * 1000,
        norm_completed:
          ((parseInt(item.Number_of_Completed_Works) || 0) / households) * 1000,
        norm_avg_wage:
          parseFloat(item.Average_Wage_rate_per_day_per_person) || 0,
      };
    });
  };

  // Fetch + normalize performance data
  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const res = await fetch("https://mgnrega-backend-8tzd.onrender.com/api/mgnrega/performance");
        if (!res.ok) throw new Error("Failed to fetch data");
        const result = await res.json();
        const dataset = Array.isArray(result) ? result : [result];

        const normalized = normalizeData(dataset);
        setData(normalized);
        setDistricts([...new Set(normalized.map((d) => d.district_name))]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching performance data:", err);
        setError("Failed to load performance data.");
        setLoading(false);
      }
    };
    fetchPerformanceData();
  }, []);

  // Auto-detect user's district
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("❌ Geolocation not supported by your browser.");
      return;
    }

    setLocationStatus("📍 Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        console.log("Detected coordinates:", latitude, longitude);

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const location = await res.json();

          const districtName =
            location.address?.district ||
            location.address?.city ||
            location.address?.county ||
            "";

          if (districtName) {
            setLocationStatus(`📍 Detected District: ${districtName}`);

            const matched = districts.find(
              (d) =>
                d.toLowerCase().includes(districtName.toLowerCase()) ||
                districtName.toLowerCase().includes(d.toLowerCase())
            );

            if (matched) {
              setSelectedDistrict(matched);
              setLocationStatus(`Auto-selected district: ${matched}`);
            } else {
              setLocationStatus(`⚠️ District "${districtName}" not found in data.`);
            }
          } else {
            setLocationStatus("⚠️ Could not determine district name.");
          }
        } catch (err) {
          console.error("Reverse geocode error:", err);
          setLocationStatus("⚠️ Failed to fetch district name.");
        }
      },
      (err) => {
        console.error("Location error:", err);
        setLocationStatus("⚠️ Location permission denied.");
      }
    );
  }, [districts]);

  // Filter by district
  const filteredData = selectedDistrict
    ? data.filter((d) => d.district_name === selectedDistrict)
    : data;

  // Summary
  const totalWorkers = filteredData.reduce(
    (sum, d) => sum + (parseInt(d.Total_No_of_Active_Workers) || 0),
    0
  );
  const totalOngoing = filteredData.reduce(
    (sum, d) => sum + (parseInt(d.Number_of_Ongoing_Works) || 0),
    0
  );
  const totalCompleted = filteredData.reduce(
    (sum, d) => sum + (parseInt(d.Number_of_Completed_Works) || 0),
    0
  );
  const avgWage =
    filteredData.reduce(
      (sum, d) =>
        sum + (parseFloat(d.Average_Wage_rate_per_day_per_person) || 0),
      0
    ) / (filteredData.length || 1);

  if (loading) return <p className="loading">Loading performance data...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="performance-dashboard fade-in">
      <h2>📊 MGNREGA District Performance Dashboard</h2>

      {/* Location Detection Info */}
      {locationStatus && <p className="info">{locationStatus}</p>}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card workers">
          <h3>{totalWorkers.toLocaleString()}</h3>
          <p>Total Active Workers</p>
        </div>
        <div className="summary-card ongoing">
          <h3>{totalOngoing.toLocaleString()}</h3>
          <p>Ongoing Works</p>
        </div>
        <div className="summary-card completed">
          <h3>{totalCompleted.toLocaleString()}</h3>
          <p>Completed Works</p>
        </div>
        <div className="summary-card wage">
          <h3>₹{avgWage.toFixed(2)}</h3>
          <p>Average Wage</p>
        </div>
      </div>

      {/* District Dropdown */}
      <div className="filter-section">
        <label>Select District:</label>
        <select
          className="modern-dropdown"
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
        >
          <option value="">-- All Districts --</option>
          {districts.map((district, idx) => (
            <option key={idx} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* Data Table */}
      <div className="table-container">
        {filteredData.length === 0 ? (
          <p>No data found for selected district.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>District</th>
                <th>State</th>
                <th>Avg Wage (₹)</th>
                <th>Active Workers</th>
                <th>Households</th>
                <th>Ongoing Works</th>
                <th>Completed Works</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.district_name}</td>
                  <td>{item.state_name}</td>
                  <td>{parseFloat(item.norm_avg_wage).toFixed(2)}</td>
                  <td>{item.Total_No_of_Active_Workers}</td>
                  <td>{item.Total_Households_Worked}</td>
                  <td>{item.Number_of_Ongoing_Works}</td>
                  <td>{item.Number_of_Completed_Works}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        {/* Bar Chart */}
        <div className="chart-card">
          <h3>Normalized Average Wages by District</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="norm_avg_wage" fill="#0077b6" name="Avg Wage (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="chart-card">
          <h3>Ongoing vs Completed Works (per 1000 HH)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="norm_ongoing"
                stroke="#007bff"
                name="Ongoing / 1000 HH"
              />
              <Line
                type="monotone"
                dataKey="norm_completed"
                stroke="#28a745"
                name="Completed / 1000 HH"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
