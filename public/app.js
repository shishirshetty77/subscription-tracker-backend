// ==================== Configuration ====================
const API_URL = '/api/v1';

// ==================== State ====================
let state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  subscriptions: [],
};

// ==================== DOM Elements ====================
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const addSubscriptionForm = document.getElementById('add-subscription-form');

// ==================== Utility Functions ====================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount, currency = 'USD') {
  const symbols = { USD: '$', EUR: '€', GBP: '£' };
  return `${symbols[currency] || '$'}${parseFloat(amount).toFixed(2)}`;
}

function getCategoryIcon(category) {
  const icons = {
    entertainment: '🎬',
    technology: '💻',
    sports: '⚽',
    news: '📰',
    lifestyle: '🌟',
    finance: '💳',
    politics: '🏛️',
    other: '📦',
  };
  return icons[category] || '📦';
}

function getDaysUntilRenewal(renewalDate) {
  const today = new Date();
  const renewal = new Date(renewalDate);
  const diffTime = renewal - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// ==================== Auth Functions ====================
function checkAuth() {
  if (state.token && state.user) {
    showDashboard();
  } else {
    showAuth();
  }
}

function showAuth() {
  authSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

function showDashboard() {
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  
  // Update user info
  document.getElementById('user-name').textContent = state.user.name;
  document.getElementById('user-email').textContent = state.user.email;
  document.getElementById('user-avatar').textContent = state.user.name.charAt(0).toUpperCase();
  
  // Set current date
  document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Load data
  loadSubscriptions();
}

function logout() {
  state.token = null;
  state.user = null;
  state.subscriptions = [];
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  showAuth();
  showToast('Logged out successfully');
}

// ==================== Auth Event Handlers ====================
showSignupBtn.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  authError.classList.add('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  signupForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  authError.classList.add('hidden');
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const data = await apiRequest('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    state.token = data.data.token;
    state.user = data.data.user;
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    
    showToast('Welcome back!', 'success');
    showDashboard();
  } catch (error) {
    authError.textContent = error.message;
    authError.classList.remove('hidden');
  }
});

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  
  try {
    const data = await apiRequest('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    state.token = data.data.token;
    state.user = data.data.user;
    localStorage.setItem('token', state.token);
    localStorage.setItem('user', JSON.stringify(state.user));
    
    showToast('Account created successfully!', 'success');
    showDashboard();
  } catch (error) {
    authError.textContent = error.message;
    authError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', logout);

// ==================== Navigation ====================
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const view = item.dataset.view;
    
    // Update active nav
    navItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    
    // Show view
    views.forEach(v => v.classList.add('hidden'));
    document.getElementById(`${view}-view`).classList.remove('hidden');
  });
});

document.getElementById('add-subscription-btn')?.addEventListener('click', () => {
  navItems.forEach(nav => nav.classList.remove('active'));
  document.querySelector('[data-view="add"]').classList.add('active');
  views.forEach(v => v.classList.add('hidden'));
  document.getElementById('add-view').classList.remove('hidden');
});

document.getElementById('cancel-add')?.addEventListener('click', () => {
  navItems.forEach(nav => nav.classList.remove('active'));
  document.querySelector('[data-view="subscriptions"]').classList.add('active');
  views.forEach(v => v.classList.add('hidden'));
  document.getElementById('subscriptions-view').classList.remove('hidden');
});

// ==================== Subscription Functions ====================
async function loadSubscriptions() {
  try {
    const data = await apiRequest(`/subscriptions/user/${state.user._id}`);
    state.subscriptions = data.data || [];
    updateOverview();
    renderSubscriptionsList();
  } catch (error) {
    console.error('Failed to load subscriptions:', error);
    state.subscriptions = [];
    updateOverview();
    renderSubscriptionsList();
  }
}

function updateOverview() {
  const subs = state.subscriptions;
  
  // Total subscriptions
  document.getElementById('total-subscriptions').textContent = subs.length;
  
  // Active subscriptions
  const active = subs.filter(s => s.status === 'active');
  document.getElementById('active-subscriptions').textContent = active.length;
  
  // Monthly cost (normalize to monthly)
  let monthlyCost = 0;
  active.forEach(s => {
    let cost = s.price;
    switch (s.frequency) {
      case 'daily': cost *= 30; break;
      case 'weekly': cost *= 4; break;
      case 'yearly': cost /= 12; break;
    }
    monthlyCost += cost;
  });
  document.getElementById('monthly-cost').textContent = formatCurrency(monthlyCost);
  
  // Upcoming renewals (within 7 days)
  const upcoming = active.filter(s => {
    const days = getDaysUntilRenewal(s.renewalDate);
    return days >= 0 && days <= 7;
  });
  document.getElementById('upcoming-renewals').textContent = upcoming.length;
  
  // Recent subscriptions table
  renderRecentSubscriptions(subs.slice(0, 5));
  
  // Category breakdown
  renderCategoryBreakdown(active);
}

function renderRecentSubscriptions(subs) {
  const tbody = document.getElementById('recent-subscriptions');
  
  if (subs.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="loading">No subscriptions yet. Add your first one!</td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = subs.map(sub => `
    <tr>
      <td>
        <strong>${sub.name}</strong>
        <br><small style="color: var(--gray-500)">${sub.category}</small>
      </td>
      <td>${formatCurrency(sub.price, sub.currency)}</td>
      <td style="text-transform: capitalize">${sub.frequency}</td>
      <td>${formatDate(sub.renewalDate)}</td>
      <td><span class="status-badge status-${sub.status}">${sub.status}</span></td>
    </tr>
  `).join('');
}

function renderCategoryBreakdown(subs) {
  const container = document.getElementById('category-breakdown');
  
  // Group by category
  const categories = {};
  subs.forEach(sub => {
    if (!categories[sub.category]) {
      categories[sub.category] = 0;
    }
    categories[sub.category] += sub.price;
  });
  
  if (Object.keys(categories).length === 0) {
    container.innerHTML = '<p style="color: var(--gray-500)">No active subscriptions</p>';
    return;
  }
  
  container.innerHTML = Object.entries(categories).map(([cat, amount]) => `
    <div class="category-card">
      <div class="category-icon">${getCategoryIcon(cat)}</div>
      <div class="category-name">${cat}</div>
      <div class="category-amount">${formatCurrency(amount)}</div>
    </div>
  `).join('');
}

function renderSubscriptionsList() {
  const container = document.getElementById('subscriptions-list');
  const statusFilter = document.getElementById('filter-status').value;
  const categoryFilter = document.getElementById('filter-category').value;
  
  let filtered = state.subscriptions;
  
  if (statusFilter !== 'all') {
    filtered = filtered.filter(s => s.status === statusFilter);
  }
  
  if (categoryFilter !== 'all') {
    filtered = filtered.filter(s => s.category === categoryFilter);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <h3>No subscriptions found</h3>
        <p>Start tracking your subscriptions by adding your first one.</p>
        <button class="btn btn-primary" onclick="document.querySelector('[data-view=\\'add\\']').click()">
          Add Subscription
        </button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(sub => `
    <div class="subscription-card">
      <div class="subscription-info">
        <div class="subscription-icon">${getCategoryIcon(sub.category)}</div>
        <div class="subscription-details">
          <h4>${sub.name}</h4>
          <p>${sub.category} • Renews ${formatDate(sub.renewalDate)}</p>
        </div>
      </div>
      <div class="subscription-price">
        <div class="price">${formatCurrency(sub.price, sub.currency)}</div>
        <div class="frequency">per ${sub.frequency.replace('ly', '')}</div>
      </div>
      <span class="status-badge status-${sub.status}">${sub.status}</span>
      <div class="subscription-actions">
        ${sub.status === 'active' ? `
          <button class="btn btn-secondary btn-sm" onclick="cancelSubscription('${sub._id}')">Cancel</button>
        ` : ''}
        <button class="btn btn-danger btn-sm" onclick="deleteSubscription('${sub._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

// Filter event listeners
document.getElementById('filter-status')?.addEventListener('change', renderSubscriptionsList);
document.getElementById('filter-category')?.addEventListener('change', renderSubscriptionsList);

// ==================== Add Subscription ====================
addSubscriptionForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const subscription = {
    name: document.getElementById('sub-name').value,
    category: document.getElementById('sub-category').value,
    price: parseFloat(document.getElementById('sub-price').value),
    currency: document.getElementById('sub-currency').value,
    frequency: document.getElementById('sub-frequency').value,
    startDate: document.getElementById('sub-start-date').value,
    paymentMethod: document.getElementById('sub-payment').value,
  };
  
  try {
    await apiRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
    
    showToast('Subscription added successfully!', 'success');
    addSubscriptionForm.reset();
    
    // Navigate to subscriptions view
    document.querySelector('[data-view="subscriptions"]').click();
    
    // Reload data
    loadSubscriptions();
  } catch (error) {
    showToast(error.message, 'error');
  }
});

// Set default date to today
document.getElementById('sub-start-date').valueAsDate = new Date();

// ==================== Subscription Actions ====================
async function cancelSubscription(id) {
  if (!confirm('Are you sure you want to cancel this subscription?')) return;
  
  try {
    await apiRequest(`/subscriptions/${id}/cancel`, { method: 'PUT' });
    showToast('Subscription cancelled', 'success');
    loadSubscriptions();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function deleteSubscription(id) {
  if (!confirm('Are you sure you want to delete this subscription? This cannot be undone.')) return;
  
  try {
    await apiRequest(`/subscriptions/${id}`, { method: 'DELETE' });
    showToast('Subscription deleted', 'success');
    loadSubscriptions();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
});
