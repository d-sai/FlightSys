// src/pages/TopUp.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/TopUp.css";

const TopUp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");

  const handleTopUp = async (e) => {
    e.preventDefault();

    if (!amount || isNaN(amount) || amount <= 0) {
      return Swal.fire("Invalid", "Please enter a valid top-up amount", "warning");
    }

    try {
      const res = await fetch("http://localhost:5000/api/student/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();

      if (!res.ok) {
        return Swal.fire("Error", data.message || "Top-up failed", "error");
      }

      Swal.fire("✅ Success", `₹${amount} added to your balance!`, "success").then(() => {
        navigate("/dashboard");
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="topup-container">
      <div className="topup-card">
        <div className="payment-header">
          <h2>💳 Payment Gateway</h2>
          <p>Secure payment processing</p>
        </div>

        <form onSubmit={handleTopUp} className="payment-form">
          {/* Amount Section */}
          <div className="amount-section">
            <label className="form-label">Amount to Add</label>
            <div className="amount-input-wrapper">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
                required
              />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="payment-method-section">
            <label className="form-label">Payment Method</label>
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="payment-option-content">
                  <span className="payment-icon">💳</span>
                  <span>Credit/Debit Card</span>
                </div>
              </div>
              <div 
                className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="payment-option-content">
                  <span className="payment-icon">📱</span>
                  <span>UPI</span>
                </div>
              </div>
              <div 
                className={`payment-option ${paymentMethod === 'wallet' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <div className="payment-option-content">
                  <span className="payment-icon">💰</span>
                  <span>Wallet</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Details (UI Only) */}
          {paymentMethod === 'card' && (
            <div className="card-details-section">
              <label className="form-label">Card Details</label>
              <div className="card-inputs">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="card-input"
                  maxLength="19"
                />
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="card-input"
                />
                <div className="card-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    className="card-input small"
                    maxLength="5"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="card-input small"
                    maxLength="3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Details (UI Only) */}
          {paymentMethod === 'upi' && (
            <div className="upi-section">
              <label className="form-label">UPI ID</label>
              <input
                type="text"
                placeholder="username@upi"
                className="upi-input"
              />
            </div>
          )}

          {/* Wallet Details (UI Only) */}
          {paymentMethod === 'wallet' && (
            <div className="wallet-section">
              <label className="form-label">Select Wallet</label>
              <select className="wallet-select">
                <option value="paytm">Paytm</option>
                <option value="phonepe">PhonePe</option>
                <option value="googlepay">Google Pay</option>
                <option value="amazonpay">Amazon Pay</option>
              </select>
            </div>
          )}

          {/* Security Info */}
          <div className="security-info">
            <div className="security-badge">
              <span className="security-icon">🔒</span>
              <span>Secured by SSL Encryption</span>
            </div>
          </div>

          {/* Pay Button */}
          <button type="submit" className="pay-btn">
            <span className="pay-btn-text">Pay ₹{amount || '0'}</span>
            <span className="pay-btn-icon">→</span>
          </button>
        </form>

        {/* Payment Footer */}
        {/* <div className="payment-footer">
          <p>This is a simulation. No actual payment will be processed.</p>
        </div> */}
      </div>
    </div>
  );
};

export default TopUp;