// Change this if your backend is on a different port / host
const API_BASE = "http://localhost:8080/api/accounts";

// --------- helpers ---------

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

let toastTimeout = null;
function showToast(message, opts = {}) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden", "error", "show");

  if (opts.type === "error") {
    toast.classList.add("error");
  }

  // allow repaint
  // eslint-disable-next-line no-unused-expressions
  toast.offsetHeight;
  toast.classList.add("show");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, opts.duration || 2600);
}

function formatCurrency(num) {
  if (num == null || Number.isNaN(num)) return "—";
  return `$${Number(num).toFixed(2)}`;
}

function nowString() {
  return new Date().toLocaleString();
}

// --------- navigation ---------

function initNavigation() {
  const buttons = $all(".nav-item");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-view-target");
      if (!target) return;

      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      $all(".view").forEach((view) => {
        view.classList.remove("active");
      });

      const view = $(`#view-${target}`);
      if (view) view.classList.add("active");
    });
  });
}

// --------- dashboard ---------

async function refreshDashboard() {
  try {
    const res = await fetch(API_BASE);
    const accounts = await handleResponse(res);

    const totalAccounts = accounts.length || 0;
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + (acc.balance || 0),
      0
    );

    $("#metric-total-accounts").textContent = totalAccounts;
    $("#metric-total-balance").textContent = formatCurrency(totalBalance);
    $("#metric-last-updated").textContent = nowString();

    const tbody = $("#dashboard-accounts-table tbody");
    tbody.innerHTML = "";

    if (!accounts.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="3" class="muted">No accounts found.</td>`;
      tbody.appendChild(tr);
      return;
    }

    // show last 5 accounts
    accounts.slice(-5).forEach((acc) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${acc.id}</td>
        <td>${acc.accountHolderName}</td>
        <td>${formatCurrency(acc.balance)}</td>
      `;
      tbody.appendChild(tr);
    });

    showToast("Dashboard refreshed");
  } catch (err) {
    console.error(err);
    showToast(`Dashboard error: ${err.message}`, { type: "error" });
  }
}

// --------- accounts table (full) ---------

async function loadAllAccounts() {
  const tbody = $("#accounts-table tbody");
  tbody.innerHTML = "";

  try {
    const res = await fetch(API_BASE);
    const accounts = await handleResponse(res);

    if (!accounts.length) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="3" class="muted">No accounts found.</td>`;
      tbody.appendChild(tr);
      return;
    }

    accounts.forEach((acc) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${acc.id}</td>
        <td>${acc.accountHolderName}</td>
        <td>${formatCurrency(acc.balance)}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="3" class="muted">Error: ${err.message}</td>`;
    tbody.appendChild(tr);
    showToast(`Failed to load accounts: ${err.message}`, { type: "error" });
  }
}

// --------- forms ---------

function initForms() {
  // Create account
  $("#create-account-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = $("#create-name").value.trim();
    const balance = parseFloat($("#create-balance").value || "0");
    const out = $("#create-account-output");

    try {
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
      out.textContent = JSON.stringify(data, null, 2);
      showToast("Account created ✅");
      await refreshDashboard();
      await loadAllAccounts();
    } catch (err) {
      out.textContent = `Error: ${err.message}`;
      showToast(`Create failed: ${err.message}`, { type: "error" });
    }
  });

  // Get single account
  $("#get-account-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#get-account-id").value;
    const out = $("#get-account-output");
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`);
      const data = await handleResponse(res);
      out.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      out.textContent = `Error: ${err.message}`;
      showToast(`Fetch failed: ${err.message}`, { type: "error" });
    }
  });

  // Deposit
  $("#deposit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#deposit-id").value;
    const amount = parseFloat($("#deposit-amount").value || "0");
    const out = $("#deposit-withdraw-output");

    try {
      const res = await fetch(`${API_BASE}/${id}/deposit`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await handleResponse(res);
      out.textContent = "Deposit success:\n" + JSON.stringify(data, null, 2);
      showToast("Deposit successful 💰");
      await refreshDashboard();
      await loadAllAccounts();
    } catch (err) {
      out.textContent = `Error: ${err.message}`;
      showToast(`Deposit failed: ${err.message}`, { type: "error" });
    }
  });

  // Withdraw
  $("#withdraw-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#withdraw-id").value;
    const amount = parseFloat($("#withdraw-amount").value || "0");
    const out = $("#deposit-withdraw-output");

    try {
      const res = await fetch(`${API_BASE}/${id}/withdraw`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await handleResponse(res);
      out.textContent = "Withdraw success:\n" + JSON.stringify(data, null, 2);
      showToast("Withdrawal successful 🏧");
      await refreshDashboard();
      await loadAllAccounts();
    } catch (err) {
      out.textContent = `Error: ${err.message}`;
      showToast(`Withdraw failed: ${err.message}`, { type: "error" });
    }
  });

  // Transfer
  $("#transfer-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fromId = parseInt($("#transfer-from").value || "0", 10);
    const toId = parseInt($("#transfer-to").value || "0", 10);
    const amount = parseFloat($("#transfer-amount").value || "0");
    const out = $("#transfer-output");

    try {
      const res = await fetch(`${API_BASE}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccountId: fromId,
          toAccountId: toId,
          amount,
        }),
      });
      const data = await handleResponse(res);
      out.textContent =
        typeof data === "string"
          ? data
          : JSON.stringify(data, null, 2);
      showToast("Transfer completed 🔁");
      await refreshDashboard();
      await loadAllAccounts();
    } catch (err) {
      out.textContent = `Error: ${err.message}`;
      showToast(`Transfer failed: ${err.message}`, { type: "error" });
    }
  });

  // Transactions
  $("#transactions-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const accountId = $("#transactions-account-id").value;
    const tbody = $("#transactions-table tbody");
    tbody.innerHTML = "";

    try {
      const res = await fetch(`${API_BASE}/${accountId}/transactions`);
      const txs = await handleResponse(res);

      if (!txs.length) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" class="muted">No transactions found.</td>`;
        tbody.appendChild(tr);
        return;
      }

      txs.forEach((tx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${tx.id}</td>
          <td>${formatCurrency(tx.amount)}</td>
          <td>${tx.transactionType}</td>
          <td>${tx.timestamp}</td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" class="muted">Error: ${err.message}</td>`;
      tbody.appendChild(tr);
      showToast(`Transactions failed: ${err.message}`, { type: "error" });
    }
  });

  // Debug console
  $("#debug-send-btn").addEventListener("click", async () => {
    const path = $("#debug-path").value.trim() || "";
    const method = $("#debug-method").value;
    const bodyRaw = $("#debug-body").value.trim();
    const out = $("#debug-output");

    let body = undefined;
    if (bodyRaw) {
      try {
        body = JSON.stringify(JSON.parse(bodyRaw));
      } catch (err) {
        out.textContent = `Invalid JSON: ${err.message}`;
        showToast("Invalid JSON body", { type: "error" });
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body || (method === "GET" || method === "DELETE" ? undefined : "{}"),
      });
      const data = await handleResponse(res);
      out.textContent =
        typeof data === "string"
          ? data
          : JSON.stringify(data, null, 2);
      showToast("Request sent ✅");
    } catch (err) {
      out.textContent = `Error: ${err.message}`;
      showToast(`Debug failed: ${err.message}`, { type: "error" });
    }
  });

  // Buttons
  $("#load-accounts-btn").addEventListener("click", loadAllAccounts);
  $("#refresh-dashboard-btn").addEventListener("click", () => {
    refreshDashboard();
    loadAllAccounts();
  });
  $("#dash-refresh-table-btn").addEventListener("click", refreshDashboard);
}

// --------- init ---------

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initForms();
  refreshDashboard();
  loadAllAccounts();
});
