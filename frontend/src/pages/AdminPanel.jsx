import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/AdminPanel.css";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPrice, setTaskPrice] = useState("");

  const [editingCourse, setEditingCourse] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    // if (!user || user.role !== "admin") return navigate("/");
    if(user && user.role ==='admin') fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  const handleCourseCreate = async (e) => {
    e.preventDefault();
    if (!title || !description || !price) {
      return Swal.fire(
        "Missing Fields",
        "Please fill all course fields",
        "warning"
      );
    }
    try {
      const res = await fetch("http://localhost:5000/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title, description, price }),
      });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.message, "error");

      Swal.fire("Success", "Course created!", "success");
      setTitle("");
      setDescription("");
      setPrice("");
      fetchCourses();
    } catch (err) {
      console.error("Error creating course", err);
    }
  };

  const handleTaskAdd = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !taskTitle || !taskDesc || !taskPrice) {
      return Swal.fire(
        "Missing Fields",
        "Please complete all task fields",
        "warning"
      );
    }
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          price: taskPrice,
          courseId: selectedCourse,
        }),
      });
      const data = await res.json();
      if (!res.ok) return Swal.fire("Error", data.message, "error");

      Swal.fire("Task Added", "Task added to course successfully", "success");
      setTaskTitle("");
      setTaskDesc("");
      setTaskPrice("");
      fetchCourses();
    } catch (err) {
      console.error("Error adding task", err);
    }
  };

  const handleDeleteCourse = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this course?",
      text: "This action is irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    await fetch(`http://localhost:5000/api/courses/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    Swal.fire("Deleted!", "Course has been deleted.", "success");
    fetchCourses();
    console.log("Delete course:", id);
  };

  // Placeholder functions for edit and delete - you can implement these
  //   const handleEditCourse = async (courseId) => {
  // Add your edit logic here
  // console.log("Edit course:", courseId);
  //   };
  //   const handleEditTask = (taskId, courseId) => {
  // Add your edit task logic here
  // console.log("Edit task:", taskId, "in course:", courseId);
  //   };
  const handleEditCourse = (courseId) => {
    const course = courses.find((c) => c._id === courseId);
    if (course) {
      setEditingCourse({ ...course }); // open modal
    }
  };

  const handleEditTask = (taskId, courseId) => {
    const course = courses.find((c) => c._id === courseId);
    const task = course?.tasks.find((t) => t._id === taskId);
    if (task) {
      setEditingTask({ ...task });
    }
  };

  const handleDeleteTask = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete this task?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!confirm.isConfirmed) return;

    await fetch(`http://localhost:5000/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    });
    Swal.fire("Deleted!", "Task deleted.", "success");
    fetchCourses();
    // };
    // const handleDeleteTask = (taskId, courseId) => {
    // Add your delete task logic here
    console.log("Delete task:", id);
  };

  return (
    <div className="admin-panel">
      <div className="background-animation">
        <div className="floating-circle floating-circle-1"></div>
        <div className="floating-circle floating-circle-2"></div>
        <div className="floating-circle floating-circle-3"></div>
      </div>

      <div className="container">
        <div className="header">
          <h2 className="main-title">
            <span className="title-icon">⚡</span>
            Admin Corner
            <span className="title-icon">⚡</span>
          </h2>
          <p className="subtitle">Manage courses and tasks with ease</p>
        </div>

        <div className="grid-container">
          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">📚</span>
              <h3 className="section-title">Create New Course</h3>
            </div>
            <form onSubmit={handleCourseCreate} className="form">
              <div className="input-group">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Course Title"
                  required
                  className="form-input"
                />
                <div className="input-border"></div>
              </div>
              <div className="input-group">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Course Description"
                  required
                  className="form-input"
                />
                <div className="input-border"></div>
              </div>
              <div className="input-group">
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Course Price (₹)"
                  required
                  className="form-input"
                />
                <div className="input-border"></div>
              </div>
              <button type="submit" className="btn btn-primary">
                <span className="button-icon">✨</span>
                Create Course
              </button>
            </form>
          </div>

          <div className="form-section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h3 className="section-title">Add Task to Course</h3>
            </div>
            <form onSubmit={handleTaskAdd} className="form">
              <div className="input-group">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <div className="input-border"></div>
              </div>
              <div className="input-group">
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task Title"
                  required
                  className="form-input"
                />
                <div className="input-border"></div>
              </div>
              <div className="input-group">
                <input
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Task Description"
                  required
                  className="form-input"
                />
                <div className="input-border"></div>
              </div>
              <div className="input-group">
                <input
                  type="number"
                  value={taskPrice}
                  onChange={(e) => setTaskPrice(e.target.value)}
                  placeholder="Task Price (₹)"
                  required
                  className="form-input"
                />
                <div className="input-border"></div>
              </div>
              <button type="submit" className="btn btn-secondary">
                <span className="button-icon">➕</span>
                Add Task
              </button>
            </form>
          </div>
        </div>

        <div className="course-list-section">
          <div className="section-header">
            <span className="section-icon">🎓</span>
            <h3 className="section-title">Existing Courses</h3>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p className="empty-text">
                No courses found. Create your first course!
              </p>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-header">
                    <h4 className="course-title">{course.title}</h4>
                    <div className="course-actions">
                      <div className="price-tag">₹{course.price}</div>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditCourse(course._id)}
                          title="Edit Course"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteCourse(course._id)}
                          title="Delete Course"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="course-description">
                    <p className="course-desc-text">{course.description}</p>
                  </div>
                  <div className="tasks-container">
                    <h5 className="tasks-title">Tasks:</h5>
                    {course.tasks && course.tasks.length > 0 ? (
                      <ul className="tasks-list">
                        {course.tasks.map((task) => (
                          <li key={task._id} className="task-item">
                            <div className="task-info">
                              <span className="task-name">{task.title}</span>
                              <span className="task-price">₹{task.price}</span>
                            </div>
                            <div className="task-actions">
                              <button
                                className="action-btn task-edit-btn"
                                onClick={() =>
                                  handleEditTask(task._id, course._id)
                                }
                                title="Edit Task"
                              >
                                ✏️
                              </button>
                              <button
                                className="action-btn task-delete-btn"
                                onClick={() =>
                                  handleDeleteTask(task._id, course._id)
                                }
                                title="Delete Task"
                              >
                                🗑️
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-tasks">No tasks added yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Course</h3>
            <input
              value={editingCourse.title}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, title: e.target.value })
              }
              placeholder="Course Title"
            />
            <input
              value={editingCourse.description}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  description: e.target.value,
                })
              }
              placeholder="Course Description"
            />
            <input
              type="number"
              value={editingCourse.price}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, price: e.target.value })
              }
              placeholder="Course Price"
            />
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:5000/api/courses/${editingCourse._id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${user.token}`,
                        },
                        body: JSON.stringify(editingCourse),
                      }
                    );
                    if (!res.ok) {
                      const errData = await res.json();
                      return Swal.fire("Error", errData.message, "error");
                    }
                    Swal.fire("Updated!", "Course updated", "success");
                    setEditingCourse(null);
                    fetchCourses();
                  } catch (err) {
                    Swal.fire("Error", "Failed to update course", "error");
                  }
                }}
              >
                Save
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setEditingCourse(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Task</h3>
            <input
              value={editingTask.title}
              onChange={(e) =>
                setEditingTask({ ...editingTask, title: e.target.value })
              }
              placeholder="Task Title"
            />
            <input
              value={editingTask.description}
              onChange={(e) =>
                setEditingTask({ ...editingTask, description: e.target.value })
              }
              placeholder="Task Description"
            />
            <input
              type="number"
              value={editingTask.price}
              onChange={(e) =>
                setEditingTask({ ...editingTask, price: e.target.value })
              }
              placeholder="Task Price"
            />
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={async () => {
                  try {
                    const res = await fetch(
                      `http://localhost:5000/api/tasks/${editingTask._id}`,
                      {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${user.token}`,
                        },
                        body: JSON.stringify(editingTask),
                      }
                    );
                    if (!res.ok) {
                      const errData = await res.json();
                      return Swal.fire("Error", errData.message, "error");
                    }
                    Swal.fire("Updated!", "Task updated", "success");
                    setEditingTask(null);
                    fetchCourses();
                  } catch (err) {
                    Swal.fire("Error", "Failed to update task", "error");
                  }
                }}
              >
                Save
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setEditingTask(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
