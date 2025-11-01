import React from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import WagePage from "./components/WagePage";
import PerformanceDashboard from "./components/PerformanceDashboard";

const App = () => {
  return (
    <Router>
      {/* 🌟 Navbar */}
      <nav className="flex justify-center gap-8 py-4 bg-indigo-100 shadow-md text-lg font-semibold text-indigo-700">
        {/* <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "text-indigo-900 underline" : "hover:text-indigo-900"
          }
        >
          Wages
        </NavLink> */}

        {/* <NavLink
          to="/performance"
          className={({ isActive }) =>
            isActive ? "text-indigo-900 underline" : "hover:text-indigo-900"
          }
        >
          Performance
        </NavLink> */}
      </nav>

      {/* 🌈 Page Routing */}
      <Routes>
        <Route path="/" element={<WagePage />} />
        <Route path="/performance" element={<PerformanceDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
