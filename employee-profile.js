const employeeProfileMarkup = `
  <aside id="employeeProfilePanel" class="employee-profile-panel" hidden aria-modal="true" role="dialog">
    <div class="employee-profile-dialog">
      <div class="employee-profile-header">
        <div>
          <p class="eyebrow">Employee account</p>
          <h2>Edit your profile</h2>
        </div>
        <button type="button" id="employeeProfileClose" aria-label="Close profile window">×</button>
      </div>
      <p id="employeeProfileSummary" class="employee-profile-summary">Logged in.</p>
      <form id="employeeProfileForm" class="employee-profile-form">
        <label>Username<input type="text" name="username" required /></label>
        <label>Full name<input type="text" name="full_name" /></label>
        <label>Email<input type="email" name="email" required /></label>
        <label>Gender<select name="gender"><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></label>
        <label>Phone<input type="tel" name="contact" /></label>
        <label>New password (optional)<input type="password" name="password" placeholder="Leave blank to keep current password" /></label>
        <div class="employee-profile-actions">
          <button type="button" id="employeeProfileCancel" class="clear-button">Cancel</button>
          <button type="submit" class="order-action">Save profile</button>
        </div>
      </form>
    </div>
  </aside>
`;

function initializeEmployeeProfile() {
  const existingPanel = document.getElementById('employeeProfilePanel');
  if (existingPanel) {
    existingPanel.remove();
  }
  document.body.insertAdjacentHTML('beforeend', employeeProfileMarkup);

  const profileButton = document.getElementById('employeeProfileButton');
  const panel = document.getElementById('employeeProfilePanel');
  const closeButton = document.getElementById('employeeProfileClose');
  const cancelButton = document.getElementById('employeeProfileCancel');
  const form = document.getElementById('employeeProfileForm');
  const summary = document.getElementById('employeeProfileSummary');

  if (!profileButton || !panel || !closeButton || !form || profileButton.dataset.profileBound) {
    return;
  }

  profileButton.dataset.profileBound = 'true';
  profileButton.removeAttribute('onclick');

  function setVisible(visible) {
    panel.hidden = !visible;
    document.body.classList.toggle('profile-modal-open', visible);
  }

  function populate(profile) {
    ['username', 'full_name', 'email', 'gender', 'contact'].forEach(function (field) {
      form.elements[field].value = profile[field] || '';
    });
    form.elements.password.value = '';
    summary.textContent = `Logged in as ${profile.full_name || profile.username || 'Employee'}`;
  }

  async function loadProfile() {
    const response = await fetch('public/profile.php?action=profile', { credentials: 'same-origin' });
    const json = await response.json();
    if (!response.ok || !json.success || !json.data) {
      throw new Error(json.message || 'Unable to load profile.');
    }
    populate(json.data);
  }

  profileButton.addEventListener('click', function () {
    setVisible(true);
    loadProfile().catch(function (error) {
      summary.textContent = error.message;
    });
  });
  closeButton.addEventListener('click', function () { setVisible(false); });
  if (cancelButton) {
    cancelButton.addEventListener('click', function () { setVisible(false); });
  }
  panel.addEventListener('click', function (event) {
    if (event.target === panel) {
      setVisible(false);
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !panel.hidden) {
      setVisible(false);
    }
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      action: 'update-profile',
      username: String(formData.get('username') || ''),
      full_name: String(formData.get('full_name') || ''),
      email: String(formData.get('email') || ''),
      gender: String(formData.get('gender') || ''),
      contact: String(formData.get('contact') || ''),
      password: String(formData.get('password') || ''),
    };
    try {
      const response = await fetch('public/profile.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Profile update failed.');
      }
      populate(payload);
      setVisible(false);
    } catch (error) {
      summary.textContent = error.message;
    }
  });
}

initializeEmployeeProfile();
