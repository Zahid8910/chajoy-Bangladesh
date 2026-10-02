const employeeMenuManagement = document.getElementById('employeeMenuManagement');
const employeeMenuSearch = document.getElementById('employeeMenuSearch');
const employeeMenuTableBody = document.getElementById('employeeMenuTableBody');
const employeeMenuForm = document.getElementById('employeeMenuForm');
const employeeMenuMessage = document.getElementById('employeeMenuMessage');
let employeeMenuItems = [];

function showEmployeeMenuMessage(message, isError = false) {
  employeeMenuMessage.textContent = message || '';
  employeeMenuMessage.style.color = isError ? '#8b1f27' : '#2d6a3f';
}

function renderEmployeeMenu() {
  const search = (employeeMenuSearch.value || '').toLowerCase();
  const rows = employeeMenuItems.filter((item) => {
    const searchable = [item.name, item.category, item.description].join(' ').toLowerCase();
    return !search || searchable.includes(search);
  });

  employeeMenuTableBody.innerHTML = rows.map((item) => `
    <tr>
      <td>${item.name || ''}</td>
      <td>${item.category || ''}</td>
      <td>BDT ${Number(item.price_bdt || item.price || 0)}</td>
      <td><span class="badge ${Number(item.active) === 1 ? '' : 'inactive'}">${Number(item.active) === 1 ? 'Active' : 'Inactive'}</span></td>
      <td><div class="action-buttons">
        <button class="action-button" type="button" data-menu-action="edit" data-menu-id="${item.menu_item_id || item.id || ''}">Edit</button>
        <button class="action-button delete" type="button" data-menu-action="delete" data-menu-id="${item.menu_item_id || item.id || ''}">Delete</button>
      </div></td>
    </tr>
  `).join('');
}

async function loadEmployeeMenu() {
  try {
    const formData = new FormData();
    formData.append('action', 'menu');
    const response = await fetch('public/admin.php', { method: 'POST', body: formData, credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to load menu items.');
    }
    employeeMenuItems = Array.isArray(result.data) ? result.data : [];
    renderEmployeeMenu();
  } catch (error) {
    showEmployeeMenuMessage(error.message, true);
  }
}

employeeMenuSearch.addEventListener('input', renderEmployeeMenu);
employeeMenuForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(employeeMenuForm);
  formData.append('action', 'save-menu-item');
  try {
    const response = await fetch('public/admin.php', { method: 'POST', body: formData, credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to save menu item.');
    }
    showEmployeeMenuMessage(result.message || 'Menu item saved successfully.');
    employeeMenuForm.reset();
    await loadEmployeeMenu();
    if (typeof window.refreshMenuCatalog === 'function') {
      await window.refreshMenuCatalog();
    }
  } catch (error) {
    showEmployeeMenuMessage(error.message, true);
  }
});

employeeMenuTableBody.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-menu-action]');
  if (!button) return;

  const item = employeeMenuItems.find((entry) => String(entry.menu_item_id ?? entry.id) === button.dataset.menuId);
  if (!item) return;

  if (button.dataset.menuAction === 'delete') {
    if (!window.confirm('Delete this menu item?')) return;
    const formData = new FormData();
    formData.append('action', 'delete-menu-item');
    formData.append('menu_item_id', button.dataset.menuId);
    try {
      const response = await fetch('public/admin.php', { method: 'POST', body: formData, credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Delete failed.');
      showEmployeeMenuMessage(result.message || 'Menu item deleted.');
      await loadEmployeeMenu();
      if (typeof window.refreshMenuCatalog === 'function') {
        await window.refreshMenuCatalog();
      }
    } catch (error) {
      showEmployeeMenuMessage(error.message, true);
    }
    return;
  }

  employeeMenuForm.elements.menu_item_id.value = item.menu_item_id ?? item.id ?? '';
  employeeMenuForm.elements.name.value = item.name || '';
  employeeMenuForm.elements.category.value = item.category || 'tea';
  employeeMenuForm.elements.price_bdt.value = item.price_bdt ?? item.price ?? 0;
  employeeMenuForm.elements.description.value = item.description || '';
  employeeMenuForm.elements.active.value = Number(item.active) === 1 ? '1' : '0';
  employeeMenuForm.elements.image_url.value = item.image_url || '';
  employeeMenuForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

if (sessionStorage.getItem('chajoyLoggedInRole') === 'employee') {
  employeeMenuManagement.hidden = false;
  loadEmployeeMenu();
}
