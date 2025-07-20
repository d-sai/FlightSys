import React, { useEffect, useState } from "react";
import "../styles/AdminDashboard.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#aa46be"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "5px",
          color: "#000",
        }}
      >
        <p>
          <strong>{label}</strong>
        </p>
        <p>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courseStats, setCourseStats] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [topStudents, setTopStudents] = useState([]);

  const [enrollmentChart, setEnrollmentChart] = useState([]);
  const [balanceChart, setBalanceChart] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchEnrollmentChart();
    fetchBalanceDistribution();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/dashboard", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setDashboard(data);

      setCourseStats(data.courseStats || []);
      setTotalStudents(data.totalStudents || 0);
      setTopStudents(data.topStudents || []);
    } catch (err) {
      console.error("Error loading admin dashboard", err);
    }
  };

  const fetchEnrollmentChart = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/chart/course-enrollments",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const data = await res.json();
      setEnrollmentChart(data);
    } catch (err) {
      console.error("Error loading course enrollment chart", err);
    }
  };

  const fetchBalanceDistribution = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/chart/balance-distribution",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const raw = await res.json();
      const formatted = formatBalanceData(raw);
      setBalanceChart(formatted);
    } catch (err) {
      console.error("Error loading balance chart", err);
    }
  };

  const formatBalanceData = (raw) => {
    const ranges = {
      Negative: 0,
      "0-1000": 0,
      "1000-5000": 0,
      "5000+": 0,
    };

    raw.forEach(({ balance }) => {
      if (balance < 0) ranges["Negative"]++;
      else if (balance <= 1000) ranges["0-1000"]++;
      else if (balance <= 5000) ranges["1000-5000"]++;
      else ranges["5000+"]++;
    });

    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  };

  const enrolled = courseStats.reduce((sum, c) => sum + c.enrolledStudents, 0);
  const notEnrolled = totalStudents - enrolled;
  const enrollPieData = [
    { name: "Enrolled", value: enrolled },
    { name: "Not Enrolled", value: notEnrolled > 0 ? notEnrolled : 0 },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>📊 Admin Analytics</h2>
        <p>Overview of courses, students and financial distribution</p>
      </div>

      {/* <div className="dashboard-grid">
        <div className="stat-box">
          <h3>Total Courses: {courseStats.length}</h3>
          <ul>
            {courseStats.map((course, idx) => (
              <li key={idx}>
                {course.title} — ₹{course.price} — 👥 {course.enrolledStudents} students
              </li>
            ))}
          </ul>
        </div>

        <div className="stat-box">
          <h3>Total Students: {totalStudents}</h3>
          <h4>Top Students</h4>
          <ul>
            {topStudents.map((student, idx) => (
              <li key={idx}>
                {student.name} ({student.email}) — ✅ {student.completedTasks} tasks — ₹{student.balance}
              </li>
            ))}
          </ul>
        </div>
      </div> */}
      {dashboard && (
        <div className="dashboard-grid">
          <div className="stat-box" onClick={() => navigate("/courses")}>
            <h3>Total Courses</h3>
            <p>{dashboard.courseStats.length}</p>
          </div>
          <div className="stat-box" onClick={() => navigate("/students")}>
            <h3>Total Students</h3>
            <p>{dashboard.totalStudents}</p>
          </div>
        </div>
      )}
      {/* Chart Section */}
      <div className="charts-section">
        <h3 className="charts-title">📈 Advanced Analytics</h3>

        {/* Chart 1: Students per Course */}
        <div className="chart-box">
          <h4>Students Enrolled per Course</h4>
          {/* <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={enrollmentChart}
              layout="vertical" // This makes the bar chart horizontal
              margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />{" "}
              <YAxis dataKey="course" type="category" />{" "}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="students" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer> */}

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={enrollmentChart} margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
              <CartesianGrid strokeDasharray="10 10" />
              <XAxis dataKey="course" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="students" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Enrolled vs Not Enrolled */}
        <div className="chart-box">
          <h4>Enrollment Coverage</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={enrollPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {enrollPieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Balance Distribution */}
        <div className="chart-box">
          <h4>Balance Distribution</h4>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={balanceChart}
                dataKey="count"
                nameKey="range"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {balanceChart.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
