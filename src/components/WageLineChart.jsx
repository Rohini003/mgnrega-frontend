import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const WageLineChart = ({ data }) => {
  if (!data || data.length === 0) return <p>No chart data available.</p>;

  return (
    <div className="chart-container">
      <h3>📈 Jobs & Works Trend</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="district_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Number_of_Ongoing_Works"
            stroke="#007bff"
            name="Ongoing Works"
          />
          <Line
            type="monotone"
            dataKey="Number_of_Completed_Works"
            stroke="#28a745"
            name="Completed Works"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WageLineChart;
