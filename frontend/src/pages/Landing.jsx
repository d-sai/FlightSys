// src/pages/Landing.jsx

import React, { useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import "../styles/Landing.css";
import { useNavigate } from "react-router-dom";
import Chatbot from '../components/Chatbot';

const Landing = () => {
  const navigate = useNavigate();
  const planeControls = useAnimation();
  const canvasRef = useRef(null);

  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
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
        ctx.fillStyle = `rgba(0, 229, 255, ${particle.opacity})`;
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

  // Airplane animation
  useEffect(() => {
    planeControls.start({
      x: ["0vw", "100vw"], 
    y: ["50vh", "-30vh"],
    //   x: ["-20vw", "100vw"],
    //   y: ["10vh", "30vh"],
      rotate: [0, -15, -35, -40, -90],
      transition: { duration: 8, repeat: Infinity, ease: "easeInOut" },
    });
  }, [planeControls]);

  // Detailed Airplane SVG Component
  const AirplaneIcon = () => (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="airplane-svg">
      <defs>
        <linearGradient id="airplaneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="50%" stopColor="#0097a7" />
          <stop offset="100%" stopColor="#00bcd4" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Main fuselage */}
      <ellipse cx="60" cy="60" rx="45" ry="8" fill="url(#airplaneGradient)" filter="url(#glow)"/>
      
      {/* Wings */}
      <ellipse cx="60" cy="60" rx="20" ry="35" fill="url(#airplaneGradient)" opacity="0.9"/>
      
      {/* Nose */}
      <ellipse cx="95" cy="60" rx="15" ry="6" fill="#ffffff" opacity="0.8"/>
      
      {/* Tail */}
      <ellipse cx="25" cy="60" rx="8" ry="15" fill="url(#airplaneGradient)" opacity="0.7"/>
      
      {/* Cockpit */}
      <circle cx="75" cy="60" r="4" fill="#ffffff" opacity="0.9"/>
      
      {/* Wing details */}
      <ellipse cx="60" cy="45" rx="15" ry="3" fill="#ffffff" opacity="0.3"/>
      <ellipse cx="60" cy="75" rx="15" ry="3" fill="#ffffff" opacity="0.3"/>
      
      {/* Engine details */}
      <circle cx="85" cy="60" r="3" fill="#00e5ff" opacity="0.8"/>
      <circle cx="85" cy="60" r="1.5" fill="#ffffff"/>
    </svg>
  );

  return (
    <div className="landing-container">
      {/* Animated background canvas */}
      <canvas 
        ref={canvasRef} 
        className="background-canvas"
      />
      
      {/* Gradient overlays */}
      <div className="gradient-overlay" />
      <div className="noise-overlay" />
      
      {/* Flying Airplane Animation */}
      <motion.div
        className="plane-animation"
        animate={planeControls}
      >
        <AirplaneIcon />
      </motion.div>

      {/* Hero Section */}
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: -80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <div className="hero-accent-line" />
        <motion.h1 
          className="hero-title"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        >
          <span className="title-gradient">Command the Skies</span>
          <br />
          <span className="title-outline">with Confidence</span>
        </motion.h1>
        
        <motion.p 
          className="hero-subtitle"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        >
          Advanced pilot training courses with real-time progress, gamified
          tasks, and intelligent certification.
        </motion.p>
        
        <motion.div
          className="hero-button-container"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.9 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0, 188, 212, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="hero-button"
            onClick={() => navigate("/login")}
          >
            <span className="button-text">Launch Cockpit</span>
            <div className="button-shine" />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="features-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <span className="features-accent">Mission Ready</span> Features
        </motion.h2>
        
        <div className="features-grid">
          {[
            {
              title: "Dynamic Progress Charts",
              description: "Track your journey with interactive real-time graphs and milestones."
            },
            {
              title: "Badge Rewards",
              description: "Achieve skill milestones and unlock badges as you progress."
            },
            {
              title: "Instant Certification",
              description: "Download your personalized certificate after training completion."
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              viewport={{ once: true }}
            >
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-glow" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Training Programs Section */}
      <motion.div
        className="programs-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="programs-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <span className="programs-accent">Elite Training</span> Programs
        </motion.h2>
        
        <div className="programs-grid">
          {[
            {
              title: "Private Pilot License",
              duration: "8-12 months",
              description: "Master the fundamentals of flight with comprehensive ground school and flight training.",
              level: "Beginner"
            },
            {
              title: "Commercial Pilot License",
              duration: "12-18 months",
              description: "Advanced flight training for professional aviation careers with instrument rating.",
              level: "Advanced"
            },
            {
              title: "Airline Transport Pilot",
              duration: "18-24 months",
              description: "Elite certification for airline pilots with multi-engine and turbine experience.",
              level: "Expert"
            }
          ].map((program, index) => (
            <motion.div 
              key={index}
              className="program-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              viewport={{ once: true }}
            >
              <div className="program-header">
                <span className="program-level">{program.level}</span>
                <span className="program-duration">{program.duration}</span>
              </div>
              <h3 className="program-title">{program.title}</h3>
              <p className="program-description">{program.description}</p>
              <div className="program-glow" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Statistics Section */}
      <motion.div
        className="stats-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="stats-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <span className="stats-accent">Flight</span> Statistics
        </motion.h2>
        
        <div className="stats-grid">
          {[
            {
              number: "2,500+",
              label: "Certified Pilots",
              description: "Successfully trained and certified"
            },
            {
              number: "98%",
              label: "Pass Rate",
              description: "First-time certification success"
            },
            {
              number: "150+",
              label: "Flight Hours",
              description: "Average training completion"
            },
            {
              number: "24/7",
              label: "Support",
              description: "Round-the-clock assistance"
            }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              whileHover={{ 
                y: -5, 
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
              viewport={{ once: true }}
            >
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-description">{stat.description}</div>
              <div className="stat-glow" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        className="testimonials-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.h2 
          className="testimonials-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <span className="testimonials-accent">Pilot</span> Testimonials
        </motion.h2>
        
        <div className="testimonials-grid">
          {[
            {
              name: "Captain Sarah Johnson",
              role: "Commercial Airline Pilot",
              testimonial: "The training program transformed my flying skills. The real-time feedback and gamified approach made learning engaging and effective.",
              rating: 5
            },
            {
              name: "Lt. Michael Chen",
              role: "Military Pilot",
              testimonial: "Outstanding curriculum with practical scenarios. The certification process was seamless and the support team was exceptional.",
              rating: 5
            },
            {
              name: "Emma Rodriguez",
              role: "Private Pilot",
              testimonial: "From zero experience to certified pilot in 10 months. The progress tracking and badge system kept me motivated throughout.",
              rating: 5
            }
          ].map((testimonial, index) => (
            <motion.div 
              key={index}
              className="testimonial-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              viewport={{ once: true }}
            >
              <div className="testimonial-content">
                <div className="testimonial-stars">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <span key={i} className="star">★</span>
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.testimonial}"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-name">{testimonial.name}</div>
                <div className="author-role">{testimonial.role}</div>
              </div>
              <div className="testimonial-glow" />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action Section */}
      <motion.div
        className="cta-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        viewport={{ once: true }}
      >
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="cta-accent-line" />
          <h2 className="cta-title">
            <span className="cta-gradient">Ready to Take Flight?</span>
          </h2>
          <p className="cta-subtitle">
            Join thousands of pilots who have achieved their aviation dreams through our comprehensive training programs.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(0, 188, 212, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="cta-button"
            onClick={() => navigate("/login")}
          >
            <span className="button-text">Start Your Journey</span>
            <div className="button-shine" />
          </motion.button>
        </motion.div>
      </motion.div>
      <Chatbot />

    </div>
  );
};

export default Landing;