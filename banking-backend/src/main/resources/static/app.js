//// Base URL for your Spring Boot backend
//// If you run on localhost:8080 with no context-path, this works:
//const API_BASE = "/api/accounts";
//
//// Utility: handle fetch response and show errors
//async function handleResponse(response) {
//  if (!response.ok) {
//    const text = await response.text();
//    throw new Error(text || ("HTTP error " + response.status));
//  }
//  // Try JSON, else plain text
//  const contentType = response.headers.get("content-type") || "";
//  if (contentType.includes("application/json")) {
//    return response.json();
//  }
//  return response.text();
//}
//
//// ---------- Create Account ----------
//document.getElementById("create-account-form").addEventListener("submit", async (e) => {
//  e.preventDefault();
//  const name = document.getElementById("create-name").value.trim();
//  const balance = parseFloat(document.getElementById("create-balance").value);
//  const output = document.getElementById("create-account-output");
//
//  try {
//    const res = await fetch(API_BASE, {
//      method: "POST",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({ id: null, accountHolderName: name, balance: balance })
//    });
//
//    const data = await handleResponse(res);
//    output.textContent = JSON.stringify(data, null, 2);
//  } catch (err) {
//    output.textContent = "Error: " + err.message;
//  }
//});
//
//// ---------- Get Account by ID ----------
//document.getElementById("get-account-form").addEventListener("submit", async (e) => {
//  e.preventDefault();
//  const id = document.getElementById("get-account-id").value;
//  const output = document.getElementById("get-account-output");
//
//  try {
//    const res = await fetch(`${API_BASE}/${id}`);
//    const data = await handleResponse(res);
//    output.textContent = JSON.stringify(data, null, 2);
//  } catch (err) {
//    output.textContent = "Error: " + err.message;
//  }
//});
//
//// ---------- Load All Accounts ----------
//document.getElementById("load-accounts-btn").addEventListener("click", async () => {
//  const tbody = document.querySelector("#accounts-table tbody");
//  tbody.innerHTML = "";
//
//  try {
//    const res = await fetch(API_BASE);
//    const accounts = await handleResponse(res);
//
//    accounts.forEach(acc => {
//      const tr = document.createElement("tr");
//      tr.innerHTML = `
//        <td>${acc.id}</td>
//        <td>${acc.accountHolderName}</td>
//        <td>${acc.balance}</td>
//      `;
//      tbody.appendChild(tr);
//    });
//  } catch (err) {
//    const tr = document.createElement("tr");
//    tr.innerHTML = `<td colspan="3">Error: ${err.message}</td>`;
//    tbody.appendChild(tr);
//  }
//});
//
//// ---------- Deposit ----------
//document.getElementById("deposit-form").addEventListener("submit", async (e) => {
//  e.preventDefault();
//  const id = document.getElementById("deposit-id").value;
//  const amount = parseFloat(document.getElementById("deposit-amount").value);
//  const output = document.getElementById("deposit-withdraw-output");
//
//  try {
//    const res = await fetch(`${API_BASE}/${id}/deposit`, {
//      method: "PUT",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({ amount: amount })
//    });
//    const data = await handleResponse(res);
//    output.textContent = "Deposit success:\n" + JSON.stringify(data, null, 2);
//  } catch (err) {
//    output.textContent = "Error: " + err.message;
//  }
//});
//
//// ---------- Withdraw ----------
//document.getElementById("withdraw-form").addEventListener("submit", async (e) => {
//  e.preventDefault();
//  const id = document.getElementById("withdraw-id").value;
//  const amount = parseFloat(document.getElementById("withdraw-amount").value);
//  const output = document.getElementById("deposit-withdraw-output");
//
//  try {
//    const res = await fetch(`${API_BASE}/${id}/withdraw`, {
//      method: "PUT",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({ amount: amount })
//    });
//    const data = await handleResponse(res);
//    output.textContent = "Withdraw success:\n" + JSON.stringify(data, null, 2);
//  } catch (err) {
//    output.textContent = "Error: " + err.message;
//  }
//});
//
//// ---------- Transfer Funds ----------
//document.getElementById("transfer-form").addEventListener("submit", async (e) => {
//  e.preventDefault();
//  const fromId = parseInt(document.getElementById("transfer-from").value);
//  const toId = parseInt(document.getElementById("transfer-to").value);
//  const amount = parseFloat(document.getElementById("transfer-amount").value);
//  const output = document.getElementById("transfer-output");
//
//  try {
//    const res = await fetch(`${API_BASE}/transfer`, {
//      method: "POST",
//      headers: { "Content-Type": "application/json" },
//      body: JSON.stringify({
//        fromAccountId: fromId,
//        toAccountId: toId,
//        amount: amount
//      })
//    });
//    const data = await handleResponse(res);
//    output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
//  } catch (err) {
//    output.textContent = "Error: " + err.message;
//  }
//});
//
//// ---------- Transactions ----------
//document.getElementById("transactions-form").addEventListener("submit", async (e) => {
//  e.preventDefault();
//  const accountId = document.getElementById("transactions-account-id").value;
//  const tbody = document.querySelector("#transactions-table tbody");
//  tbody.innerHTML = "";
//
//  try {
//    const res = await fetch(`${API_BASE}/${accountId}/transactions`);
//    const txs = await handleResponse(res);
//
//    txs.forEach(tx => {
//      const tr = document.createElement("tr");
//      tr.innerHTML = `
//        <td>${tx.id}</td>
//        <td>${tx.amount}</td>
//        <td>${tx.transactionType}</td>
//        <td>${tx.timestamp}</td>
//      `;
//      tbody.appendChild(tr);
//    });
//  } catch (err) {
//    const tr = document.createElement("tr");
//    tr.innerHTML = `<td colspan="4">Error: ${err.message}</td>`;
//    tbody.appendChild(tr);
//  }
//});
