import React, { useEffect, useState } from "react";
import "../styles.css";
import WageDashboard from "./WageDashboard";
import PerformanceDashboard from "./PerformanceDashboard"; // new import

function speak(text, lang = "en-IN") {
  if (!("speechSynthesis" in window)) return;
  const s = new SpeechSynthesisUtterance(text);
  s.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(s);
}

const WagePage = () => {
  const [allWages, setAllWages] = useState([]);
  const [wages, setWages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en-IN");
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const fetchWages = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/wages");
        const data = await res.json();
        setAllWages(data);
        setWages(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWages();
  }, []);

  const handleStateChange = (e) => {
    const selected = e.target.value;
    if (selected === "all") setWages(allWages);
    else setWages(allWages.filter((w) => w.state === selected));
  };

  const speakTop = () => {
    if (!wages.length) {
      speak("No data available", lang);
      return;
    }
    const top = wages[0];
    speak(
      `${top.district || top.state} daily wage ${Math.round(top.wage)} rupees`,
      lang
    );
  };

  return (
    <div className="app-container">
      {/* 🌈 Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1> MGNREGA Wage Dashboard</h1>
        </div>
        <div className="nav-right">
          {[ "dashboard","performance", "insights"].map((tab) => (
            <button
              key={tab}
              className={`nav-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </nav>

      {/* 🧭 Header Section */}
      {/* <header className="header-section">
        <div>
          <h2>Explore State-Wise Wages</h2>
          <p>Select a state to view district-level wage insights</p>
        </div>
        <div className="header-buttons">
          <button
            className="glass-btn"
            onClick={() =>
              speak("This shows wage per day for different districts", lang)
            }
          >
            ❔ Explain
          </button>
          <button className="glass-btn" onClick={speakTop}>
            🔊 Listen
          </button>
        </div>
      </header> */}

      {/* 🌍 State Filter */}
      {/* <div className="filter-section">
        <label>Select State:</label>
        <select onChange={handleStateChange} className="modern-dropdown">
          <option value="all">All States</option>
          {[...new Set(allWages.map((w) => w.state))].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div> */}

      {/* 🧩 Tab Content */}
      <main className="content-area fade-in">
        {/* Dashboard → Wage Chart */}
        {activeTab === "dashboard" && (
          <section className="fade-in chart-section">
            <WageDashboard />
          </section>
        )}

        {/* Insights → Highest / Avg / Lowest */}
        {activeTab === "insights" && (
          <section className="summary-section fade-in">
            <div className="summary-card blue">
              <h3>Highest Wage</h3>
              <p>
                ₹{Math.max(...wages.map((w) => w.wage))}
                <span>
                  {
                    wages.find(
                      (w) => w.wage === Math.max(...wages.map((x) => x.wage))
                    )?.district
                  }{" "}
                  (
                  {
                    wages.find(
                      (w) => w.wage === Math.max(...wages.map((x) => x.wage))
                    )?.state
                  }
                  )
                </span>
              </p>
            </div>

            <div className="summary-card purple">
              <h3>Average Wage</h3>
              <p>
                ₹
                {Math.round(
                  wages.reduce((acc, w) => acc + w.wage, 0) / wages.length
                )}
                <span>Across {wages.length} Districts</span>
              </p>
            </div>

            <div className="summary-card green">
              <h3>Lowest Wage</h3>
              <p>
                ₹{Math.min(...wages.map((w) => w.wage))}
                <span>
                  {
                    wages.find(
                      (w) => w.wage === Math.min(...wages.map((x) => x.wage))
                    )?.district
                  }{" "}
                  (
                  {
                    wages.find(
                      (w) => w.wage === Math.min(...wages.map((x) => x.wage))
                    )?.state
                  }
                  )
                </span>
              </p>
            </div>
          </section>
        )}

        {/* Analytics → Wage Cards */}
        {/* {activeTab === "analytics" && (
          <>
            {loading ? (
              <p className="loading">Loading wage data...</p>
            ) : (
              <section className="card-grid">
                {wages.length ? (
                  wages.slice(0, 6).map((item, i) => (
                    <div key={i} className="glass-card">
                      <h3>{item.district || item.state}</h3>
                      <p className="wage">₹{Math.round(item.wage)}</p>
                      <p className="date">
                        Updated:{" "}
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No data found</p>
                )}
              </section>
            )}
          </>
        )} */}

        {/* Performance → Workers, Expenditure, etc */}
        {activeTab === "performance" && (
          <section className="fade-in chart-section">
            <PerformanceDashboard />
          </section>
        )}
      </main>
    </div>
  );
};

export default WagePage;
