import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const WageBarChart = ({ data }) => {
  const formattedData = data.map((item) => ({
    district: item.district || "Unknown",
    average_wage: Number(item.wage) || 0,
  }));

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-3 text-center text-gray-800">
        Average Wage per District
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="district" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="average_wage" fill="#43a047" name="Average Wage" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WageBarChart;
