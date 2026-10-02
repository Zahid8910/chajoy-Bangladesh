let targetPage = '';

const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginButton = document.getElementById('loginButton');
const loginError = document.getElementById('loginError');

function showLoginError(message) {
  loginError.textContent = message;
  loginError.classList.add('visible');
}

function clearLoginError() {
  loginError.textContent = '';
  loginError.classList.remove('visible');
}

function createProfileFromUser(user, fallbackEmail, fallbackPassword) {
  const username = user && user.username ? user.username : (fallbackEmail ? fallbackEmail.split('@')[0] : '');
  const fullName = user && (user.full_name || user.name) ? (user.full_name || user.name) : username;

  return {
    user_id: user && user.user_id ? user.user_id : 0,
    role: user && user.role ? user.role : 'customer',
    name: fullName,
    full_name: fullName,
    username: username,
    email: user && user.email ? user.email : fallbackEmail,
    contact: user && user.contact ? user.contact : '',
    gender: user && user.gender ? user.gender : '',
    password: fallbackPassword || ''
  };
}

function saveLoggedInUser(result, fallbackEmail, fallbackPassword) {
  const user = result && result.user ? result.user : {};
  const profile = createProfileFromUser(user, fallbackEmail, fallbackPassword);

  localStorage.setItem('chajoyAccount', JSON.stringify(profile));
  localStorage.setItem('chajoyProfile', JSON.stringify(profile));
}

function showRoleModal(role) {
  const modal = document.getElementById('roleModal');
  const title = document.getElementById('modalTitle');
  const message = document.getElementById('modalMessage');

  if (role === 'customer') {
    title.textContent = "Customer's Dashboard";
    message.textContent = 'Welcome customer.';
    targetPage = 'Home_login.html';
  } else if (role === 'employee') {
    title.textContent = "Employee's Dashboard";
    message.textContent = 'Welcome employee.';
    targetPage = 'employee.html';
  } else if (role === 'admin') {
    title.textContent = "Admin's Dashboard";
    message.textContent = 'Welcome admin.';
    targetPage = 'public/admin.php?action=admin';
  }

  modal.classList.remove('hidden');
}

async function handleLogin() {
  clearLoginError();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  const selectedRoleInput = document.querySelector('input[name="identity"]:checked');
  const selectedRole = selectedRoleInput ? selectedRoleInput.value : '';

  if (!email || !password) {
    showLoginError('Please enter your email and password.');
    if (!email) loginEmail.focus();
    else loginPassword.focus();
    return;
  }

  if (!selectedRole) {
    showLoginError('Please select a role.');
    return;
  }

  const response = await fetch('public/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'login',
      email: email,
      password: password,
      role: selectedRole
    })
  });

  const result = await response.json();

  if (!result.success) {
    showLoginError(result.errors && result.errors.role ? result.errors.role : (result.errors && result.errors.email ? result.errors.email : 'Invalid email, password or role.'));
    loginEmail.focus();
    return;
  }

  saveLoggedInUser(result, email, password);
  sessionStorage.setItem('chajoyLoggedInRole', result.role);
  showRoleModal(result.role);
}
loginButton.addEventListener('click', handleLogin);

document.getElementById('proceedBtn').addEventListener('click', function () {
  if (targetPage) {
    const normalizedRole = targetPage.includes('admin.php') ? 'admin' : targetPage === 'employee.html' ? 'employee' : 'customer';
    sessionStorage.setItem('chajoyLoggedInRole', normalizedRole);
    window.location.href = targetPage;
  }
});

const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const forgotPasswordButton = document.getElementById('forgotPasswordButton');
const forgotPasswordClose = document.getElementById('forgotPasswordClose');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const resetQuestion = document.getElementById('resetQuestion');
const resetAnswer = document.getElementById('resetAnswer');
const resetMessage = document.getElementById('resetMessage');
const resetQuestionPrompt = document.getElementById('resetQuestionPrompt');
const newPasswordFields = document.getElementById('newPasswordFields');
const resetNewPassword = document.getElementById('resetNewPassword');
const forgotPasswordInstructions = document.getElementById('forgotPasswordInstructions');
const forgotPasswordSubmit = document.getElementById('forgotPasswordSubmit');

function normalizeAnswer(value) {
  return value.trim().toLowerCase();
}

function closeForgotPasswordModal() {
  forgotPasswordModal.classList.add('hidden');
  resetMessage.textContent = '';
  forgotPasswordForm.reset();
  resetQuestionPrompt.hidden = true;
  newPasswordFields.hidden = true;
  resetAnswer.required = true;
  resetNewPassword.required = false;
  forgotPasswordSubmit.textContent = 'Submit answer';
}

forgotPasswordButton.addEventListener('click', async function () {
  const selectedRole = document.querySelector('input[name="identity"]:checked');
  const email = loginEmail.value.trim();
  if (!selectedRole) {
    showLoginError('Invalid role or email.');
    return;
  }
  if (selectedRole.value === 'admin') {
    showLoginError('Invalid role or email.');
    return;
  }
  if (!email) {
    showLoginError('Invalid role or email.');
    loginEmail.focus();
    return;
  }
  forgotPasswordButton.disabled = true;
  try {
    const response = await fetch('public/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'forgot-question', role: selectedRole.value, email })
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Invalid role or email.');
    }

    clearLoginError();
    forgotPasswordInstructions.textContent = 'Answer the security question, then choose a new password.';
    resetQuestionPrompt.textContent = result.question;
    resetQuestionPrompt.hidden = false;
    resetMessage.textContent = '';
    forgotPasswordModal.classList.remove('hidden');
    resetAnswer.focus();
  } catch (error) {
    showLoginError(error.message || 'Invalid role or email.');
  } finally {
    forgotPasswordButton.disabled = false;
  }
});

forgotPasswordClose.addEventListener('click', closeForgotPasswordModal);

forgotPasswordModal.addEventListener('click', function (event) {
  if (event.target === forgotPasswordModal) {
    closeForgotPasswordModal();
  }
});

forgotPasswordForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  const selectedRole = document.querySelector('input[name="identity"]:checked');
  const email = loginEmail.value.trim();
  if (!selectedRole || selectedRole.value === 'admin') {
    resetMessage.textContent = 'Select Employee or Customer before continuing.';
    return;
  }
  if (newPasswordFields.hidden) {
    const answerResponse = await fetch('public/auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'verify-recovery-answer',
        role: selectedRole.value,
        email,
        answer: resetAnswer.value
      })
    });
    const answerResult = await answerResponse.json();
    if (!answerResponse.ok || !answerResult.success) {
      resetMessage.textContent = answerResult.message || 'The security answer is incorrect.';
      return;
    }
    newPasswordFields.hidden = false;
    resetNewPassword.required = true;
    forgotPasswordSubmit.textContent = 'Reset password';
    resetMessage.textContent = answerResult.message;
    resetNewPassword.focus();
    return;
  }
  fetch('public/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'reset-password',
      role: selectedRole.value,
      email,
      answer: resetAnswer.value,
      password: resetNewPassword.value
    })
  }).then(function (response) {
    return response.json().then(function (result) {
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Password update failed.');
      }
      resetMessage.textContent = result.message;
      forgotPasswordForm.reset();
      newPasswordFields.hidden = true;
      forgotPasswordModal.classList.add('hidden');
      window.location.href = 'Sign_up.html?password-reset=success';
    });
  }).catch(function (error) {
    resetMessage.textContent = error.message;
  });
});