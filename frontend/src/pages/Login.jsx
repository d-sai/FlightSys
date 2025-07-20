import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [focusedField, setFocusedField] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.3,
      color: Math.random() > 0.5 ? '#00e5ff' : '#0097a7',
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('#', 'rgba(').replace(/^rgba\(([^,]+)/, (match, hex) => {
          const r = parseInt(hex.slice(0, 2), 16);
          const g = parseInt(hex.slice(2, 4), 16);
          const b = parseInt(hex.slice(4, 6), 16);
          return `rgba(${r}, ${g}, ${b}`;
        });
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire('Error', data.message || 'Login failed', 'error');
      }

      login(data);
      Swal.fire('Success', `Welcome ${data.name}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  // Floating aircraft illustrations
  const FloatingAircraft = ({ delay = 0, direction = 1 }) => (
    <motion.div
      className="floating-aircraft"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        y: [0, -20, 0],
        x: [0, direction * 10, 0]
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut"
      }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <defs>
          <linearGradient id={`aircraftGradient${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0097a7" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          d="M30 10 L50 30 L40 35 L30 50 L20 35 L10 30 Z"
          fill={`url(#aircraftGradient${delay})`}
          stroke="#00e5ff"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </motion.div>
  );

  return (
    <div className="login-container">
      {/* Animated background canvas */}
      <canvas ref={canvasRef} className="background-canvas" />
      
      {/* Gradient overlays */}
      <div className="gradient-overlay" />
      <div className="noise-overlay" />
      
      {/* Floating aircraft decorations */}
      <FloatingAircraft delay={0} direction={1} />
      <FloatingAircraft delay={1.5} direction={-1} />
      <FloatingAircraft delay={3} direction={1} />
      
      {/* Side decorative elements */}
      <div className="side-decoration left">
        <div className="decoration-line"></div>
        <div className="decoration-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>
      
      <div className="side-decoration right">
        <div className="decoration-line"></div>
        <div className="decoration-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>

      {/* Main login form */}
      <motion.div
        className="login-form-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="form-header">
          <motion.div
            className="form-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00e5ff" />
                  <stop offset="100%" stopColor="#0097a7" />
                </linearGradient>
              </defs>
              <circle cx="25" cy="25" r="20" fill="url(#iconGradient)" opacity="0.2" />
              <path
                d="M25 10 L40 25 L32 28 L25 40 L18 28 L10 25 Z"
                fill="url(#iconGradient)"
                stroke="#00e5ff"
                strokeWidth="2"
              />
            </svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Welcome Back to <br/><span className="highlight">Fly8</span>
          </motion.h2>
          <motion.p
            className="form-subtitle"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Ready to continue your aviation journey?
          </motion.p>
        </div>

        <motion.form
          className="login-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="input-group">
            <motion.div
              className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''}`}
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
              <div className="input-icon">✉️</div>
            </motion.div>

            <motion.div
              className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''}`}
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
              <div className="input-icon">🔒</div>
            </motion.div>
          </div>

          <motion.button
            type="submit"
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <span className="button-text">Take Flight</span>
            <div className="button-shine"></div>
          </motion.button>

          <motion.div
            className="form-footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <p>New to FlightSys? <a href="/register">Create Account</a></p>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default Login;