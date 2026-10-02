const adminApiBase = 'admin.php';

const state = {
  users: [],
  menuItems: [],
  branchList: [],
  adminProfile: null,
  stats: {},
};

const $ = (selector) => document.querySelector(selector);

function showMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message || '';
  el.style.color = isError ? '#8b1f27' : '#2d6a3f';
}

async function apiRequest(action, payload = {}, method = 'POST') {
  const formData = new FormData();
  formData.append('action', action);
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  const response = await fetch(adminApiBase, {
    method,
    body: formData,
    credentials: 'same-origin',
  });

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new Error('Unexpected server response.');
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed.');
  }

  return data.data !== undefined ? data.data : data;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function renderStats(stats) {
  const cards = [
    { label: 'Users', value: stats.total_users ?? 0 },
    { label: 'Admins', value: stats.admins ?? 0 },
    { label: 'Employees', value: stats.employees ?? 0 },
    { label: 'Customers', value: stats.customers ?? 0 },
    { label: 'Menu Items', value: stats.menu_items ?? 0 },
    { label: 'Branches', value: stats.branches ?? 0 },
    { label: 'Recent Users', value: Array.isArray(stats.recent_users) ? stats.recent_users.length : 0 },
  ];

  const container = $('#statsGrid');
  if (!container) return;
  container.innerHTML = cards.map(card => `
    <div class="stat-card">
      <h3>${card.label}</h3>
      <strong>${card.value}</strong>
    </div>
  `).join('');
}

function renderUsers() {
  const search = ($('#userSearch')?.value || '').toLowerCase();
  const filter = ($('#userRoleFilter')?.value || '').toLowerCase();

  const rows = state.users.filter((user) => {
    const combined = [user.username, user.full_name, user.email, user.role, user.contact].join(' ').toLowerCase();
    const matchesSearch = !search || combined.includes(search);
    const matchesRole = !filter || (user.role || '').toLowerCase() === filter;
    return matchesSearch && matchesRole;
  });

  const body = $('#usersTableBody');
  if (!body) return;
  body.innerHTML = rows.map((user) => `
    <tr>
      <td>${user.user_id ?? user.id ?? ''}</td>
      <td>${escapeHtml(user.username || '')}</td>
      <td>${escapeHtml(user.full_name || '')}</td>
      <td>${escapeHtml(user.email || '')}</td>
      <td><span class="badge">${escapeHtml((user.role || '').toLowerCase())}</span></td>
      <td>${escapeHtml(user.gender || '')}</td>
      <td>${escapeHtml(user.contact || '')}</td>
      <td>${escapeHtml(user.created_at ? new Date(user.created_at).toLocaleDateString() : '')}</td>
      <td>
        <div class="action-buttons">
          <button class="action-button" type="button" data-user-action="edit" data-user-id="${user.user_id ?? user.id ?? ''}">Edit</button>
          <button class="action-button delete" type="button" data-user-action="delete" data-user-id="${user.user_id ?? user.id ?? ''}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderRecentUsers() {
  const list = $('#recentUsersList');
  if (!list) return;

  const recent = Array.isArray(state.stats.recent_users) ? state.stats.recent_users : [];
  list.innerHTML = recent.slice(0, 5).map((user) => `
    <li>
      <div>
        <strong>${escapeHtml(user.username || user.full_name || 'User')}</strong><br />
        <small>${escapeHtml(user.role || '')}</small>
      </div>
      <span class="badge">${escapeHtml(user.email || '')}</span>
    </li>
  `).join('');
}

function renderMenu() {
  const search = ($('#menuSearch')?.value || '').toLowerCase();
  const rows = state.menuItems.filter((item) => {
    const combined = [item.name, item.category, item.description].join(' ').toLowerCase();
    return !search || combined.includes(search);
  });

  const body = $('#menuTableBody');
  if (!body) return;
  body.innerHTML = rows.map((item) => `
    <tr>
      <td>${escapeHtml(item.name || '')}</td>
      <td>${escapeHtml(item.category || '')}</td>
      <td>${escapeHtml(item.price_bdt ?? item.price ?? '')}</td>
      <td><span class="badge ${item.active == 1 ? '' : 'inactive'}">${item.active == 1 ? 'Active' : 'Inactive'}</span></td>
      <td>${item.image_url ? `<img class="menu-image" src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name || '')}" />` : '<span>—</span>'}</td>
      <td>
        <div class="action-buttons">
          <button class="action-button" type="button" data-menu-action="edit" data-menu-id="${item.menu_item_id ?? item.id ?? ''}">Edit</button>
          <button class="action-button delete" type="button" data-menu-action="delete" data-menu-id="${item.menu_item_id ?? item.id ?? ''}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderBranches() {
  const list = $('#branchList');
  if (!list) return;

  const search = ($('#branchSearch')?.value || '').toLowerCase();
  const branches = state.branchList.filter((branch) => {
    const combined = [branch.name, branch.status, branch.map_url].join(' ').toLowerCase();
    return !search || combined.includes(search);
  });

  list.innerHTML = branches.map((branch) => `
    <article class="branch-card">
      <div class="section-header section-header-inline">
        <h3>${escapeHtml(branch.name || 'Branch')}</h3>
        <span class="badge ${String(branch.status || 'active').toLowerCase() === 'upcoming' ? 'upcoming' : ''}">${escapeHtml(branch.status || 'Active')}</span>
      </div>
      <p>${escapeHtml(branch.map_url ? 'Location link available' : 'No location link added yet')}</p>
      <div class="action-buttons branch-actions">
        <button class="action-button" type="button" data-branch-action="edit" data-branch-id="${branch.branch_id ?? branch.id ?? ''}">Edit</button>
        <button class="action-button delete" type="button" data-branch-action="delete" data-branch-id="${branch.branch_id ?? branch.id ?? ''}">Delete</button>
      </div>
      <a class="map-link" href="${escapeHtml(branch.map_url || 'https://www.google.com/maps')}" target="_blank" rel="noopener noreferrer">Open map</a>
    </article>
  `).join('');
}

function loadProfile() {
  const panel = $('#adminProfileContent');
  if (!panel) return;

  if (!state.adminProfile) {
    panel.innerHTML = '<p>Profile unavailable.</p>';
    return;
  }

  const user = state.adminProfile;
  panel.innerHTML = `
    <div class="profile-meta">
      <div class="meta-row"><strong>Username</strong><span>${escapeHtml(user.username || '')}</span></div>
      <div class="meta-row"><strong>Full name</strong><span>${escapeHtml(user.full_name || user.username || '')}</span></div>
      <div class="meta-row"><strong>Email</strong><span>${escapeHtml(user.email || '')}</span></div>
      <div class="meta-row"><strong>Gender</strong><span>${escapeHtml(user.gender || '')}</span></div>
      <div class="meta-row"><strong>Phone</strong><span>${escapeHtml(user.contact || '')}</span></div>
    </div>
  `;

  const usernameField = $('#profileUsername');
  const fullNameField = $('#profileFullName');
  const emailField = $('#profileEmail');
  const phoneField = $('#profilePhone');
  const genderField = $('#profileGender');

  if (usernameField) usernameField.value = user.username || '';
  if (fullNameField) fullNameField.value = user.full_name || '';
  if (emailField) emailField.value = user.email || '';
  if (phoneField) phoneField.value = user.contact || '';
  if (genderField) genderField.value = user.gender || '';
}

async function loadDashboard() {
  try {
    const [stats, users, menuItems, branches, profile] = await Promise.all([
      apiRequest('dashboard'),
      apiRequest('users'),
      apiRequest('menu'),
      apiRequest('branches'),
      apiRequest('profile'),
    ]);

    state.stats = stats || {};
    state.users = Array.isArray(users) ? users : [];
    state.menuItems = Array.isArray(menuItems) ? menuItems : [];
    state.branchList = Array.isArray(branches) ? branches : [];
    state.adminProfile = profile || null;

    renderStats(state.stats);
    renderUsers();
    renderRecentUsers();
    renderMenu();
    renderBranches();
    loadProfile();
  } catch (error) {
    console.error(error);
    const activeRole = sessionStorage.getItem('chajoyLoggedInRole');
    const isPublicRoute = window.location.pathname.includes('/public/');
    window.location.href = activeRole ? (isPublicRoute ? '../home.html' : 'home.html') : (isPublicRoute ? '../Sign_up.html' : 'Sign_up.html');
  }
}

function showProfilePanel(show = true) {
  const panel = $('#adminProfilePanel');
  if (!panel) return;
  panel.classList.toggle('hidden', !show);
  document.body.classList.toggle('profile-modal-open', show);
  if (show) {
    $('#profileUsername')?.focus();
  }
}

async function handleAdminSignOut() {
  try {
    await apiRequest('logout');
  } catch (error) {
    // no-op; redirect anyway
  }
  const isPublicRoute = window.location.pathname.includes('/public/');
  window.location.href = isPublicRoute ? '../home.html' : 'home.html';
}

async function handleProfileSave(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());

  if (!payload.password || payload.password.trim() === '') {
    delete payload.password;
  }

  try {
    const result = await apiRequest('update-profile', payload);
    showMessage('profileMessage', result.message || 'Profile updated.', result.success !== false);
    await loadDashboard();
  } catch (error) {
    showMessage('profileMessage', error.message, true);
  }
}

async function handleUserFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const editingId = form.dataset.editingId;

  try {
    const result = editingId
      ? await apiRequest('update-user', { ...payload, user_id: editingId })
      : await apiRequest('add-user', payload);

    showMessage('userMessage', result.message || 'User saved successfully.', result.success !== false);
    delete form.dataset.editingId;
    form.reset();
    await loadDashboard();
  } catch (error) {
    showMessage('userMessage', error.message, true);
  }
}

async function handleUserActionClick(event) {
  const btn = event.target.closest('[data-user-action]');
  if (!btn) return;

  const id = btn.dataset.userId;
  const action = btn.dataset.userAction;

  if (action === 'delete') {
    if (!confirm('Delete this user?')) return;
    try {
      await apiRequest('delete-user', { user_id: id });
      await loadDashboard();
    } catch (error) {
      showMessage('userMessage', error.message, true);
    }
    return;
  }

  if (action === 'edit') {
    const user = state.users.find((item) => String(item.user_id ?? item.id) === String(id));
    if (!user) return;

    const form = $('#addUserForm');
    if (!form) return;
    form.querySelector('[name="username"]').value = user.username || '';
    form.querySelector('[name="full_name"]').value = user.full_name || '';
    form.querySelector('[name="email"]').value = user.email || '';
    form.querySelector('[name="contact"]').value = user.contact || '';
    form.querySelector('[name="gender"]').value = user.gender || '';
    form.querySelector('[name="role"]').value = user.role || 'customer';
    form.querySelector('[name="password"]').value = '';
    form.querySelector('[name="password"]').setAttribute('placeholder', 'Leave blank to keep existing password');

    form.dataset.editingId = id;
    showMessage('userMessage', 'Editing existing user. Save to update.', false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function handleMenuSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const menuItemId = form.querySelector('[name="menu_item_id"]').value;
  formData.append('action', menuItemId ? 'save-menu-item' : 'save-menu-item');

  try {
    const response = await fetch(adminApiBase, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.message || 'Failed to save menu item.');
    }

    showMessage('menuMessage', data.message || 'Menu item saved successfully.', false);
    form.reset();
    const hiddenInput = form.querySelector('[name="menu_item_id"]');
    if (hiddenInput) hiddenInput.value = '';
    await loadDashboard();
  } catch (error) {
    showMessage('menuMessage', error.message, true);
  }
}

async function handleMenuActionClick(event) {
  const btn = event.target.closest('[data-menu-action]');
  if (!btn) return;

  const id = btn.dataset.menuId;
  const action = btn.dataset.menuAction;

  if (action === 'delete') {
    if (!confirm('Delete this menu item?')) return;
    try {
      await apiRequest('delete-menu-item', { menu_item_id: id });
      await loadDashboard();
    } catch (error) {
      showMessage('menuMessage', error.message, true);
    }
    return;
  }

  if (action === 'edit') {
    const item = state.menuItems.find((entry) => String(entry.menu_item_id ?? entry.id) === String(id));
    if (!item) return;

    const form = $('#menuForm');
    if (!form) return;
    form.querySelector('[name="menu_item_id"]').value = item.menu_item_id ?? item.id ?? '';
    form.querySelector('[name="name"]').value = item.name || '';
    form.querySelector('[name="category"]').value = item.category || 'tea';
    form.querySelector('[name="price_bdt"]').value = item.price_bdt ?? item.price ?? 0;
    form.querySelector('[name="description"]').value = item.description || '';
    form.querySelector('[name="active"]').value = item.active == 1 ? '1' : '0';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

async function handleBranchSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());

  try {
    const result = await apiRequest('save-branch', payload);
    showMessage('branchMessage', result.message || 'Branch saved successfully.', result.success !== false);
    form.reset();
    const hiddenInput = form.querySelector('[name="branch_id"]');
    if (hiddenInput) hiddenInput.value = '';
    await loadDashboard();
  } catch (error) {
    showMessage('branchMessage', error.message, true);
  }
}

async function handleBranchActionClick(event) {
  const btn = event.target.closest('[data-branch-action]');
  if (!btn) return;

  const id = btn.dataset.branchId;
  const action = btn.dataset.branchAction;

  if (action === 'delete') {
    if (!confirm('Delete this branch?')) return;
    try {
      await apiRequest('delete-branch', { branch_id: id });
      await loadDashboard();
    } catch (error) {
      showMessage('branchMessage', error.message, true);
    }
    return;
  }

  if (action === 'edit') {
    const branch = state.branchList.find((entry) => String(entry.branch_id ?? entry.id) === String(id));
    if (!branch) return;

    const form = $('#branchForm');
    if (!form) return;
    form.querySelector('[name="branch_id"]').value = branch.branch_id ?? branch.id ?? '';
    form.querySelector('[name="name"]').value = branch.name || '';
    form.querySelector('[name="status"]').value = branch.status || 'active';
    form.querySelector('[name="map_url"]').value = branch.map_url || '';
    window.scrollTo({ top: document.body.scrollHeight * 0.4, behavior: 'smooth' });
  }
}

function applyCurrentAdminPage() {
  const page = document.body.dataset.adminPage || 'admin';
  const dashboardSection = document.getElementById('dashboard');
  const userSection = document.getElementById('user-management');
  const menuSection = document.getElementById('menu-management');
  const branchSection = document.getElementById('branches');

  const sections = [dashboardSection, userSection, menuSection, branchSection];
  sections.forEach((section) => {
    if (!section) return;
    section.hidden = true;
  });

  const targetMap = {
    admin: dashboardSection,
    dashboard: dashboardSection,
    admin_users: userSection,
    'user-management': userSection,
    admin_menu: menuSection,
    menu: menuSection,
    admin_branches: branchSection,
    branches: branchSection,
  };

  const activeSection = targetMap[page] || dashboardSection;
  if (activeSection) {
    activeSection.hidden = false;
  }

  document.querySelectorAll('[data-admin-nav]').forEach((link) => {
    const isActive = link.dataset.adminNav === page;
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
    if (isActive) {
      link.style.color = '#7d8f1d';
    } else {
      link.style.color = '';
    }
  });
}

function initEvents() {
  $('#profileToggle')?.addEventListener('click', () => showProfilePanel(true));
  $('#closeProfilePanel')?.addEventListener('click', () => showProfilePanel(false));
  $('#cancelProfileEdit')?.addEventListener('click', () => showProfilePanel(false));
  $('#adminProfilePanel')?.addEventListener('click', (event) => {
    if (event.target.id === 'adminProfilePanel') {
      showProfilePanel(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !$('#adminProfilePanel')?.classList.contains('hidden')) {
      showProfilePanel(false);
    }
  });
  $('#adminSignOut')?.addEventListener('click', handleAdminSignOut);
  $('#adminProfileForm')?.addEventListener('submit', handleProfileSave);
  $('#addUserForm')?.addEventListener('submit', handleUserFormSubmit);
  $('#menuForm')?.addEventListener('submit', handleMenuSubmit);
  $('#branchForm')?.addEventListener('submit', handleBranchSubmit);
  $('#userSearch')?.addEventListener('input', renderUsers);
  $('#userRoleFilter')?.addEventListener('change', renderUsers);
  $('#menuSearch')?.addEventListener('input', renderMenu);
  $('#branchSearch')?.addEventListener('input', renderBranches);
  $('#menuFormReset')?.addEventListener('click', () => {
    const form = $('#menuForm');
    if (!form) return;
    form.reset();
    const hiddenInput = form.querySelector('[name="menu_item_id"]');
    if (hiddenInput) hiddenInput.value = '';
  });
  $('#branchFormReset')?.addEventListener('click', () => {
    const form = $('#branchForm');
    if (!form) return;
    form.reset();
    const hiddenInput = form.querySelector('[name="branch_id"]');
    if (hiddenInput) hiddenInput.value = '';
  });

  document.addEventListener('click', (event) => {
    const userAction = event.target.closest('[data-user-action]');
    if (userAction) {
      handleUserActionClick(event);
      return;
    }

    const menuAction = event.target.closest('[data-menu-action]');
    if (menuAction) {
      handleMenuActionClick(event);
      return;
    }

    const branchAction = event.target.closest('[data-branch-action]');
    if (branchAction) {
      handleBranchActionClick(event);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyCurrentAdminPage();
  initEvents();
  loadDashboard();
});
