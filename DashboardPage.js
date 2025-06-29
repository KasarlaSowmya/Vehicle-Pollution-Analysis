import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#22c55e', '#facc15', '#ef4444']; // green, yellow, red

export default function DashboardPage() {
  const [data, setData] = useState([]);
  const [numberFilter, setNumberFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error("❌ Error fetching dashboard data:", err));
  }, []);

  // Extract dropdown values dynamically
  const uniqueTypes = [...new Set(data.map(d => d.type))];
  const uniqueFuels = [...new Set(data.map(d => d.fuelType))];

  // ✅ Apply all filters
  const filtered = data.filter(d =>
    (d.number?.toLowerCase() || '').includes(numberFilter.toLowerCase()) &&
    (d.area?.toLowerCase() || '').includes(areaFilter.toLowerCase()) &&
    (d.fuelType?.toLowerCase() || '').includes(fuelFilter.toLowerCase()) &&
    (d.type?.toLowerCase() || '').includes(typeFilter.toLowerCase())
  );

  // ✅ Pie and Bar chart data
  const pollutionCount = filtered.reduce((acc, curr) => {
    acc[curr.pollutionLevel] = (acc[curr.pollutionLevel] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(pollutionCount).map(([level, count]) => ({
    name: level,
    value: count,
  }));

  const barData = ['Low', 'Moderate', 'High'].map(level => ({
    name: level,
    count: filtered.filter(v => v.pollutionLevel === level).length,
  }));

  // ✅ Email sending function
  const sendResult = async (email, result) => {
    try {
      await axios.post('http://localhost:5000/send-result', { email, result });
      alert(`✅ Result sent to ${email}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      alert("Failed to send email");
    }
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <div className="filters">
        <input
          placeholder="Filter by Vehicle Number"
          value={numberFilter}
          onChange={(e) => setNumberFilter(e.target.value)}
        />
        <input
          placeholder="Filter by Area"
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
        />

        <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}>
          <option value="">All Fuel Types</option>
          {uniqueFuels.map((fuel, i) => (
            <option key={i} value={fuel}>{fuel}</option>
          ))}
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Vehicle Types</option>
          {uniqueTypes.map((type, i) => (
            <option key={i} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <h3>Pollution Pie Chart</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <h3>Pollution Bar Chart</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#16a34a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h3>Vehicles:</h3>
      {filtered.map((item, index) => (
        <div key={index} className="result-card">
          <p><strong>Vehicle:</strong> {item.number}</p>
          <p><strong>Type:</strong> {item.type}</p>
          <p><strong>Fuel:</strong> {item.fuelType}</p>
          <p><strong>Area:</strong> {item.area}</p>
          <p><strong>Pollution Level:</strong> {item.pollutionLevel}</p>
          <button onClick={() => sendResult(item.email, item.pollutionLevel)}>
            Email Result
          </button>
        </div>
      ))}
    </div>
  );
}
