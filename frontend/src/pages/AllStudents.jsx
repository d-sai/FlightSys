// AllStudents.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/AllStudents.css";

const AllStudents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 8;

  useEffect(() => {
    if (user) fetchStudents();
  }, [user]);

  // useEffect(() => {
  //   let timeoutId; // Declare a variable to store the timeout ID

  //   if (user) {
  //     // 1. First execution (default fetch)
  //     fetchStudents();
  //     console.log("Initial fetchStudents triggered.");

  //     // 2. Schedule the second execution after 10 seconds
  //     timeoutId = setTimeout(() => {
  //       fetchStudents();
  //       console.log("Delayed fetchStudents triggered after 10 seconds.");
  //     }, 10000); // 10000 milliseconds = 10 seconds
  //   }

  //   // Cleanup function:
  //   // This is crucial to prevent memory leaks and unwanted behavior
  //   // if the 'user' dependency changes again before the timeout fires,
  //   // or if the component unmounts.
  //   return () => {
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //       console.log("Cleanup: Cleared pending timeout.");
  //     }
  //   };
  // }, [user]); // Dependency array: Effect runs when 'user' changes

  // return (
  //   <div>
  //     {/* Your component's JSX */}
  //     <p>User status: {user ? 'Logged in' : 'Logged out'}</p>
  //   </div>
  // );
  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/admin/students", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      console.log(data);
      
      setStudents(data);
    } catch (err) {
      console.error("Failed to load student list", err);
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * studentsPerPage;
  const indexOfFirst = indexOfLast - studentsPerPage;
  const currentStudents = students.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(students.length / studentsPerPage);

  return (
    <div className="students-container">
      <h2 className="students-title">👥 All Registered Students</h2>

      {students.length === 0 ? (
        <p className="no-students">No students found.</p>
      ) : (
        <>
          <table className="students-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Enrolled Course</th>
                <th>Balance (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((s, idx) => (
                <tr key={s._id}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td data-label="Name">{s.name}</td>
                  <td data-label="Email">{s.email}</td>
                  <td data-label="Course">
                    {/* {console.log("enrolled couruse:",s.enrolledCourse?.title)}; */}
                    {/* {s && s.enrolledCourse && s.enrolledCourse?.title || "Not Enrolled"} */}
                    {(s.enrolledCourse) ? "Enrolled":"Not Enrolled" }
                  </td>
                  <td data-label="Balance">₹{s.balance}</td>
                  <td data-label="Action">
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/admin/student/${s._id}`)}
                    >
                      🔍 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, idx) => (
              <button
                key={idx + 1}
                className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AllStudents;
