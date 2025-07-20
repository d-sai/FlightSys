import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import AdminPanel from "./pages/AdminPanel";
import Completetask from "./pages/Completetask";
import TransactionHistory from "./pages/TransactionHistory";
import AllStudents from "./pages/AllStudents";
import StudentProfile from "./pages/StudentProfile";
import TopUp from "./pages/TopUp"; // Import the new TopUp page
import QuizGame from "./pages/QuizGame";
function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/complete-task" element={<Completetask />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/students" element={<AllStudents />} />
          <Route path="/admin/student/:id" element={<StudentProfile />} />
          <Route path="/topup" element={<TopUp />} />
          <Route path="/quiz" element={<QuizGame />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
