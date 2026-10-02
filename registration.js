const registrationConfirm = document.getElementById('registrationConfirm');
const registrationEmail = document.getElementById('registrationEmail');
const registrationPhone = document.getElementById('registrationPhone');
const registrationUsername = document.getElementById('registrationUsername');
const registrationPassword = document.getElementById('registrationPassword');
const registrationRetypePassword = document.getElementById('registrationRetypePassword');
const registrationQuestion = document.getElementById('registrationQuestion');
const registrationCustomQuestionField = document.getElementById('registrationCustomQuestionField');
const registrationCustomQuestion = document.getElementById('registrationCustomQuestion');
const registrationAnswer = document.getElementById('registrationAnswer');
const registrationRoleError = document.getElementById('registrationRoleError');
const registrationGenderError = document.getElementById('registrationGenderError');
const registrationUsernameError = document.getElementById('registrationUsernameError');
const registrationEmailError = document.getElementById('registrationEmailError');
const registrationPhoneError = document.getElementById('registrationPhoneError');
const registrationPasswordError = document.getElementById('registrationPasswordError');
const registrationRetypePasswordError = document.getElementById('registrationRetypePasswordError');
const registrationQuestionError = document.getElementById('registrationQuestionError');
const registrationAnswerError = document.getElementById('registrationAnswerError');
const registrationSuccessModal = document.getElementById('registrationSuccessModal');
const registrationRoleInputs = document.querySelectorAll('input[name="identity"]');
const registrationGenderInputs = document.querySelectorAll('input[name="gender"]');

const fieldErrorMap = {
  role: registrationRoleError,
  username: registrationUsernameError,
  email: registrationEmailError,
  phone: registrationPhoneError,
  password: registrationPasswordError,
  retypePassword: registrationRetypePasswordError,
  gender: registrationGenderError,
  question: registrationQuestionError,
  answer: registrationAnswerError,
};

function clearFieldError(container) {
  if (!container) return;
  container.textContent = '';
  container.classList.remove('visible');
}

function clearInputError(element) {
  if (!element) return;
  element.classList.remove('is-invalid');
  element.setAttribute('aria-invalid', 'false');
}

function showFieldError(element, message, errorContainer) {
  if (!element) return;
  clearInputError(element);
  element.classList.add('is-invalid');
  element.setAttribute('aria-invalid', 'true');

  if (errorContainer) {
    clearFieldError(errorContainer);
    errorContainer.textContent = message;
    errorContainer.classList.add('visible');
  }

  element.focus();
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function clearErrors() {
  [registrationUsername, registrationEmail, registrationPhone, registrationPassword, registrationRetypePassword, registrationQuestion, registrationCustomQuestion, registrationAnswer].forEach(clearInputError);
  registrationRoleInputs.forEach((input) => input.closest('label').classList.remove('is-invalid-gender'));
  registrationGenderInputs.forEach((input) => input.closest('label').classList.remove('is-invalid-gender'));
  Object.values(fieldErrorMap).forEach(clearFieldError);
  registrationSuccessModal.classList.add('hidden');
}

function getSelectedRole() {
  const selected = document.querySelector('input[name="identity"]:checked');
  return selected ? selected.value : '';
}

function getSelectedGender() {
  const selected = document.querySelector('input[name="gender"]:checked');
  return selected ? selected.value : '';
}

function getSecurityQuestion() {
  if (registrationQuestion.value === 'custom') {
    return registrationCustomQuestion.value.trim();
  }
  return registrationQuestion.value.trim();
}

function showSecurityQuestionError(message) {
  const targetElement = registrationQuestion.value === 'custom' ? registrationCustomQuestion : registrationQuestion;
  const targetContainer = fieldErrorMap.question;

  if (registrationQuestion.value === 'custom' && !registrationCustomQuestion.value.trim()) {
    showFieldError(targetElement, message, targetContainer);
    return true;
  }

  if (!registrationQuestion.value) {
    showFieldError(registrationQuestion, message, targetContainer);
    return true;
  }

  return false;
}

function updateRegistrationCustomQuestion() {
  const isCustomQuestion = registrationQuestion.value === 'custom';
  registrationCustomQuestionField.classList.toggle('hidden', !isCustomQuestion);
  registrationCustomQuestion.required = isCustomQuestion;
  document.querySelector('.Register').classList.toggle('custom-question-active', isCustomQuestion);
  if (!isCustomQuestion) {
    registrationCustomQuestion.value = '';
    clearInputError(registrationCustomQuestion);
  }
}

registrationQuestion.addEventListener('change', updateRegistrationCustomQuestion);

function validateRegistration() {
  clearErrors();
  let firstInvalid = null;
  const errors = {};

  const role = getSelectedRole();
  if (!role) {
    errors.role = 'Please select a registration role.';
    showFieldError(registrationRoleInputs[0], errors.role, fieldErrorMap.role);
    firstInvalid = firstInvalid || registrationRoleInputs[0];
  }

  const username = registrationUsername.value.trim();
  if (!username) {
    errors.username = 'Please enter your username.';
    showFieldError(registrationUsername, errors.username, fieldErrorMap.username);
    firstInvalid = firstInvalid || registrationUsername;
  } else if (!/^[A-Za-z ]+$/.test(username)) {
    errors.username = 'Username can contain letters and spaces only.';
    showFieldError(registrationUsername, errors.username, fieldErrorMap.username);
    firstInvalid = firstInvalid || registrationUsername;
  }

  const email = registrationEmail.value.trim();
  if (!email) {
    errors.email = 'Please enter your email.';
    showFieldError(registrationEmail, errors.email, fieldErrorMap.email);
    firstInvalid = firstInvalid || registrationEmail;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
    showFieldError(registrationEmail, errors.email, fieldErrorMap.email);
    firstInvalid = firstInvalid || registrationEmail;
  }

  const phone = registrationPhone.value.trim();
  if (!phone) {
    errors.phone = 'Please enter your phone number.';
    showFieldError(registrationPhone, errors.phone, fieldErrorMap.phone);
    firstInvalid = firstInvalid || registrationPhone;
  } else if (!/^\d{11}$/.test(phone)) {
    errors.phone = 'Phone number must be 11 digits.';
    showFieldError(registrationPhone, errors.phone, fieldErrorMap.phone);
    firstInvalid = firstInvalid || registrationPhone;
  }

  const gender = getSelectedGender();
  if (!gender) {
    errors.gender = 'Please select your gender.';
    showFieldError(registrationGenderInputs[0], errors.gender, fieldErrorMap.gender);
    firstInvalid = firstInvalid || registrationGenderInputs[0];
  }

  const password = registrationPassword.value;
  const retypePassword = registrationRetypePassword.value;
  if (!password) {
    errors.password = 'Please enter your password.';
    showFieldError(registrationPassword, errors.password, fieldErrorMap.password);
    firstInvalid = firstInvalid || registrationPassword;
  }
  if (!retypePassword) {
    errors.retypePassword = 'Please retype your password.';
    showFieldError(registrationRetypePassword, errors.retypePassword, fieldErrorMap.retypePassword);
    firstInvalid = firstInvalid || registrationRetypePassword;
  }
  if (password && retypePassword && password !== retypePassword) {
    errors.passwordMatch = 'Passwords do not match.';
    showFieldError(registrationPassword, errors.passwordMatch, fieldErrorMap.password);
    showFieldError(registrationRetypePassword, errors.passwordMatch, fieldErrorMap.retypePassword);
    firstInvalid = firstInvalid || registrationPassword;
  }

  const question = getSecurityQuestion();
  if (!question) {
    errors.question = registrationQuestion.value === 'custom'
      ? 'Please enter your security question.'
      : 'Please select a security question.';
    const customQuestionInvalid = showSecurityQuestionError(errors.question);
    firstInvalid = firstInvalid || (customQuestionInvalid ? registrationQuestion.value === 'custom' ? registrationCustomQuestion : registrationQuestion : registrationQuestion);
  }

  const answer = registrationAnswer.value.trim();
  if (!answer) {
    errors.answer = 'Please enter your security answer.';
    showFieldError(registrationAnswer, errors.answer, fieldErrorMap.answer);
    firstInvalid = firstInvalid || registrationAnswer;
  }

  if (Object.keys(errors).length > 0) {
    if (firstInvalid) {
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return false;
  }

  return { role, username, email, phone, password, gender, question, answer };
}

registrationConfirm.addEventListener('click', async function () {
  const payload = validateRegistration();
  if (!payload) {
    return;
  }

  const response = await fetch('public/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'register',
      role: payload.role,
      username: payload.username,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
      retype_password: payload.password,
      gender: payload.gender,
      security_question: payload.question,
      security_answer: payload.answer
    })
  });

  const result = await response.json();

  if (!result.success) {
    const firstErrorField = Object.keys(result.errors || {})[0];
    const fieldMap = {
      role: { element: registrationRoleInputs[0], error: fieldErrorMap.role },
      username: { element: registrationUsername, error: fieldErrorMap.username },
      email: { element: registrationEmail, error: fieldErrorMap.email },
      phone: { element: registrationPhone, error: fieldErrorMap.phone },
      password: { element: registrationPassword, error: fieldErrorMap.password },
      retypePassword: { element: registrationRetypePassword, error: fieldErrorMap.retypePassword },
      gender: { element: registrationGenderInputs[0], error: fieldErrorMap.gender },
      question: { element: registrationQuestion, error: fieldErrorMap.question },
      answer: { element: registrationAnswer, error: fieldErrorMap.answer }
    };
    const target = fieldMap[firstErrorField] || fieldMap.username;
    showFieldError(target.element, result.errors[firstErrorField], target.error);
    return;
  }

  const newAccount = {
    user_id: result.user_id || 0,
    role: result.role || payload.role || 'customer',
    name: payload.username,
    full_name: payload.username,
    username: payload.username,
    email: payload.email,
    contact: payload.phone,
    gender: payload.gender,
    password: payload.password,
    question: payload.question,
    answer: payload.answer
  };

  localStorage.setItem('chajoyAccount', JSON.stringify(newAccount));
  localStorage.setItem('chajoyProfile', JSON.stringify(newAccount));

  registrationSuccessModal.classList.remove('hidden');
  setTimeout(() => {
    window.location.href = 'Sign_up.html';
  }, 1400);
});

updateRegistrationCustomQuestion();