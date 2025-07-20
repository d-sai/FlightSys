// src/pages/StudentProfile.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import "../styles/StudentProfile.css";

const StudentProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
  }, []);

  const fetchStudentDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/student/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setStudent(data);
    } catch (err) {
      console.error("Error loading student", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    const confirm = await Swal.fire({
      title: "Unenroll student?",
      text: "This will remove the student from their current course.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Unenroll",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:5000/api/student/unenroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: id }), // confirm that backend expects this
      });
      const data = await res.json();

      if (!res.ok) return Swal.fire("Error", data.message, "error");

      Swal.fire("Success", "Student has been unenrolled", "success");
      fetchStudentDetails(); // refresh state
    } catch (err) {
      Swal.fire("Error", "Failed to unenroll student", "error");
    }
  };

  if (loading) return <div className="profile-loading">Loading...</div>;
  if (!student) return <div className="profile-error">Student not found</div>;

  const { name, email, enrolledCourse, completedTasks, balance, transactions } =
    student;

  return (
    <div className="student-profile-container">
      <div className="profile-header">
        <h2>{name}</h2>
        <p>{email}</p>
        <p className="balance">💰 Balance: ₹{balance}</p>
        {enrolledCourse ? (
          <p className="course-info">🎓 Enrolled in: {enrolledCourse.title}</p>
        ) : (
          <p className="course-info not-enrolled">
            ❌ Not enrolled in any course
          </p>
        )}
      </div>

      {/* {enrolledCourse && (
        <div className="task-section">
          <h3>Tasks for {enrolledCourse.title}</h3>
          <ul className="task-list">
            {enrolledCourse.tasks.map((task) => (
              <li key={task._id}>
                {task.title} — ₹{task.price} — {completedTasks.includes(task._id) ? '✅ Completed' : '❌ Pending'}
              </li>
            ))}
          </ul>
          <button className="unenroll-btn" onClick={handleUnenroll}>Unenroll Student</button>
        </div>
      )} */}
      {enrolledCourse && (
        <div className="section-card">
          <h3 className="section-title">Tasks for {enrolledCourse.title}</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrolledCourse.tasks.map((task) => (
                <tr key={task._id}>
                  <td>{task.title}</td>
                  <td>₹{task.price}</td>
                  <td>
                    {completedTasks.includes(task._id)
                      ? "✅ Completed"
                      : "❌ Pending"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="unenroll-btn" onClick={handleUnenroll}>
            Unenroll Student
          </button>
        </div>
      )}

      {/* <div className="transactions-section">
        <h3>Transaction History</h3>
        {transactions?.length > 0 ? (
          <ul className="transaction-list">
            {transactions.map((txn, i) => (
              <li key={i}>
                {txn.date.slice(0, 10)} | {txn.type.toUpperCase()} →{" "}
                {txn.reference} — ₹{txn.amount}
              </li>
            ))}
          </ul>
        ) : (
          <p>No transactions yet.</p>
        )}
      </div> */}
      {/* Transaction History */}
      <div className="section-card">
        <h3 className="section-title">Transaction History</h3>
        {transactions?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, i) => (
                <tr key={i}>
                  <td>{new Date(txn.date).toLocaleDateString()}</td>
                  <td>{txn.type}</td>
                  <td>{txn.reference}</td>
                  <td>₹{txn.amount}</td>
                  <td>₹{txn.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions yet.</p>
        )}
      </div>

      <button className="back-btn" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>
    </div>
  );
};

export default StudentProfile;
