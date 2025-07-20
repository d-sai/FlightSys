// src/components/NotificationPanel.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/Notifications.css";

const NotificationPanel = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const endpoint = isAdmin
      ? "http://localhost:5000/api/admin/notifications"
      : "http://localhost:5000/api/student/notifications";

    fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Notification fetch error:", err));
  }, []);

  return (
    <div className="notification-sidebar">
      <div className="notification-header">
        <h3>🔔 Notifications</h3>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="no-data">No notifications yet.</p>
        ) : (
          notifications.map((notif, index) => (
            <div key={index} className={`notif-card type-${notif.type}`}>
              <p className="notif-msg">
                {isAdmin &&
                notif.message.includes(
                  "Congratulations! You completed the course:"
                )
                  ? notif.message.replace(
                      "Congratulations! You completed the course:",
                      "Completed the course:"
                    )
                  : notif.message}
              </p>

              {/* <p className="notif-msg">{notif.message}</p> */}
              {isAdmin && notif.user && (
                <p className="notif-meta">
                  👤 {notif.user.name} ({notif.user.email})
                </p>
              )}

              <p className="notif-date">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;

// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import '../styles/Notifications.css';

// const Notifications = () => {
//   const { user } = useAuth();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const isAdmin = user?.role === 'admin';
//   const endpoint = isAdmin
//     ? 'http://localhost:5000/api/admin/notifications'
//     : 'http://localhost:5000/api/notifications';

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       const res = await fetch(endpoint, {
//         headers: {
//           Authorization: `Bearer ${user.token}`,
//         },
//       });

//       const data = await res.json();
//       setNotifications(data);
//     } catch (err) {
//       console.error('Error fetching notifications:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="notification-loading">Loading notifications...</div>;

//   return (
//     <div className="notifications-page">
//       <h2 className="notifications-title">🔔 Notifications</h2>

//       {notifications.length === 0 ? (
//         <p className="no-notifications">No notifications yet.</p>
//       ) : (
//         <ul className="notification-list">
//           {notifications.map((notif, index) => (
//             <li key={index} className={`notification-card type-${notif.type}`}>
//               <div className="notification-content">
//                 <p className="notification-message">{notif.message}</p>
//                 <p className="notification-date">
//                   {new Date(notif.createdAt).toLocaleString()}
//                 </p>
//               </div>

//               {isAdmin && notif.user && (
//                 <div className="notification-meta">
//                   👤 {notif.user.name} ({notif.user.email})
//                 </div>
//               )}

//               <div className="notification-type">#{notif.type}</div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Notifications;
