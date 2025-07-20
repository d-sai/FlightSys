import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Notifications from "../pages/Notifications";
import "../styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const handleNav = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => handleNav("/")}>
          ✈️ Fly8
        </div>

        <div
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`navbar-links ${menuOpen ? "show" : ""}`}>
          <li onClick={() => handleNav("/")}>Home</li>

          {!user ? (
            <>
              <li onClick={() => handleNav("/login")}>Login</li>
              <li onClick={() => handleNav("/register")}>Register</li>
            </>
          ) : (
            <>
              <li onClick={() => handleNav("/courses")}>Courses</li>
              <li onClick={() => handleNav("/dashboard")}>Dashboard</li>
              {user.role === "student" && (
                <li onClick={() => handleNav("/complete-task")}>
                  Complete Tasks
                </li>
              )}
              <li onClick={() => handleNav("/transactions")}>Transactions</li>
              {user.role === "admin" && (
                <li onClick={() => handleNav("/admin")}>Admin Panel</li>
              )}
              <li className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                🔔
              </li>
              <li
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </li>
            </>
          )}
        </ul>
      </nav>
      {showNotifications && (
        <Notifications onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
};

export default Navbar;
