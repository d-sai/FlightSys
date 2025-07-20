import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/Courses.css';
const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  // const [enrolledCourseId, setEnrolledCourseId] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  // if(user && user.role==='student'){
  //   // console.log("user:", user.enrolled._id)
  //   setEnrolledCourseId(user.enrolled.-id);
  // }
  useEffect(() => {
    // if (!user) return navigate('/login');
    if (user)    fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      // console.log("get /courses: ",data);
      
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const res = await fetch('http://localhost:5000/api/student/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ courseId })
      });

      const data = await res.json();
      if (!res.ok) return Swal.fire('Error', data.message, 'error');

      Swal.fire('Enrolled', 'You have successfully enrolled', 'success');
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCourseId(prev => (prev === id ? null : id));
  };

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h2>Available Courses</h2>
        <div className="courses-stats">
          <span className="stats-item">
            <span className="stats-number">{courses.length}</span>
            <span className="stats-label">Total Courses</span>
          </span>
          {
            user && user.role==='student'&& <span className="stats-item">
            {/* <span className="stats-number">{courses.filter(c => c.enrolled).length}</span> */}
            {/* {console.log("before 73:", user && user.role==='student' && user.enrolled._id)} */}
            <span className="stats-number">{user && user.role==='student' && user.enrolled && user.enrolled._id?1:0}</span>
            <span className="stats-label">Enrolled</span>
          </span>
          }
          
        </div>
      </div>

      <div className="course-list">
        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <p>No courses available at the moment</p>
            <span>Check back later for new courses</span>
          </div>
        ) : (
          courses.map(course => (
            <div key={course._id} className={`course-card ${user && user.role==='student' && user.enrolled && user.enrolled._id === course._id ? 'enrolled' : ''}`}>
              <div className="course-header">
              {/* {console.log("enrolledCourseId:",enrolledCourseId)} */}
                <div className="course-title-section">
                  <h3>{course.title}</h3>
                  {/* {enrolledCourseId === course._id && ( */}
                  {user && user.enrolled && user.enrolled._id === course._id && (
                    <span className="enrolled-badge">✓ Enrolled</span>
                  )}
                </div>
                <div className="course-meta">
                  <div className="meta-item">
                    <span className="meta-label">Price</span>
                    <span className="meta-value">₹{course.price}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Tasks</span>
                    <span className="meta-value">{course.tasks.length}</span>
                  </div>
                </div>
              </div>
 
              <div className="course-actions">
                {user && user.role !== 'admin' && user.enrolled && user.role === 'student' && user.enrolled._id === course._id ? (
  <button className="btn-enrolled" disabled>
    <span className="btn-icon">✓</span>
    Already Enrolled
  </button>
) : user && user.role !== 'admin' ? (
  <button className="btn-enroll" onClick={() => handleEnroll(course._id)}>
    <span className="btn-icon">+</span>
    Enroll Now
  </button>
) : null}
                {/* {user && user.enrolled && user.role==='admin' && user.enrolled._id === course._id ? (
                  <button className="btn-enrolled" disabled>
                    <span className="btn-icon">✓</span>
                    Already Enrolled
                  </button>
                ) : (
                  <button className="btn-enroll" onClick={() => handleEnroll(course._id)}>
                    <span className="btn-icon">+</span>
                    Enroll Now
                  </button>
                )} */}
                <button 
                  className="btn-toggle" 
                  onClick={() => toggleExpand(course._id)}
                  aria-expanded={expandedCourseId === course._id}
                >
                  <span className="btn-icon">
                    {expandedCourseId === course._id ? '−' : '+'}
                  </span>
                  {expandedCourseId === course._id ? 'Hide Tasks' : 'View Tasks'}
                </button>
              </div>

              {expandedCourseId === course._id && (
                <div className="task-list">
                  <div className="task-header">
                    <h4>Course Tasks</h4>
                    <span className="task-count">{course.tasks.length} tasks</span>
                  </div>
                  {course.tasks.map((task, index) => (
                    <div key={task._id} className="task-item">
                      <div className="task-number">{index + 1}</div>
                      <div className="task-content">
                        <div className="task-title">{task.title}</div>
                        <div className="task-details">
                          <span className="task-price">₹{task.price}</span>
                          {console.log("task.subscribed: ",task)
                          }
                          {/* <span className={`task-status ${task.subscribed ? 'subscribed' : 'not-subscribed'}`}>
                            {task.subscribed ? '✓ Subscribed' : '○ Not Subscribed'}
                          </span> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        {/* <button className="quiz-btn" onClick={() => navigate("/quiz")}>
        🎯 Take Pilot Quiz
      </button> */}
      </div>
      {/* <button onClick={<QuizGame/>}>explore</button> */}
      {user && user.role==='student' && <button className="quiz-btn" onClick={() => navigate("/quiz")}>
        🎯 Take Pilot Quiz
      </button>}
    </div>
  );
};

export default Courses;