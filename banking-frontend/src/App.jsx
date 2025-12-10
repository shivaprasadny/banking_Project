import React, { useEffect, useState } from "react";

// Backend API base (used internally, not shown in UI)
const API_BASE = "http://localhost:8080/api/accounts";

const VIEWS = {
  DASHBOARD: "dashboard",
  ACCOUNTS: "accounts",
  TRANSACTIONS: "transactions",
};

function App() {
  const [activeView, setActiveView] = useState(VIEWS.DASHBOARD);

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dashboardLastUpdated, setDashboardLastUpdated] = useState(null);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    visible: false,
  });

  // --- Form state ---
  const [createForm, setCreateForm] = useState({ name: "", balance: "" });
  const [getAccountId, setGetAccountId] = useState("");
  const [depositForm, setDepositForm] = useState({ id: "", amount: "" });
  const [withdrawForm, setWithdrawForm] = useState({ id: "", amount: "" });
  const [transferForm, setTransferForm] = useState({
    fromId: "",
    toId: "",
    amount: "",
  });
  const [transactionsAccountId, setTransactionsAccountId] = useState("");

  // --- Result / message text (user-friendly, not JSON) ---
  const [createMessage, setCreateMessage] = useState("");
  const [accountInfoMessage, setAccountInfoMessage] = useState("");
  const [depositWithdrawMessage, setDepositWithdrawMessage] = useState("");
  const [transferMessage, setTransferMessage] = useState("");

  const showToast = (message, type = "success", duration = 2600) => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, duration);
  };

  const formatCurrency = (value) => {
    if (value == null || Number.isNaN(value)) return "—";
    return `$${Number(value).toFixed(2)}`;
  };

  const nowString = () => new Date().toLocaleString();

  // ---- API helpers ----
  const handleResponse = async (res) => {
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      return res.json();
    }
    return res.text();
  };

  const fetchAccounts = async () => {
    const res = await fetch(API_BASE);
    return handleResponse(res);
  };

  // ---- Dashboard ----
  const refreshDashboard = async () => {
    try {
      setLoading(true);
      const data = await fetchAccounts();
      setAccounts(data);
      setDashboardLastUpdated(nowString());
      showToast("Dashboard updated");
    } catch (err) {
      console.error(err);
      showToast(`Unable to refresh accounts: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  // ---- Create account ----
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    const name = createForm.name.trim();
    const balance = parseFloat(createForm.balance || "0");
    if (!name) return;

    try {
      setLoading(true);
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: null,
          accountHolderName: name,
          balance,
        }),
      });
      const data = await handleResponse(res);
      setCreateForm({ name: "", balance: "" });

      setCreateMessage(
        `New account #${data.id} opened for ${data.accountHolderName} with balance ${formatCurrency(
          data.balance
        )}.`
      );

      await refreshDashboard();
      showToast("Account opened");
    } catch (err) {
      setCreateMessage(`Unable to open account: ${err.message}`);
      showToast("Account opening failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Get single account ----
  const handleGetAccount = async (e) => {
    e.preventDefault();
    if (!getAccountId) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${getAccountId}`);
      const data = await handleResponse(res);
      setAccountInfoMessage(
        `Account #${data.id} — ${data.accountHolderName}, Current balance: ${formatCurrency(
          data.balance
        )}.`
      );
      showToast("Account details loaded");
    } catch (err) {
      setAccountInfoMessage(`Unable to find account: ${err.message}`);
      showToast("Account lookup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Deposit ----
  const handleDeposit = async (e) => {
    e.preventDefault();
    const id = depositForm.id;
    const amount = parseFloat(depositForm.amount || "0");
    if (!id || amount <= 0) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${id}/deposit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await handleResponse(res);

      setDepositWithdrawMessage(
        `Deposit of ${formatCurrency(
          amount
        )} to Account #${id} successful. New balance: ${formatCurrency(
          data.balance
        )}.`
      );

      await refreshDashboard();
      showToast("Deposit successful");
    } catch (err) {
      setDepositWithdrawMessage(`Deposit failed: ${err.message}`);
      showToast("Deposit failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Withdraw ----
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const id = withdrawForm.id;
    const amount = parseFloat(withdrawForm.amount || "0");
    if (!id || amount <= 0) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/${id}/withdraw`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await handleResponse(res);

      setDepositWithdrawMessage(
        `Withdrawal of ${formatCurrency(
          amount
        )} from Account #${id} successful. New balance: ${formatCurrency(
          data.balance
        )}.`
      );

      await refreshDashboard();
      showToast("Withdrawal successful");
    } catch (err) {
      setDepositWithdrawMessage(`Withdrawal failed: ${err.message}`);
      showToast("Withdrawal failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Transfer ----
  const handleTransfer = async (e) => {
    e.preventDefault();
    const fromId = parseInt(transferForm.fromId || "0", 10);
    const toId = parseInt(transferForm.toId || "0", 10);
    const amount = parseFloat(transferForm.amount || "0");
    if (!fromId || !toId || amount <= 0) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: fromId,
          toAccountId: toId,
          amount,
        }),
      });
      await handleResponse(res);

      setTransferMessage(
        `You transferred ${formatCurrency(
          amount
        )} from Account #${fromId} to Account #${toId}.`
      );

      await refreshDashboard();
      showToast("Transfer completed");
    } catch (err) {
      setTransferMessage(`Transfer failed: ${err.message}`);
      showToast("Transfer failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Transactions ----
  const handleLoadTransactions = async (e) => {
    e.preventDefault();
    if (!transactionsAccountId) return;

    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/${transactionsAccountId}/transactions`
      );
      const data = await handleResponse(res);
      setTransactions(data);
      showToast("Transactions loaded");
    } catch (err) {
      setTransactions([]);
      showToast("Unable to load transactions", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Derived values ----
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + (acc.balance || 0),
    0
  );

  const primaryAccount = accounts[0] || null;

  // ---- Dashboard view with dynamic insights ----
  const renderDashboard = () => {
    const hasAccounts = accounts.length > 0;

    let highestBalanceAccount = null;
    let averageBalance = 0;
    let randomCustomer = null;

    if (hasAccounts) {
      highestBalanceAccount = accounts.reduce((max, acc) =>
        max == null || acc.balance > max.balance ? acc : max
      , null);

      averageBalance =
        accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0) /
        accounts.length;

      const randomIndex = Math.floor(Math.random() * accounts.length);
      randomCustomer = accounts[randomIndex];
    }

    return (
      <section className="view active">
        {/* Welcome banner */}
        <div className="card" style={{ marginBottom: "14px" }}>
          <div className="card-header">
            <div>
              <h2 style={{ marginBottom: 4 }}>Welcome back, Shiva</h2>
              <p className="topbar-subtitle">
                Here’s an overview of your accounts and recent activity at Shiva
                Bank.
              </p>
            </div>
            <div className="topbar-actions">
              <button
                className="pill-btn"
                type="button"
                onClick={() => setActiveView(VIEWS.TRANSACTIONS)}
              >
                Make a Transfer
              </button>
            </div>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid-3">
          <div className="card metric-card">
            <div className="metric-label">Total Accounts</div>
            <div className="metric-value">{totalAccounts}</div>
            <div className="metric-footnote">Active with Shiva Bank</div>
          </div>
          <div className="card metric-card">
            <div className="metric-label">Total Balance</div>
            <div className="metric-value">{formatCurrency(totalBalance)}</div>
            <div className="metric-footnote">Across all your accounts</div>
          </div>
          <div className="card metric-card">
            <div className="metric-label">Last Updated</div>
            <div className="metric-value small">
              {dashboardLastUpdated || "Just now"}
            </div>
            <div className="metric-footnote">Refresh to sync latest data</div>
          </div>
        </div>

        {/* Dynamic insights */}
        {hasAccounts && (
          <div className="card" style={{ marginBottom: "14px" }}>
            <div className="card-header">
              <h2>Insights about your accounts</h2>
            </div>
            <div className="grid-3">
              <div className="mini-insight">
                <div className="metric-label">Highest Balance</div>
                <div className="metric-value small">
                  {highestBalanceAccount
                    ? formatCurrency(highestBalanceAccount.balance)
                    : "—"}
                </div>
                {highestBalanceAccount && (
                  <div className="metric-footnote">
                    Account #{highestBalanceAccount.id} —{" "}
                    {highestBalanceAccount.accountHolderName}
                  </div>
                )}
              </div>

              <div className="mini-insight">
                <div className="metric-label">Average Balance</div>
                <div className="metric-value small">
                  {formatCurrency(averageBalance)}
                </div>
                <div className="metric-footnote">
                  Based on all active accounts
                </div>
              </div>

              <div className="mini-insight">
                <div className="metric-label">Customer of the moment</div>
                <div className="metric-value small">
                  {randomCustomer ? randomCustomer.accountHolderName : "—"}
                </div>
                {randomCustomer && (
                  <div className="metric-footnote">
                    Account #{randomCustomer.id} highlighted this refresh
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Primary account (if any) */}
        {primaryAccount && (
          <div className="card">
            <div className="card-header">
              <h2>Primary Account Snapshot</h2>
            </div>
            <p style={{ fontSize: "13px", marginBottom: 4 }}>
              Account <strong>#{primaryAccount.id}</strong> —{" "}
              <strong>{primaryAccount.accountHolderName}</strong>
            </p>
            <p style={{ fontSize: "20px", fontWeight: 600, margin: 0 }}>
              {formatCurrency(primaryAccount.balance)}
            </p>
            <p className="metric-footnote" style={{ marginTop: 4 }}>
              Use the Accounts tab to manage this and other accounts.
            </p>
          </div>
        )}

        {/* All accounts table */}
        <div className="card">
          <div className="card-header">
            <h2>All Accounts</h2>
            <button
              className="pill-btn pill-btn-ghost"
              onClick={refreshDashboard}
              type="button"
              disabled={loading}
            >
              ⟳ Refresh
            </button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Holder</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="muted">
                      No accounts yet. Open your first account from the Accounts
                      tab.
                    </td>
                  </tr>
                )}
                {accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td>{acc.id}</td>
                    <td>{acc.accountHolderName}</td>
                    <td>{formatCurrency(acc.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    );
  };

  // ---- Accounts view ----
  const renderAccounts = () => (
    <section className="view active">
      <div className="grid-2">
        {/* Open Account */}
        <div className="card">
          <div className="card-header">
            <h2>Open New Account</h2>
          </div>
          <form className="form" onSubmit={handleCreateAccount}>
            <label className="field">
              <span>Account Holder Name</span>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Shiva Prasad"
                required
              />
            </label>
            <label className="field">
              <span>Initial Deposit</span>
              <input
                type="number"
                step="0.01"
                value={createForm.balance}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, balance: e.target.value }))
                }
                required
              />
            </label>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Working..." : "Open Account"}
            </button>
          </form>
          {createMessage && <div className="result-pill">{createMessage}</div>}
        </div>

        {/* Account Services */}
        <div className="card">
          <div className="card-header">
            <h2>Account Services</h2>
          </div>

          {/* View account */}
          <form className="form inline-form" onSubmit={handleGetAccount}>
            <label className="field">
              <span>Account ID</span>
              <input
                type="number"
                value={getAccountId}
                onChange={(e) => setGetAccountId(e.target.value)}
                required
              />
            </label>
            <button className="secondary-btn" type="submit" disabled={loading}>
              {loading ? "..." : "View Details"}
            </button>
          </form>
          {accountInfoMessage && (
            <div className="result-pill neutral">{accountInfoMessage}</div>
          )}

          <div className="divider" />

          <div className="grid-2-tight">
            {/* Deposit */}
            <form className="form" onSubmit={handleDeposit}>
              <h3>Deposit</h3>
              <label className="field">
                <span>Account ID</span>
                <input
                  type="number"
                  value={depositForm.id}
                  onChange={(e) =>
                    setDepositForm((f) => ({ ...f, id: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={depositForm.amount}
                  onChange={(e) =>
                    setDepositForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  required
                />
              </label>
              <button
                className="primary-btn subtle"
                type="submit"
                disabled={loading}
              >
                Deposit
              </button>
            </form>

            {/* Withdraw */}
            <form className="form" onSubmit={handleWithdraw}>
              <h3>Withdraw</h3>
              <label className="field">
                <span>Account ID</span>
                <input
                  type="number"
                  value={withdrawForm.id}
                  onChange={(e) =>
                    setWithdrawForm((f) => ({ ...f, id: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Amount</span>
                <input
                  type="number"
                  step="0.01"
                  value={withdrawForm.amount}
                  onChange={(e) =>
                    setWithdrawForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  required
                />
              </label>
              <button
                className="danger-btn subtle"
                type="submit"
                disabled={loading}
              >
                Withdraw
              </button>
            </form>
          </div>

          {depositWithdrawMessage && (
            <div className="result-pill">{depositWithdrawMessage}</div>
          )}
        </div>
      </div>
    </section>
  );

  // ---- Transactions view ----
  const renderTransactions = () => (
    <section className="view active">
      <div className="grid-2">
        {/* Transfer Funds */}
        <div className="card">
          <div className="card-header">
            <h2>Transfer Between Accounts</h2>
          </div>
          <form className="form" onSubmit={handleTransfer}>
            <div className="grid-2-tight">
              <label className="field">
                <span>From Account ID</span>
                <input
                  type="number"
                  value={transferForm.fromId}
                  onChange={(e) =>
                    setTransferForm((f) => ({ ...f, fromId: e.target.value }))
                  }
                  required
                />
              </label>
              <label className="field">
                <span>To Account ID</span>
                <input
                  type="number"
                  value={transferForm.toId}
                  onChange={(e) =>
                    setTransferForm((f) => ({ ...f, toId: e.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <label className="field">
              <span>Amount</span>
              <input
                type="number"
                step="0.01"
                value={transferForm.amount}
                onChange={(e) =>
                  setTransferForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
              />
            </label>
            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Working..." : "Submit Transfer"}
            </button>
          </form>
          {transferMessage && (
            <div className="result-pill">{transferMessage}</div>
          )}
        </div>

        {/* Transaction History */}
        <div className="card">
          <div className="card-header">
            <h2>Transaction History</h2>
          </div>
          <form className="form inline-form" onSubmit={handleLoadTransactions}>
            <label className="field">
              <span>Account ID</span>
              <input
                type="number"
                value={transactionsAccountId}
                onChange={(e) => setTransactionsAccountId(e.target.value)}
                required
              />
            </label>
            <button className="secondary-btn" type="submit" disabled={loading}>
              {loading ? "..." : "View History"}
            </button>
          </form>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="muted">
                      No transactions loaded. Choose an account to view its
                      history.
                    </td>
                  </tr>
                )}
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.id}</td>
                    <td>{formatCurrency(tx.amount)}</td>
                    <td>{tx.transactionType}</td>
                    <td>{tx.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
       <button
  type="button"
  className="brand brand-button"
  onClick={() => setActiveView(VIEWS.DASHBOARD)}
>
  <div className="brand-icon">$</div>
  <div className="brand-text">
    <span className="brand-title">Shiva Bank</span>
    <span className="brand-subtitle">Digital Banking</span>
  </div>
</button>


        <nav className="nav-menu">
          <button
            className={`nav-item ${
              activeView === VIEWS.DASHBOARD ? "active" : ""
            }`}
            onClick={() => setActiveView(VIEWS.DASHBOARD)}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Overview</span>
          </button>
          <button
            className={`nav-item ${
              activeView === VIEWS.ACCOUNTS ? "active" : ""
            }`}
            onClick={() => setActiveView(VIEWS.ACCOUNTS)}
          >
            <span className="nav-icon">💼</span>
            <span className="nav-label">Accounts</span>
          </button>
          <button
            className={`nav-item ${
              activeView === VIEWS.TRANSACTIONS ? "active" : ""
            }`}
            onClick={() => setActiveView(VIEWS.TRANSACTIONS)}
          >
            <span className="nav-icon">💸</span>
            <span className="nav-label">Transfers &amp; History</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">S</div>
            <div>
              <div className="user-name">Shiva Prasad</div>
              <div className="user-role">Premium Customer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-area">
        <header className="topbar">
          <div>
            <h1 className="topbar-title">Shiva Bank Online</h1>
            <p className="topbar-subtitle">
              Secure, simple banking for your everyday life.
            </p>
          </div>
          <div className="topbar-actions">
            <button
              className="pill-btn"
              type="button"
              onClick={refreshDashboard}
              disabled={loading}
            >
              ⟳ Refresh
            </button>
          </div>
        </header>

        <main className="views">
          {activeView === VIEWS.DASHBOARD && renderDashboard()}
          {activeView === VIEWS.ACCOUNTS && renderAccounts()}
          {activeView === VIEWS.TRANSACTIONS && renderTransactions()}
        </main>
      </div>

      {/* Toast */}
      {toast.visible && (
        <div className={`toast ${toast.type === "error" ? "error" : ""}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
