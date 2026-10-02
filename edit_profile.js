const profileForm = document.getElementById('profileForm');
const profileMessage = document.getElementById('profileMessage');
const profileSummary = document.getElementById('profileSummary');
const editButton = document.getElementById('editButton');
const cancelButton = document.getElementById('cancelButton');
const passwordPanel = document.getElementById('passwordPanel');
const passwordForm = document.getElementById('passwordForm');
const passwordMessage = document.getElementById('passwordMessage');
const passwordCancelButton = document.getElementById('passwordCancelButton');
const previousPassword = document.getElementById('previousPassword');
const newPassword = document.getElementById('newPassword');
const retypeNewPassword = document.getElementById('retypeNewPassword');
const profileFields = {
  name: document.getElementById('profileName'),
  username: document.getElementById('profileUsername'),
  email: document.getElementById('profileEmail'),
  contact: document.getElementById('profileContact'),
  gender: document.getElementById('profileGender')
};
const summaryFields = {
  name: document.getElementById('summaryName'),
  username: document.getElementById('summaryUsername'),
  email: document.getElementById('summaryEmail'),
  contact: document.getElementById('summaryContact'),
  password: document.getElementById('summaryPassword'),
  gender: document.getElementById('summaryGender')
};

const savedAccount = JSON.parse(localStorage.getItem('chajoyAccount') || 'null');
const savedProfile = JSON.parse(localStorage.getItem('chajoyProfile') || 'null') || {};

function normalizeProfileName(value, fallback) {
  const trimmed = (value || '').trim();
  return trimmed || (fallback || '').trim() || '';
}

function loadProfileFields() {
  const storedName = normalizeProfileName(savedProfile.full_name || savedProfile.name, savedAccount && (savedAccount.full_name || savedAccount.name));
  const storedUsername = normalizeProfileName(savedProfile.username, savedAccount && savedAccount.username);
  const storedEmail = normalizeProfileName(savedProfile.email, savedAccount && savedAccount.email);
  const storedContact = normalizeProfileName(savedProfile.contact, savedAccount && savedAccount.contact);
  const storedGender = normalizeProfileName(savedProfile.gender, savedAccount && savedAccount.gender);

  profileFields.name.value = storedName;
  profileFields.username.value = storedUsername;
  profileFields.email.value = storedEmail;
  profileFields.contact.value = storedContact;
  profileFields.gender.value = storedGender;
}

loadProfileFields();
profileForm.hidden = true;

function getCurrentProfile() {
  const name = profileFields.name.value.trim();
  const username = profileFields.username.value.trim();
  const email = profileFields.email.value.trim();
  const contact = profileFields.contact.value.trim();
  const gender = profileFields.gender.value;
  const password = savedProfile.password || (savedAccount && savedAccount.password) || '';

  return {
    name: name,
    full_name: name,
    username: username,
    email: email,
    contact: contact,
    gender: gender,
    password: password
  };
}

function displayValue(value, fallback) {
  return value || fallback;
}

function updateSummary(profile) {
  const profileName = profile.full_name || profile.name || 'Not added yet';
  summaryFields.name.textContent = displayValue(profileName, 'Not added yet');
  summaryFields.username.textContent = displayValue(profile.username, 'Not added yet');
  summaryFields.email.textContent = displayValue(profile.email, 'Not added yet');
  summaryFields.contact.textContent = displayValue(profile.contact, 'Not added yet');
  summaryFields.password.textContent = (savedProfile.password || (savedAccount && savedAccount.password)) ? '********' : 'Not set';
  summaryFields.gender.textContent = displayValue(profile.gender, 'Not selected');
}

updateSummary(getCurrentProfile());

editButton.addEventListener('click', function () {
  profileSummary.hidden = true;
  profileForm.hidden = false;
  profileMessage.textContent = '';
  profileFields.name.focus();
});

const changePasswordButton = document.createElement('button');
changePasswordButton.type = 'button';
changePasswordButton.className = 'cancel-button';
changePasswordButton.textContent = 'Change password';
editButton.parentElement.appendChild(changePasswordButton);

changePasswordButton.addEventListener('click', function () {
  profileSummary.hidden = true;
  profileForm.hidden = true;
  passwordPanel.hidden = false;
  passwordMessage.textContent = '';
  previousPassword.focus();
});

passwordCancelButton.addEventListener('click', function () {
  passwordForm.reset();
  passwordPanel.hidden = true;
  profileSummary.hidden = false;
});

passwordForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const currentPassword = savedProfile.password || (savedAccount && savedAccount.password) || '';

  if (!currentPassword) {
    passwordMessage.textContent = 'No previous password is saved for this account.';
    return;
  }

  if (previousPassword.value !== currentPassword) {
    passwordMessage.textContent = 'The previous password is incorrect.';
    previousPassword.focus();
    return;
  }

  if (newPassword.value.length < 6) {
    passwordMessage.textContent = 'Your new password must be at least 6 characters.';
    newPassword.focus();
    return;
  }

  if (newPassword.value !== retypeNewPassword.value) {
    passwordMessage.textContent = 'The new passwords do not match.';
    retypeNewPassword.focus();
    return;
  }

  savedProfile.password = newPassword.value;
  localStorage.setItem('chajoyProfile', JSON.stringify(savedProfile));
  if (savedAccount) {
    savedAccount.password = newPassword.value;
    localStorage.setItem('chajoyAccount', JSON.stringify(savedAccount));
  }
  passwordForm.reset();
  passwordPanel.hidden = true;
  profileSummary.hidden = false;
  profileMessage.textContent = 'Your password has been changed successfully.';
  updateSummary(getCurrentProfile());
});

cancelButton.addEventListener('click', function () {
  loadProfileFields();
  profileSummary.hidden = false;
  profileForm.hidden = true;
  profileMessage.textContent = '';
});

profileForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const profile = getCurrentProfile();

  if (!profile.email) {
    profileMessage.textContent = 'Please enter your email address.';
    profileFields.email.focus();
    return;
  }

  const normalizedProfile = {
    ...profile,
    name: profile.name || profile.username,
    full_name: profile.name || profile.username
  };

  localStorage.setItem('chajoyProfile', JSON.stringify(normalizedProfile));
  Object.assign(savedProfile, normalizedProfile);

  if (savedAccount) {
    savedAccount.name = normalizedProfile.name;
    savedAccount.full_name = normalizedProfile.full_name;
    savedAccount.username = normalizedProfile.username;
    savedAccount.email = normalizedProfile.email;
    savedAccount.contact = normalizedProfile.contact;
    savedAccount.gender = normalizedProfile.gender;
    localStorage.setItem('chajoyAccount', JSON.stringify(savedAccount));
  }

  updateSummary(normalizedProfile);
  profileSummary.hidden = false;
  profileForm.hidden = true;
  profileMessage.textContent = 'Your profile has been updated successfully.';
});
