const employeeBranch = document.getElementById('employeeBranch');
const inventoryList = document.getElementById('inventoryList');
const employeeSignOut = document.getElementById('employeeSignOut');
const inventoryKey = 'chajoyUnavailableItems';
const menuItems = ['Strawberry Sundae', 'Blueberry Sundae', 'Mango Sundae', 'Peach Sundae', 'Fresh Lemon Tea', 'Jasmine Green Tea', 'Strawberry Tea', 'Guava Green Tea', 'Brown Sugar Boba Milk', 'Classic Milk Tea', 'Strawberry Boba Milk', 'Blueberry Milk Tea', 'Chocolate Oreo Sundae', 'Peach Shake', 'Blueberry Shake', 'Vanilla Ice Cream', 'Matcha Ice Cream'];

function branchKey(value) { return value.toLowerCase().replace(/[^a-z0-9]/g, '').replace('lakshmibajar', 'laxmibazar'); }
function unavailableItems() {
  const saved = JSON.parse(localStorage.getItem(inventoryKey) || '{}');
  return new Set(saved[employeeBranch.value] || saved[branchKey(employeeBranch.value)] || []);
}
function renderInventory() {
  if (!employeeBranch.value) {
    inventoryList.innerHTML = '<p class="empty-state">Select a branch to manage its menu availability.</p>';
    return;
  }
  const unavailable = unavailableItems();
  inventoryList.innerHTML = menuItems.map(function (item) {
    const unavailableItem = unavailable.has(item);
    return `<div class="inventory-row"><strong>${item}</strong><span class="availability-status ${unavailableItem ? 'is-unavailable' : ''}">${unavailableItem ? 'Unavailable' : 'Available'}</span><button type="button" class="inventory-action ${unavailableItem ? 'make-available' : 'make-unavailable'}" data-item="${item}" aria-pressed="${unavailableItem}">${unavailableItem ? 'Make available' : 'Mark unavailable'}</button></div>`;
  }).join('');
}
employeeBranch.addEventListener('change', renderInventory);
inventoryList.addEventListener('click', function (event) {
  const button = event.target.closest('[data-item]');
  if (!button || !employeeBranch.value) return;
  const unavailable = unavailableItems();
  unavailable.has(button.dataset.item) ? unavailable.delete(button.dataset.item) : unavailable.add(button.dataset.item);
  const saved = JSON.parse(localStorage.getItem(inventoryKey) || '{}');
  saved[branchKey(employeeBranch.value)] = [...unavailable];
  localStorage.setItem(inventoryKey, JSON.stringify(saved));
  renderInventory();
});
employeeSignOut.addEventListener('click', function () { sessionStorage.removeItem('chajoyLoggedInRole'); window.location.href = 'home.html'; });
window.addEventListener('storage', renderInventory);
renderInventory();
