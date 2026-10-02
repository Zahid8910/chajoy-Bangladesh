let drinkCards = Array.from(document.querySelectorAll('.drink-card'));
const categoryTabs = Array.from(document.querySelectorAll('.category-tab'));
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const clearCart = document.getElementById('clearCart');
const receiptButton = document.getElementById('receiptButton');
const orderMessage = document.getElementById('orderMessage');
const receiptModal = document.getElementById('receiptModal');
const receiptClose = document.getElementById('receiptClose');
const receiptDetails = document.getElementById('receiptDetails');
const receiptTotal = document.getElementById('receiptTotal');
const receivedButton = document.getElementById('receivedButton');
const receiptMessage = document.getElementById('receiptMessage');
const orderBranch = document.getElementById('orderBranch');
const loginPrompt = document.getElementById('loginPrompt');
const loginPromptClose = document.getElementById('loginPromptClose');
const loginPromptMessage = document.getElementById('loginPromptMessage');
const menuSignOut = document.querySelector('#menuSignOut, #employeeSignOut');
const customerOrdersPanel = document.getElementById('customerOrdersPanel');
const customerNotification = document.getElementById('customerNotification');
const customerOrders = document.getElementById('customerOrders');
const inventoryKey = 'chajoyUnavailableItems';
const cart = new Map();
const unavailableBranches = new Set([
  'Shonir Akhra Branch (Upcoming)',
  'Aftabnagar Branch (Upcoming)',
  'Shonir Akhra Branch (Unavailable - choose another branch)',
  'Aftabnagar Branch (Unavailable - choose another branch)'
]);
let currentOrder = null;
const loggedInRole = sessionStorage.getItem('chajoyLoggedInRole');
const isAuthenticatedUser = loggedInRole === 'customer' || loggedInRole === 'employee';

function getUnavailableItems(branchValue) {
  branchValue = branchValue || orderBranch.value;
  const availabilityByBranch = JSON.parse(localStorage.getItem(inventoryKey) || '{}');
  const branchKey = branchValue.toLowerCase().replace(/[^a-z0-9]/g, '').replace('lakshmibajar', 'laxmibazar');
  return new Set(availabilityByBranch[branchValue] || availabilityByBranch[branchKey] || []);
}

function renderItemAvailability() {
  const branchValue = orderBranch.value;
  const unavailableItems = branchValue ? getUnavailableItems(branchValue) : new Set();
  drinkCards.forEach(function (card) {
    const isUnavailable = unavailableItems.has(card.dataset.name);
    const addButton = card.querySelector('.add-button');
    addButton.disabled = isUnavailable;
    addButton.textContent = isUnavailable ? 'Unavailable' : 'Add';
    card.classList.toggle('is-unavailable', isUnavailable);
  });
}

function menuItemSwatchClass(item) {
  const name = String(item.name || '').toLowerCase();
  const nameColors = [
    ['strawberry sundae', 'strawberry'],
    ['blueberry sundae', 'blueberry'],
    ['mango sundae', 'mango'],
    ['peach sundae', 'peach'],
    ['fresh lemon tea', 'lemon'],
    ['jasmine green tea', 'jasmine'],
    ['strawberry tea', 'strawberry-tea'],
    ['guava green tea', 'guava'],
    ['brown sugar boba milk', 'brown-sugar'],
    ['classic milk tea', 'classic-milk'],
    ['strawberry boba milk', 'strawberry-boba'],
    ['blueberry milk tea', 'blueberry-milk'],
    ['chocolate oreo sundae', 'chocolate'],
    ['peach shake', 'peach-shake'],
    ['blueberry shake', 'blueberry-shake'],
    ['vanilla ice cream', 'vanilla'],
    ['matcha ice cream', 'matcha'],
  ];
  const matchingColor = nameColors.find(function (entry) {
    return name === entry[0];
  });
  if (matchingColor) {
    return matchingColor[1];
  }
  return String(item.category || '').replace(/[^a-z0-9-]/gi, '') || 'default';
}

function renderMenuCatalog(items) {
  const drinkList = document.querySelector('.drink-list');
  if (!drinkList || !Array.isArray(items)) {
    return;
  }

  drinkList.innerHTML = items.map(function (item) {
    const name = escapeHtml(item.name || 'Menu item');
    const description = escapeHtml(item.description || '');
    const category = escapeHtml(item.category || '');
    const price = Number(item.price_bdt || item.price || 0);
    return `
      <article class="drink-card" data-category="${category}" data-name="${name}" data-price="${price}">
        <div class="drink-swatch ${menuItemSwatchClass(item)}"></div>
        <div class="drink-details"><h2>${name}</h2><p>${description}</p></div>
        <strong class="drink-price">BDT ${price}</strong>
        <button class="add-button" type="button">Add</button>
      </article>
    `;
  }).join('');

  drinkCards = Array.from(document.querySelectorAll('.drink-card'));
  bindDrinkCardActions();
  renderItemAvailability();
  const activeTab = document.querySelector('.category-tab.active');
  if (activeTab && activeTab.dataset.category !== 'all') {
    drinkCards.forEach(function (card) {
      card.classList.toggle('is-hidden', card.dataset.category !== activeTab.dataset.category);
    });
  }
}

async function refreshMenuCatalog() {
  const response = await fetch('public/menu.php', { credentials: 'same-origin' });
  const result = await response.json();
  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || 'Unable to load menu items.');
  }
  renderMenuCatalog(result.data.filter(function (item) {
    return item.active === undefined || Number(item.active) === 1;
  }));
}

window.refreshMenuCatalog = refreshMenuCatalog;

if (isAuthenticatedUser) {
  const signUpButton = document.querySelector('.sign_up');
  if (signUpButton) {
    signUpButton.hidden = true;
  }
  if (menuSignOut) {
    menuSignOut.hidden = false;
  }
  if (loggedInRole === 'customer') {
    customerOrdersPanel.hidden = false;
  }
} else {
  if (menuSignOut) {
    menuSignOut.hidden = true;
  }
}

if (menuSignOut) {
  menuSignOut.addEventListener('click', function () {
    sessionStorage.removeItem('chajoyLoggedInRole');
    window.location.href = 'home.html';
  });
}

function showLoginPrompt(message) {
  loginPromptMessage.textContent = message;
  loginPrompt.classList.remove('hidden');
}

function getSavedOrders() {
  return JSON.parse(localStorage.getItem('chajoyOrders') || '[]');
}

function getCustomerStatusMessage(order) {
  if (order.status === 'rejected') {
    return `Your order was rejected by ${order.branch}. Reason: ${order.rejectionReason || 'The branch did not provide a reason.'}`;
  }
  if (order.status === 'preparing') {
    return `Your order has been received by ${order.branch} and is now being prepared.`;
  }
  if (order.status === 'ready') {
    return `Your order is ready. Please pick it up from ${order.branch}.`;
  }
  if (order.status === 'picked_up') {
    return `Your order was picked up from ${order.branch}. Thank you for visiting ChaJoy.`;
  }
  return `Your order has not been received by ${order.branch} yet. Once the branch accepts it, you will be notified.`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, function (character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character];
  });
}

async function loadCustomerOrdersFromServer() {
  if (loggedInRole !== 'customer') {
    return [];
  }

  try {
    const response = await fetch('public/orders.php?action=customer_history', { credentials: 'same-origin' });
    if (!response.ok) {
      return getSavedOrders();
    }
    const json = await response.json();
    if (!json.success || !Array.isArray(json.data)) {
      return getSavedOrders();
    }
    const mappedOrders = json.data.map(function (order) {
      return {
        receiptNumber: order.receipt_number || order.receiptNumber,
        receipt_number: order.receipt_number || order.receiptNumber,
        branch: order.branch || order.branch_name || 'Unknown branch',
        items: (order.items || []).map(function (item) {
          return {
            name: item.item_name_snapshot || item.name || 'Item',
            quantity: Number(item.quantity || 1),
            price: Number(item.unit_price_bdt || item.price || 0),
          };
        }),
        total: Number(order.total_bdt || order.total || 0),
        status: String(order.status || 'received'),
        rejectionReason: order.rejection_reason || order.rejectionReason || '',
        createdAt: order.created_at || order.createdAt || new Date().toISOString(),
      };
    });
    localStorage.setItem('chajoyOrders', JSON.stringify(mappedOrders));
    return mappedOrders;
  } catch (error) {
    return getSavedOrders();
  }
}

async function renderCustomerOrders() {
  if (loggedInRole !== 'customer') {
    return;
  }

  const savedOrders = await loadCustomerOrdersFromServer();
  const pendingOrders = (savedOrders || []).slice().reverse();
  const latestOrder = pendingOrders[0];
  customerNotification.textContent = latestOrder
    ? getCustomerStatusMessage(latestOrder)
    : 'Your submitted orders will appear here.';

  if (!pendingOrders.length) {
    customerOrders.innerHTML = '<p class="empty-cart">You have not submitted an order yet.</p>';
    return;
  }

  customerOrders.innerHTML = pendingOrders.map(function (order) {
    const pickupButton = order.status === 'ready'
      ? `<button type="button" class="pickup-button" data-pickup="${order.receiptNumber || order.receipt_number}">Mark as picked up</button>`
      : '';
    return `
      <article class="customer-order-card">
        <div class="customer-order-header">
          <div><h3>${order.receiptNumber || order.receipt_number}</h3><p>${(order.items || []).map(function (item) { return `${item.name} x ${item.quantity}`; }).join(', ')}</p></div>
          <span class="customer-order-status">${String(order.status || 'received').replace('_', ' ')}</span>
        </div>
        <p class="customer-order-branch">Pickup branch: ${order.branch}</p>
        ${order.status === 'rejected' ? `<p class="customer-order-reason">Reason for rejection: ${escapeHtml(order.rejectionReason || 'The branch did not provide a reason.')}</p>` : ''}
        <div class="customer-order-footer"><strong>BDT ${order.total || 0}</strong>${pickupButton}</div>
      </article>`;
  }).join('');
}

function renderCart() {
  const items = Array.from(cart.values());
  const itemCount = items.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);
  const total = items.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);

  cartCount.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  cartTotal.textContent = `BDT ${total}`;

  if (!items.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your order is empty.</p>';
    return;
  }

  cartItems.innerHTML = items.map(function (item) {
    return `
      <div class="cart-line">
        <div>
          <h3>${item.name}</h3>
          <p>BDT ${item.price} each</p>
          <div class="cart-controls">
            <button type="button" class="quantity-button" data-action="decrease" data-name="${item.name}" aria-label="Remove one ${item.name}">-</button>
            <span>${item.quantity}</span>
            <button type="button" class="quantity-button" data-action="increase" data-name="${item.name}" aria-label="Add one ${item.name}">+</button>
            <button type="button" class="remove-button" data-action="remove" data-name="${item.name}">Remove</button>
          </div>
        </div>
        <span class="cart-line-total">BDT ${item.price * item.quantity}</span>
      </div>`;
  }).join('');
}

function addToCart(card) {
  if (getUnavailableItems().has(card.dataset.name)) {
    orderMessage.textContent = `${card.dataset.name} is currently unavailable.`;
    return;
  }
  if (loggedInRole !== 'customer') {
    showLoginPrompt('Please login or register yourself before adding items to an order.');
    return;
  }

  const name = card.dataset.name;
  const price = Number(card.dataset.price);
  const existing = cart.get(name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.set(name, { name: name, price: price, quantity: 1 });
  }

  orderMessage.textContent = `${name} added to your order.`;
  renderCart();
}

function bindDrinkCardActions() {
  drinkCards.forEach(function (card) {
    card.querySelector('.add-button').addEventListener('click', function () {
      addToCart(card);
    });
  });
}

bindDrinkCardActions();
refreshMenuCatalog().catch(function () {
  // Keep the bundled catalog available if the menu endpoint is temporarily unavailable.
});

orderBranch.addEventListener('change', function () {
  renderItemAvailability();
  renderCart();
});

categoryTabs.forEach(function (tab) {
  tab.addEventListener('click', function () {
    const category = tab.dataset.category;
    categoryTabs.forEach(function (categoryTab) {
      categoryTab.classList.toggle('active', categoryTab === tab);
    });
    drinkCards.forEach(function (card) {
      card.classList.toggle('is-hidden', category !== 'all' && card.dataset.category !== category);
    });
  });
});

cartItems.addEventListener('click', function (event) {
  const button = event.target.closest('button[data-action]');
  if (!button) {
    return;
  }

  const name = button.dataset.name;
  const item = cart.get(name);
  if (!item) {
    return;
  }

  if (button.dataset.action === 'increase') {
    item.quantity += 1;
  } else if (button.dataset.action === 'decrease') {
    item.quantity -= 1;
    if (item.quantity < 1) {
      cart.delete(name);
    }
  } else if (button.dataset.action === 'remove') {
    cart.delete(name);
  }

  orderMessage.textContent = '';
  renderCart();
});

clearCart.addEventListener('click', function () {
  cart.clear();
  orderMessage.textContent = 'Your order has been cleared.';
  renderCart();
});

receiptButton.addEventListener('click', async function () {
  if (loggedInRole !== 'customer') {
    showLoginPrompt('Please login or register yourself before getting a receipt.');
    return;
  }

  if (!cart.size) {
    orderMessage.textContent = 'Add a drink before getting your receipt.';
    return;
  }

  if (!orderBranch.value) {
    orderMessage.textContent = 'Choose a pickup branch before getting your receipt.';
    orderBranch.focus();
    return;
  }

  const unavailableItems = getUnavailableItems();
  const unavailableOrderItems = Array.from(cart.values()).filter(function (item) {
    return unavailableItems.has(item.name);
  });
  if (unavailableOrderItems.length) {
    orderMessage.textContent = `${unavailableOrderItems.map(function (item) { return item.name; }).join(', ')} is currently unavailable at ${orderBranch.value}. Choose another item or branch.`;
    renderItemAvailability();
    return;
  }

  if (unavailableBranches.has(orderBranch.value)) {
    orderMessage.textContent = 'That branch is currently unavailable. Please choose another pickup branch.';
    orderBranch.focus();
    return;
  }

  const items = Array.from(cart.values());
  const total = items.reduce(function (sum, item) {
    return sum + item.price * item.quantity;
  }, 0);
  if (!currentOrder) {
    currentOrder = {
      receiptNumber: `CJ-${Date.now().toString().slice(-6)}`,
      branch: orderBranch.value,
      items: items,
      total: total,
      status: 'received',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch('public/orders.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_order',
          branch: orderBranch.value,
          items: items.map(function (item) {
            return {
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              unit_price_bdt: item.price,
            };
          })
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        currentOrder.receiptNumber = result.data.receipt_number || currentOrder.receiptNumber;
        currentOrder.receipt_number = result.data.receipt_number || currentOrder.receiptNumber;
        currentOrder.order_id = result.data.order_id;
      }
    } catch (error) {
      // Fall back to local storage if server save fails.
    }

    const savedOrders = JSON.parse(localStorage.getItem('chajoyOrders') || '[]');
    savedOrders.push(currentOrder);
    localStorage.setItem('chajoyOrders', JSON.stringify(savedOrders));
  }

  receiptDetails.innerHTML = `
    <div class="receipt-line"><span>Receipt no.</span><strong>${currentOrder.receiptNumber}</strong></div>
    <div class="receipt-line"><span>Pickup branch</span><strong>${currentOrder.branch}</strong></div>
    ${currentOrder.items.map(function (item) {
      return `<div class="receipt-line"><span>${item.name} x ${item.quantity}</span><strong>BDT ${item.price * item.quantity}</strong></div>`;
    }).join('')}`;
  receiptTotal.textContent = `BDT ${currentOrder.total}`;
  receiptMessage.textContent = '';
  receivedButton.hidden = false;
  receivedButton.textContent = 'Close receipt';
  receiptModal.classList.remove('hidden');
});

function closeReceipt() {
  receiptModal.classList.add('hidden');
}

receiptClose.addEventListener('click', closeReceipt);

receiptModal.addEventListener('click', function (event) {
  if (event.target === receiptModal) {
    closeReceipt();
  }
});

receivedButton.addEventListener('click', async function () {
  cart.clear();
  renderCart();
  orderBranch.value = '';
  currentOrder = null;
  closeReceipt();
  orderMessage.textContent = 'Your order has not been received yet. Once the branch accepts it, you will be notified.';
  await renderCustomerOrders();
});

customerOrders.addEventListener('click', async function (event) {
  const pickupButton = event.target.closest('[data-pickup]');
  if (!pickupButton) {
    return;
  }

  const receiptNumber = pickupButton.dataset.pickup;
  const savedOrders = getSavedOrders();
  const matchingOrder = savedOrders.find(function (order) {
    return (order.receiptNumber || order.receipt_number) === receiptNumber;
  });

  if (matchingOrder && matchingOrder.order_id) {
    try {
      await fetch('public/orders.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', order_id: matchingOrder.order_id, status: 'picked_up' })
      });
    } catch (error) {
      // Ignore server update failures and fall back to local state.
    }
  }

  const updatedOrders = savedOrders.map(function (order) {
    const currentReceipt = order.receiptNumber || order.receipt_number;
    return currentReceipt === receiptNumber ? { ...order, status: 'picked_up', updatedAt: new Date().toISOString() } : order;
  });
  localStorage.setItem('chajoyOrders', JSON.stringify(updatedOrders));
  await renderCustomerOrders();
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !loginPrompt.classList.contains('hidden')) {
    loginPrompt.classList.add('hidden');
  }
  if (event.key === 'Escape' && !receiptModal.classList.contains('hidden')) {
    closeReceipt();
  }
});

loginPromptClose.addEventListener('click', function () {
  loginPrompt.classList.add('hidden');
});

loginPrompt.addEventListener('click', function (event) {
  if (event.target === loginPrompt) {
    loginPrompt.classList.add('hidden');
  }
});

window.addEventListener('storage', renderCustomerOrders);
window.addEventListener('storage', renderItemAvailability);
window.setInterval(function () {
  renderCustomerOrders();
  renderItemAvailability();
}, 1000);
renderCart();
renderCustomerOrders();
renderItemAvailability();
