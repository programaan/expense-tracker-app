const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const dateEl = document.getElementById("date");
const categoryEl = document.getElementById("category");

let chart;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

transactionFormEl.addEventListener("submit", addTransaction);

function addTransaction(e) {
  e.preventDefault();

  // get form values
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);
  const date = dateEl.value;
  const category = categoryEl.value;

  if(!description || isNaN(amount) || !date || !category) {
    alert("Please fill all fields");
    return;
  }

  transactions.push({
  id: Date.now(),
  description,
  amount,
  date,
  category
});

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();

  transactionFormEl.reset();
  updateChart();
}

function updateTransactionList() {
  transactionListEl.innerHTML = "";

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);
  });
}

function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");

  li.innerHTML = `
  <div>
    <strong>${transaction.description}</strong><br>
    <small>${transaction.category} • ${new Date(transaction.date).toLocaleDateString('en-IN')}</small>
  </div>
  <span>
    ${formatCurrency(transaction.amount)}
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  </span>
`;

  return li;
}

function updateSummary() {
  // 100, -50, 200, -200 => 50
  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // update ui => todo: fix the formatting
  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);
}

function formatCurrency(number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(number);
}


function removeTransaction(id) {
  // filter out the one we wanted to delete
  transactions = transactions.filter((transaction) => transaction.id !== id);

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();
  updateChart();
}

function clearAllTransactions()  {
  if(confirm("Are you sure you want to delete all transactions?")) {
    transactions = [];
    localStorage.removeItem("transactions");

    updateTransactionList();
    updateSummary();
    updateChart();
  }
}


function updateChart() {
  const categoryTotals = {};

  transactions.forEach((t) => {
    if (t.amount < 0) {
      const cat = t.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
    }
  });

  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  const canvas = document.getElementById("expense-chart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // ✅ destroy old chart properly
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        label: "Expenses by Category",
        data: data,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4CAF50",
          "#9C27B0",
          "#FF9800"
        ],
      }]
    },
    options: {
  responsive: true,
  animation: false,
  events: ['click', 'touchstart'],        // Enable tooltips on tap for mobile
  interaction: {
    mode: 'index',                        // Easier targeting of slices
    intersect: false
  },
  plugins: {
    tooltip: {
      enabled: true                        // Always show tooltips
    }
  }
}
  });
}



// initial render
updateTransactionList();
updateSummary();
updateChart();


