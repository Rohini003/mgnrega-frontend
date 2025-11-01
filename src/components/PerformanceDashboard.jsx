


import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/*
  New WageDashboard:
  - Fetches from /api/mgnrega/performance
  - Accepts ?state=StateName (backend supports this)
  - Shows KPI summary and bar chart for districts' avg wage
*/

const WageDashboard = () => {
  const [records, setRecords] = useState([]); // raw records from API or DB
  const [selectedState, setSelectedState] = useState("All");
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("");
  const [lang] = useState("en-IN");

  // Helper: safely extract numeric field with multiple possible keys
  const getNumber = (obj, keys, fallback = 0) => {
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
        const n = Number(obj[k]);
        if (!Number.isNaN(n)) return n;
      }
    }
    return fallback;
  };

  // Fetch records when component mounts or selectedState changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = selectedState && selectedState !== "All"
          ? { params: { state: selectedState } }
          : {};

        const res = await axios.get(
          "http://localhost:5000/api/mgnrega/performance",
          params
        );

        // backend might return array or { source, data } shape
        const payload = Array.isArray(res.data)
          ? { source: "API/Array", data: res.data }
          : res.data && res.data.data
            ? res.data
            : { source: res.data.source || "API", data: res.data };

        setDataSource(payload.source || "Unknown");
        // normalize records array
        setRecords(Array.isArray(payload.data) ? payload.data : []);
      } catch (err) {
        console.error("❌ Error fetching MGNREGA performance:", err.message);
        setRecords([]);
        setDataSource("Error / Fallback");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedState]);

  // Build unique states list from records (for dropdown)
  const states = useMemo(() => {
    const s = new Set(records.map(r => (r["State Name"] || r.StateName || r.state_name || "").toString().trim()).filter(Boolean));
    return ["All", ...Array.from(s).sort()];
  }, [records]);

  // Data filtered for current selected state (if needed)
  const filtered = useMemo(() => {
    if (selectedState === "All") return records;
    return records.filter(
      r =>
        (r["State Name"] || r.StateName || r.state_name || "").toString().toLowerCase() ===
        selectedState.toLowerCase()
    );
  }, [records, selectedState]);

  // Compute KPIs
  const kpis = useMemo(() => {
    if (!filtered || filtered.length === 0) return {
      totalWorkers: 0,
      totalHouseholds: 0,
      totalExp: 0,
      completedWorks: 0,
      avgWage: 0,
    };

    // keys in gov data: "Total_No_of_Workers", "Total_Households_Worked", "Total_Exp", "Number_of_Completed_Works", "Average_Wage_rate_per_day_per_person"
    const totalWorkers = filtered.reduce(
      (acc, r) => acc + getNumber(r, ["Total_No_of_Workers", "Total No of Workers", "TotalWorkers", "TotalWorkers"], 0),
      0
    );
    const totalHouseholds = filtered.reduce(
      (acc, r) => acc + getNumber(r, ["Total_Households_Worked", "Total Households Worked", "TotalHouseholdsWorked"], 0),
      0
    );
    const totalExp = filtered.reduce(
      (acc, r) => acc + getNumber(r, ["Total_Exp", "Total Exp", "TotalExp", "Total_Exp"], 0),
      0
    );
    const completedWorks = filtered.reduce(
      (acc, r) => acc + getNumber(r, ["Number_of_Completed_Works", "Number of Completed Works", "CompletedWorks"], 0),
      0
    );

    // average wage (mean of district averages)
    const wageVals = filtered.map(r =>
      getNumber(r, ["Average_Wage_rate_per_day_per_person", "Average Wage Rate Per Day Per Person", "AverageWageRatePerDay"], 0)
    ).filter(v => v > 0);

    const avgWage = wageVals.length ? Math.round(wageVals.reduce((a,b)=>a+b,0)/wageVals.length) : 0;

    return {
      totalWorkers,
      totalHouseholds,
      totalExp,
      completedWorks,
      avgWage,
    };
  }, [filtered]);

  // Prepare chart data: top districts by wage (sort and limit)
  const chartData = useMemo(() => {
    const arr = filtered.map(r => ({
      district: (r["District Name"] || r.DistrictName || r.district_name || r.district || "Unknown"),
      wage: Number(r["Average_Wage_rate_per_day_per_person"] ?? r["Average Wage Rate Per Day Per Person"] ?? r.AverageWageRatePerDay ?? 0)
    }));
    // sort descending, show top 12
    return arr.sort((a,b)=>b.wage - a.wage).slice(0, 12);
  }, [filtered]);

  // Voice: speak top district by wage
  const speakTop = () => {
    if (!chartData.length) return;
    const top = chartData[0];
    const text = `${top.district} average daily wage ${Math.round(top.wage)} rupees`;
    if ("speechSynthesis" in window) {
      const s = new SpeechSynthesisUtterance(text);
      s.lang = lang;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(s);
    } else alert(text);
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.title}> MGNREGA District Performance</h1>
          <p style={styles.subtitle}>
            {selectedState === "All" ? "All States (latest month available)" : selectedState}
            {" • "} Data source: <strong>{dataSource || "—"}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={styles.dropdown}
          >
            {states.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button style={styles.voiceButton} onClick={speakTop} title="Listen to top wage">
            🔊 Speak
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div style={styles.kpiGrid}>
        <div style={{ ...styles.kpiCard, borderTop: "4px solid #2563eb" }}>
          <div style={styles.kpiLabel}>Total Workers</div>
          <div style={styles.kpiValue}>{kpis.totalWorkers.toLocaleString()}</div>
          <div style={styles.kpiNote}>Workers (sum across districts)</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "4px solid #7c3aed" }}>
          <div style={styles.kpiLabel}>Households Worked</div>
          <div style={styles.kpiValue}>{kpis.totalHouseholds.toLocaleString()}</div>
          <div style={styles.kpiNote}>Total households</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "4px solid #9333ea" }}>
          <div style={styles.kpiLabel}>Total Expenditure</div>
          <div style={styles.kpiValue}>₹{Math.round(kpis.totalExp).toLocaleString()}</div>
          <div style={styles.kpiNote}>(in reported units)</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "4px solid #16a34a" }}>
          <div style={styles.kpiLabel}>Completed Works</div>
          <div style={styles.kpiValue}>{kpis.completedWorks.toLocaleString()}</div>
          <div style={styles.kpiNote}>Number of completed works</div>
        </div>

        <div style={{ ...styles.kpiCard, borderTop: "4px solid #0ea5a4" }}>
          <div style={styles.kpiLabel}>Avg Daily Wage</div>
          <div style={styles.kpiValue}>₹{kpis.avgWage}</div>
          <div style={styles.kpiNote}>Average across districts</div>
        </div>
      </div>

      {/* Chart */}
      <div style={styles.chartWrapper}>
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading...</p>
        ) : chartData.length ? (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorWage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="district" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wage" fill="url(#colorWage)" radius={[8,8,0,0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ textAlign: "center" }}>No data available for selected state.</p>
        )}
      </div>

      {/* Table: district list */}
      {filtered.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>District</th>
              <th style={styles.th}>Avg Wage (₹)</th>
              <th style={styles.th}>Workers</th>
              <th style={styles.th}>Households Worked</th>
              <th style={styles.th}>Total Exp</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => {
              const district = r["District Name"] || r.DistrictName || r.district_name || r.district || "Unknown";
              const wage = getNumber(r, ["Average_Wage_rate_per_day_per_person", "Average Wage Rate Per Day Per Person"], 0);
              const workers = getNumber(r, ["Total_No_of_Workers", "Total No of Workers", "TotalWorkers"], 0);
              const households = getNumber(r, ["Total_Households_Worked", "Total Households Worked"], 0);
              const exp = getNumber(r, ["Total_Exp", "Total Exp", "TotalExp"], 0);

              return (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.td}>{district}</td>
                  <td style={{ ...styles.td, color: "#2563eb", fontWeight: 700 }}>₹{Math.round(wage)}</td>
                  <td style={styles.td}>{workers.toLocaleString()}</td>
                  <td style={styles.td}>{households.toLocaleString()}</td>
                  <td style={styles.td}>₹{Math.round(exp).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ---------- Styles (keeps your blue theme) ----------
const styles = {
  container: {
    width: "85%",
    margin: "50px auto",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0px 8px 30px rgba(16,24,40,0.08)",
    fontFamily: "'Inter', sans-serif",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    color: "#073b79",
    fontSize: "1.75rem",
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    color: "#475569",
    fontSize: "0.95rem",
  },
  dropdown: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #c7d2fe",
    fontSize: "0.95rem",
    background: "white",
  },
  voiceButton: {
    background: "#e6f2ff",
    color: "#0b63d6",
    border: "1px solid rgba(11,99,214,0.12)",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 18,
    marginTop: 18,
    marginBottom: 20,
  },
  kpiCard: {
    background: "linear-gradient(180deg, #ffffff, #fbfdff)",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 6px 18px rgba(14,42,83,0.06)",
    textAlign: "left",
  },
  kpiLabel: { color: "#475569", fontSize: 13, fontWeight: 600 },
  kpiValue: { fontSize: 20, fontWeight: 800, marginTop: 6 },
  kpiNote: { fontSize: 12, color: "#64748b", marginTop: 6 },

  chartWrapper: {
    borderRadius: 12,
    padding: 18,
    background: "#f8fafc",
    marginBottom: 26,
  },

  table: {
    width: "100%",
    marginTop: 10,
    borderCollapse: "collapse",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 6px 20px rgba(2,6,23,0.04)",
  },
  tableHeader: { backgroundColor: "#eef2ff" },
  th: { padding: 12, fontWeight: 700, textAlign: "left", color: "#0b63d6" },
  td: { padding: 12, textAlign: "left", color: "#334155", borderBottom: "1px solid #f1f5f9" },
  tableRow: {},
};

export default WageDashboard;
