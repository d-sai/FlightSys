import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Swal from "sweetalert2";
import AdminDashboard from "./AdminDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseEnrolled, setCourseEnrolled] = useState(false);
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0 });
  const [balance, setBalance] = useState(0);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    // if (!user) return navigate("/login");
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user && user.role === "student") {
        const result = await fetch(
          "http://localhost:5000/api/student/progress",
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        const data = await result.json();
        // console.log("data of student/progress:", data);
        const {
          totalTasks: total,
          completedTasks: completed,
          balance,
          course,
          badges,
        } = data;
        // console.log(total,completed,balance,badges);
        setTaskStats({ total, completed });
        setBalance(balance);
        if (course) setCourseEnrolled(true);
        if (completed >= 5) setBadges(["Rookie", "Skilled"]);
        if (completed >= 10) setBadges(["Ace"]);
      }
    } catch (err) {
      console.error("Error loading dashboard", err);
    }
  };

  const handleCertificate = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/student/certificate", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        return Swal.fire(
          "Not Eligible",
          data.message || "Cannot issue certificate",
          "error"
        );
      }

      const downloadRes = await fetch(
        "http://localhost:5000/api/student/certificate/download",
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (!downloadRes.ok) {
        return Swal.fire("Error", "Failed to download certificate", "error");
      }

      // Convert stream to Blob and trigger download
      const blob = await downloadRes.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Certificate-${user.name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire(
        "🎉 Success!",
        "Certificate downloaded successfully.",
        "success"
      );
    } catch (error) {
      Swal.fire("Error", "Something went wrong", "error");
      console.error(error);
    }
  };

  const chartData = [
    { name: "Completed", value: taskStats.completed },
    { name: "Remaining", value: taskStats.total - taskStats.completed },
  ];
  const COLORS = ["#00c49f", "#ff8042"];
  if (user?.role === "admin") return <AdminDashboard />;
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Welcome, {user && user.name}</h2>
        <p className="dashboard-subtitle">
          Track your progress and achievements
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Task Progress Section */}
        <div className="chart-section">
          <div className="section-header">
            <h3>Task Progress</h3>
            <div className="progress-stats">
              <span className="stat-item">
                <span className="stat-number">{taskStats.completed}</span>
                <span className="stat-label">Completed</span>
              </span>
              <span className="stat-divider">/</span>
              <span className="stat-item">
                <span className="stat-number">{taskStats.total}</span>
                <span className="stat-label">Total</span>
              </span>
            </div>
          </div>

          <div className="chart-container">
            {user && !courseEnrolled ? (
              <div className="no-data-container">
                <div className="no-data-icon">📚</div>
                <p className="no-data-msg">
                  You haven't enrolled in any course yet.
                </p>
                <button
                  className="browse-courses-btn"
                  onClick={() => navigate("/courses")}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <PieChart width={280} height={280}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </div>
        </div>

        {/* Account Info Section */}
        <div className="account-section">
          <div className="balance-card">
            <div className="card-header" onClick={() => navigate("/topup")}>
              <h4>Account Balance</h4>
              <div className="balance-amount">
                <span className="currency">₹</span>
                <span className="amount">{balance}</span>
              </div>
            </div>
            {balance < 0 && (
              <div className="alert-container">
                <div className="negative-alert">
                  <span className="alert-icon">⚠️</span>
                  {/* <button
                    className="topup-btn"
                    onClick={() => navigate("/topup")}
                  >
                    💳 Add Money
                  </button> */}

                  <span>Your balance is negative! Please top up.</span>
                </div>
              </div>
            )}
          </div>

          <div className="badges-card">
            <div className="card-header">
              <h4>Badges Earned</h4>
              <span className="badge-count">{badges.length}</span>
            </div>
            <div className="badges-container">
              {badges.length === 0 ? (
                <div className="no-badges">
                  <div className="no-badges-icon">🏆</div>
                  <p>No badges yet</p>
                  <p className="no-badges-hint">
                    Complete tasks to earn badges!
                  </p>
                </div>
              ) : (
                <div className="badges-list">
                  {badges.map((badge) => (
                    <div key={badge} className="badge-item">
                      <span className="badge-icon">🏅</span>
                      <span className="badge-name">{badge}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button className="certificate-btn" onClick={handleCertificate}>
            <span className="btn-icon">📜</span>
            Get Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
