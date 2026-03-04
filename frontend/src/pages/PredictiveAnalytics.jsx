import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

function PredictiveAnalytics() {

  const barData = [
    { dept: "CSE", placed: 85 },
    { dept: "IT", placed: 78 },
    { dept: "ECE", placed: 65 },
  ];

  const lineData = [
    { year: 2022, rate: 70 },
    { year: 2023, rate: 80 },
    { year: 2024, rate: 88 },
  ];

  const pieData = [
    { name: "Placed", value: 320 },
    { name: "Unplaced", value: 80 },
  ];

  const COLORS = ["#2563eb", "#ef4444"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div className="card">Total Students: 400</div>
        <div className="card">Placed: 320</div>
        <div className="card">Placement Rate: 80%</div>
      </div>

      <div className="card" style={{ height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={barData}>
            <XAxis dataKey="dept"/>
            <YAxis/>
            <Tooltip/>
            <Bar dataKey="placed" fill="#2563eb"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={lineData}>
            <XAxis dataKey="year"/>
            <YAxis/>
            <Tooltip/>
            <Line type="monotone" dataKey="rate" stroke="#10b981"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={100}>
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip/>
          </PieChart>
        </ResponsiveContainer>
      </div>

    </motion.div>
  );
}

export default PredictiveAnalytics;