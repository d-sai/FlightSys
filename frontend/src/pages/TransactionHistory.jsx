import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/TransactionHistory.css";
import Swal from "sweetalert2";

const ITEMS_PER_PAGE = 5;

const TransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [search, sortKey, sortOrder, startDate, endDate, transactions]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const url =
        user?.role === "admin"
          ? "http://localhost:5000/api/admin/transactions"
          : "http://localhost:5000/api/student/transactions";

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      // console.log(data);
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      Swal.fire({
        title: "Error",
        text: "Could not load transactions",
        icon: "error",
        background: "#1e293b",
        color: "#ffffff",
        confirmButtonColor: "#60a5fa",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let temp = [...transactions];

    if (search.trim()) {
      const s = search.toLowerCase();
      temp = temp.filter((txn) => {
        return (
          txn.reference?.toLowerCase().includes(s) ||
          txn.type?.toLowerCase().includes(s) ||
          (user.role === "admin" &&
            (txn.user?.name?.toLowerCase().includes(s) ||
              txn.user?.email?.toLowerCase().includes(s)))
        );
      });
    }

    if (startDate) {
      const start = new Date(startDate);
      temp = temp.filter((txn) => new Date(txn.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      temp = temp.filter((txn) => new Date(txn.date) <= end);
    }

    temp.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (sortKey === "date")
        return sortOrder === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    setCurrentPage(1);
    setFiltered(temp);
  };

  const getTransactionTypeClass = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "type-deposit";
      case "withdrawal":
        return "type-withdrawal";
      case "transfer":
        return "type-transfer";
      default:
        return "type-deposit";
    }
  };

  const getAmountClass = (amount) => {
    return amount >= 0 ? "amount-positive" : "amount-negative";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={currentPage === i ? "active-page" : ""}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setSortKey("date");
    setSortOrder("desc");
  };

  return (
    <div className="transaction-history-container">
      <h2>Transaction History</h2>

      <div className="filters">
        <input
          type="text"
          // placeholder="Search by reference, user, or type..."
          placeholder="Search by user, or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />

        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="balanceAfter">Sort by Balance After</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="transaction-table">
        <div className="table-header">
          {user && user.role === "admin" && <div>User</div>}
          <div>Type</div>
          {user && user.role === "student" && <div>Reference</div>}
          {user && user.role === "admin" && <div>Reference ID</div>}
          <div>Amount</div>
          {user && user.role === "student" && <div>Balance After</div>}
          <div>Date</div>
        </div>

        {loading ? (
          <div className="loading">Loading transactions...</div>
        ) : paginatedData.length === 0 ? (
          <div className="no-data">
            {filtered.length === 0 && transactions.length > 0
              ? "No transactions match your filters."
              : "No transactions found."}
          </div>
        ) : (
          paginatedData.map((txn, idx) => (
            <div key={idx} className="table-row">
              {user && user.role === "admin" && (
                <div data-label="User">
                  <strong>{txn.user?.name || "Unknown User"}</strong>
                  <small>{txn.user?.email || "No email"}</small>
                </div>
              )}
              <div data-label="Type">
                <span
                  className={`transaction-type ${getTransactionTypeClass(
                    txn.type
                  )}`}
                >
                  {txn.type || "Unknown"}
                </span>
              </div>
              {user && user.role === "student" && (
                <div data-label="Reference">{txn.reference.slice(0, 12) + "..." || "N/A"}</div>
              )}
              {user && user.role === "admin" && txn.type === "topup" && (
                <div data-label="Reference ID">
                  {/* {console.log("txn.referenceId:", txn._id)} */}
                  {txn._id ? txn._id.slice(0, 12) + "..." : "N/A"}
                  {/* {txn.referenceId ? txn.referenceId.slice(0, 12) + '...' : 'N/A'} */}
                </div>
              )}
              {user && user.role === "admin" && txn.type !== "topup" && (
                <div data-label="Reference ID">
                  {/* {console.log("txn.referenceId:", txn)} */}
                  {txn.referenceId
                    ? txn.referenceId.slice(0, 12) + "..."
                    : "N/A"}
                  {/* {txn.referenceId ? txn.referenceId.slice(0, 12) + '...' : 'N/A'} */}
                </div>
              )}
              <div data-label="Amount" className={getAmountClass(txn.amount)}>
                ₹{Math.abs(txn.amount).toLocaleString()}
                {txn.amount < 0 && " (Debit)"}
              </div>
              {user && user.role === "student" && (
                <div data-label="Balance After">
                  ₹{txn.balanceAfter ? txn.balanceAfter.toLocaleString() : "0"}
                </div>
              )}
              <div data-label="Date">{formatDate(txn.date)}</div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ◀ Prev
          </button>

          {renderPaginationButtons()}

          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}

      {(search ||
        startDate ||
        endDate ||
        sortKey !== "date" ||
        sortOrder !== "desc") && (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <button
            onClick={clearFilters}
            style={{
              padding: "0.75rem 1.5rem",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "8px",
              color: "#ef4444",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.3)";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.2)";
              e.target.style.transform = "none";
            }}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
