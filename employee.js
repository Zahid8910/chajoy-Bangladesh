const ordersKey = 'chajoyOrders';
const inventoryKey = 'chajoyUnavailableItems';
const employeeBranch = document.getElementById('employeeBranch');
const ordersTitle = document.getElementById('ordersTitle');
const ordersList = document.getElementById('ordersList');
const orderCount = document.getElementById('orderCount');
const employeeSignOut = document.getElementById('employeeSignOut');
const rejectModal = document.getElementById('rejectModal');
const rejectClose = document.getElementById('rejectClose');
const rejectCancel = document.getElementById('rejectCancel');
const rejectSubmit = document.getElementById('rejectSubmit');
const rejectReason = document.getElementById('rejectReason');
const rejectMessage = document.getElementById('rejectMessage');
const inventoryList = document.getElementById('inventoryList');
const employeeMenuSearch = document.getElementById('employeeMenuSearch');
const employeeMenuTableBody = document.getElementById('employeeMenuTableBody');
const employeeMenuForm = document.getElementById('employeeMenuForm');
const employeeMenuMessage = document.getElementById('employeeMenuMessage');
const menuItems = ['Strawberry Sundae', 'Blueberry Sundae', 'Mango Sundae', 'Peach Sundae', 'Fresh Lemon Tea', 'Jasmine Green Tea', 'Strawberry Tea', 'Guava Green Tea', 'Brown Sugar Boba Milk', 'Classic Milk Tea', 'Strawberry Boba Milk', 'Blueberry Milk Tea', 'Chocolate Oreo Sundae', 'Peach Shake', 'Blueberry Shake', 'Vanilla Ice Cream', 'Matcha Ice Cream'];
let orderToReject = null;
let employeeMenuItems = [];

async function loadEmployeeBranches() {
  try {
    const response = await fetch('public/branches.php', { credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Unable to load branches.');
    }

    const currentBranch = employeeBranch.value;
    employeeBranch.innerHTML = '<option value="">Select a branch</option>';
    (Array.isArray(result.data) ? result.data : []).forEach(function (branch) {
      const option = document.createElement('option');
      option.value = branch.name || '';
      option.textContent = `${branch.name || ''}${branch.status === 'upcoming' ? ' (Upcoming)' : ''}`;
      employeeBranch.appendChild(option);
    });
    if (currentBranch) {
      employeeBranch.value = currentBranch;
    }
    renderInventory();
    renderOrders();
  } catch (error) {
    employeeBranch.innerHTML = '<option value="">Branches unavailable</option>';
    renderInventory();
  }
}

function getOrders() {
  return JSON.parse(localStorage.getItem(ordersKey) || '[]');
}

function saveOrders(updatedOrders) {
  localStorage.setItem(ordersKey, JSON.stringify(updatedOrders));
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function branchKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace('lakshmibajar', 'laxmibazar');
}

function getInventoryState() {
  const saved = JSON.parse(localStorage.getItem(inventoryKey) || '{}');
  const branch = employeeBranch.value || '';
  return new Set(saved[branch] || saved[branchKey(branch)] || []);
}

function renderInventory() {
  if (!inventoryList) {
    return;
  }
  if (!employeeBranch.value) {
    inventoryList.innerHTML = '<p class="empty-state">Select a branch to manage its menu availability.</p>';
    return;
  }

  const unavailable = getInventoryState();
  inventoryList.innerHTML = menuItems.map(function (item) {
    const unavailableItem = unavailable.has(item);
    return `
      <div class="inventory-row">
        <strong>${item}</strong>
        <span class="availability-status ${unavailableItem ? 'is-unavailable' : ''}">${unavailableItem ? 'Unavailable' : 'Available'}</span>
        <button type="button" class="inventory-action ${unavailableItem ? 'make-available' : ''}" data-item="${item}" aria-pressed="${String(unavailableItem)}">
          ${unavailableItem ? 'Make available' : 'Mark unavailable'}
        </button>
      </div>`;
  }).join('');
}

function showEmployeeMenuMessage(message, isError = false) {
  if (!employeeMenuMessage) {
    return;
  }
  employeeMenuMessage.textContent = message || '';
  employeeMenuMessage.style.color = isError ? '#8b1f27' : '#2d6a3f';
}

function renderEmployeeMenu() {
  if (!employeeMenuTableBody) {
    return;
  }

  const search = (employeeMenuSearch?.value || '').toLowerCase();
  const rows = employeeMenuItems.filter(function (item) {
    const combined = [item.name, item.category, item.description].join(' ').toLowerCase();
    return !search || combined.includes(search);
  });

  employeeMenuTableBody.innerHTML = rows.map(function (item) {
    const status = Number(item.active) === 1 ? 'Active' : 'Inactive';
    const image = item.image_url ? `<img class="menu-image" src="${item.image_url}" alt="${item.name}" />` : '<span>—</span>';
    return `
      <tr>
        <td>${item.name || ''}</td>
        <td>${item.category || ''}</td>
        <td>BDT ${Number(item.price_bdt || item.price || 0)}</td>
        <td><span class="badge ${Number(item.active) === 1 ? '' : 'inactive'}">${status}</span></td>
        <td>${image}</td>
        <td>
          <div class="action-buttons">
            <button class="action-button" type="button" data-menu-action="edit" data-menu-id="${item.menu_item_id || item.id || ''}">Edit</button>
            <button class="action-button delete" type="button" data-menu-action="delete" data-menu-id="${item.menu_item_id || item.id || ''}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function loadEmployeeMenu() {
  try {
    const formData = new FormData();
    formData.append('action', 'menu');
    const response = await fetch('public/admin.php', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to load menu items.');
    }
    employeeMenuItems = Array.isArray(json.data) ? json.data : [];
    renderEmployeeMenu();
  } catch (error) {
    showEmployeeMenuMessage(error.message || 'Unable to load menu items.', true);
  }
}

async function submitEmployeeMenu(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  formData.append('action', 'save-menu-item');

  try {
    const response = await fetch('public/admin.php', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Unable to save menu item.');
    }
    showEmployeeMenuMessage(json.message || 'Menu item saved successfully.', false);
    form.reset();
    const hiddenInput = form.querySelector('[name="menu_item_id"]');
    if (hiddenInput) hiddenInput.value = '';
    await loadEmployeeMenu();
  } catch (error) {
    showEmployeeMenuMessage(error.message || 'Unable to save menu item.', true);
  }
}

async function handleEmployeeMenuTableClick(event) {
  const button = event.target.closest('[data-menu-action]');
  if (!button) {
    return;
  }

  const id = button.dataset.menuId;
  const action = button.dataset.menuAction;

  if (action === 'delete') {
    const shouldDelete = window.confirm('Delete this menu item?');
    if (!shouldDelete) {
      return;
    }

    const formData = new FormData();
    formData.append('action', 'delete-menu-item');
    formData.append('menu_item_id', String(id));

    try {
      const response = await fetch('public/admin.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Delete failed.');
      }
      await loadEmployeeMenu();
      showEmployeeMenuMessage(json.message || 'Menu item deleted.', false);
    } catch (error) {
      showEmployeeMenuMessage(error.message || 'Delete failed.', true);
    }
    return;
  }

  const item = employeeMenuItems.find(function (entry) {
    return String(entry.menu_item_id ?? entry.id) === String(id);
  });
  if (!item) {
    return;
  }

  const hiddenInput = employeeMenuForm.querySelector('[name="menu_item_id"]');
  if (hiddenInput) hiddenInput.value = item.menu_item_id ?? item.id ?? '';
  employeeMenuForm.querySelector('[name="name"]').value = item.name || '';
  employeeMenuForm.querySelector('[name="category"]').value = item.category || 'tea';
  employeeMenuForm.querySelector('[name="price_bdt"]').value = item.price_bdt ?? item.price ?? 0;
  employeeMenuForm.querySelector('[name="description"]').value = item.description || '';
  employeeMenuForm.querySelector('[name="active"]').value = Number(item.active) === 1 ? '1' : '0';
  employeeMenuForm.querySelector('[name="image_url"]').value = item.image_url || '';
  window.scrollTo({ top: document.body.scrollHeight * 0.3, behavior: 'smooth' });
}

function renderOrders() {
  const branch = employeeBranch.value;
  if (!branch) {
    ordersTitle.textContent = 'Select a branch to begin';
    orderCount.textContent = '0 orders';
    ordersList.innerHTML = '<p class="empty-state">Orders for the selected branch will appear here.</p>';
    return;
  }

  const localOrders = getOrders().filter(function (order) { return order.branch === branch; });
  const employeeOrders = localOrders.slice().reverse();
  ordersTitle.textContent = branch;
  orderCount.textContent = `${employeeOrders.length} ${employeeOrders.length === 1 ? 'order' : 'orders'}`;
  if (!employeeOrders.length) {
    ordersList.innerHTML = '<p class="empty-state">No customer orders have arrived at this branch yet.</p>';
    return;
  }

  ordersList.innerHTML = employeeOrders.map(function (order) {
    const statusLabel = order.status === 'picked_up' ? 'Customer received' : order.status;
    const action = order.status === 'received'
      ? '<div class="order-actions"><button type="button" class="order-action" data-action="prepare">Accept order</button><button type="button" class="order-action reject-action" data-action="reject">Reject order</button></div>'
      : order.status === 'preparing'
        ? '<div class="order-actions"><button type="button" class="order-action" data-action="ready">Order is done - notify pickup</button></div>'
        : order.status === 'ready'
          ? '<p class="pickup-note">Order is done. Customer can pick it up from this branch.</p>'
          : order.status === 'rejected'
            ? `<p class="rejection-note">Rejected: ${order.rejectionReason || 'No reason provided.'}</p>`
            : '<p class="customer-received-note">Customer has received the order.</p>';
    const itemsMarkup = (order.items || []).map(function (item) {
      const itemName = item.name || item.item_name_snapshot || 'Item';
      const itemQuantity = item.quantity || 1;
      const itemPrice = Number(item.price || item.unit_price_bdt || 0);
      return `<div class="order-item"><strong>${itemName} x ${itemQuantity}</strong><span>BDT ${itemPrice * itemQuantity}</span></div>`;
    }).join('');
    return `<article class="order-card"><div class="order-card-header"><div><h3>${order.receiptNumber || order.receipt_number}</h3><span class="order-time">Received ${formatTime(order.createdAt || order.created_at)}</span></div><span class="status">${statusLabel}</span></div><div class="order-items">${itemsMarkup}</div><div class="order-card-footer"><span class="order-total">Total <strong>BDT ${order.total || order.total_bdt || 0}</strong></span>${action}</div></article>`;
  }).join('');
}

async function loadOrdersFromServer() {
  try {
    const response = await fetch('public/orders.php?action=employee_orders', { credentials: 'same-origin' });
    if (!response.ok) {
      return;
    }
    const json = await response.json();
    if (!json.success || !Array.isArray(json.data)) {
      return;
    }
    const orders = json.data.map(function (order) {
      const branchName = order.branch || order.branch_name || 'Unknown branch';
      const items = (order.items || []).map(function (item) {
        const unitPrice = Number(item.unit_price_bdt || item.price || 0);
        return {
          name: item.item_name_snapshot || item.name || 'Item',
          quantity: Number(item.quantity || 1),
          price: unitPrice,
          unit_price_bdt: unitPrice,
        };
      });
      const total = Number(order.total_bdt || order.total || 0);
      return {
        receiptNumber: order.receipt_number || order.receiptNumber,
        branch: branchName,
        items: items,
        total: total,
        status: String(order.status || 'received'),
        rejectionReason: order.rejection_reason || order.rejectionReason || '',
        createdAt: order.created_at || order.createdAt || new Date().toISOString(),
      };
    });
    saveOrders(orders);
    renderOrders();
  } catch (error) {
    // Ignore fallback when server integration is not available.
  }
}

async function updateOrderStatus(orderId, newStatus, reason) {
  try {
    const response = await fetch('public/orders.php', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_status', order_id: orderId, status: newStatus, rejection_reason: reason || '' })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update order status.');
    }
    return true;
  } catch (error) {
    const receiptNumber = orderId && String(orderId).startsWith('CJ-') ? orderId : orderId;
    const saved = getOrders().map(function (order) {
      if (order.receiptNumber === receiptNumber || order.receipt_number === receiptNumber) {
        return { ...order, status: newStatus, rejectionReason: reason || order.rejectionReason || '', updatedAt: new Date().toISOString() };
      }
      return order;
    });
    saveOrders(saved);
    return true;
  }
}

if (inventoryList) {
  inventoryList.addEventListener('click', function (event) {
    const button = event.target.closest('[data-item]');
    if (!button || !employeeBranch.value) {
      return;
    }
    const unavailable = getInventoryState();
    const itemName = button.dataset.item;
    if (unavailable.has(itemName)) {
      unavailable.delete(itemName);
    } else {
      unavailable.add(itemName);
    }
    const saved = JSON.parse(localStorage.getItem(inventoryKey) || '{}');
    saved[employeeBranch.value] = [...unavailable];
    localStorage.setItem(inventoryKey, JSON.stringify(saved));
    renderInventory();
  });
}

employeeBranch.addEventListener('change', function () {
  renderOrders();
  renderInventory();
});

loadEmployeeBranches();

ordersList.addEventListener('click', async function (event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) {
    return;
  }
  const card = actionButton.closest('.order-card');
  const receipt = card.querySelector('h3').textContent;
  const order = getOrders().find(function (item) { return (item.receiptNumber || item.receipt_number) === receipt; });
  if (!order) {
    return;
  }

  if (actionButton.dataset.action === 'reject') {
    orderToReject = receipt;
    rejectReason.value = '';
    rejectMessage.textContent = '';
    rejectModal.hidden = false;
    rejectReason.focus();
    return;
  }

  const nextStatus = actionButton.dataset.action === 'prepare' ? 'preparing' : 'ready';
  await updateOrderStatus(order.order_id || order.orderId || receipt, nextStatus, '');
  renderOrders();
  loadOrdersFromServer();
});

function closeRejectModal() {
  rejectModal.hidden = true;
  orderToReject = null;
}

rejectSubmit.addEventListener('click', async function () {
  const reason = rejectReason.value.trim();
  if (!reason) {
    rejectMessage.textContent = 'Enter a reason before rejecting the order.';
    rejectReason.focus();
    return;
  }
  const order = getOrders().find(function (item) { return (item.receiptNumber || item.receipt_number) === orderToReject; });
  if (!order) {
    closeRejectModal();
    return;
  }
  await updateOrderStatus(order.order_id || order.orderId || orderToReject, 'rejected', reason);
  closeRejectModal();
  renderOrders();
  loadOrdersFromServer();
});

rejectClose.addEventListener('click', closeRejectModal);
rejectCancel.addEventListener('click', closeRejectModal);
rejectModal.addEventListener('click', function (event) { if (event.target === rejectModal) closeRejectModal(); });
document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !rejectModal.hidden) closeRejectModal(); });
if (employeeMenuSearch) {
  employeeMenuSearch.addEventListener('input', renderEmployeeMenu);
}
if (employeeMenuForm) {
  employeeMenuForm.addEventListener('submit', submitEmployeeMenu);
}
if (employeeMenuTableBody) {
  employeeMenuTableBody.addEventListener('click', handleEmployeeMenuTableClick);
}
employeeSignOut.addEventListener('click', function () {
  sessionStorage.removeItem('chajoyLoggedInRole');
  localStorage.removeItem('chajoyProfile');
  window.location.href = 'home.html';
});
window.addEventListener('storage', function () { renderOrders(); renderInventory(); });
window.setInterval(function () { renderOrders(); renderInventory(); loadOrdersFromServer(); }, 2000);

renderOrders();
renderInventory();
loadOrdersFromServer();
if (employeeMenuForm) {
  loadEmployeeMenu();
}
