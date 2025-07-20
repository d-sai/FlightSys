import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles/CompleteTask.css';

const Completetask = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/student/tasks', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await res.json();
      setTasks(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setLoading(false);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const res = await fetch('http://localhost:5000/api/student/complete-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ taskId })
      });

      const data = await res.json();
      console.log("handle Complete data: ",data);
      
      if (!res.ok) {
        return Swal.fire('Error', data.message || 'Could not complete task', 'error');
      }

      Swal.fire('Task Completed!', data.message || 'Successfully completed the task', 'success');
      fetchTasks();
    } catch (err) {
      console.error('Error completing task:', err);
      Swal.fire('Error', 'Something went wrong.', 'error');
    }
  };

  return (
    <div className="ct-complete-task-container">
      <div className="ct-hero-section">
        <div className="ct-hero-content">
          <h2 className="ct-hero-title">Your Assigned Tasks</h2>
          <div className="ct-hero-decoration">
            <div className="ct-floating-icon">📋</div>
            <div className="ct-floating-icon ct-delay-1">⚡</div>
            <div className="ct-floating-icon ct-delay-2">🎯</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="ct-loading-container">
          <div className="ct-loading-spinner">
            <div className="ct-spinner"></div>
            <p>Loading your tasks...</p>
          </div>
        </div>
      ) : (
        <>
          {tasks.length === 0 ? (
            <div className="ct-no-tasks-message">
              <div className="ct-empty-state">
                <div className="ct-empty-icon">🚫</div>
                <h3>No Tasks Yet</h3>
                <p>You haven't enrolled in any course yet.</p>
                <button className="ct-browse-btn" onClick={() => navigate('/courses')}>
                  <span>Browse Courses</span>
                  <div className="ct-btn-shine"></div>
                </button>
              </div>
            </div>
          ) : (
            <div className="ct-task-grid">
              {tasks.map((task, index) => (
                <div 
                  key={task._id} 
                  className={`ct-task-card ${task.status === 'completed' ? 'ct-completed' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="ct-task-header">
                    <h4>{task.title}</h4>
                    <div className={`ct-status-badge ${task.status === 'completed' ? 'ct-completed' : 'ct-pending'}`}>
                      {task.status === 'completed' ? '✅' : '⏳'}
                    </div>
                  </div>
                  
                  <p className="ct-task-description">{task.description}</p>
                  
                  <div className="ct-task-meta">
                    <div className="ct-price-tag">
                      <span className="ct-currency">₹</span>
                      <span className="ct-amount">{task.price}</span>
                    </div>
                    <div className={`ct-status-text ${task.status === 'completed' ? 'ct-completed' : 'ct-pending'}`}>
                      {task.status === 'completed' ? 'Completed' : 'Pending'}
                    </div>
                  </div>
                  
                  {task.status !== 'completed' && (
                    <button 
                      onClick={() => handleComplete(task._id)} 
                      className="ct-complete-btn"
                    >
                      <span>Mark as Complete</span>
                      <div className="ct-btn-glow"></div>
                    </button>
                  )}
                  
                  <div className="ct-card-overlay"></div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Completetask;